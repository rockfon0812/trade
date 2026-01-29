
import { GoogleGenAI, Type } from "@google/genai";
import { BacktestResult, StrategyParams, AIAnalysisResult, ThemeCandidate, SectorAnalysisResult } from "../types";

// 環境偵測：是否有本地 API Key
const LOCAL_API_KEY = process.env.API_KEY;
const IS_LOCAL_MODE = !!LOCAL_API_KEY;

export const analyzeSectorStrategyWithGemini = async (themeName: string, candidates: ThemeCandidate[], params: StrategyParams): Promise<SectorAnalysisResult> => {
  const sorted = [...candidates].filter(c => c.status === 'NORMAL');
  const representative = [
    ...sorted.slice(0, 5).map(c => ({ name: c.name, return: c.backtest?.totalReturn, winRate: c.backtest?.winRate, status: 'TOP_PERFORMER' })),
    ...sorted.slice(-2).map(c => ({ name: c.name, return: c.backtest?.totalReturn, winRate: c.backtest?.winRate, status: 'LAGGING' }))
  ];

  // 定義本地開發時的邏輯 (Admin Only)
  const localExecution = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
      const prompt = `
        族群: ${themeName}
        回測區間: ${params.startYear} ~ ${params.endYear}
        量化數據摘要: ${JSON.stringify(representative)}
        
        請扮演一位【資深證券投顧研究員】，針對此族群撰寫一份「法人級深度研究報告」。
        內容需包含：趨勢判斷、信心指數、族群概況、市場表現、成分股分析、技術/籌碼/基本面分析、風險與策略。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          systemInstruction: "你是一位頂尖的金融量化分析師。請輸出符合 Schema 定義的嚴謹 JSON 格式報告。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sectorTrend: { type: Type.STRING, description: "BULLISH, BEARISH, or NEUTRAL" },
              trendReason: { type: Type.STRING, description: "趨勢判斷的一句話簡評" },
              confidenceScore: { type: Type.NUMBER, description: "0-100 的信心指數" },
              overview: { type: Type.STRING, description: "1. 族群概況" },
              marketPerformance: { type: Type.STRING, description: "2. 近期表現" },
              componentAnalysis: { type: Type.STRING, description: "3. 成分股分析" },
              technicalAnalysis: { type: Type.STRING, description: "4. 技術面" },
              chipAnalysis: { type: Type.STRING, description: "5. 籌碼面" },
              fundamentalAnalysis: { type: Type.STRING, description: "6. 基本面" },
              riskFactors: { type: Type.STRING, description: "7. 風險因子" },
              strategyAdvice: { type: Type.STRING, description: "8. 操作策略建議" }
            },
            required: ["sectorTrend", "trendReason", "confidenceScore", "overview", "marketPerformance", "componentAnalysis", "technicalAnalysis", "chipAnalysis", "fundamentalAnalysis", "riskFactors", "strategyAdvice"]
          }
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("[AI] Local Sector Analysis failed:", error);
      throw error;
    }
  };

  // 本地模式直接執行，公開模式依賴環境變數配置
  if (IS_LOCAL_MODE) {
    console.log(`[DevMode] Direct Sector Analysis`);
    return localExecution();
  } else {
    console.warn("[PublicMode] Sector Analysis requires GEMINI_API_KEY environment variable. Returning default response.");
    return { 
      sectorTrend: 'NEUTRAL',
      trendReason: '無法進行 AI 分析 - 請在 Vercel 環境變數中設置 GEMINI_API_KEY',
      confidenceScore: 0,
      overview: "分析服務暫時無法使用",
      marketPerformance: "N/A",
      componentAnalysis: "N/A",
      technicalAnalysis: "N/A",
      chipAnalysis: "N/A",
      fundamentalAnalysis: "N/A",
      riskFactors: "N/A",
      strategyAdvice: "請稍後再試",
    };
  }
};

export const analyzeStrategyWithGemini = async (result: BacktestResult, params: StrategyParams): Promise<AIAnalysisResult> => {
  // 定義本地開發時的邏輯 (Admin Only)
  const localExecution = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
      const prompt = `
        請撰寫一份專業的個股投資研究報告。
        標的: ${params.symbol}
        回測區間: ${params.startYear} ~ ${params.endYear}
        回測結果: 總報酬 ${result.totalReturn}%, 勝率 ${result.winRate}%, 最大回撤 ${result.maxDrawdown}%, Sharpe Ratio ${result.sharpeRatio}。
        請模擬券商法人研究報告的語氣，包含：公司簡介、產業地位、財務、成長性、競爭優勢、風險、投資建議、目標區間。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          systemInstruction: "你是一位頂尖的華爾街投資分析師。請輸出符合 Schema 定義的嚴謹 JSON 格式報告。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: {
                type: Type.OBJECT,
                properties: {
                  companyProfile: { type: Type.STRING },
                  industryPosition: { type: Type.STRING },
                  financialAnalysis: { type: Type.STRING },
                  growthPotential: { type: Type.STRING },
                  competitiveAdvantage: { type: Type.STRING },
                  riskFactors: { type: Type.STRING },
                  investmentAdvice: { type: Type.STRING },
                  targetPriceZone: { type: Type.STRING }
                },
                required: ["companyProfile", "industryPosition", "financialAnalysis", "growthPotential", "competitiveAdvantage", "riskFactors", "investmentAdvice", "targetPriceZone"]
              }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("AI Analysis Failed:", error);
      return { report: undefined };
    }
  };

  // 本地模式直接執行，公開模式依賴環境變數配置
  if (IS_LOCAL_MODE) {
    console.log(`[DevMode] Direct AI Analysis`);
    return localExecution();
  } else {
    console.warn("[PublicMode] AI Analysis requires GEMINI_API_KEY environment variable. Returning default response.");
    return { 
      report: {
        companyProfile: "無法進行 AI 分析 - 請在 Vercel 環境變數中設置 GEMINI_API_KEY",
        industryPosition: "N/A",
        financialAnalysis: "N/A",
        growthPotential: "N/A",
        competitiveAdvantage: "N/A",
        riskFactors: "N/A",
        investmentAdvice: "N/A",
        targetPriceZone: "N/A"
      }
    };
  }
};

export const resolveSymbolFromGemini = async (input: string): Promise<string> => {
  if (!IS_LOCAL_MODE) {
    console.warn("[PublicMode] Symbol resolution requires GEMINI_API_KEY. Please set it in environment variables.");
    return "ERROR";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
    const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: `將 "${input}" 轉換為 Yahoo Finance 代號（如 2330.TW）。僅回傳代號，不要有其他文字。` 
    });
    return response.text?.trim() || "ERROR";
  } catch (error) {
    console.error("Symbol resolution failed:", error);
    return "ERROR";
  }
};

/**
 * 生成【策略診斷報告】：以專業分析師角度分析策略為何只在特定時期發生交易
 * 輸入：回測結果 + 交易清單 + 策略參數
 * 輸出：交易時間分佈分析、市場微觀結構影響、指標信號特性等
 */
export const generateStrategyDiagnosisWithGemini = async (
  result: BacktestResult,
  params: StrategyParams,
  backtestLogItem?: { combination: string; roleDescription: string; indicators: string[] }
): Promise<{ diagnosis: string; timeDistributionAnalysis: string; recommendedImprovement: string }> => {
  const localExecution = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: LOCAL_API_KEY });
      
      // 提取交易月份/季度分佈
      const tradesByQuarter = result.trades.reduce((acc, trade) => {
        const date = new Date(trade.entryDate);
        const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)}`;
        const key = `${date.getFullYear()}-${quarter}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tradesByMonth = result.trades.reduce((acc, trade) => {
        const date = new Date(trade.entryDate);
        const month = `${date.getMonth() + 1}月`;
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const prompt = `
        【交易策略診斷任務】
        
        標的: ${params.symbol}
        回測期間: ${params.startYear} ~ ${params.endYear}
        總交易次數: ${result.trades.length}
        總報酬: ${result.totalReturn}%
        勝率: ${result.winRate}%
        最大回撤: ${result.maxDrawdown}%
        
        策略配置:
        ${backtestLogItem ? `- 組合名稱: ${backtestLogItem.combination}` : ''}
        ${backtestLogItem ? `- 指標清單: ${backtestLogItem.indicators.join(', ')}` : ''}
        ${backtestLogItem ? `- 指標角色: ${backtestLogItem.roleDescription}` : ''}
        - 初始資本: ${params.initialCapital}
        - 佣金率: ${params.commissionRate}%
        - 稅率: ${params.taxRate}%
        - 停損: ${params.stopLossPercentage}%
        - 獲利目標: ${params.takeProfitPercentage}%
        
        交易時間分佈（按季度）:
        ${JSON.stringify(tradesByQuarter, null, 2)}
        
        交易時間分佈（按月份）:
        ${JSON.stringify(tradesByMonth, null, 2)}
        
        交易清單 (前10筆):
        ${result.trades.slice(0, 10).map((t, i) => `${i + 1}. ${t.entryDate} 進場 @ ${t.entryPrice} | ${t.exitDate ? `${t.exitDate} 出場 @ ${t.exitPrice}` : '持有中'} | PnL: ${t.pnl?.toFixed(2)}`).join('\n')}
        
        請以【量化分析師】角色撰寫一份「策略診斷報告」，分析：
        1. 【交易時間分佈】交易為何集中在特定季節或月份？
        2. 【市場微觀結構】是否與季末、財報期等市場事件有關？
        3. 【指標信號特性】該策略的指標組合（${backtestLogItem?.indicators.join(', ') || 'N/A'}）何時發出最強信號？
        4. 【流動性因素】交易集中時期是否流動性較佳或波動性較高？
        5. 【樣本量評估】交易次數是否足夠代表該策略的穩定性？
        6. 【改善建議】如何擴展交易機會或降低時間集中風險？
        
        輸出格式：
        {
          "diagnosis": "整體診斷摘要（2-3句）",
          "timeDistributionAnalysis": "詳細的時間分佈分析（包括季度/月份特徵）",
          "recommendedImprovement": "具體改善建議（如調整參數、擴展指標等）"
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          systemInstruction: "你是一位資深的量化交易分析師與風險管理專家。請提供深度、專業、具有可操作性的診斷報告。",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diagnosis: { type: Type.STRING, description: "整體診斷摘要" },
              timeDistributionAnalysis: { type: Type.STRING, description: "時間分佈詳細分析" },
              recommendedImprovement: { type: Type.STRING, description: "改善建議" }
            },
            required: ["diagnosis", "timeDistributionAnalysis", "recommendedImprovement"]
          }
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("[AI] Strategy Diagnosis failed:", error);
      throw error;
    }
  };

  if (IS_LOCAL_MODE) {
    console.log(`[DevMode] Direct Strategy Diagnosis`);
    return localExecution();
  } else {
    console.warn("[PublicMode] Strategy Diagnosis requires GEMINI_API_KEY. Returning placeholder.");
    return {
      diagnosis: "無法進行診斷 - 請在 Vercel 環境變數中設置 GEMINI_API_KEY",
      timeDistributionAnalysis: "分析服務暫時無法使用，待環境變數配置後將提供詳細分析",
      recommendedImprovement: "N/A"
    };
  }
};
