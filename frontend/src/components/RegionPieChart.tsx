import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  records?: Array<{ region: string; revenue: number }>;
}

const REGION_COLORS: Record<string, string> = {
  'North America': '#6366f1',
  'Europe': '#38bdf8',
  'Asia Pacific': '#10b981',
  'Latin America': '#f59e0b',
  'Middle East': '#ec4899',
  'Global': '#8b5cf6',
};

const RegionPieChart: React.FC<Props> = ({ records }) => {
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];
    const totals: Record<string, number> = {};
    let totalRevenue = 0;
    records.forEach((r) => {
      const reg = r.region || 'Other';
      const rev = Number(r.revenue || 0);
      totals[reg] = (totals[reg] || 0) + rev;
      totalRevenue += rev;
    });

    if (totalRevenue === 0) return [];

    const colors = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];
    return Object.entries(totals).map(([name, rev], idx) => ({
      name,
      value: Math.round((rev / totalRevenue) * 100),
      color: REGION_COLORS[name] || colors[idx % colors.length],
    }));
  }, [records]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-white">Regional Revenue Share</h3>
          <p className="text-xs text-slate-400 mt-0.5">Distribution across key geographic markets</p>
        </div>
        <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Global Split
        </span>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[210px] w-full flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/40 p-6 text-center my-auto">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 className="text-sm font-semibold text-slate-300">No Regional Data Available</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Ingest order records with a region column to visualize geographic revenue breakdown.
          </p>
        </div>
      ) : (
        <>
          <div className="h-[210px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800/80">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-400 font-medium truncate">{item.name}</span>
                <span className="text-xs font-bold text-slate-200 ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default RegionPieChart;
