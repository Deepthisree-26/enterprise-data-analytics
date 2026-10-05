import React, { useState } from 'react';
import { exportReportFile } from '../services/dataService';

const reportOptions = [
  { id: 'Executive', title: 'Executive Overview Board Report', desc: 'Boardroom-level multi-sheet audit compiling all active departments', icon: '🏛️' },
  { id: 'Sales', title: 'Sales & Revenue Audit Report', desc: 'Transaction volumes, profit margins, product velocity, and regional performance', icon: '💼' },
  { id: 'Customers', title: 'Customer Master & Retention Report', desc: 'Account health, segmentation, spend distribution, and churn risk metrics', icon: '👥' },
  { id: 'Inventory', title: 'Inventory Stock & Valuation Report', desc: 'Warehouse SKU counts, safety stock status, reorder levels, and total valuation', icon: '🏭' },
  { id: 'Finance', title: 'Financial Ledger & Budget Variance Report', desc: 'Operating revenue vs expenses, departmental allocations, and net operating income', icon: '💰' },
  { id: 'Marketing', title: 'Marketing Omnichannel Campaign Report', desc: 'Campaign acquisition spend, conversion rates, attributed revenue, and blended ROI', icon: '🎯' },
  { id: 'HR', title: 'Workforce Headcount & HR Audit Report', desc: 'Staffing levels, employee attendance rates, performance scoring, and attrition risk', icon: '👔' },
];

const ReportsPage: React.FC = () => {
  const [downloadingDept, setDownloadingDept] = useState<string | null>(null);

  const handleDownload = async (department: string, format: 'pdf' | 'excel') => {
    const key = `${department}-${format}`;
    setDownloadingDept(key);
    try {
      const blob = await exportReportFile(department, format);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${department}_Report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Report download failed. Please verify server status.');
    } finally {
      setDownloadingDept(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive Audit & Board Reporting
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
            Automated Report Engine
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Generate presentation-ready executive board decks (PDF) and comprehensive multi-sheet financial workbooks (Excel) for all business units.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportOptions.map((rep) => {
          const isPdfLoading = downloadingDept === `${rep.id}-pdf`;
          const isExcelLoading = downloadingDept === `${rep.id}-excel`;

          return (
            <div
              key={rep.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                rep.id === 'Executive'
                  ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-900 border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/80 border-slate-800 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{rep.icon}</span>
                  {rep.id === 'Executive' && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40">
                      Multi-Sheet Deck
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-bold text-white mb-1.5">{rep.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{rep.desc}</p>
              </div>

              <div className="flex items-center space-x-2.5 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleDownload(rep.id, 'pdf')}
                  disabled={isPdfLoading || isExcelLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center space-x-1.5"
                >
                  {isPdfLoading ? (
                    <span>Generating PDF...</span>
                  ) : (
                    <>
                      <span>📄</span>
                      <span>Export PDF</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDownload(rep.id, 'excel')}
                  disabled={isPdfLoading || isExcelLoading}
                  className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5"
                >
                  {isExcelLoading ? (
                    <span>Building Excel...</span>
                  ) : (
                    <>
                      <span>📊</span>
                      <span>Export Excel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsPage;
