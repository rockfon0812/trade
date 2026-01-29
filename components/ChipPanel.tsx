
import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { StockData } from '../types';

interface ChipPanelProps {
  data: StockData[];
}

type InvestorType = 'ALL' | 'FOREIGN' | 'TRUST' | 'DEALER';
type ViewMode = 'DAILY' | 'CUMULATIVE';
// Rule 1: 明確定義時間區段，包含 1, 7 日
type TimeRange = '1' | '3' | '5' | '7' | '10' | '20' | '60' | 'ALL' | 'CUSTOM';

const CHIP_COLORS = {
  FOREIGN: '#3b82f6', // 藍色
  TRUST: '#f97316',   // 橘色
  DEALER: '#a855f7'   // 紫色
};

// Rule 6.1: 清楚標示資料性質
const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-xl text-xs z-50">
        <p className="font-bold text-slate-200 mb-2">{label}</p>
        <div className="mb-2 pb-2 border-b border-slate-700/50">
           <span className="text-[10px] uppercase font-black text-slate-500 tracking-wider">
               {viewMode === 'DAILY' ? '單日買賣超變動 (Daily Net)' : '區間累計買賣超 (Cumulative)'}
           </span>
        </div>
        {payload.map((entry: any, index: number) => {
          const rawVal = entry.value;
          const sheets = rawVal / 1000;
          let colorClass = 'text-white';
          let prefix = rawVal > 0 ? '+' : '';
          
          if (viewMode === 'DAILY' || viewMode === 'CUMULATIVE') {
             colorClass = rawVal > 0 ? 'text-red-400' : 'text-green-400';
          }

          return (
            <div key={index} className="flex justify-between gap-4 mb-1">
              <span style={{ color: entry.color || entry.stroke || entry.fill }}>
                {entry.name}:
              </span>
              <span className={`font-mono font-bold ${colorClass}`}>
                {prefix}{Math.round(sheets).toLocaleString()} 張
              </span>
            </div>
          );
        })}
        <div className="mt-2 pt-2 border-t border-slate-700 text-[9px] text-slate-500 italic">
            * 數據為依據價格行為之模擬估算
        </div>
      </div>
    );
  }
  return null;
};

const ChipPanel: React.FC<ChipPanelProps> = ({ data }) => {
  const [activeType, setActiveType] = useState<InvestorType>('ALL');
  const [timeRange, setTimeRange] = useState<TimeRange>('20');
  const [viewMode, setViewMode] = useState<ViewMode>('DAILY'); 
  
  // Custom date range state
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 初始化自訂日期為資料範圍
  useEffect(() => {
    if (data && data.length > 0) {
      const lastDate = data[data.length - 1].date;
      const firstDate = data[0].date;
      // 預設自訂區間為最近 20 天
      const cutoff = new Date(lastDate);
      cutoff.setDate(cutoff.getDate() - 20);
      const cutoffStr = cutoff.toISOString().split('T')[0];
      
      setCustomEnd(lastDate);
      setCustomStart(cutoffStr > firstDate ? cutoffStr : firstDate);
    }
  }, [data]);

  const slicedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (timeRange === 'CUSTOM') {
       // 嚴格過濾：僅包含選定日期區間內的實際交易日 (Rule 1.4)
       return data.filter(d => {
           if (customStart && d.date < customStart) return false;
           if (customEnd && d.date > customEnd) return false;
           return true;
       });
    }

    if (timeRange === 'ALL') return data;
    
    // Rule 1: 嚴格定義：數字代表「交易日回推數」
    const days = parseInt(timeRange);
    return data.slice(Math.max(0, data.length - days));
  }, [data, timeRange, customStart, customEnd]);

  // Rule 2.3: 嚴禁跨日累積。DAILY 模式必須顯示原始資料。
  const chartData = useMemo(() => {
    if (slicedData.length === 0) return [];
    if (viewMode === 'DAILY') return slicedData;
    
    // 累積模式：僅在此模式下計算累積，從選定區間的第一天開始歸零重算
    let accForeign = 0, accTrust = 0, accDealer = 0;
    return slicedData.map(d => {
        accForeign += d.foreign || 0;
        accTrust += d.trust || 0;
        accDealer += d.dealer || 0;
        return { ...d, accForeign, accTrust, accDealer };
    });
  }, [slicedData, viewMode]);

  // 依據選取期間計算累積數據
  const periodSummary = useMemo(() => {
    if (slicedData.length === 0) return { f: 0, t: 0, d: 0 };
    return slicedData.reduce((acc, curr) => ({
      f: acc.f + (curr.foreign || 0),
      t: acc.t + (curr.trust || 0),
      d: acc.d + (curr.dealer || 0)
    }), { f: 0, t: 0, d: 0 });
  }, [slicedData]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg mb-6 flex flex-col transition-all duration-300">
      <div className="flex flex-col gap-4 mb-4 border-b border-slate-700 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  三大法人籌碼分析 (模擬估算)
              </h3>
            </div>

            <div className="flex flex-col gap-2 items-end w-full md:w-auto">
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 overflow-x-auto max-w-full custom-scrollbar">
                    {/* Rule 1: 提供 1, 3, 5, 7, 10, 20, 60 選項 */}
                    {(['1', '3', '5', '7', '10', '20', '60', 'ALL', 'CUSTOM'] as TimeRange[]).map(range => (
                        <button 
                            key={range}
                            onClick={() => setTimeRange(range)} 
                            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all whitespace-nowrap ${timeRange === range ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {range === 'ALL' ? '全' : range === 'CUSTOM' ? '自訂' : `${range}日`}
                        </button>
                    ))}
                </div>
                
                <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    <button onClick={() => setViewMode('DAILY')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'DAILY' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>日變動 (Daily)</button>
                    <button onClick={() => setViewMode('CUMULATIVE')} className={`px-3 py-1 text-xs font-bold rounded transition-all ${viewMode === 'CUMULATIVE' ? 'bg-indigo-500 text-white' : 'text-slate-400'}`}>區間累積 (Cumulative)</button>
                </div>
            </div>
        </div>
        
        {/* 自訂日期選擇器面板 */}
        {timeRange === 'CUSTOM' && (
            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 flex flex-wrap gap-4 items-center animate-fadeIn">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">起始</span>
                    <input 
                        type="date" 
                        value={customStart} 
                        max={customEnd}
                        onChange={(e) => setCustomStart(e.target.value)} 
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-bold">結束</span>
                    <input 
                        type="date" 
                        value={customEnd} 
                        min={customStart}
                        onChange={(e) => setCustomEnd(e.target.value)} 
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-indigo-500"
                    />
                </div>
                <span className="text-[10px] text-indigo-400 italic ml-auto border border-indigo-500/30 px-2 py-0.5 rounded bg-indigo-500/10">
                    * 系統將僅計算區間內的實際交易日 (Trading Days Only)
                </span>
            </div>
        )}
      </div>

      {/* 修正：顯示選取期間的累積數據，並簡化標籤 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded border bg-slate-900 border-blue-500/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">外資</p>
            <p className={`font-bold text-xs ${periodSummary.f > 0 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(periodSummary.f/1000).toLocaleString()} 張</p>
        </div>
        <div className="p-2 rounded border bg-slate-900 border-orange-500/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">投信</p>
            <p className={`font-bold text-xs ${periodSummary.t > 0 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(periodSummary.t/1000).toLocaleString()} 張</p>
        </div>
        <div className="p-2 rounded border bg-slate-900 border-purple-500/30">
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">自營商</p>
            <p className={`font-bold text-xs ${periodSummary.d > 0 ? 'text-red-400' : 'text-green-400'}`}>{Math.round(periodSummary.d/1000).toLocaleString()} 張</p>
        </div>
      </div>

      <div className="w-full h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'DAILY' ? (
              // Rule 2.1: 日變動資料僅代表單一交易日，使用 BarChart
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(v) => (v/1000).toFixed(0)} />
                <Tooltip content={<CustomTooltip viewMode="DAILY" />} />
                <Legend />
                <Bar dataKey="foreign" name="外資 (日變動)" fill={CHIP_COLORS.FOREIGN} isAnimationActive={false} />
                <Bar dataKey="trust" name="投信 (日變動)" fill={CHIP_COLORS.TRUST} isAnimationActive={false} />
                <Bar dataKey="dealer" name="自營 (日變動)" fill={CHIP_COLORS.DEALER} isAnimationActive={false} />
              </BarChart>
          ) : (
              // Rule 2.4: 累積資料獨立顯示，使用 LineChart
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} vertical={false} />
                <XAxis dataKey="date" tick={{fontSize: 10}} stroke="#94a3b8" tickFormatter={(v) => v.slice(5)} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(v) => (v/1000).toFixed(0)} />
                <Tooltip content={<CustomTooltip viewMode="CUMULATIVE" />} />
                <Legend />
                <Line type="monotone" dataKey="accForeign" name="外資 (區間累積)" stroke={CHIP_COLORS.FOREIGN} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accTrust" name="投信 (區間累積)" stroke={CHIP_COLORS.TRUST} strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="accDealer" name="自營 (區間累積)" stroke={CHIP_COLORS.DEALER} strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(ChipPanel);
