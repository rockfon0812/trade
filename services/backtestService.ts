
import { BacktestResult, StockData, StrategyParams, Trade, AIAutoConfigResult, BacktestLogItem } from '../types';

const roundToTwo = (num: number): number => Math.round((num + Number.EPSILON) * 100) / 100;

export const calculateIndicators = (data: StockData[], params: StrategyParams): StockData[] => {
  if (!data || data.length === 0) return [];
  const result = data.map(d => ({ ...d }));
  const len = result.length;

  const getSMA = (index: number, period: number) => {
    if (index < period - 1) return undefined;
    let sum = 0;
    for (let i = 0; i < period; i++) {
      const entry = result[index - i];
      if (entry) sum += entry.price;
    }
    return sum / period;
  };

  const calculateEMA = (index: number, period: number, prevEMA?: number) => {
    const k = 2 / (period + 1);
    const currentPrice = result[index]?.price ?? 0;
    if (index === 0) return currentPrice;
    return currentPrice * k + (prevEMA ?? currentPrice) * (1 - k);
  };

  for (let i = 0; i < len; i++) {
    const d = result[i];
    if (!d) continue;

    if (params.useSMA) {
      d.smaShort = getSMA(i, params.shortWindow);
      d.smaLong = getSMA(i, params.longWindow);
    }
    
    if (params.useEMA) {
      const prevEmaShort = i > 0 ? result[i - 1].emaShort : undefined;
      const prevEmaLong = i > 0 ? result[i - 1].emaLong : undefined;
      d.emaShort = calculateEMA(i, params.emaShort, prevEmaShort);
      d.emaLong = calculateEMA(i, params.emaLong, prevEmaLong);
    }
    
    if (params.useMACD) {
      const prevEma12 = i > 0 ? (result[i - 1] as any)?.ema12 : undefined;
      const prevEma26 = i > 0 ? (result[i - 1] as any)?.ema26 : undefined;
      const ema12 = calculateEMA(i, 12, prevEma12);
      const ema26 = calculateEMA(i, 26, prevEma26);
      (d as any).ema12 = ema12;
      (d as any).ema26 = ema26;
      d.macd = ema12 - ema26;
      
      const prevSignal = i > 0 ? result[i - 1].signal : undefined;
      d.signal = i === 0 ? d.macd : calculateEMA(i, 9, prevSignal);
      d.hist = d.macd - (d.signal || 0);
    }

    if (params.useKD && i >= 8) {
      let low9 = Infinity, high9 = -Infinity;
      let validRange = true;
      for (let j = 0; j < 9; j++) {
        const entry = result[i - j];
        if (!entry) { validRange = false; break; }
        low9 = Math.min(low9, entry.price);
        high9 = Math.max(high9, entry.price);
      }
      
      if (validRange && low9 !== Infinity) {
        const rsv = high9 === low9 ? 50 : ((d.price - low9) / (high9 - low9)) * 100;
        const prevK = i > 0 ? (result[i - 1].stochK ?? 50) : 50;
        const prevD = i > 0 ? (result[i - 1].stochD ?? 50) : 50;
        d.stochK = prevK * (2 / 3) + rsv * (1 / 3);
        d.stochD = prevD * (2 / 3) + d.stochK * (1 / 3);
      }
    }

    if (params.useVWMA) {
        let pvSum = 0, vSum = 0;
        const period = params.vwmaPeriod || 20;
        if (i >= period - 1) {
            let validVWMA = true;
            for (let j = 0; j < period; j++) {
                const entry = result[i - j];
                if (!entry) { validVWMA = false; break; }
                pvSum += entry.price * entry.volume;
                vSum += entry.volume;
            }
            if (validVWMA && vSum > 0) d.vwma = pvSum / vSum;
        }
    }

    // ATR Implementation for Dynamic Risk
    if (params.useATR) {
        const period = 14;
        if (i > 0) {
            const prevClose = result[i - 1].price;
            // 若無 High/Low，以 Abs(Close - PrevClose) 模擬 TR，或假設日內波動
            // 為了更精確的模擬，我們假設 High = Max(Price, PrevClose), Low = Min(Price, PrevClose)
            // 更好的方式是直接計算 Gap。
            const tr = Math.abs(d.price - prevClose); 
            // 若 DataService 未來提供 High/Low，公式為: Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose))
            
            const prevATR = i > 1 ? result[i - 1].atr : tr;
            if (prevATR !== undefined) {
                // ATR Smoothing (Wilder's)
                d.atr = ((prevATR * (period - 1)) + tr) / period;
            } else {
                d.atr = tr;
            }
        } else {
            d.atr = 0;
        }
    }
  }

  // RSI
  if (params.useRSI && len > params.rsiPeriod) {
    let gains = 0, losses = 0;
    for (let i = 1; i < len; i++) {
      const current = result[i];
      const previous = result[i - 1];
      if (!current || !previous) continue;

      const diff = current.price - previous.price;
      const g = diff > 0 ? diff : 0;
      const l = diff < 0 ? -diff : 0;
      
      if (i <= params.rsiPeriod) {
        gains += g; losses += l;
        if (i === params.rsiPeriod) current.rsi = 100 - (100 / (1 + (gains / (losses || 1))));
      } else {
        gains = (gains * (params.rsiPeriod - 1) + g) / params.rsiPeriod;
        losses = (losses * (params.rsiPeriod - 1) + l) / params.rsiPeriod;
        current.rsi = 100 - (100 / (1 + (gains / (losses || 1))));
      }
    }
  }

  return result;
};

const executeBacktestCore = (processedData: StockData[], params: StrategyParams) => {
  const trades: Trade[] = [];
  let currentCapital = params.initialCapital;
  let posShares = 0;
  let posType: 'LONG' | 'SHORT' | 'NONE' = 'NONE';
  let peakEquity = params.initialCapital;
  let maxDD = 0;
  
  // ATR Trailing Stop 變數
  let highestPriceSinceEntry = 0;

  const equityCurve: { date: string; equity: number }[] = [];
  const dailyReturns: number[] = [];

  // Rule 5: 夏普比率資料檢核
  if (processedData.length < 2) return { trades: [], totalReturn: 0, maxDrawdown: 0, equityCurve: [], sharpeRatio: NaN };

  for (let i = 1; i < processedData.length; i++) {
    const today = processedData[i];
    const prev = processedData[i - 1];
    if (!today || !prev) continue;

    let buyScore = 0;
    let sellScore = 0;
    let activeIndicators = 0;

    // 策略信號計分板
    if (params.useSMA && prev.smaShort !== undefined && prev.smaLong !== undefined) {
      activeIndicators++;
      if (prev.smaShort > prev.smaLong) buyScore++; else sellScore++;
    }
    if (params.useEMA && prev.emaShort !== undefined && prev.emaLong !== undefined) {
      activeIndicators++;
      if (prev.emaShort > prev.emaLong) buyScore++; else sellScore++;
    }
    if (params.useRSI && prev.rsi !== undefined) {
      activeIndicators++;
      if (prev.rsi < params.rsiOversold) buyScore += 1.2; 
      else if (prev.rsi > params.rsiOverbought) sellScore += 1.2;
    }
    if (params.useMACD && prev.hist !== undefined) {
      activeIndicators++;
      if (prev.hist > 0) buyScore++; else sellScore++;
    }
    if (params.useKD && prev.stochK !== undefined && prev.stochD !== undefined) {
      activeIndicators++;
      if (prev.stochK > prev.stochD) buyScore += 0.8; else sellScore += 0.8;
    }
    if (params.useVWMA && prev.vwma !== undefined) {
        activeIndicators++;
        if (prev.price > prev.vwma) buyScore++; else sellScore++;
    }

    // 修正策略閾值
    const entryThreshold = activeIndicators === 1 ? 0.9 : 0.35;
    const isBull = activeIndicators > 0 ? (buyScore / activeIndicators) >= entryThreshold : false;
    const isBear = activeIndicators > 0 ? (sellScore / activeIndicators) >= entryThreshold : false;

    if (posType !== 'NONE') {
      const activeTrade = trades[trades.length - 1];
      const pnlPct = (today.price - activeTrade.entryPrice) / (activeTrade.entryPrice || 1);
      highestPriceSinceEntry = Math.max(highestPriceSinceEntry, today.price);

      let shouldExit = false;
      let exitReason: Trade['exitReason'] = 'STRATEGY';

      // 1. 固定停損
      if (params.stopLossPercentage > 0 && pnlPct * 100 <= -params.stopLossPercentage) {
        shouldExit = true; exitReason = 'STOP_LOSS';
      } 
      // 2. ATR 移動停利 (Trailing Stop) - 高階風控
      else if (params.useATR && prev.atr) {
          // 若價格從最高點回落超過 2.5 倍 ATR，則出場
          const atrStopPrice = highestPriceSinceEntry - (prev.atr * 2.5);
          if (today.price < atrStopPrice) {
              shouldExit = true; exitReason = 'TRAILING_STOP';
          }
      }
      // 3. 固定停利
      else if (params.takeProfitPercentage > 0 && pnlPct * 100 >= params.takeProfitPercentage) {
        shouldExit = true; exitReason = 'TAKE_PROFIT';
      } 
      // 4. 訊號反轉出場
      else if (isBear) {
        shouldExit = true; exitReason = 'STRATEGY';
      }

      if (shouldExit || i === processedData.length - 1) {
        const exitProceeds = posShares * today.price * (1 - params.commissionRate - params.taxRate);
        currentCapital += exitProceeds;
        activeTrade.exitDate = today.date;
        activeTrade.exitPrice = today.price;
        activeTrade.pnl = roundToTwo(((exitProceeds / (activeTrade.entryPrice * posShares)) - 1) * 100);
        activeTrade.status = 'CLOSED';
        if (exitReason) activeTrade.exitReason = exitReason;
        
        posType = 'NONE'; posShares = 0;
      }
    } else if (isBull) {
      const entryPriceWithFee = today.price * (1 + params.commissionRate);
      const shares = Math.floor((currentCapital * 0.95) / (entryPriceWithFee || 1));
      if (shares > 0) {
        posShares = shares; posType = 'LONG';
        highestPriceSinceEntry = today.price; // Reset trailing high
        const cost = posShares * entryPriceWithFee;
        currentCapital -= cost;
        trades.push({
          id: `T-${i}`, entryDate: today.date, entryPrice: today.price,
          type: 'LONG', status: 'OPEN', fees: cost - (posShares * today.price), tax: 0
        });
      }
    }

    const equity = currentCapital + (posType === 'LONG' ? posShares * today.price : 0);
    const prevEquity = equityCurve.length > 0 ? equityCurve[equityCurve.length - 1].equity : params.initialCapital;
    dailyReturns.push(prevEquity !== 0 ? (equity - prevEquity) / prevEquity : 0);
    
    peakEquity = Math.max(peakEquity, equity);
    maxDD = Math.max(maxDD, peakEquity !== 0 ? (peakEquity - equity) / peakEquity : 0);
    equityCurve.push({ date: today.date, equity: Math.round(equity) });
  }

  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const stdDev = dailyReturns.length > 1 
    ? Math.sqrt(dailyReturns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (dailyReturns.length - 1)) 
    : 0;
  
  const sharpe = stdDev > 0.000001 ? (avgReturn / stdDev) * Math.sqrt(252) : NaN;

  return { trades, totalReturn: params.initialCapital !== 0 ? (equityCurve[equityCurve.length - 1]?.equity / params.initialCapital) - 1 : 0, maxDrawdown: maxDD, equityCurve, sharpeRatio: sharpe };
};

export const runBacktest = (data: StockData[], params: StrategyParams): BacktestResult => {
  if (!data || data.length === 0) return { trades: [], totalReturn: 0, finalCapital: params.initialCapital, winRate: 0, maxDrawdown: 0, sharpeRatio: NaN, equityCurve: [], totalFees: 0, totalTax: 0 };
  
  if (params.type === 'AI_AUTO') {
    return runAIAutoConfig(data, params);
  }

  const processedData = calculateIndicators(data, params);
  const core = executeBacktestCore(processedData, params);
  const closed = core.trades.filter(t => t.status === 'CLOSED');
  
  return {
    trades: core.trades,
    totalReturn: roundToTwo(core.totalReturn * 100),
    finalCapital: core.equityCurve[core.equityCurve.length - 1]?.equity || params.initialCapital,
    winRate: closed.length > 0 ? roundToTwo(closed.filter(t => (t.pnl || 0) > 0).length / closed.length * 100) : 0,
    maxDrawdown: roundToTwo(core.maxDrawdown * 100),
    sharpeRatio: isNaN(core.sharpeRatio) ? NaN : roundToTwo(core.sharpeRatio),
    equityCurve: core.equityCurve,
    totalFees: 0, totalTax: 0
  };
};

const runAIAutoConfig = (data: StockData[], params: StrategyParams): BacktestResult => {
  // 專業量化策略定義：每一組策略必須包含「至少兩類」不同指標
  // 強制揭露：明確列出指標名稱與參數
  const strategies: { 
      name: string; 
      type: 'HIGH' | 'MID' | 'LOW'; 
      logicType: string; 
      indicators: string[]; // 指標清單 (e.g., "RSI(14)")
      roleDescription: string; // 指標角色 (e.g., "RSI for entry")
      config: Partial<StrategyParams> 
  }[] = [
      // 1. 高頻動能 (Aggressive Momentum)
      {
          name: '高頻動能 (Aggressive)',
          type: 'HIGH',
          logicType: 'Momentum / Trend',
          indicators: ['SMA(3,8)', 'RSI(7)', 'KD(9,3,3)', 'ATR(14)'],
          roleDescription: 'SMA:短期趨勢確認 | RSI+KD:動能進場訊號 | ATR:動態移動停利',
          config: {
              useSMA: true, shortWindow: 3, longWindow: 8, 
              useRSI: true, rsiPeriod: 7, rsiOverbought: 80, rsiOversold: 20, 
              useATR: true, 
              useKD: true, 
              stopLossPercentage: 5, 
              useMACD: false, useEMA: false, useVWMA: false
          }
      },
      // 2. 波段趨勢 (Balanced Swing)
      {
          name: '波段趨勢 (Balanced)',
          type: 'MID',
          logicType: 'Trend Following',
          indicators: ['EMA(10,20)', 'MACD(12,26,9)', 'RSI(14)', 'ATR(14)'],
          roleDescription: 'EMA:趨勢主方向 | MACD:動能確認 | RSI:過濾極端值 | ATR:波段風控',
          config: {
              useEMA: true, emaShort: 10, emaLong: 20, 
              useMACD: true, 
              useRSI: true, rsiPeriod: 14, rsiOverbought: 70, rsiOversold: 30,
              useATR: true,
              stopLossPercentage: 10,
              useSMA: false, useKD: false
          }
      },
      // 3. 長線過濾 (Conservative)
      {
          name: '長線濾網 (Conservative)',
          type: 'LOW',
          logicType: 'Trend / Volume',
          indicators: ['SMA(20,60)', 'VWMA(20)'],
          roleDescription: 'SMA:長期均線支撐 | VWMA:成交量加權確認趨勢真實性',
          config: {
              useSMA: true, shortWindow: 20, longWindow: 60, 
              useVWMA: true, vwmaPeriod: 20, 
              useATR: false, 
              stopLossPercentage: 15, 
              useRSI: false, useMACD: true, useEMA: false, useKD: false
          }
      },
      // 4. 複合動能 (Mixed Momentum)
      {
          name: '複合動能 (Mixed)',
          type: 'MID',
          logicType: 'Consensus',
          indicators: ['KD(9,3,3)', 'RSI(14)', 'MACD(12,26,9)', 'ATR(14)'],
          roleDescription: 'KD+RSI+MACD:三指標共識進場 (投票機制) | ATR:波動度保護',
          config: {
              useKD: true, useRSI: true, useMACD: true, 
              useATR: true,
              stopLossPercentage: 8
          }
      },
      // 5. 價量突圍 (Volume Breakout)
      {
          name: '價量突圍 (Vol Breakout)',
          type: 'HIGH',
          logicType: 'Volume / Momentum',
          indicators: ['VWMA(5)', 'EMA(5,10)', 'ATR(14)'],
          roleDescription: 'VWMA:量能突圍偵測 | EMA:短線加速確認 | ATR:快速停損',
          config: {
             useVWMA: true, vwmaPeriod: 5,
             useEMA: true, emaShort: 5, emaLong: 10,
             useATR: true,
             stopLossPercentage: 6
          }
      }
  ];

  // 1. 批量執行所有策略 (Scan Phase)
  const results = strategies.map(strategy => {
      const testParams = {
        ...params,
        useSMA: false, useEMA: false, useRSI: false, useMACD: false, useKD: false, useVWMA: false,
        useVWAP: false, useStoch: false, useATR: false, useOBV: false,
        ...strategy.config
      };
      const processed = calculateIndicators(data, testParams);
      const core = executeBacktestCore(processed, testParams);
      
      // 計算評分
      const tradeCount = core.trades.length;
      let score = isNaN(core.sharpeRatio) ? -999 : core.sharpeRatio;
      
      // 懲罰邏輯 (非黑箱，確保有足夠交易樣本)
      if (tradeCount < 5) score *= 0.5; 
      else if (tradeCount < 10) score *= 0.8;
      
      // 嚴重回撤懲罰
      if (core.maxDrawdown > 0.4) score *= 0.6;

      return { strategy, core, score, testParams };
  });

  // 2. 排序找出最佳解 (Evaluation Phase)
  results.sort((a, b) => b.score - a.score);
  const bestResult = results[0];
  
  if (!bestResult) {
      return { trades: [], totalReturn: 0, finalCapital: params.initialCapital, winRate: 0, maxDrawdown: 0, sharpeRatio: NaN, equityCurve: [], totalFees: 0, totalTax: 0 };
  }

  // 3. 生成完整紀錄表 (Logging Phase)
  const logs: BacktestLogItem[] = results.map(item => {
     const isOptimal = item === bestResult;
     const tradeCount = item.core.trades.length;
     
     // 生成具體的淘汰/保留原因 (Transparent Reasoning)
     let reason = "";
     if (isOptimal) {
         reason = "最佳風險調整後報酬 (Optimal Risk-Reward)";
     } else if (tradeCount < 10) {
         reason = "交易樣本不足 (Insufficient Trades)";
     } else if (item.core.maxDrawdown > 30) {
         reason = "最大回撤過高 (High Risk)";
     } else if (item.core.sharpeRatio < 0) {
         reason = "夏普比率為負 (Negative Sharpe)";
     } else if (item.core.totalReturn < bestResult.core.totalReturn * 0.5) {
         reason = "總報酬顯著落後 (Underperformance)";
     } else {
         reason = "績效次於最佳解 (Suboptimal)";
     }

     const closed = item.core.trades.filter(t => t.status === 'CLOSED');
     const winRate = closed.length > 0 ? roundToTwo(closed.filter(t => (t.pnl || 0) > 0).length / closed.length * 100) : 0;

     return {
        combination: item.strategy.name,
        logicType: item.strategy.logicType,
        timeframe: 'Daily', // 目前系統固定為日線
        frequency: item.strategy.type,
        tradeCount: tradeCount,
        winRate: winRate,
        return: roundToTwo(item.core.totalReturn * 100),
        mdd: roundToTwo(item.core.maxDrawdown * 100),
        sharpe: isNaN(item.core.sharpeRatio) ? 0 : roundToTwo(item.core.sharpeRatio),
        status: isOptimal ? 'OPTIMAL' : 'REJECTED',
        reason: reason,
        // Mandatory Disclosure Fields
        indicators: item.strategy.indicators,
        roleDescription: item.strategy.roleDescription
     };
  });

  const finalClosed = bestResult.core.trades.filter(t => t.status === 'CLOSED');
  const finalWinRate = finalClosed.length > 0 ? roundToTwo(finalClosed.filter(t => (t.pnl || 0) > 0).length / finalClosed.length * 100) : 0;

  // AI 建議文案 (Human-Readable Summary)
  const bestLog = logs.find(l => l.status === 'OPTIMAL');
  const freqMap = { 'HIGH': '高頻交易', 'MID': '波段操作', 'LOW': '長線持有' };
  const freqText = bestLog?.frequency ? freqMap[bestLog.frequency] : '未知';
  const logicText = bestResult.strategy.logicType;
  const indicatorsText = bestResult.strategy.indicators.join('、');
  const roleText = bestResult.strategy.roleDescription;

  const aiExplanation = `AI 掃描顯示「${bestLog?.combination}」為當前市場狀態下的最佳策略。

1. **技術指標組合**：本策略使用 [${indicatorsText}] 進行綜合判斷。
2. **指標角色說明**：${roleText}。
3. **策略特性**：此組合屬於【${logicText}】邏輯的【${freqText}】風格。
4. **績效摘要**：回測期間共執行 ${bestLog?.tradeCount} 筆交易，捕捉了市場波動，並將最大回撤控制在 ${bestLog?.mdd}%。

相比其他因樣本不足或風險過高而被剔除的策略，此配置在「訊號覆蓋率」與「風險控制」間取得了最佳平衡。`;

  return {
    trades: bestResult.core.trades,
    totalReturn: roundToTwo(bestResult.core.totalReturn * 100),
    finalCapital: bestResult.core.equityCurve[bestResult.core.equityCurve.length - 1]?.equity || params.initialCapital,
    winRate: finalWinRate,
    maxDrawdown: roundToTwo(bestResult.core.maxDrawdown * 100),
    sharpeRatio: isNaN(bestResult.core.sharpeRatio) ? NaN : roundToTwo(bestResult.core.sharpeRatio),
    equityCurve: bestResult.core.equityCurve,
    totalFees: 0, totalTax: 0,
    aiAutoConfig: {
        bestCombination: [bestResult.strategy.name],
        metrics: {
          sharpe: isNaN(bestResult.core.sharpeRatio) ? 0 : roundToTwo(bestResult.core.sharpeRatio),
          return: roundToTwo(bestResult.core.totalReturn * 100),
          mdd: roundToTwo(bestResult.core.maxDrawdown * 100),
          winRate: finalWinRate
        },
        backtestLog: logs, // 回傳完整紀錄表 (含指標細節)
        aiRecommendation: aiExplanation
    }
  };
};
