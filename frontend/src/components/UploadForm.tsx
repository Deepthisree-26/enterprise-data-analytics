import React, { useState } from 'react';
import { uploadFile } from '../services/dataService';

interface Props {
  onUploadSuccess?: () => void;
}

const UploadForm: React.FC<Props> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await uploadFile(file);
      const count = Array.isArray(res) ? res.length : '';
      setSuccess(`Successfully ingested ${file.name}! ${count ? `${count} records processed. ` : ''}Ledger & ML models updated.`);
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError(err.response.data?.detail || 'Forbidden: Only Analyst or Admin roles can ingest datasets.');
      } else if (err.response?.status === 401) {
        setError('Session expired or unauthorized. Please sign in again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.code === 'ECONNABORTED' || err.message?.includes('Network Error')) {
        setError('Network Error: Unable to connect to the backend server (127.0.0.1:8000). Please ensure the backend is running.');
      } else {
        setError(err.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Ingest Financial & Sales Dataset</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Support for transactional spreadsheets (.csv, .xlsx). Automatically triggers model re-training.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">CSV</span>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">XLSX</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label className="flex-1 cursor-pointer flex items-center justify-between px-4 py-2.5 bg-slate-950/60 border border-dashed border-slate-700 hover:border-indigo-500/60 rounded-xl transition-all group">
          <div className="flex items-center space-x-3 overflow-hidden">
            <svg className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-slate-300 truncate">
              {file ? file.name : 'Select or drop a CSV / XLSX data file...'}
            </span>
          </div>
          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg shrink-0 ml-2">
            Browse
          </span>
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={loading || !file}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 shrink-0"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Ingesting...</span>
            </>
          ) : (
            <>
              <span>Upload & Analyze</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </form>

      <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <span className="text-slate-400">
          Need to upload and validate <b>Customers</b>, <b>Inventory</b>, <b>Finance</b>, <b>Marketing</b>, or <b>HR</b> datasets?
        </span>
        <a
          href="/analyst/data-ingestion"
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1 transition"
        >
          <span>Launch Enterprise Ingestion Center</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
};

export default UploadForm;
