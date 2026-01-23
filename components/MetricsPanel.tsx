
import React from 'react';
import { BacktestResult } from '../types';

interface MetricsPanelProps {
  result: BacktestResult;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ result }) => {
  return (
    <div className="mb-6 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs mb-1">總報酬率</p>
                <p className={`text-2xl font-black ${result.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{result.totalReturn}%</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs mb-1">勝率</p>
                <p className="text-2xl font-black text-white">{result.winRate}%</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
                <p className="text-slate-400 text-xs mb-1">最大回撤</p>
                <p className="text-2xl font-black text-rose-400">-{result.maxDrawdown}%</p>
            </div>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg col-span-2">
                <div className="flex justify-between items-center mb-1">
                  {/* 規則4: 明確標示年化夏普比率 */}
                  <p className="text-slate-400 text-xs">年化夏普比率 (Annualized Sharpe)</p>
                  <span className="text-[9px] text-slate-500 bg-slate-900 px-1 rounded">Risk-Adjusted Return</span>
                </div>
                <p className="text-2xl font-black text-amber-400">
                  {result.sharpeRatio !== undefined && !isNaN(result.sharpeRatio) ? result.sharpeRatio : 'N/A'}
                </p>
                <p className="text-[9px] text-slate-600 mt-1 italic">公式: (Rp - Rf) / σp * √252</p>
            </div>
        </div>
    </div>
  );
};

export default MetricsPanel;
