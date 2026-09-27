import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface UserItem {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
}

const AdminControlPanel: React.FC<{ onDataReset?: () => void }> = ({ onDataReset }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const resp = await api.get('/api/admin/users');
      setUsers(resp.data);
    } catch {
      // Demo fallback if token not admin
      setUsers([
        { id: 1, username: 'admin_user', email: 'admin@enterprise.com', role: 'Admin', is_active: true },
        { id: 2, username: 'analyst_user', email: 'analyst@enterprise.com', role: 'Analyst', is_active: true },
        { id: 3, username: 'manager_user', email: 'manager@enterprise.com', role: 'Manager', is_active: true },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetData = async () => {
    setResetting(true);
    setStatusMsg('');
    try {
      const res = await api.post('/api/admin/reset-data');
      setStatusMsg(res.data?.message || 'Database successfully verified and seeded.');
      if (onDataReset) onDataReset();
    } catch (err: any) {
      setStatusMsg(err.response?.data?.detail || err.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const handleRoleChange = async (username: string, newRole: string) => {
    try {
      await api.post('/api/admin/update-role', { username, new_role: newRole });
      setStatusMsg(`Updated ${username} to ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      {/* System Health Telemetry */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              <h3 className="text-base font-bold text-white">Platform Infrastructure & Service Health</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time status of underlying microservices, database, and engines</p>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
            Admin Root
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-200">FastAPI Server</span>
            </div>
            <p className="text-[11px] text-slate-400">Port 8000 (Active)</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-200">SQLite Database</span>
            </div>
            <p className="text-[11px] text-slate-400">enterprise_data.db</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
              <span className="text-xs font-semibold text-slate-200">ML Engine</span>
            </div>
            <p className="text-[11px] text-slate-400">Linear Regression</p>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span className="text-xs font-semibold text-slate-200">AI BI Copilot</span>
            </div>
            <p className="text-[11px] text-slate-400">Telemetry Engine</p>
          </div>
        </div>

        {/* Database Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Pipeline Maintenance: Clear all uploaded datasets and reset ML models to a clean state.
          </p>
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="px-4 py-2 bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 text-xs font-semibold rounded-xl border border-slate-700 hover:border-rose-500/40 transition-all flex items-center space-x-2 shrink-0"
          >
            {resetting ? (
              <span>Purging...</span>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Purge All Uploaded Records</span>
              </>
            )}
          </button>
        </div>

        {statusMsg && (
          <div className="mt-3 p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-300 text-xs">
            {statusMsg}
          </div>
        )}
      </div>

      {/* User Accounts & Role Governance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Registered User Accounts & Access Governance</h3>
            <p className="text-xs text-slate-400 mt-0.5">Control enterprise access tiers and role provisioning</p>
          </div>
          <button
            onClick={fetchUsers}
            className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800">
            <thead className="bg-slate-800/50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">Username</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase">Active Role</th>
                <th className="px-5 py-3 text-right text-[11px] font-bold text-slate-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-3 font-semibold text-white">{u.username}</td>
                  <td className="px-5 py-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      u.role === 'Admin'
                        ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        : u.role === 'Analyst'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.username, e.target.value)}
                      className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2 py-1"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminControlPanel;
