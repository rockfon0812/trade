
import React, { useState, useMemo } from 'react';
import { StrategyParams, StrategyType } from '../types';
import { THEME_LIST } from '../services/themeData';

interface StrategyFormProps {
  params: StrategyParams;
  onChange: (newParams: StrategyParams) => void;
  onRun: () => void;
  isLoading: boolean;
  mode: 'SINGLE' | 'THEME';
  setMode: (mode: 'SINGLE' | 'THEME') => void;
  themeKeyword: string;
  setThemeKeyword: (val: string) => void;
}

const N_YEAR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const INDICATOR_GROUPS = [
  {
    label: '趨勢 (Trend)',
    items: [
      { id: 'useSMA', label: 'SMA', icon: '📈' },
      { id: 'useEMA', label: 'EMA', icon: '📉' },
      { id: 'useVWAP', label: 'VWAP', icon: '⚡' },
      { id: 'useVWMA', label: 'VWMA', icon: '🌊' },
    ]
  },
  {
    label: '動能 (Momentum)',
    items: [
      { id: 'useRSI', label: 'RSI', icon: '⚡' },
      { id: 'useStoch', label: 'Stoch', icon: '🔄' },
      { id: 'useKD', label: 'KD', icon: '📉' },
      { id: 'useMACD', label: 'MACD', icon: '📊' },
    ]
  },
  {
    label: '波動與成交量',
    items: [
      { id: 'useATR', label: 'ATR', icon: '📏' },
      { id: 'useOBV', label: 'OBV', icon: '📊' },
    ]
  }
];

const StrategyForm: React.FC<StrategyFormProps> = ({ 
  params, onChange, onRun, isLoading, mode, setMode, themeKeyword, setThemeKeyword
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const isAiMode = params.type === 'AI_AUTO';

  const filteredThemes = useMemo(() => {
    return THEME_LIST.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'backtestYears') {
      const n = Number(value);
      onChange({ ...params, backtestYears: n });
    } else {
      onChange({ ...params, [name]: type === 'number' ? Number(value) : value });
    }
  };

  const toggleIndicator = (id: string) => {
    if (isLoading || isAiMode) return;
    onChange({ 
      ...params, 
      [id as keyof StrategyParams]: !params[id as keyof StrategyParams],
      type: 'Combined'
    });
  };

  const toggleAiMode = () => {
    if (isLoading) return;
    onChange({ 
      ...params, 
      type: isAiMode ? 'Combined' : 'AI_AUTO',
      useSMA: false, useEMA: false, useRSI: false, useVWMA: false
    });
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col h-auto overflow-hidden transition-all duration-500">
      <div className="flex bg-slate-900/80 p-1">
        <button onClick={() => !isLoading && setMode('SINGLE')} className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all ${mode === 'SINGLE' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>個股模式</button>
        <button onClick={() => !isLoading && setMode('THEME')} className={`flex-1 py-3 text-xs font-black tracking-widest rounded-xl transition-all ${mode === 'THEME' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>族群模式</button>
      </div>

      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-[11px] font-black text-indigo-400 uppercase tracking-tighter flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
            標的設定
          </label>
          
          {mode === 'SINGLE' ? (
            <input name="symbol" disabled={isLoading} value={params.symbol} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none font-mono" placeholder="輸入代號 (如 2330)" />
          ) : (
            <div className="space-y-2">
              <input type="text" placeholder="搜尋族群..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white outline-none" />
              <select disabled={isLoading} value={themeKeyword} onChange={(e) => setThemeKeyword(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none appearance-none font-bold text-sm">
                <option value="">選擇族群...</option>
                {filteredThemes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">停利 %</label>
            <input type="number" name="takeProfitPercentage" value={params.takeProfitPercentage} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">停損 %</label>
            <input type="number" name="stopLossPercentage" value={params.stopLossPercentage} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">回測時間範圍</label>
          <div className="w-full">
            <select name="backtestYears" value={params.backtestYears || 3} onChange={handleChange} className="w-full bg-slate-900 border border-indigo-500/50 rounded-lg px-4 py-2 text-sm text-white outline-none">
              {N_YEAR_OPTIONS.map(n => <option key={n} value={n}>最近 {n} 年</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">智能配置引擎</label>
          <button type="button" onClick={toggleAiMode} disabled={isLoading} className={`w-full py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${isAiMode ? 'bg-amber-500/10 border-amber-500 shadow-lg' : 'bg-slate-900 border-slate-700'}`}>
            <span className={`text-sm font-black ${isAiMode ? 'text-amber-400' : 'text-slate-500'}`}>{isAiMode ? '🤖 AI 自動掃描中' : '啟動 AI 自動掃描'}</span>
            <span className="text-[9px] text-slate-500 mt-1">{isAiMode ? '系統將自動排列組合找出最佳策略' : '讓 AI 為您尋找最佳指標組合'}</span>
          </button>
        </div>

        <div className={`space-y-4 ${isAiMode ? 'opacity-30 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center">
             <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">技術指標組合</label>
             <span className="text-[9px] text-indigo-400 bg-indigo-900/30 px-1.5 py-0.5 rounded border border-indigo-500/20">多選即為共識決</span>
          </div>
          
          <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
            {INDICATOR_GROUPS.map(group => (
              <div key={group.label} className="space-y-2">
                <p className="text-[9px] text-slate-500 uppercase">{group.label}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <button key={item.id} type="button" onClick={() => toggleIndicator(item.id)} className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${params[item.id as keyof StrategyParams] === true ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 italic px-2 leading-relaxed">
             💡 提示: 若勾選多個指標，系統會採用「投票機制」：必須有 35% 以上指標同時發出訊號才會交易。
          </p>
        </div>

        <button onClick={onRun} disabled={isLoading} className={`w-full py-4 rounded-2xl font-black text-xs tracking-widest transition-all ${isLoading ? 'bg-slate-700 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl'}`}>
          {isLoading ? '計算中...' : (mode === 'THEME' ? '開始族群分析' : '開始個股回測')}
        </button>
      </div>
    </div>
  );
};

export default StrategyForm;
