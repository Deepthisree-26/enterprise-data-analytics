import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserStatus,
  resetAdminUserPassword,
  deleteAdminUser,
  AdminUser,
} from '../../services/adminService';

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Analyst',
    department: 'Operations',
    full_name: '',
  });

  const [editUserData, setEditUserData] = useState({
    role: 'Analyst',
    department: '',
    full_name: '',
    is_active: true,
  });

  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchTerm) params.q = searchTerm;
      if (roleFilter) params.role = roleFilter;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter !== '') params.is_active = statusFilter === 'active';
      const data = await fetchAdminUsers(params);
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter, deptFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);
    try {
      await createAdminUser(newUserData);
      setSuccessMsg(`User ${newUserData.username} created successfully!`);
      setShowAddModal(false);
      setNewUserData({
        username: '',
        email: '',
        password: '',
        role: 'Analyst',
        department: 'Operations',
        full_name: '',
      });
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    setError(null);
    try {
      await updateAdminUser(selectedUser.id, editUserData);
      setSuccessMsg(`User ${selectedUser.username} updated successfully!`);
      setShowEditModal(false);
      loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} user "${user.username}"?`)) return;
    try {
      await toggleAdminUserStatus(user.id, !user.is_active);
      setSuccessMsg(`User ${user.username} is now ${!user.is_active ? 'Active' : 'Inactive'}.`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || `Failed to ${action} user`);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;
    setActionLoading(true);
    try {
      await resetAdminUserPassword(selectedUser.id, newPassword);
      setSuccessMsg(`Password for ${selectedUser.username} has been reset.`);
      setShowPasswordModal(false);
      setNewPassword('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!window.confirm(`CONFIRM DESTRUCTION: Are you sure you want to permanently delete user "${user.username}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteAdminUser(user.id);
      setSuccessMsg(`User ${user.username} was permanently deleted.`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete user');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setEditUserData({
      role: user.role,
      department: user.department || 'Administration',
      full_name: user.full_name || '',
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: AdminUser) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="User Lifecycle & Identity Governance"
        subtitle="Provision accounts, assign departmental units, manage RBAC privileges, and enforce account credentials"
        icon="👥"
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
          >
            <span>+</span>
            <span>Add User</span>
          </button>
        }
      />

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white font-bold ml-4">✕</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Administrator</option>
            <option value="Analyst">Data Analyst</option>
            <option value="Manager">Executive Manager</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Departments</option>
            <option value="Administration">Administration</option>
            <option value="Sales">Sales</option>
            <option value="Customers">Customers</option>
            <option value="Products">Products</option>
            <option value="Inventory">Inventory</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Operations">Operations</option>
            <option value="Executive">Executive</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </form>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            User Accounts Registry ({users.length})
          </span>
          <span className="text-[11px] text-slate-400">Real database records</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading user records...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No matching user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{user.full_name || user.username}</div>
                      <div className="text-[11px] text-slate-400 font-mono">@{user.username} • {user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.role === 'Admin'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : user.role === 'Manager'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-300 font-medium">{user.department || 'Unassigned'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          user.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Baseline'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => openEditModal(user)}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
                          title="Edit User"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openPasswordModal(user)}
                          className="px-2 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700"
                          title="Reset Password"
                        >
                          Key
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`px-2 py-1 text-[11px] rounded border ${
                            user.is_active
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.is_active ? 'Suspend' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="px-2 py-1 text-[11px] bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 rounded border border-rose-500/30"
                          title="Delete User Account"
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

      {/* MODAL: ADD USER */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Create Enterprise User</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserData.full_name}
                  onChange={(e) => setNewUserData({ ...newUserData, full_name: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUserData.username}
                  onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                  placeholder="e.g. jane_analyst"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  placeholder="e.g. jane@enterprise.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newUserData.password}
                  onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={newUserData.department}
                    onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive</option>
                    <option value="Sales">Sales</option>
                    <option value="Customers">Customers</option>
                    <option value="Products">Products</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  {actionLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Edit User: {selectedUser.username}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUserData.full_name}
                  onChange={(e) => setEditUserData({ ...editUserData, full_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select
                    value={editUserData.role}
                    onChange={(e) => setEditUserData({ ...editUserData, role: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Analyst">Analyst</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Department</label>
                  <select
                    value={editUserData.department}
                    onChange={(e) => setEditUserData({ ...editUserData, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Operations">Operations</option>
                    <option value="Executive">Executive</option>
                    <option value="Sales">Sales</option>
                    <option value="Customers">Customers</option>
                    <option value="Products">Products</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUserData.is_active}
                    onChange={(e) => setEditUserData({ ...editUserData, is_active: e.target.checked })}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Account Active</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {showPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">Reset Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400">
              Set a new temporary password for <strong>@{selectedUser.username}</strong>:
            </p>
            <form onSubmit={handleResetPassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/30"
                >
                  {actionLoading ? 'Resetting...' : 'Confirm Reset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
