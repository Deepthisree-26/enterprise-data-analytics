import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchRoleAccessControl, RoleAccessControl } from '../../services/adminService';

const AdminAccessControlPage: React.FC = () => {
  const [rolesData, setRolesData] = useState<RoleAccessControl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetchRoleAccessControl();
        setRolesData(resp);
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || 'Failed to load access control matrix');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Role & Access Control Matrix"
          subtitle="Enforce multi-tier permissions, route boundaries, and API authorization rules"
          icon="🔐"
        />
        <div className="p-16 text-center text-xs text-slate-400">Loading RBAC matrix...</div>
      </div>
    );
  }

  const roleConfigs = [
    {
      role: 'Analyst',
      badge: 'Data Analyst Tier',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      icon: '📥',
      gradient: 'from-emerald-950/30 to-slate-900',
    },
    {
      role: 'Manager',
      badge: 'Executive Manager Tier',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      icon: '🏛️',
      gradient: 'from-amber-950/30 to-slate-900',
    },
    {
      role: 'Admin',
      badge: 'Platform Administrator Tier',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      icon: '🛡️',
      gradient: 'from-rose-950/30 to-slate-900',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Role & Access Control Matrix"
        subtitle="Enforce multi-tier permissions, route boundaries, and API authorization rules"
        icon="🔐"
      />

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleConfigs.map(({ role, badge, badgeColor, icon, gradient }) => {
          const info = rolesData ? rolesData[role] : null;
          return (
            <div
              key={role}
              className={`bg-gradient-to-b ${gradient} border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-xl">
                    {icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{info?.title || role}</h3>
                <p className="text-xs text-slate-400 mb-4">{info?.description}</p>

                {/* Counts */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl mb-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Assigned Users</span>
                    <span className="font-bold text-white text-base">{info?.user_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Active Users</span>
                    <span className="font-bold text-emerald-400 text-base">{info?.active_count || 0}</span>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-bold uppercase font-mono text-slate-400 tracking-wider">
                    Permitted Capabilities:
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {info?.permissions.map((p, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Authorized Routes */}
              <div className="pt-3 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase font-mono text-slate-400 tracking-wider block mb-1.5">
                  Frontend & API Boundaries:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {info?.routes.slice(0, 5).map((r) => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      {r}
                    </span>
                  ))}
                  {(info?.routes.length || 0) > 5 && (
                    <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-indigo-400">
                      +{info!.routes.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enforcement Architecture Banner */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <h3 className="text-sm font-bold text-white mb-2">Two-Way RBAC Security Guarantee</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Access control is strictly enforced on <strong>both frontend routes</strong> (via <code>ProtectedRoute.tsx</code>) and <strong>backend API endpoints</strong> (via FastAPI <code>require_admin</code> and role token inspection). Any attempt to invoke Admin APIs by non-administrative tokens triggers an immediate HTTP <code>403 Forbidden</code> response and is committed to the centralized security audit log.
        </p>
      </section>
    </div>
  );
};

export default AdminAccessControlPage;
