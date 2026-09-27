import React from 'react';

interface Props {
  label: string;
  value: string | number;
}

const KPICard: React.FC<Props> = ({ label, value }) => {
  const isRevenue = label.toLowerCase().includes('revenue');
  const isUnits = label.toLowerCase().includes('unit');

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300">
      {/* Ambient background corner glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all duration-300 pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {label}
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl ring-1 ${
          isRevenue
            ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/30'
            : isUnits
            ? 'bg-indigo-500/15 text-indigo-400 ring-indigo-500/30'
            : 'bg-amber-500/15 text-amber-400 ring-amber-500/30'
        }`}>
          {isRevenue ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : isUnits ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        </div>
      </div>

      {value === '$0.00' || value === '0' || value === 'N/A' || !value ? (
        <div className="mt-4 flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
          <span>Awaiting dataset ingestion</span>
        </div>
      ) : (
        <div className="mt-4 flex items-center space-x-2 text-xs font-semibold text-emerald-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Live Ingested Telemetry</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
