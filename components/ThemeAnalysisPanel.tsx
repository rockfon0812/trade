
import React from 'react';
import { ThemeAnalysisReport, ThemeCandidate } from '../types';

interface ThemeAnalysisPanelProps {
  report: ThemeAnalysisReport | null;
  isLoading: boolean;
  theme: string;
  onSelectStock: (candidate: ThemeCandidate) => void;
  isSectorAiLoading: boolean;
}

const ThemeAnalysisPanel: React.FC<ThemeAnalysisPanelProps> = ({ 
    report, 
    isLoading, 
    theme, 
    onSelectStock,
    isSectorAiLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 shadow-lg flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse">正在掃描族群大數據...</p>
      </div>
    );
  }

  if (!report || !report.candidates) return null;

  const { sectorAnalysis } = report;

  return (
    <div className="space-y-6 mt-8 animate-fadeIn pb-10">
      
      {/* 1. SECTOR HEADER & METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-indigo-500/30 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <svg className="w-32 h-32 text-indigo-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
             </div>
             <h3 className="text-xl font-black text-white tracking-tight mb-1">{theme}</h3>
             <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-4">PROFESSIONAL SECTOR RESEARCH</p>
             
             {isSectorAiLoading ? (
                 <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
                 </div>
             ) : (
                <div className="flex items-end gap-4">
                    <div className={`text-5xl font-black ${sectorAnalysis?.sectorTrend === 'BULLISH' ? 'text-emerald-400' : sectorAnalysis?.sectorTrend === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'}`}>
                        {sectorAnalysis?.sectorTrend || 'NEUTRAL'}
                    </div>
                    <div className="text-sm text-slate-400 mb-2 font-medium max-w-md">
                        "{sectorAnalysis?.trendReason}"
                    </div>
                </div>
             )}
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col items-center justify-center relative">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">信心指數 (Confidence)</h4>
              {isSectorAiLoading ? (
                  <div className="w-24 h-24 rounded-full border-4 border-slate-700 animate-spin"></div>
              ) : (
                  <div className="relative flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                          <circle cx="56" cy="56" r="50" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                          <circle cx="56" cy="56" r="50" stroke={ (sectorAnalysis?.confidenceScore || 0) > 60 ? "#10b981" : (sectorAnalysis?.confidenceScore || 0) > 40 ? "#f59e0b" : "#f43f5e" } strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - ((sectorAnalysis?.confidenceScore || 0) / 100) * 314} className="transition-all duration-1000 ease-out" />
                      </svg>
                      <div className="absolute text-3xl font-black text-white">{sectorAnalysis?.confidenceScore}</div>
                  </div>
              )}
          </div>
      </div>

      {/* 2. DEEP DIVE REPORT GRID */}
      {isSectorAiLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-800 rounded-xl"></div>)}
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* 概況與表現 */}
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-indigo-500/20 pb-2">1. 族群概況 (Overview)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.overview}</p>
             </div>
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mb-3 border-b border-indigo-500/20 pb-2">2. 市場表現 (Performance)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.marketPerformance}</p>
             </div>

             {/* 技術與籌碼 */}
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-widest mb-3 border-b border-sky-500/20 pb-2">4. 技術面解析 (Technical)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.technicalAnalysis}</p>
             </div>
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-sky-400 uppercase tracking-widest mb-3 border-b border-sky-500/20 pb-2">5. 籌碼結構 (Chips)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.chipAnalysis}</p>
             </div>

             {/* 成分股與基本面 */}
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3 border-b border-emerald-500/20 pb-2">3. 成分股輪動 (Components)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.componentAnalysis}</p>
             </div>
             <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3 border-b border-emerald-500/20 pb-2">6. 基本面展望 (Fundamental)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{sectorAnalysis?.fundamentalAnalysis}</p>
             </div>

             {/* 風險與策略 (Full Width) */}
             <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-rose-950/10 p-5 rounded-xl border border-rose-500/20">
                    <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-3 border-b border-rose-500/20 pb-2">7. 關鍵風險 (Risks)</h4>
                    <p className="text-xs text-rose-200/80 leading-relaxed">{sectorAnalysis?.riskFactors}</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900/40 p-5 rounded-xl border border-indigo-500/40 shadow-lg">
                    <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-3 border-b border-indigo-500/20 pb-2">8. 操作策略 (Strategy)</h4>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">{sectorAnalysis?.strategyAdvice}</p>
                </div>
             </div>
          </div>
      )}

      {/* 3. RANKING TABLE */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden mt-8">
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
            <h3 className="text-white font-bold text-sm">族群個股回測排行 (Leaderboard)</h3>
            <span className="text-[10px] text-slate-500">點擊個股可進入詳細回測模式</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                    <tr>
                        <th className="px-6 py-4">排名</th>
                        <th className="px-6 py-4">標的</th>
                        <th className="px-6 py-4 text-right">勝率</th>
                        <th className="px-6 py-4 text-right">最大回撤</th>
                        <th className="px-6 py-4 text-right">總回報</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                    {report.candidates.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/30 cursor-pointer transition-colors group" onClick={() => onSelectStock(item)}>
                            <td className="px-6 py-4 font-black text-slate-500">#{idx + 1}</td>
                            <td className="px-6 py-4">
                                <div className="text-indigo-300 font-bold group-hover:text-indigo-400 transition-colors">{item.symbol}</div>
                                <div className="text-[10px] text-slate-500">{item.name}</div>
                            </td>
                            <td className="px-6 py-4 text-right font-mono text-slate-300">{item.backtest?.winRate}%</td>
                            <td className="px-6 py-4 text-right text-rose-400 font-mono">-{item.backtest?.maxDrawdown}%</td>
                            <td className={`px-6 py-4 text-right font-black ${(item.backtest?.totalReturn || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.backtest?.totalReturn}%
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ThemeAnalysisPanel;
