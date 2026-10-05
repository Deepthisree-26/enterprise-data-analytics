import React, { useEffect, useState } from 'react';
import AdminHeader from '../../components/AdminHeader';
import { fetchAdminDataQuality } from '../../services/adminService';

const AdminDataQualityPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const resp = await fetchAdminDataQuality();
      setData(resp);
    } catch (err: any) {
      console.error('Failed to load data quality metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminHeader
          title="Data Quality & Integrity Center"
          subtitle="Real-time compliance monitoring, schema validations, null value detection, and department health"
          icon="✅"
        />
        <div className="p-16 text-center text-xs text-slate-400">Loading data quality metrics...</div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const departmentBreakdown = data?.department_breakdown || [];
  const trends = data?.trends || [];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Data Quality & Integrity Center"
        subtitle="Real-time compliance monitoring, schema validations, null value detection, and department health"
        icon="✅"
        actions={
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition"
          >
            <span>Refresh Telemetry</span>
          </button>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Checked Rows</span>
          <div className="text-2xl font-black text-white mt-1">{(summary.total_checked || 0).toLocaleString()}</div>
          <span className="text-[10px] text-slate-500 font-medium">Inspected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Valid Rows</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{(summary.valid_records || 0).toLocaleString()}</div>
          <span className="text-[10px] text-emerald-500 font-medium">Passed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Invalid Rows</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{(summary.invalid_records || 0).toLocaleString()}</div>
          <span className="text-[10px] text-rose-500 font-medium">Rejected</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Missing Values</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{summary.missing_values || 0}</div>
          <span className="text-[10px] text-slate-500 font-medium">Null Fields</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duplicates</span>
          <div className="text-2xl font-black text-sky-400 mt-1">{summary.duplicate_records || 0}</div>
          <span className="text-[10px] text-slate-500 font-medium">Deduplicated</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">FK Errors</span>
          <div className="text-2xl font-black text-violet-400 mt-1">{summary.foreign_key_errors || 0}</div>
          <span className="text-[10px] text-slate-500 font-medium">Orphan Keys</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Warnings</span>
          <div className="text-2xl font-black text-amber-300 mt-1">{summary.warnings || 0}</div>
          <span className="text-[10px] text-slate-500 font-medium">Non-critical</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quality Score</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{summary.overall_score || 100}%</div>
          <span className="text-[10px] text-emerald-400 font-medium">High Standard</span>
        </div>
      </div>

      {/* Department Quality Breakdown Table */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
        <h2 className="text-base font-bold text-white mb-4">Department Data Quality Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Database Records</th>
                <th className="py-3 px-4 text-right">Valid Rows</th>
                <th className="py-3 px-4 text-right">Invalid Rows</th>
                <th className="py-3 px-4 text-right">Warnings</th>
                <th className="py-3 px-4 text-center">Quality Score</th>
                <th className="py-3 px-4 text-center">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {departmentBreakdown.map((row: any) => (
                <tr key={row.department} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>{row.department}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-200">
                    {row.total_records.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400 font-semibold">
                    {row.valid_records.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-rose-400">
                    {row.invalid_records}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">
                    {row.warnings}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${row.quality_score}%` }}
                        ></div>
                      </div>
                      <span className="font-mono font-bold text-emerald-400">{row.quality_score}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        row.status === 'Healthy'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Historical Quality Trends */}
      {trends.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-base font-bold text-white mb-4">Historical Ingestion Quality Trends</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trends.map((t: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-white truncate max-w-[180px]">{t.file}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-indigo-400 font-semibold">
                      {t.department}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{t.timestamp}</span>
                </div>
                <div className="mt-3 flex justify-between items-center text-[11px] pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Pass Rate:</span>
                  <span className="font-mono font-bold text-emerald-400">{t.pass_rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default AdminDataQualityPage;
