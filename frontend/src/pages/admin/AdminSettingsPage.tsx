import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminSettings, updateAdminSettings } from '../../services/adminService';

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, { value: string; category: string; description: string }>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminSettings();
      setSettings(data);
      const vals: Record<string, string> = {};
      Object.entries(data).forEach(([k, item]) => {
        vals[k] = item.value;
      });
      setFormValues(vals);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await updateAdminSettings(formValues);
      setSuccessMsg('System configuration updated and recorded in audit log.');
      loadSettings();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Platform Governance & System Settings"
          subtitle="Configure operational thresholds, ingestion quotas, telemetry preferences, and AI model parameters"
          icon="⚙️"
        />
        <div className="p-16 text-center text-xs text-slate-400">Loading system settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Platform Governance & System Settings"
        subtitle="Configure operational thresholds, ingestion quotas, telemetry preferences, and AI model parameters"
        icon="⚙️"
      />

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Application Branding */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Application & Branding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Application Platform Title</label>
              <input
                type="text"
                value={formValues['app_title'] || ''}
                onChange={(e) => handleChange('app_title', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Branding displayed in system headers</span>
            </div>
          </div>
        </section>

        {/* Ingestion & Upload Quotas */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dataset Ingestion Quotas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Max Upload Size (MB)</label>
              <input
                type="number"
                min={1}
                max={500}
                value={formValues['max_upload_size_mb'] || '50'}
                onChange={(e) => handleChange('max_upload_size_mb', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Enforced during CSV / XLSX parsing</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Allowed Ingestion Extensions</label>
              <input
                type="text"
                value={formValues['allowed_extensions'] || '.csv, .xlsx, .xls'}
                onChange={(e) => handleChange('allowed_extensions', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Accepted file formats</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Max Preview Rows Rendered</label>
              <input
                type="number"
                min={10}
                max={500}
                value={formValues['max_preview_rows'] || '100'}
                onChange={(e) => handleChange('max_preview_rows', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Preview table pagination limit</span>
            </div>
          </div>
        </section>

        {/* Security & Sessions */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Session & Security Parameters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">JWT Session Timeout (Minutes)</label>
              <input
                type="number"
                min={15}
                max={10080}
                value={formValues['session_timeout_minutes'] || '1440'}
                onChange={(e) => handleChange('session_timeout_minutes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Default 1440 min (24 hours)</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Minimum Password Length</label>
              <input
                type="number"
                min={6}
                max={32}
                value={formValues['enforce_password_length'] || '6'}
                onChange={(e) => handleChange('enforce_password_length', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Credential complexity threshold</span>
            </div>
          </div>
        </section>

        {/* AI Copilot & Reporting */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Copilot & Report Formatting</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Ollama Model Identifier</label>
              <input
                type="text"
                value={formValues['copilot_model_name'] || 'llama3.2'}
                onChange={(e) => handleChange('copilot_model_name', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Local Ollama LLM tag</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Sampling Temperature</label>
              <input
                type="text"
                value={formValues['copilot_temperature'] || '0.7'}
                onChange={(e) => handleChange('copilot_temperature', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Range 0.0 - 1.0</span>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Report Default Page Size</label>
              <select
                value={formValues['reports_page_size'] || 'LETTER'}
                onChange={(e) => handleChange('reports_page_size', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="LETTER">US Letter (Landscape)</option>
                <option value="A4">A4 (Landscape)</option>
              </select>
              <span className="text-[10px] text-slate-500 mt-1 block">PDF layout dimensions</span>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Confidential credentials, database keys, and JWT salts are strictly stored in system environment and cannot be modified via UI.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
