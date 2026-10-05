import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminReportsData, exportAdminReport } from '../../services/adminService';

const AdminReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<'system_usage' | 'data_quality' | 'audit_report'>('system_usage');
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);

  const loadReport = async (type = reportType) => {
    setLoading(true);
    try {
      const data = await fetchAdminReportsData(type);
      setReportData(data);
    } catch (err: any) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(reportType);
  }, [reportType]);

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    try {
      await exportAdminReport(reportType, format);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Administrative Governance & Compliance Reports"
        subtitle="Generate executive-grade system usage, data quality, and security audit reports with one-click export"
        icon="📑"
        actions={
          <div className="flex items-center space-x-2">
            <button
              disabled={!!exporting}
              onClick={() => handleExport('excel')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
            >
              <span>{exporting === 'excel' ? 'Exporting...' : '📥 Export Excel'}</span>
            </button>
            <button
              disabled={!!exporting}
              onClick={() => handleExport('pdf')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20 transition"
            >
              <span>{exporting === 'pdf' ? 'Generating...' : '📄 Export PDF'}</span>
            </button>
          </div>
        }
      />

      {/* Report Selection Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setReportType('system_usage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'system_usage'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          1. System Usage & Capacity
        </button>
        <button
          onClick={() => setReportType('data_quality')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'data_quality'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          2. Data Quality & Compliance
        </button>
        <button
          onClick={() => setReportType('audit_report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            reportType === 'audit_report'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          3. Security & Access Audit
        </button>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Compiling report data...</div>
      ) : !reportData ? (
        <div className="p-16 text-center text-xs text-slate-500">No data available for this report type.</div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">Official Document</span>
              <h2 className="text-xl font-black text-white mt-0.5">{reportData.report_title}</h2>
              <p className="text-xs text-slate-400 mt-1">Generated: {reportData.generated_at}</p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-emerald-400">Ready for Board Export</span>
            </div>
          </div>

          {/* Report KPIs */}
          {reportData.kpis && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(reportData.kpis).map(([k, v]: [string, any]) => (
                <div key={k} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {k.replace(/_/g, ' ')}
                  </span>
                  <div className="text-2xl font-black text-white mt-1">
                    {typeof v === 'number' ? v.toLocaleString() : String(v)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* System Usage Specific Details */}
          {reportType === 'system_usage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-3">Records Ingested by Department</h3>
                <div className="space-y-2">
                  {reportData.records_by_department?.map((d: any) => (
                    <div key={d.department} className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-white">{d.department}</span>
                      <span className="font-mono text-cyan-400 font-bold">{d.records.toLocaleString()} rows</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-3">User Role Allocation</h3>
                <div className="space-y-2">
                  {reportData.roles_distribution?.map((r: any) => (
                    <div key={r.role} className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-white">{r.role}</span>
                      <span className="font-mono text-indigo-400 font-bold">{r.count} users</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Quality Specific Details */}
          {reportType === 'data_quality' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-sm font-bold text-white mb-3">Department Pass Rates</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3 text-right">Checked</th>
                      <th className="py-2.5 px-3 text-right">Valid</th>
                      <th className="py-2.5 px-3 text-right">Invalid</th>
                      <th className="py-2.5 px-3 text-center">Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reportData.departments?.map((d: any) => (
                      <tr key={d.department} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-bold text-white">{d.department}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{d.total_checked}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-emerald-400">{d.valid}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-rose-400">{d.invalid}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">{d.pass_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Audit Report Specific Details */}
          {reportType === 'audit_report' && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
              <h3 className="text-sm font-bold text-white mb-3">Recent Security Actions Sample</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Action</th>
                      <th className="py-2.5 px-3">Target</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reportData.recent_events?.map((ev: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{ev.timestamp}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{ev.user}</td>
                        <td className="py-2.5 px-3 font-mono text-indigo-300">{ev.action}</td>
                        <td className="py-2.5 px-3 text-slate-400">{ev.resource}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            ev.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
