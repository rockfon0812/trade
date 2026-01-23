
export type StrategyType = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'Bollinger' | 'OBV' | 'KD' | 'ADX' | 'VWMA' | 'Combined' | 'AI_AUTO';
export type TradingMode = 'LONG_ONLY' | 'SHORT_ONLY' | 'BOTH';

export interface StockData {
  date: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  volume: number;
  smaShort?: number;
  smaLong?: number;
  emaShort?: number;
  emaLong?: number;
  rsi?: number;
  vwma?: number;
  foreign?: number;
  trust?: number;
  dealer?: number;
  vwap?: number;
  atr?: number; // Added for Volatility
  stochK?: number;
  stochD?: number;
  macd?: number;
  signal?: number;
  hist?: number;
  obv?: number;
}

export interface Trade {
  id: string;
  entryDate: string;
  entryPrice: number;
  exitDate?: string;
  exitPrice?: number;
  pnl?: number;
  type: 'LONG' | 'SHORT';
  status: 'OPEN' | 'CLOSED';
  fees: number;
  tax: number;
  exitReason?: 'STRATEGY' | 'STOP_LOSS' | 'TAKE_PROFIT' | 'FORCE_CLOSE' | 'TRAILING_STOP';
}

export interface StrategyParams {
  symbol: string;
  initialCapital: number;
  startYear: number;
  endYear: number;
  backtestYears?: number; 
  type: StrategyType;
  tradingMode: TradingMode;
  commissionRate: number;
  taxRate: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  
  useSMA: boolean;
  useEMA: boolean;
  useRSI: boolean;
  useMACD: boolean;
  useKD: boolean;
  useVWMA: boolean;
  useVWAP: boolean;
  useStoch: boolean;
  useATR: boolean; // Volatility Stop
  useOBV: boolean;
  
  shortWindow: number;
  longWindow: number;
  emaShort: number;
  emaLong: number;
  rsiPeriod: number;
  rsiOverbought: number;
  rsiOversold: number;
  vwmaPeriod: number;
}

export interface BacktestLogItem {
  combination: string;
  logicType: string; 
  timeframe: string;
  frequency: 'HIGH' | 'MID' | 'LOW'; 
  tradeCount: number;
  winRate: number;
  return: number;
  mdd: number;
  sharpe: number;
  status: 'OPTIMAL' | 'REJECTED';
  reason?: string;
  // New: Mandatory Indicator Disclosure
  indicators: string[]; // e.g. ["RSI(14)", "SMA(5,20)"]
  roleDescription: string; // e.g. "RSI:Entry, SMA:Filter"
}

export interface AIAutoConfigResult {
  bestCombination: string[];
  metrics: {
    sharpe: number;
    return: number;
    mdd: number;
    winRate: number;
  };
  backtestLog: BacktestLogItem[];
  aiRecommendation: string;
}

export interface BacktestResult {
  trades: Trade[];
  totalReturn: number;
  finalCapital: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  equityCurve: { date: string; equity: number }[];
  totalFees: number;
  totalTax: number;
  aiAutoConfig?: AIAutoConfigResult;
}

export interface ProfessionalReport {
  companyProfile: string;
  industryPosition: string;
  financialAnalysis: string;
  growthPotential: string;
  competitiveAdvantage: string;
  riskFactors: string;
  investmentAdvice: string;
  targetPriceZone: string;
}

export interface AIAnalysisResult {
  report?: ProfessionalReport; // Task 3
  // Keep legacy fields for backward compatibility if needed, or define as optional
  performanceObservations?: { name: string; observation: string }[];
  newWeights?: { name: string; weight: number }[];
  originalWeights?: { name: string; weight: number }[];
  adjustmentReason?: string;
  shouldApply?: string;
  applyReason?: string;
  marketRegime?: string;
}

export interface ThemeStock {
  symbol: string;
  name: string;
  market: string;
}

export interface ThemeCandidate {
  symbol: string;
  name: string;
  market: string;
  status: 'NORMAL' | 'DATA_ERROR';
  backtest?: BacktestResult;
}

export interface SectorAnalysisResult {
  sectorTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  trendReason: string;
  confidenceScore: number; // New: 0-100
  
  // New: Comprehensive Report Structure
  overview: string;          // 1. 族群概況 (背景/產業鏈)
  marketPerformance: string; // 2. 近期表現 (指數/大盤)
  componentAnalysis: string; // 3. 成分股分析 (領頭/落後)
  technicalAnalysis: string; // 4. 技術面 (均線/量能)
  chipAnalysis: string;      // 5. 籌碼面 (法人/大戶)
  fundamentalAnalysis: string; // 6. 基本面 (成長/需求)
  riskFactors: string;       // 7. 風險因子
  strategyAdvice: string;    // 8. 操作建議
}

export interface ThemeAnalysisReport {
  theme: string;
  candidates: ThemeCandidate[];
  sectorAnalysis?: SectorAnalysisResult;
}

export interface FailureLog {
  timestamp: string;
  result: string;
  market_regime: string;
  strategy_type: string;
  reason: string;
}
