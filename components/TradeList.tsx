
import React, { useMemo } from 'react';
import { Trade } from '../types';

interface TradeListProps {
  trades: Trade[];
}

const getReasonLabel = (reason?: Trade['exitReason']) => {
  switch (reason) {
    case 'STRATEGY': return '策略訊號';
    case 'STOP_LOSS': return '停損出場';
    case 'TAKE_PROFIT': return '停利出場';
    case 'FORCE_CLOSE': return '回測結束強平';
    default: return '未知';
  }
};

const getReasonColor = (reason?: Trade['exitReason']) => {
  switch (reason) {
    case 'STRATEGY': return 'text-sky-400';
    case 'STOP_LOSS': return 'text-rose-400';
    case 'TAKE_PROFIT': return 'text-emerald-400';
    case 'FORCE_CLOSE': return 'text-slate-500';
    default: return 'text-slate-400';
  }
};

const TradeList: React.FC<TradeListProps> = ({ trades }) => {
  const sortedTrades = useMemo(() => {
    return [...trades].sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  }, [trades]);

  if (trades.length === 0) return (
    <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg text-center h-full flex items-center justify-center">
      <p className="text-slate-400">目前尚無成交紀錄</p>
    </div>
  );

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-900 border-b border-slate-700">
        <h3 className="text-white font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          交易明細 (History)
        </h3>
      </div>
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-900 sticky top-0">
            <tr>
              <th className="px-6 py-3">方向</th>
              <th className="px-6 py-3">進場日期</th>
              <th className="px-6 py-3">進場價</th>
              <th className="px-6 py-3">出場日期</th>
              <th className="px-6 py-3">出場價</th>
              <th className="px-6 py-3">損益 %</th>
              <th className="px-6 py-3">原因</th>
            </tr>
          </thead>
          <tbody>
            {sortedTrades.map((trade, idx) => {
              const pnl = trade.pnl || 0;
              const isWin = pnl > 0;
              const isShort = trade.type === 'SHORT';
              return (
                <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/50">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isShort ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-blue-900/50 text-blue-300 border border-blue-500/30'}`}>
                        {isShort ? 'SHORT' : 'LONG'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{trade.entryDate}</td>
                  <td className="px-6 py-4">${trade.entryPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">{trade.exitDate || '-'}</td>
                  <td className="px-6 py-4">{trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}</td>
                  <td className={`px-6 py-4 font-bold ${isWin ? 'text-emerald-400' : pnl < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {trade.pnl !== undefined ? `${pnl > 0 ? '+' : ''}${pnl}%` : '-'}
                  </td>
                  <td className={`px-6 py-4 ${getReasonColor(trade.exitReason)}`}>
                    {getReasonLabel(trade.exitReason)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(TradeList);
