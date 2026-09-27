import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; forecast: number }[];
}

const ForecastChart: React.FC<Props> = ({ data }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }));
      setChartData(formatted);
    } else {
      setChartData([]);
    }
  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white">Revenue ML Forecast</h3>
          <p className="text-xs text-slate-400 mt-0.5">Linear Regression predictive trajectory</p>
        </div>
        <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
          Scikit-Learn Model
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[260px] w-full flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No Forecast Trajectory Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Ingest a dataset via the Analyst hub to train the Scikit-Learn regression engine and compute future projections.
          </p>
        </div>
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#forecastGradient)"
                name="Projected Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ForecastChart;
