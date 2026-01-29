
import React, { useState, useCallback } from 'react';
import StrategyForm from './components/StrategyForm';
import MetricsPanel from './components/MetricsPanel';
import Chart from './components/Chart';
import ChipPanel from './components/ChipPanel';
import TradeList from './components/TradeList';
import AIAnalysis from './components/AIAnalysis';
import ThemeAnalysisPanel from './components/ThemeAnalysisPanel';
import { fetchStockData } from './services/dataService';
import { runBacktest, calculateIndicators } from './services/backtestService';
import { analyzeStrategyWithGemini, analyzeSectorStrategyWithGemini, resolveSymbolFromGemini } from './services/geminiService';
import { THEME_LIST } from './services/themeData';
import { StrategyParams, BacktestResult, StockData, AIAnalysisResult, ThemeAnalysisReport, ThemeCandidate } from './types';

const INITIAL_PARAMS: StrategyParams = {
  symbol: '', 
  initialCapital: 1000000, 
  startYear: 2022, 
  endYear: 2024, 
  backtestYears: 3, 
  type: 'Combined', 
  tradingMode: 'LONG_ONLY', 
  commissionRate: 0.001425, 
  taxRate: 0.003, 
  stopLossPercentage: 10, 
  takeProfitPercentage: 30, 
  useSMA: true, 
  useEMA: false, 
  useRSI: false, 
  useMACD: false, 
  useKD: false,
  useVWMA: false, 
  useVWAP: false, 
  useStoch: false, 
  useATR: false, 
  useOBV: false,
  shortWindow: 5, 
  longWindow: 20, 
  emaShort: 12, 
  emaLong: 26, 
  rsiPeriod: 14, 
  rsiOverbought: 70, 
  rsiOversold: 30, 
  vwmaPeriod: 20
};

const App: React.FC = () => {
  const [params, setParams] = useState<StrategyParams>(INITIAL_PARAMS);
  const [executedParams, setExecutedParams] = useState<StrategyParams | null>(null);
  const [mode, setMode] = useState<'SINGLE' | 'THEME'>('SINGLE');
  const [data, setData] = useState<StockData[]>([]);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [themeKeyword, setThemeKeyword] = useState('');
  const [themeReport, setThemeReport] = useState<ThemeAnalysisReport | null>(null);
  const [isSectorAiLoading, setIsSectorAiLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSingleStockBacktest = useCallback(async (overrideSymbol?: string) => {
    let targetInput = (overrideSymbol || params.symbol).trim();
    if (!targetInput) { setError("請輸入代號。"); return; }
    
    setData([]); setBacktestResult(null); setAiAnalysis(null); setError(null); setIsLoading(true);
    
    try {
      let ticker = targetInput;
      // 簡單的正則檢查，若非標準代號則嘗試用 AI 解析
      if (!/^\d{4}(\.TW|\.TWO)?$/i.test(targetInput)) {
          const resolved = await resolveSymbolFromGemini(targetInput);
          if (resolved === "ERROR") throw new Error("代號解析失敗，請確認名稱或直接輸入代號。");
          ticker = resolved;
      }

      const today = new Date();
      const currentYear = today.getFullYear();
      const startYear = currentYear - (params.backtestYears || 3);
      const endYear = currentYear;

      const rawData = await fetchStockData(ticker, startYear, endYear);
      const result = runBacktest(rawData, params);
      const dataWithIndicators = calculateIndicators(rawData, params);
      
      setExecutedParams({...params, symbol: ticker, startYear, endYear});
      setData(dataWithIndicators);
      setBacktestResult(result);
      setIsLoading(false);

      if (result.trades.length > 0) {
        setIsAiLoading(true);
        const analysis = await analyzeStrategyWithGemini(result, {...params, startYear, endYear});
        setAiAnalysis(analysis);
        setIsAiLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [params]);

  const handleThemeAnalysis = useCallback(async () => {
    if (!themeKeyword) { setError("請選擇族群。"); return; }
    const theme = THEME_LIST.find(t => t.id === themeKeyword);
    if (!theme) return;

    setError(null); setThemeReport(null); setIsLoading(true);

    try {
      const candidates: ThemeCandidate[] = [];
      const today = new Date();
      const startYear = today.getFullYear() - (params.backtestYears || 3);
      const endYear = today.getFullYear();

      for (const stock of theme.stocks) {
        try {
          const rawData = await fetchStockData(stock.symbol, startYear, endYear);
          const result = runBacktest(rawData, params);
          candidates.push({ symbol: stock.symbol, name: stock.name, market: stock.market, status: 'NORMAL', backtest: result });
        } catch (e) {
          candidates.push({ symbol: stock.symbol, name: stock.name, market: stock.market, status: 'DATA_ERROR' });
        }
      }

      candidates.sort((a, b) => (b.backtest?.totalReturn || 0) - (a.backtest?.totalReturn || 0));
      setThemeReport({ theme: theme.name, candidates });
      setIsLoading(false);

      if (candidates.some(c => c.status === 'NORMAL')) {
        setIsSectorAiLoading(true);
        const sectorAnalysis = await analyzeSectorStrategyWithGemini(theme.name, candidates, {...params, startYear, endYear});
        setThemeReport(prev => prev ? { ...prev, sectorAnalysis } : null);
        setIsSectorAiLoading(false);
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  }, [themeKeyword, params]);

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 text-slate-200">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Trade<span className="text-indigo-500">Strategy</span> AI</h1>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Institutional Backtesting Engine • Gemini 3.0 Pro</p>
          </div>
        </header>

        {/* 如果沒有結果，顯示寬表單 */}
        {!backtestResult && !themeReport && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <aside className="lg:col-span-2">
              <StrategyForm params={params} onChange={setParams} onRun={() => mode === 'SINGLE' ? handleSingleStockBacktest() : handleThemeAnalysis()} isLoading={isLoading} mode={mode} setMode={setMode} themeKeyword={themeKeyword} setThemeKeyword={setThemeKeyword} />
            </aside>

            <main className="lg:col-span-3">
              {error && <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-4 rounded-xl mb-6 text-xs font-bold">{error}</div>}
              
              <div className="h-[500px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-3xl text-slate-600 bg-slate-900/30">
                  <div className="max-w-md text-center space-y-4">
                     <h2 className="text-3xl font-black text-white">🚀 歡迎使用專業回測系統</h2>
                     <p className="text-sm text-slate-400 leading-relaxed">
                        本系統整合 Gemini AI 與多因子策略模型。請從左側面板開始：
                     </p>
                     <div className="grid grid-cols-1 gap-3 text-left bg-slate-900 p-6 rounded-xl border border-slate-800/50 shadow-inner">
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold">1</span>
                           <span className="text-xs text-slate-300">輸入股票代號 (如 2330.TW) 或選擇熱門族群。</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold">2</span>
                           <span className="text-xs text-slate-300">勾選想要使用的技術指標 (支援多選共識決)。</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="w-6 h-6 flex items-center justify-center bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold">3</span>
                           <span className="text-xs text-slate-300">點擊「執行回測」開始分析。</span>
                        </div>
                     </div>
                  </div>
              </div>
            </main>
          </div>
        )}

        {/* 如果有結果，顯示全寬佈局 */}
        {(backtestResult || themeReport) && (
          <div className="flex flex-col gap-6">
            {/* 圖表區域 - 固定上方 */}
            {mode === 'SINGLE' && backtestResult && (
              <div className="animate-fadeIn space-y-6">
                <MetricsPanel result={backtestResult} />
                <Chart data={data} trades={backtestResult.trades} strategyType={executedParams?.type || 'SMA'} shortWindow={executedParams?.shortWindow || 5} longWindow={executedParams?.longWindow || 20} />
                <ChipPanel data={data} />
              </div>
            )}

            {/* 下方兩個區塊滿版 */}
            {mode === 'SINGLE' && backtestResult && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TradeList trades={backtestResult.trades} />
                <AIAnalysis analysis={aiAnalysis} backtestResult={backtestResult} isLoading={isAiLoading} />
              </div>
            )}

            {mode === 'THEME' && themeReport && (
               <ThemeAnalysisPanel 
                 report={themeReport} 
                 isLoading={isLoading} 
                 theme={themeReport.theme} 
                 isSectorAiLoading={isSectorAiLoading}
                 onSelectStock={(c) => {
                    setMode('SINGLE');
                    setParams(p => ({...p, symbol: c.symbol}));
                    handleSingleStockBacktest(c.symbol);
                 }} 
               />
            )}

            {error && <div className="bg-rose-500/10 border border-rose-500/40 text-rose-300 p-4 rounded-xl text-xs font-bold">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
