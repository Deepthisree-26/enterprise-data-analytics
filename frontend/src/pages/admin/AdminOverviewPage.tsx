import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminOverview, AdminOverviewData } from '../../services/adminService';

const AdminOverviewPage: React.FC = () => {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetchAdminOverview();
      setData(resp);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load admin overview telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Admin Governance Center"
          subtitle="System telemetry, infrastructure status, and cross-departmental operations overview"
          icon="📊"
        />
        <div className="flex flex-col items-center justify-center p-20 bg-slate-900/60 border border-slate-800 rounded-2xl">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-xs font-semibold text-slate-400">Loading Real-Time System Telemetry...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Admin Governance Center"
          subtitle="System telemetry, infrastructure status, and cross-departmental operations overview"
          icon="📊"
        />
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 text-rose-300 text-sm flex items-center justify-between">
          <span>{error || 'Unable to connect to administrative telemetry.'}</span>
          <button
            onClick={loadData}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, recent_user_activity, recent_uploads, data_quality_summary, recent_audit, system_alerts, department_data_status } = data;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Admin Governance Center"
        subtitle="Live platform metrics, user access oversight, data governance, and infrastructure health"
        icon="📊"
        actions={
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Telemetry</span>
          </button>
        }
      />

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
          <div className="text-2xl font-black text-white mt-1">{kpis.total_users}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Provisioned</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Users</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{kpis.active_users}</div>
          <span className="text-[10px] text-slate-500 font-medium">Verified Active</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Inactive Users</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{kpis.inactive_users}</div>
          <span className="text-[10px] text-slate-500 font-medium">Deactivated</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Departments</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">{kpis.total_departments}</div>
          <span className="text-[10px] text-indigo-300 font-medium">Enterprise Units</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Datasets</span>
          <div className="text-2xl font-black text-violet-400 mt-1">{kpis.total_datasets}</div>
          <span className="text-[10px] text-slate-500 font-medium">Managed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Records</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{kpis.total_records.toLocaleString()}</div>
          <span className="text-[10px] text-cyan-300 font-medium">In DB Tables</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Uploads</span>
          <div className="text-2xl font-black text-sky-400 mt-1">{kpis.total_uploads}</div>
          <span className="text-[10px] text-slate-500 font-medium">Batches</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">System Status</span>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-bold text-white">{kpis.system_status}</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">{kpis.quality_pass_rate}% Data Pass</span>
        </div>
      </section>

      {/* Row 1: Department Data Status & Data Quality Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Data Status (2 cols) */}
        <section className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              <h2 className="text-base font-bold text-white">Department Data Status</h2>
            </div>
            <Link to="/admin/departments" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              Manage Departments →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">DB Records</th>
                  <th className="py-2.5 px-3">Availability</th>
                  <th className="py-2.5 px-3">Last Upload</th>
                  <th className="py-2.5 px-3">Governance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {department_data_status.map((dept) => (
                  <tr key={dept.department} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-semibold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span>{dept.department}</span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-200">
                      {dept.record_count.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          dept.has_data
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {dept.has_data ? 'Active Data' : 'Awaiting Data'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{dept.last_upload}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold ${
                          dept.is_active ? 'text-indigo-400' : 'text-slate-500'
                        }`}
                      >
                        {dept.is_active ? '● Active' : '○ Deactivated'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Data Quality Summary (1 col) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <h2 className="text-base font-bold text-white">Data Quality Summary</h2>
              </div>
              <Link to="/admin/data-quality" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                Details →
              </Link>
            </div>

            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-4 text-center">
              <div className="text-3xl font-black text-emerald-400">{data_quality_summary.quality_rate}%</div>
              <span className="text-[11px] text-slate-400 font-medium">Enterprise Data Integrity Score</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Total Rows Checked:</span>
                <span className="font-mono font-bold text-white">{data_quality_summary.total_checked.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Valid Records:</span>
                <span className="font-mono font-bold text-emerald-400">{data_quality_summary.valid_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Invalid Records:</span>
                <span className="font-mono font-bold text-rose-400">{data_quality_summary.invalid_records.toLocaleString()}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80">
                <span className="text-slate-400">Ingestion Warnings:</span>
                <span className="font-mono font-bold text-amber-400">{data_quality_summary.warnings_total}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Validator: Active</span>
            <span className="text-emerald-400 font-semibold">Schema Engine Operational</span>
          </div>
        </section>
      </div>

      {/* Row 2: Recent User Activity & Recent Dataset Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Activity */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
              <h2 className="text-base font-bold text-white">Recent Security & User Activity</h2>
            </div>
            <Link to="/admin/activity" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              View Log →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recent_user_activity.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent security events recorded.</p>
            ) : (
              recent_user_activity.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        act.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                    ></span>
                    <div>
                      <span className="font-bold text-white">{act.username}</span>
                      <span className="text-slate-400 ml-2">({act.role || 'User'})</span>
                      <p className="text-[11px] text-slate-400">{act.details || act.activity_type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">{act.timestamp}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Dataset Uploads */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
              <h2 className="text-base font-bold text-white">Recent Dataset Ingestions</h2>
            </div>
            <Link to="/admin/upload-history" className="text-xs text-violet-400 hover:text-violet-300 font-semibold">
              Full History →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recent_uploads.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent uploads recorded in database.</p>
            ) : (
              recent_uploads.map((up) => (
                <div
                  key={up.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs hover:border-slate-700 transition"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">{up.file_name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-400 font-semibold">
                        {up.department}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      by <span className="text-slate-300">{up.uploaded_by}</span> • {up.valid_rows} rows imported
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{up.upload_timestamp}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Row 3: Recent Audit Activity & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audit Activity */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-bold text-white">Audit Trail Summary</h2>
            </div>
            <Link to="/admin/audit-logs" className="text-xs text-amber-400 hover:text-amber-300 font-semibold">
              Audit Center →
            </Link>
          </div>
          <div className="space-y-2.5">
            {recent_audit.map((al) => (
              <div
                key={al.id}
                className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] font-bold">
                      {al.action}
                    </span>
                    <span className="text-white font-semibold">{al.user}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{al.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-400">{al.details}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System Alerts */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <h2 className="text-base font-bold text-white">Platform System Alerts</h2>
            </div>
            <Link to="/admin/alerts" className="text-xs text-rose-400 hover:text-rose-300 font-semibold">
              Manage Alerts →
            </Link>
          </div>
          <div className="space-y-2.5">
            {system_alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs ${
                  alert.severity === 'critical' || alert.severity === 'error'
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">{alert.title}</span>
                  <span className="uppercase text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950/80 font-semibold">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] opacity-80">{alert.message}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] opacity-60 font-mono">
                  <span>Category: {alert.category}</span>
                  <span>{alert.created_at}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
