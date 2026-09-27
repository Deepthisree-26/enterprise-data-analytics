import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getUserRole } from '../utils/auth';
import { switchRole } from '../services/authService';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const [switching, setSwitching] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = async (newRole: 'Analyst' | 'Manager' | 'Admin') => {
    if (newRole === role || switching) return;
    setSwitching(true);
    try {
      await switchRole(newRole);
      window.location.reload();
    } catch (err: any) {
      alert(`Role switch error: ${err.message}`);
    } finally {
      setSwitching(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r.toLowerCase()) {
      case 'admin':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'analyst':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      case 'manager':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      default:
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <header className="h-16 px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Platform Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">
            Enterprise <span className="text-indigo-400">BI</span>
          </h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Data Analytics Engine</p>
        </div>
      </div>

      {/* Role Switcher & User Controls */}
      <div className="flex items-center space-x-4">
        {/* Quick Role Switcher for instant testing */}
        <div className="hidden sm:flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] text-slate-500 font-bold uppercase px-2">Role:</span>
          {(['Analyst', 'Manager', 'Admin'] as const).map((r) => {
            const isActive = (role || '').toLowerCase() === r.toLowerCase();
            return (
              <button
                key={r}
                disabled={switching}
                onClick={() => handleRoleSwitch(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {role && (
          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadge(role)}`}>
              {role}
            </span>
          </div>
        )}

        <div className="h-5 w-[1px] bg-slate-800"></div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-all"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
