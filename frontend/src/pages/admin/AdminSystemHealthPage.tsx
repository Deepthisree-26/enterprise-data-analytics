import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchSystemHealth, SystemHealthData } from '../../services/adminService';

const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const resp = await fetchSystemHealth();
      setHealth(resp);
    } catch (err: any) {
      console.error('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Unavailable':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-400';
      case 'Warning':
        return 'bg-amber-400';
      case 'Error':
        return 'bg-rose-400';
      case 'Unavailable':
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Infrastructure & Microservice Health Telemetry"
        subtitle="Real-time uptime, response latency, and connectivity verification across all platform engines"
        icon="🖥️"
        actions={
          <button
            onClick={loadHealth}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <span>Run Health Check</span>
          </button>
        }
      />

      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg font-bold text-white">
              Platform Status: <span className="text-emerald-400">{health?.status || 'Active'}</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Last verified: {health?.checked_at || 'Just now'} • Telemetry protocol HTTP/1.1
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300">Healthy</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-slate-300">Warning</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="text-slate-300">Unavailable / Standby</span>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Running health diagnostics across all services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {health?.services.map((srv, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase text-slate-500 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                    {srv.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(srv.status)}`}>
                    {srv.status}
                  </span>
                </div>

                <div className="flex items-center space-x-2 mb-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${getStatusDot(srv.status)}`}></span>
                  <h3 className="text-sm font-bold text-white">{srv.name}</h3>
                </div>

                <p className="text-xs text-slate-400 mb-4">{srv.details}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono truncate max-w-[130px]">{srv.endpoint}</span>
                <span className="font-mono font-bold text-slate-300">{srv.latency_ms > 0 ? `${srv.latency_ms} ms` : 'Standby'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSystemHealthPage;
