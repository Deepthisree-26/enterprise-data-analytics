import React from 'react';
import { NavLink } from 'react-router-dom';

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  actions?: React.ReactNode;
}

const navItems = [
  { to: '/admin', label: 'Overview', icon: '📊' },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/access-control', label: 'Access Control', icon: '🔐' },
  { to: '/admin/departments', label: 'Departments', icon: '🏢' },
  { to: '/admin/data-management', label: 'Data Registry', icon: '📁' },
  { to: '/admin/upload-history', label: 'Upload History', icon: '📤' },
  { to: '/admin/data-quality', label: 'Data Quality', icon: '✅' },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: '🔍' },
  { to: '/admin/activity', label: 'Activity', icon: '👤' },
  { to: '/admin/system-health', label: 'System Health', icon: '🖥️' },
  { to: '/admin/alerts', label: 'Alerts', icon: '🚨' },
  { to: '/admin/reports', label: 'Reports', icon: '📑' },
  { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
];

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  actions,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-2xl shadow-inner">
              {icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  {badge || 'Platform Administration'}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-indigo-400 font-medium">Enterprise Governance</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">{title}</h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">{subtitle}</p>
            </div>
          </div>
          {actions && <div className="flex items-center space-x-2.5">{actions}</div>}
        </div>
      </div>

      {/* Horizontal Admin Sub-Navigation Pills */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1.5 shadow-md overflow-x-auto flex items-center space-x-1 scrollbar-thin scrollbar-thumb-slate-700">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default AdminHeader;
