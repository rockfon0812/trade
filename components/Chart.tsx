
import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
  Area
} from 'recharts';
import { StockData, Trade } from '../types';

interface ChartProps {
  data: StockData[];
  trades: Trade[];
  strategyType: string;
  shortWindow: number;
  longWindow: number;
}

// 任務三：自定義訊號形狀
const RenderTradeSignal = (props: any) => {
  const { cx, cy, tradeType, price, pnl } = props;
  if (!cx || !cy) return null;
  const isLong = tradeType === 'LONG';
  return (
    <g>
      <path
        d={isLong ? `M${cx},${cy-10} L${cx-7},${cy+3} L${cx+7},${cy+3} Z` : `M${cx},${cy+10} L${cx-7},${cy-3} L${cx+7},${cy-3} Z`}
        fill={isLong ? "#22c55e" : "#ef4444"}
      />
      <title>{`${isLong ? '買進' : '賣出'}: $${price}\n${pnl ? '損益: ' + pnl + '%' : ''}`}</title>
    </g>
  );
};

const Chart: React.FC<ChartProps> = ({ data, trades, strategyType, shortWindow, longWindow }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg mb-6 relative">
      <h3 className="text-white font-semibold mb-6">股價走勢與交易訊號</h3>
      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="price" name="價格" stroke="#818cf8" fill="url(#colorPrice)" strokeWidth={2} />
            
            {(strategyType === 'SMA' || strategyType === 'Combined') && data[0]?.smaShort && (
              <Line type="monotone" dataKey="smaShort" name="SMA短" stroke="#fbbf24" dot={false} strokeDasharray="5 5" />
            )}

            {/* 任務三：疊加買賣訊號點 */}
            {trades.map((t, idx) => (
              <ReferenceDot
                key={`entry-${idx}`}
                x={t.entryDate}
                y={t.entryPrice}
                shape={(p: any) => <RenderTradeSignal {...p} tradeType="LONG" price={t.entryPrice} />}
              />
            ))}
            {trades.map((t, idx) => t.exitDate && (
              <ReferenceDot
                key={`exit-${idx}`}
                x={t.exitDate}
                y={t.exitPrice}
                shape={(p: any) => <RenderTradeSignal {...p} tradeType="SHORT" pnl={t.pnl} price={t.exitPrice} />}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(Chart);
