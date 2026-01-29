
import React from 'react';
import { AIAnalysisResult, BacktestResult } from '../types';

interface AIAnalysisProps {
  analysis: AIAnalysisResult | null;
  backtestResult?: BacktestResult | null; // Added to access AI Auto Config Logs
  isLoading: boolean;
}

const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, backtestResult, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-pulse h-full">
        <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-700/50 rounded w-full"></div>
          <div className="h-32 bg-slate-700/50 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const report = analysis?.report;
  const aiConfig = backtestResult?.aiAutoConfig;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          專業投資研究報告 (Gemini 3 Pro)
        </h3>
        <span className="text-[10px] font-mono text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 uppercase tracking-tighter">
          INSTITUTIONAL GRADE
        </span>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-800">
        {!analysis && !aiConfig ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">請先執行回測以生成投資報告</p>
          </div>
        ) : (
          <>
            {/* 任務一：AI 自動配置過程紀錄表 */}
            {aiConfig && (
              <section className="mb-6 border-b border-slate-700 pb-6">
                <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   <span className="animate-pulse">🤖</span> AI 策略配置過程紀錄表 (Strategy Scan)
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-700">
                   <table className="w-full text-[10px] text-left">
                      <thead className="bg-slate-900 text-slate-400 uppercase">
                         <tr>
                            <th className="px-3 py-2 min-w-[120px]">策略組合 / 頻率</th>
                            <th className="px-3 py-2 min-w-[180px]">技術指標組合與參數 (Indicators)</th>
                            <th className="px-3 py-2 min-w-[200px]">指標用途 (Role Description)</th>
                            <th className="px-3 py-2 text-right">交易次數</th>
                            <th className="px-3 py-2 text-right">報酬率</th>
                            <th className="px-3 py-2 text-right">MDD</th>
                            <th className="px-3 py-2 text-right">Sharpe</th>
                            <th className="px-3 py-2">狀態</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/50 bg-slate-900/30">
                         {aiConfig.backtestLog.map((log, idx) => (
                            <tr key={idx} className={log.status === 'OPTIMAL' ? 'bg-indigo-900/20' : 'hover:bg-slate-800/50'}>
                               <td className="px-3 py-2">
                                   <div className="font-bold text-slate-300">{log.combination}</div>
                                   <div className="text-[9px] mt-0.5">
                                      <span className={`px-1 py-0.5 rounded ${
                                        log.frequency === 'HIGH' ? 'bg-rose-900/40 text-rose-300' :
                                        log.frequency === 'MID' ? 'bg-blue-900/40 text-blue-300' :
                                        'bg-emerald-900/40 text-emerald-300'
                                      }`}>
                                        {log.frequency} ({log.logicType})
                                      </span>
                                   </div>
                               </td>
                               <td className="px-3 py-2">
                                  <div className="flex flex-wrap gap-1">
                                    {log.indicators && log.indicators.length > 0 ? (
                                      log.indicators.map((ind, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-[9px] text-indigo-300 font-mono">
                                          {ind}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-500">N/A</span>
                                    )}
                                  </div>
                               </td>
                               <td className="px-3 py-2">
                                  <p className="text-[9px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                                    {log.roleDescription || '未提供說明'}
                                  </p>
                               </td>
                               <td className="px-3 py-2 text-right font-mono text-slate-400">{log.tradeCount}</td>
                               <td className={`px-3 py-2 text-right font-mono font-bold ${log.return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{log.return}%</td>
                               <td className="px-3 py-2 text-right font-mono text-rose-300">-{log.mdd}%</td>
                               <td className="px-3 py-2 text-right font-mono text-amber-300">{log.sharpe}</td>
                               <td className="px-3 py-2">
                                  {log.status === 'OPTIMAL' ? (
                                      <span className="flex flex-col">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 w-fit mb-0.5 border border-emerald-500/30">OPTIMAL</span>
                                          <span className="text-[9px] text-emerald-600/70 truncate max-w-[80px]">{log.reason}</span>
                                      </span>
                                  ) : (
                                      <span className="flex flex-col">
                                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-700 text-slate-400 w-fit mb-0.5">REJECTED</span>
                                          <span className="text-[9px] text-slate-600 truncate max-w-[80px]">{log.reason}</span>
                                      </span>
                                  )}
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
                <div className="mt-4 bg-slate-900/80 p-4 rounded border border-indigo-500/30 text-xs text-slate-300 shadow-inner">
                   <h5 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     AI 決策摘要 (Human-Readable Summary)
                   </h5>
                   <p className="leading-relaxed whitespace-pre-wrap pl-1">{aiConfig.aiRecommendation}</p>
                </div>
              </section>
            )}

            {/* 任務三：專業研報內容 */}
            {report ? (
                <div className="space-y-5 animate-fadeIn">
                    {/* 公司與產業 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">公司簡介</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{report.companyProfile}</p>
                        </div>
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">產業地位</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{report.industryPosition}</p>
                        </div>
                    </div>

                    {/* 財務與成長 */}
                    <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">財務分析</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">{report.financialAnalysis}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">成長動能</h4>
                                <p className="text-xs text-slate-300 leading-relaxed">{report.growthPotential}</p>
                            </div>
                        </div>
                    </div>

                    {/* 競爭優勢與風險 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
                            <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">競爭優勢 (Moat)</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{report.competitiveAdvantage}</p>
                        </div>
                        <div className="bg-rose-950/10 p-4 rounded-xl border border-rose-500/20">
                            <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">風險因子</h4>
                            <p className="text-xs text-rose-200/80 leading-relaxed">{report.riskFactors}</p>
                        </div>
                    </div>

                    {/* 投資建議 */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 border border-indigo-500/30 shadow-lg">
                        <div className="flex justify-between items-start mb-3">
                             <h4 className="text-[11px] font-black text-white uppercase tracking-widest">投資建議 (Verdict)</h4>
                             <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                                {report.investmentAdvice.slice(0, 10)}...
                             </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed mb-3">{report.investmentAdvice}</p>
                        <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 uppercase font-bold">目標區間：</span>
                            <span className="text-xs font-mono font-bold text-indigo-300">{report.targetPriceZone}</span>
                        </div>
                    </div>
                </div>
            ) : (
                !aiConfig && (
                    <div className="text-center py-4">
                        <p className="text-xs text-slate-500">正在等待 AI 分析報告...</p>
                    </div>
                )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(AIAnalysis);
