
import React from 'react';
import { FailureLog } from '../types';

interface LogPanelProps {
  logs: FailureLog[];
}

const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  if (logs.length === 0) return null;

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-lg mt-6 font-mono text-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-slate-400 font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          System Logs: Strategy Failures & Learning
        </h3>
        <span className="text-xs text-slate-600 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          Total Events: {logs.length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
        {logs.slice().reverse().map((log, index) => (
          <div key={index} className="bg-slate-900/50 p-3 rounded border border-slate-800/50 hover:border-slate-700 transition-colors">
            <div className="flex justify-between items-start mb-1">
                <span className="text-xs text-slate-500">{log.timestamp}</span>
                <span className="text-xs font-bold text-rose-500 bg-rose-950/30 px-1.5 rounded uppercase">{log.result}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <span className="text-slate-500 block">Market Regime</span>
                    <span className="text-indigo-300">{log.market_regime}</span>
                </div>
                <div>
                    <span className="text-slate-500 block">Strategy Type</span>
                    <span className="text-sky-300">{log.strategy_type}</span>
                </div>
                <div className="col-span-2 mt-1 pt-1 border-t border-slate-800">
                    <span className="text-slate-500 mr-2">Reason:</span>
                    <span className="text-slate-300">{log.reason}</span>
                </div>
            </div>
            
             {/* Raw JSON representation for "Geek" feel requested by user */}
             <div className="mt-2 text-[10px] text-slate-600 font-mono bg-black/20 p-1 rounded overflow-x-auto whitespace-nowrap">
                {`{ "regime": "${log.market_regime}", "strategy": "${log.strategy_type}", "reason": "${log.reason}" }`}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPanel;
