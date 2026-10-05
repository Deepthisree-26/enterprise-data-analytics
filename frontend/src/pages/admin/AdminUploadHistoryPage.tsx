import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminUploadHistory } from '../../services/adminService';

const AdminUploadHistoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUpload, setSelectedUpload] = useState<any | null>(null);

  const loadHistory = async (pageNum = page) => {
    setLoading(true);
    try {
      const resp = await fetchAdminUploadHistory({
        q: searchTerm || undefined,
        department: deptFilter || undefined,
        status: statusFilter || undefined,
        page: pageNum,
        limit: 12,
      });
      setItems(resp.items);
      setTotal(resp.total);
      setPage(resp.page);
      setPages(resp.pages);
    } catch (err: any) {
      console.error('Failed to load upload history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory(1);
  }, [deptFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadHistory(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Ingestion & Upload Audit History"
        subtitle="Comprehensive chronological audit trail of all dataset submissions, parsing runs, and validation outcomes"
        icon="📤"
        actions={
          <button
            onClick={() => loadHistory(page)}
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
              placeholder="Search by filename or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Sales">Sales</option>
            <option value="Customers">Customers</option>
            <option value="Products">Products</option>
            <option value="Inventory">Inventory</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </form>
      </div>

      {/* Uploads Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Upload Records ({total})
          </span>
          <span className="text-[11px] text-slate-400">Page {page} of {pages}</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading upload history...</div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No upload history records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Upload ID</th>
                  <th className="py-3 px-4">File Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Dataset Type</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4 text-right">Rows</th>
                  <th className="py-3 px-4 text-right">Valid</th>
                  <th className="py-3 px-4 text-right">Invalid</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-mono text-slate-400">#{item.id}</td>
                    <td className="py-3 px-4 font-bold text-white">{item.file_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-indigo-400 border border-slate-700">
                        {item.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.dataset_type}</td>
                    <td className="py-3 px-4 text-slate-400 font-medium">{item.uploaded_by}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">{item.total_rows}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">{item.valid_rows}</td>
                    <td className="py-3 px-4 text-right font-mono text-rose-400">{item.invalid_rows}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{item.upload_timestamp}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUpload(item)}
                        className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700"
                      >
                        Details
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
            <span className="text-slate-400">Total Records: {total}</span>
            <div className="flex items-center space-x-1.5">
              <button
                disabled={page <= 1}
                onClick={() => loadHistory(page - 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Previous
              </button>
              <span className="px-3 py-1 font-mono text-indigo-400">{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => loadHistory(page + 1)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg border border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedUpload && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Upload Details #{selectedUpload.id}</h3>
              <button onClick={() => setSelectedUpload(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Filename:</span>
                <span className="font-bold text-white">{selectedUpload.file_name}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Department:</span>
                <span className="font-bold text-indigo-400">{selectedUpload.department}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Dataset Type:</span>
                <span className="font-bold text-slate-200">{selectedUpload.dataset_type}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Uploaded By:</span>
                <span className="font-bold text-slate-200">{selectedUpload.uploaded_by}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">{selectedUpload.upload_timestamp}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Total Rows</span>
                  <div className="text-base font-black text-white">{selectedUpload.total_rows}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Valid Rows</span>
                  <div className="text-base font-black text-emerald-400">{selectedUpload.valid_rows}</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Invalid Rows</span>
                  <div className="text-base font-black text-rose-400">{selectedUpload.invalid_rows}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedUpload(null)}
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

export default AdminUploadHistoryPage;
