import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  fetchAdminAlerts,
  updateAdminAlertStatus,
  createAdminAlert,
} from '../../services/adminService';

const AdminAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    severity: 'warning',
    category: 'data_quality',
    department: 'Sales',
  });
  const [creating, setCreating] = useState(false);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAlerts({
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
      });
      setAlerts(data);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [statusFilter, severityFilter]);

  const handleStatusChange = async (id: number, newStatus: 'open' | 'acknowledged' | 'resolved') => {
    try {
      await updateAdminAlertStatus(id, newStatus);
      setSuccessMsg(`Alert #${id} marked as ${newStatus}.`);
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update alert');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createAdminAlert(newAlert);
      setSuccessMsg('System alert broadcasted successfully!');
      setShowCreateModal(false);
      setNewAlert({
        title: '',
        message: '',
        severity: 'warning',
        category: 'data_quality',
        department: 'Sales',
      });
      loadAlerts();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create alert');
    } finally {
      setCreating(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'error':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'info':
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="System & Data Governance Alerts"
        subtitle="Operational anomalies, data-quality violations, service notices, and incident dispatching"
        icon="🚨"
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/30"
            >
              + Create Alert
            </button>
            <button
              onClick={loadAlerts}
              className="px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl"
            >
              Refresh
            </button>
          </div>
        }
      />

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Statuses (Open, Ack, Resolved)</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-16 text-center text-xs text-slate-500">
          No alerts found matching the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border transition shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                alert.status === 'resolved'
                  ? 'bg-slate-900/60 border-slate-800/60 opacity-60'
                  : alert.severity === 'critical' || alert.severity === 'error'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2.5 mb-1.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-sm font-bold text-white">{alert.title}</span>
                  {alert.department && (
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] text-indigo-400 border border-slate-800 font-medium">
                      {alert.department}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
                <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-mono">
                  <span>Category: {alert.category}</span>
                  <span>Created: {alert.created_at}</span>
                  {alert.resolved_at && <span>Resolved by {alert.resolved_by} at {alert.resolved_at}</span>}
                </div>
              </div>

              {/* Status Actions */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 uppercase font-mono mr-1">Status:</span>
                {alert.status !== 'open' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'open')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    Open
                  </button>
                )}
                {alert.status !== 'acknowledged' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'acknowledged')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  >
                    Acknowledge
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(alert.id, 'resolved')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE ALERT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Broadcast System Alert</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g. Finance Ledger Sync Anomaly"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Message / Detail</label>
                <textarea
                  rows={3}
                  required
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                  placeholder="Describe the operational condition or system warning..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                    <option value="error">Error</option>
                    <option value="info">Info</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={newAlert.department}
                    onChange={(e) => setNewAlert({ ...newAlert, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Customers">Customers</option>
                    <option value="Products">Products</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-md shadow-rose-600/30"
                >
                  {creating ? 'Broadcasting...' : 'Broadcast Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAlertsPage;
