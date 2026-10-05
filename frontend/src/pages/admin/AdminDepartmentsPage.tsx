import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  fetchAdminDepartments,
  toggleDepartmentStatus,
  DepartmentItem,
} from '../../services/adminService';

const deptIcons: Record<string, string> = {
  Sales: '💼',
  Customers: '👥',
  Products: '📦',
  Inventory: '🏭',
  Finance: '💰',
  Marketing: '🎯',
  HR: '👔',
};

const AdminDepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [updatingDept, setUpdatingDept] = useState<string | null>(null);

  const loadDepartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDepartments();
      setDepartments(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleToggle = async (dept: DepartmentItem) => {
    const action = dept.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} the "${dept.name}" department? Existing historical records will remain intact.`)) {
      return;
    }
    setUpdatingDept(dept.name);
    try {
      await toggleDepartmentStatus(dept.name, !dept.is_active);
      setSuccessMsg(`Department "${dept.name}" is now ${!dept.is_active ? 'Active' : 'Inactive'}.`);
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} department`);
    } finally {
      setUpdatingDept(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Enterprise Department Governance"
        subtitle="Manage business units, monitor record capacities, review dataset freshness, and toggle organizational status"
        icon="🏢"
        actions={
          <button
            onClick={loadDepartments}
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

      {/* Departments Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading department statistics...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.name}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-md transition-all flex flex-col justify-between ${
                dept.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                      {deptIcons[dept.name] || '📊'}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">{dept.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Enterprise Unit</span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      dept.is_active
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                    }`}
                  >
                    {dept.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{dept.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Users</span>
                    <span className="font-bold text-white">{dept.user_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Datasets</span>
                    <span className="font-bold text-indigo-400">{dept.dataset_count}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-mono">Records</span>
                    <span className="font-bold text-cyan-400 font-mono">{dept.record_count.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span>Last Ingestion:</span>
                    <span className="font-mono text-slate-200">{dept.last_upload}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Readiness:</span>
                    <span className={`font-semibold ${dept.record_count > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {dept.record_count > 0 ? '✓ Ready' : '○ Awaiting Data'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Action */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {dept.is_active ? 'Operational' : 'Access Restricted'}
                </span>
                <button
                  disabled={updatingDept === dept.name}
                  onClick={() => handleToggle(dept)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                    dept.is_active
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  {updatingDept === dept.name ? 'Saving...' : dept.is_active ? 'Suspend Unit' : 'Activate Unit'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentsPage;
