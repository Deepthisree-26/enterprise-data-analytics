import React from 'react';
import { NavLink } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Sidebar: React.FC = () => {
  const role = getUserRole() || 'Analyst';

  const getRoleLinks = () => {
    switch (role.toLowerCase()) {
      case 'analyst':
        return [
          {
            to: '/dashboard',
            label: 'Dashboard',
            badge: 'Home',
            icon: '📊',
          },
          {
            to: '/analyst/data-ingestion',
            label: 'Data Ingestion',
            badge: 'Ingest',
            icon: '📥',
          },
          {
            to: '/data-explorer',
            label: 'Data Explorer',
            badge: 'Audit',
            icon: '🔍',
          },
          {
            to: '/predictive-analytics',
            label: 'Predictive Analytics',
            badge: 'ML',
            icon: '⚡',
          },
          {
            to: '/manager-chat',
            label: 'AI Copilot',
            badge: 'AI',
            icon: '🤖',
          },
        ];

      case 'manager':
        return [
          {
            to: '/manager/executive',
            label: 'Executive Overview',
            badge: 'Board',
            icon: '🏛️',
          },
          {
            to: '/sales',
            label: 'Sales',
            badge: '',
            icon: '💼',
          },
          {
            to: '/customers',
            label: 'Customers',
            badge: '',
            icon: '👥',
          },
          {
            to: '/inventory',
            label: 'Inventory',
            badge: '',
            icon: '🏭',
          },
          {
            to: '/finance',
            label: 'Finance',
            badge: '',
            icon: '💰',
          },
          {
            to: '/marketing',
            label: 'Marketing',
            badge: '',
            icon: '🎯',
          },
          {
            to: '/hr',
            label: 'HR',
            badge: '',
            icon: '👔',
          },
          {
            to: '/predictive-analytics',
            label: 'Predictive Analytics',
            badge: 'ML',
            icon: '⚡',
          },
          {
            to: '/manager-chat',
            label: 'AI Copilot',
            badge: 'AI',
            icon: '🤖',
          },
          {
            to: '/reports',
            label: 'Reports',
            badge: 'Export',
            icon: '📑',
          },
        ];

      case 'admin':
        return [
          {
            to: '/admin',
            label: 'Overview',
            badge: 'Admin',
            icon: '📊',
          },
          {
            to: '/admin/users',
            label: 'User Management',
            badge: 'Users',
            icon: '👥',
          },
          {
            to: '/admin/access-control',
            label: 'Access Control',
            badge: 'RBAC',
            icon: '🔐',
          },
          {
            to: '/admin/departments',
            label: 'Departments',
            badge: '7 Units',
            icon: '🏢',
          },
          {
            to: '/admin/data-management',
            label: 'Data Management',
            badge: 'Registry',
            icon: '📁',
          },
          {
            to: '/admin/upload-history',
            label: 'Upload History',
            badge: 'Audit',
            icon: '📤',
          },
          {
            to: '/admin/data-quality',
            label: 'Data Quality',
            badge: 'QA',
            icon: '✅',
          },
          {
            to: '/admin/audit-logs',
            label: 'Audit Logs',
            badge: 'Trail',
            icon: '🔍',
          },
          {
            to: '/admin/activity',
            label: 'Security Activity',
            badge: 'Logins',
            icon: '👤',
          },
          {
            to: '/admin/system-health',
            label: 'System Health',
            badge: 'Live',
            icon: '🖥️',
          },
          {
            to: '/admin/alerts',
            label: 'System Alerts',
            badge: 'Alerts',
            icon: '🚨',
          },
          {
            to: '/admin/reports',
            label: 'Admin Reports',
            badge: 'PDF/XLS',
            icon: '📑',
          },
          {
            to: '/admin/settings',
            label: 'System Settings',
            badge: 'Config',
            icon: '⚙️',
          },
          {
            to: '/manager/executive',
            label: 'Executive Overview',
            badge: 'Manager',
            icon: '🏛️',
          },
          {
            to: '/analyst/data-ingestion',
            label: 'Data Ingestion',
            badge: 'Analyst',
            icon: '📥',
          },
          {
            to: '/manager-chat',
            label: 'AI Copilot',
            badge: 'AI',
            icon: '🤖',
          },
        ];

      default:
        return [
          {
            to: '/dashboard',
            label: 'Dashboard',
            badge: '',
            icon: '📊',
          },
        ];
    }
  };

  const links = getRoleLinks();

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full z-20 shrink-0">
      {/* Brand Section */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 font-bold text-sm">
          BI
        </div>
        <div>
          <span className="font-extrabold text-sm tracking-tight text-white uppercase block leading-tight">
            Enterprise BI
          </span>
          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">
            {role || 'Analytics Platform'}
          </span>
        </div>
      </div>

      {/* Navigation Links with custom scrollbar */}
      <div className="p-3 flex-1 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{role ? `${role} Navigation` : 'Navigation'}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
        </div>
        {links.map((l) => (
          <NavLink
            key={l.label}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`
            }
          >
            <div className="flex items-center space-x-2.5 truncate">
              <span className="text-base shrink-0">{l.icon}</span>
              <span className="truncate">{l.label}</span>
            </div>
            {l.badge && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
                {l.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">System Online</p>
            <p className="text-[11px] text-slate-500">Multi-Department Engine</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
