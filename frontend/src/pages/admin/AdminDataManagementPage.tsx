import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  fetchAdminDatasets,
  fetchDatasetPreview,
  deleteAdminDataset,
  DatasetItem,
} from '../../services/adminService';

const AdminDataManagementPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Preview Modal
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const loadDatasets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDatasets({
        department: deptFilter || undefined,
        status_filter: statusFilter || undefined,
        q: searchTerm || undefined,
      });
      setDatasets(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to load datasets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDatasets();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDatasets();
  };

  const handleOpenPreview = async (id: number) => {
    setPreviewLoading(true);
    try {
      const resp = await fetchDatasetPreview(id);
      setPreviewData(resp);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to load dataset preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDelete = async (item: DatasetItem) => {
    if (!window.confirm(`Are you sure you want to remove dataset "${item.dataset_name}" from the departmental catalog?`)) {
      return;
    }
    try {
      await deleteAdminDataset(item.id);
      setSuccessMsg(`Dataset "${item.dataset_name}" was successfully removed.`);
      loadDatasets();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove dataset');
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Departmental Data Registry"
        subtitle="Catalog of all imported departmental data feeds, validation statuses, row counts, and live previews"
        icon="📁"
        actions={
          <button
            onClick={loadDatasets}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <span>Refresh</span>
          </button>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search datasets by filename or author..."
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
            <option value="">All Import Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
          </select>
        </form>
      </div>

      {/* Datasets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Datasets in Registry ({datasets.length})
          </span>
          <span className="text-[11px] text-slate-400">Audited feeds</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-slate-400">Loading datasets...</div>
        ) : datasets.length === 0 ? (
          <div className="p-16 text-center text-xs text-slate-500">No matching datasets found in registry.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Dataset Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Dataset Type</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Upload Timestamp</th>
                  <th className="py-3 px-4 text-right">Rows</th>
                  <th className="py-3 px-4">Validation</th>
                  <th className="py-3 px-4">Import Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {datasets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4 font-bold text-white">{item.dataset_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-indigo-400 border border-slate-700">
                        {item.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.dataset_type}</td>
                    <td className="py-3 px-4 text-slate-400">{item.uploaded_by}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{item.upload_timestamp}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                      {item.total_rows.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.invalid_rows === 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {item.validation_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          item.status === 'Success'
                            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {item.import_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenPreview(item.id)}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-2 py-1 text-[11px] bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 rounded border border-rose-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>{previewData.file_name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                    {previewData.department}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Uploaded by {previewData.uploaded_by} on {previewData.upload_timestamp} • {previewData.total_rows} total rows
                </p>
              </div>
              <button onClick={() => setPreviewData(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-auto border border-slate-800 rounded-xl">
              {previewData.preview_records && previewData.preview_records.length > 0 ? (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 sticky top-0 text-[10px] font-mono text-slate-400 border-b border-slate-800">
                    <tr>
                      {Object.keys(previewData.preview_records[0]).map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {previewData.preview_records.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        {Object.values(row).map((val: any, cIdx: number) => (
                          <td key={cIdx} className="py-2 px-3 whitespace-nowrap text-slate-200">
                            {String(val ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">No records found for this dataset preview.</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewData(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDataManagementPage;
