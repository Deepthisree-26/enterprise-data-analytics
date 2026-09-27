import React, { useState } from 'react';

const ManagerReports: React.FC = () => {
  const [downloading, setDownloading] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setDownloading(format);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/reports/export?format=${format}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `executive_bi_report_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`Export Error: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <h3 className="text-base font-bold text-white">Executive Reporting & Distribution</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Generate audited formal PDF briefs and multi-tab Excel models for board meetings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Manager Access
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Executive PDF Summary</h4>
                <p className="text-[11px] text-slate-400">Ready for distribution to executive leadership</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleExport('pdf')}
            disabled={downloading === 'pdf'}
            className="mt-4 w-full py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            {downloading === 'pdf' ? (
              <span>Generating PDF...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Executive PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Excel Card */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Full Financial Workbook (.xlsx)</h4>
                <p className="text-[11px] text-slate-400">Complete raw ledger, formulas, and margin audits</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => handleExport('excel')}
            disabled={downloading === 'excel'}
            className="mt-4 w-full py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            {downloading === 'excel' ? (
              <span>Generating Excel...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Financial Excel</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManagerReports;
