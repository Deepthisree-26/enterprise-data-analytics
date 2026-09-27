import React from 'react';
import { NavLink } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Sidebar: React.FC = () => {
  const role = getUserRole();

  const getRoleLinks = () => {
    switch (role.toLowerCase()) {
      case 'analyst':
        return [
          {
            to: '/dashboard',
            label: 'Analyst Data Hub',
            badge: 'Ingest',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            ),
          },
          {
            to: '/dashboard#ml-simulator',
            label: 'ML Simulator',
            badge: 'Predict',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
          },
          {
            to: '/dashboard#data-grid',
            label: 'Transaction Ledger',
            badge: 'Audit',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
          },
          {
            to: '/manager-chat',
            label: 'Analyst AI Copilot',
            badge: 'Copilot',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            ),
          },
        ];
      case 'manager':
        return [
          {
            to: '/dashboard',
            label: 'Executive Scorecards',
            badge: 'KPIs',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            to: '/dashboard#manager-reports',
            label: 'Audit Reports (PDF/Excel)',
            badge: 'Export',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            ),
          },
          {
            to: '/dashboard#manager-charts',
            label: 'Forecast & Market Share',
            badge: 'Strategy',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
            ),
          },
          {
            to: '/manager-chat',
            label: 'Executive AI Copilot',
            badge: 'Executive',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ),
          },
        ];
      case 'admin':
        return [
          {
            to: '/dashboard',
            label: 'System Operations',
            badge: 'Health',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
          {
            to: '/dashboard#admin-controls',
            label: 'User Access Governance',
            badge: 'Accounts',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
          },
          {
            to: '/dashboard#data-grid',
            label: 'Pipeline Data & Ledger',
            badge: 'Database',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            ),
          },
          {
            to: '/manager-chat',
            label: 'System AI Copilot',
            badge: 'Admin AI',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            ),
          },
        ];
      default:
        return [
          {
            to: '/dashboard',
            label: 'Telemetry & KPIs',
            badge: '',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            ),
          },
          {
            to: '/manager-chat',
            label: 'Executive AI Chat',
            badge: '',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            ),
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

      {/* Navigation Links */}
      <div className="p-4 flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>{role ? `${role} Tools` : 'Navigation'}</span>
          {role && (
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          )}
        </div>
        {links.map((l) => (
          <NavLink
            key={l.label}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <span className="shrink-0">{l.icon}</span>
              <span>{l.label}</span>
            </div>
            {l.badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
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
            <p className="text-[11px] text-slate-500">FastAPI & BI Engine Active</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
