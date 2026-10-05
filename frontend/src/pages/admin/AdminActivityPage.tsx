import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminActivity } from '../../services/adminService';

const AdminActivityPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('');

  const loadActivity = async (pageNum = page) => {
    setLoading(true);
    try {
      const resp = await fetchAdminActivity({
        username: usernameFilter || undefined,
        role: roleFilter || undefined,
        activity_type: activityTypeFilter || undefined,
        page: pageNum,
        limit: 15,
      });
      setItems(resp.items);
      setSummary(resp.summary || {});
      setTotal(resp.total);
      setPage(resp.page);
      setPages(resp.pages);
    } catch (err: any) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivity(1);
  }, [roleFilter, activityTypeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadActivity(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Security & Access Activity Center"
        subtitle="Monitor authentication attempts, failed credential challenges, and suspicious access-denied telemetry"
        icon="👤"
        actions={
          <button
            onClick={() => loadActivity(page)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <span>Refresh</span>
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Events Today (24h)</span>
          <div className="text-2xl font-black text-white mt-1">{summary.total_events_today || 0}</div>
          <span className="text-[10px] text-indigo-400 font-medium">Telemetry Pulses</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Failed Logins</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{summary.failed_attempts || 0}</div>
          <span className="text-[10px] text-rose-400 font-medium">Invalid Credentials</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Access Denied (403)</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{summary.access_denied_events || 0}</div>
          <span className="text-[10px] text-amber-400 font-medium">RBAC Boundary Blocks</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Recorded Logs</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{summary.total_activity_logs || 0}</div>
          <span className="text-[10px] text-cyan-400 font-medium">Security Sessions</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by username..."
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Analyst">Analyst</option>
            <option value="Manager">Manager</option>
          </select>

          <select
            value={activityTypeFilter}
            onChange={(e) => setActivityTypeFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Activity Types</option>
            <option value="LOGIN">LOGIN</option>
            <option value="FAILED_LOGIN">FAILED_LOGIN</option>
            <option value="ACCESS_DENIED">ACCESS_DENIED</option>
            <option value="LOGIN_REJECTED">LOGIN_REJECTED</option>
          </select>
        </form>
      </div>

      {/* Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Activity Stream ({total})
          </span>
          <span className="text-[11px] text-slate-400">Page {page} of {pages}</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading activity events...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No matching activity records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Username</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Activity Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">#{act.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {act.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{act.username}</td>
                    <td className="py-3 px-4">
                      {act.role ? (
                        <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-semibold text-slate-300 border border-slate-800">
                          {act.role}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{act.department || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-sky-300">
                        {act.activity_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          act.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{act.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Activity Logs: {total}</span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => loadActivity(page - 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-mono text-indigo-400">{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => loadActivity(page + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityPage;
