import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminAuditLogs } from '../../services/adminService';

const AdminAuditLogsPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);

  const loadLogs = async (pageNum = page) => {
    setLoading(true);
    try {
      const resp = await fetchAdminAuditLogs({
        q: searchTerm || undefined,
        action: actionFilter || undefined,
        status: statusFilter || undefined,
        page: pageNum,
        limit: 15,
      });
      setItems(resp.items);
      setTotal(resp.total);
      setPage(resp.page);
      setPages(resp.pages);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [actionFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Compliance & Security Audit Trail"
        subtitle="Immutable ledger recording user access events, role updates, data deletions, and system configuration modifications"
        icon="🔍"
        actions={
          <button
            onClick={() => loadLogs(page)}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <span>Refresh</span>
          </button>
        }
      />

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search by user, resource, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_SIGNUP">USER_SIGNUP</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="ROLE_CHANGED">ROLE_CHANGED</option>
            <option value="STATUS_CHANGED">STATUS_CHANGED</option>
            <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="DATASET_DELETED">DATASET_DELETED</option>
            <option value="ACCESS_DENIED">ACCESS_DENIED</option>
            <option value="ALERT_STATUS_UPDATED">ALERT_STATUS_UPDATED</option>
            <option value="CONFIG_UPDATED">CONFIG_UPDATED</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="DENIED">DENIED</option>
            <option value="FAILURE">FAILURE</option>
          </select>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Audit Ledger ({total})
          </span>
          <span className="text-[11px] text-slate-400">Page {page} of {pages}</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading audit trail...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No matching audit events found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Event ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-500">#{entry.id}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {entry.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">{entry.user}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] font-mono font-bold text-indigo-300 border border-slate-800">
                        {entry.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">{entry.resource || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          entry.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      <button
                        onClick={() => setSelectedAudit(entry)}
                        className="text-left hover:text-white truncate block w-full"
                        title={entry.details}
                      >
                        {entry.details}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Audit Logs: {total}</span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => loadLogs(page - 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-mono text-indigo-400">{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => loadLogs(page + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Audit Event #{selectedAudit.id}</h3>
              <button onClick={() => setSelectedAudit(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-white">{selectedAudit.timestamp}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-400">Actor:</span>
                <span className="font-bold text-white">{selectedAudit.user}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-400">Action:</span>
                <span className="font-mono font-bold text-indigo-400">{selectedAudit.action}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-400">Target Resource:</span>
                <span className="font-mono text-slate-200">{selectedAudit.resource || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950">
                <span className="text-slate-400">Execution Status:</span>
                <span className="font-bold text-emerald-400">{selectedAudit.status}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block mb-1 text-[10px] uppercase font-mono">Payload / Description:</span>
                <p className="text-slate-200 whitespace-pre-wrap">{selectedAudit.details}</p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsPage;
