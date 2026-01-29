
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
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg animate-pulse h-full min-h-[500px]">
        <div className="h-8 bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="space-y-6">
          <div className="h-28 bg-slate-700/50 rounded w-full"></div>
          <div className="h-40 bg-slate-700/50 rounded w-full"></div>
        </div>
      </div>
    );
  }

  const report = analysis?.report;
  const aiConfig = backtestResult?.aiAutoConfig;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px] animate-fadeIn">
      {/* Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-white font-extrabold flex items-center gap-3 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          專業投資研究報告 (Gemini 3 Pro)
        </h3>
        <span className="text-[12px] font-mono text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 bg-indigo-500/10 uppercase tracking-tighter">
          INSTITUTIONAL GRADE
        </span>
      </div>

      <div className="p-6 space-y-6 flex-1 bg-slate-800">
        {!analysis && !aiConfig ? (
          <div className="text-center py-10">
            <p className="text-slate-400 text-base">請先執行回測以生成投資報告</p>
          </div>
        ) : (
          <>
            {/* 重新設計：將內容分為兩個獨立區塊，字體放大且不使用內部滾動 */}
            <div className="grid grid-cols-1 gap-6">
              {/* 研究報告區塊 */}
              <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 min-h-[320px]">
                <h4 className="text-2xl font-extrabold text-white mb-3">專業研究報告</h4>
                <div className="text-lg text-slate-200 leading-relaxed space-y-4">
                  {report ? (
                    <>
                      <p><strong className="text-indigo-300">公司簡介：</strong> {report.companyProfile || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">產業地位：</strong> {report.industryPosition || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">財務分析：</strong> {report.financialAnalysis || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">成長性：</strong> {report.growthPotential || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">競爭優勢：</strong> {report.competitiveAdvantage || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">風險因子：</strong> {report.riskFactors || '資料暫無'}</p>
                      <p><strong className="text-indigo-300">投資建議：</strong> <span className="text-2xl font-black text-amber-400">{report.investmentAdvice || 'N/A'}</span></p>
                      <p><strong className="text-indigo-300">目標價區間：</strong> {report.targetPriceZone || 'N/A'}</p>
                    </>
                  ) : (
                    (() => {
                      const cfg: any = aiConfig as any;
                      if (cfg && Array.isArray(cfg.backtestLog) && cfg.backtestLog.length > 0) {
                        const primary = cfg.backtestLog.find((l: any) => l.status === 'OPTIMAL') || cfg.backtestLog[0];
                        return (
                          <>
                            <p><strong className="text-indigo-300">推薦組合：</strong> <span className="font-bold text-white text-xl">{primary.combination}</span></p>
                            <p><strong className="text-indigo-300">策略類型：</strong> {primary.logicType} / {primary.timeframe} / {primary.frequency}</p>
                            <p><strong className="text-indigo-300">指標：</strong> {(primary.indicators || []).join('，') || '無'}</p>
                            <p><strong className="text-indigo-300">指標角色：</strong> {primary.roleDescription || '無'}</p>
                            <p><strong className="text-indigo-300">績效摘要：</strong> 交易次數 {primary.tradeCount}，勝率 {primary.winRate}%，報酬 {primary.return}%，MDD {primary.mdd}%</p>
                            <p><strong className="text-indigo-300">狀態/原因：</strong> {primary.status} / {primary.reason || '無'}</p>
                            <p className="text-sm text-slate-400">此內容由回測結果摘要生成；如需更完整研究報告，請執行深入分析。</p>
                          </>
                        );
                      }

                      return (<p className="text-slate-400">請先執行回測以生成投資報告或等待 AI 產生分析內容。</p>);
                    })()
                  )}
                </div>
              </section>

              {/* AI 決策區塊 */}
              <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 min-h-[220px]">
                <h4 className="text-2xl font-extrabold text-white mb-3">AI 決策與重點</h4>
                <div className="text-lg text-slate-200 leading-relaxed">
                  {aiConfig ? (
                    (() => {
                      const cfg: any = aiConfig as any;
                      if (cfg && (cfg.backtestLog || cfg.bestCombination)) {
                        return (
                          <>
                            <div className="mb-4">
                              <div className="text-sm text-slate-400">推薦組合</div>
                              <div className="text-xl font-black text-indigo-300">{cfg.bestCombination && cfg.bestCombination.length ? cfg.bestCombination[0] : (cfg.bestCombination || 'N/A')}</div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-4 text-center">
                              <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Sharpe</div>
                                <div className="text-lg font-bold text-amber-400">{cfg.metrics?.sharpe ?? 'N/A'}</div>
                              </div>
                              <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Return</div>
                                <div className="text-lg font-bold text-emerald-400">{cfg.metrics?.return ?? 'N/A'}%</div>
                              </div>
                              <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">MDD</div>
                                <div className="text-lg font-bold text-rose-400">-{cfg.metrics?.mdd ?? 'N/A'}%</div>
                              </div>
                              <div className="bg-slate-800 p-3 rounded">
                                <div className="text-xs text-slate-400">Win Rate</div>
                                <div className="text-lg font-bold text-white">{cfg.metrics?.winRate ?? 'N/A'}%</div>
                              </div>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-slate-700 mb-4">
                              <table className="w-full text-sm text-left">
                                <thead className="bg-slate-900 text-slate-400 uppercase text-xs">
                                  <tr>
                                    <th className="px-3 py-2">組合</th>
                                    <th className="px-3 py-2">類型</th>
                                    <th className="px-3 py-2">頻率</th>
                                    <th className="px-3 py-2 text-right">交易次數</th>
                                    <th className="px-3 py-2 text-right">勝率</th>
                                    <th className="px-3 py-2 text-right">報酬</th>
                                    <th className="px-3 py-2 text-right">MDD</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50 bg-slate-900/30">
                                  {Array.isArray(cfg.backtestLog) && cfg.backtestLog.map((log: any, idx: number) => (
                                    <tr key={idx} className={log.status === 'OPTIMAL' ? 'bg-indigo-900/20' : 'hover:bg-slate-800/50'}>
                                      <td className="px-3 py-2 font-bold text-slate-300">{log.combination}</td>
                                      <td className="px-3 py-2 text-xs text-slate-400">{log.logicType}</td>
                                      <td className="px-3 py-2 text-xs text-slate-400">{log.frequency}</td>
                                      <td className="px-3 py-2 text-right font-mono text-slate-400">{log.tradeCount}</td>
                                      <td className="px-3 py-2 text-right font-mono text-slate-300">{log.winRate}%</td>
                                      <td className={`px-3 py-2 text-right font-mono font-bold ${log.return >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{log.return}%</td>
                                      <td className="px-3 py-2 text-right text-rose-400 font-mono">-{log.mdd}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="bg-slate-900/80 p-4 rounded border border-indigo-500/30 text-sm text-slate-300 shadow-inner whitespace-pre-wrap">
                              <h5 className="font-bold text-indigo-400 mb-2">AI 建議</h5>
                              <div>{cfg.aiRecommendation || cfg.aiRecommendationText || cfg.aiRecommendation || '無'}</div>
                            </div>

                            <div className="mt-3 text-sm text-slate-400">模型信心: <span className="font-bold text-white">{cfg.confidence ?? 'N/A'}</span></div>
                          </>
                        );
                      }

                      return (<p className="text-slate-400">AI 決策資料暫無或尚在生成中。</p>);
                    })()
                  ) : (
                    <p className="text-slate-400">AI 決策資料暫無或尚在生成中。</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(AIAnalysis);
