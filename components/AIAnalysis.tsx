
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
                  <p><strong className="text-indigo-300">公司簡介：</strong> {report?.companyProfile || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">產業地位：</strong> {report?.industryPosition || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">財務分析：</strong> {report?.financialAnalysis || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">成長性：</strong> {report?.growthPotential || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">競爭優勢：</strong> {report?.competitiveAdvantage || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">風險因子：</strong> {report?.riskFactors || '資料暫無'}</p>
                  <p><strong className="text-indigo-300">投資建議：</strong> <span className="text-2xl font-black text-amber-400">{report?.investmentAdvice || 'N/A'}</span></p>
                  <p><strong className="text-indigo-300">目標價區間：</strong> {report?.targetPriceZone || 'N/A'}</p>
                </div>
              </section>

              {/* AI 決策區塊 */}
              <section className="bg-slate-900 p-6 rounded-xl border border-slate-700 min-h-[220px]">
                <h4 className="text-2xl font-extrabold text-white mb-3">AI 決策與重點</h4>
                <div className="text-lg text-slate-200 leading-relaxed">
                  {aiConfig ? (
                    <div className="space-y-3">
                      <p><strong className="text-indigo-300">推薦參數：</strong> {JSON.stringify(aiConfig.recommendedParams || aiConfig)}</p>
                      <p><strong className="text-indigo-300">模型信心：</strong> {aiConfig.confidence ? `${aiConfig.confidence}%` : 'N/A'}</p>
                      <p><strong className="text-indigo-300">關鍵要點：</strong> {aiConfig.summary || aiConfig.notes || '無'}</p>
                    </div>
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
