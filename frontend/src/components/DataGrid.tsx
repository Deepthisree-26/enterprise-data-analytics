import React, { useState, useMemo } from 'react';

interface Record {
  order_id: string;
  date: string;
  region: string;
  category: string;
  product: string;
  units_sold: number;
  revenue: number;
  profit_margin: number;
  customer_role: string;
}

interface Props {
  records: Record[];
}

const DataGrid: React.FC<Props> = ({ records }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  const handleExport = (format: 'pdf' | 'excel') => {
    const token = localStorage.getItem('token');
    const url = `/api/reports/export?format=${format}`;
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Export failed');
        return res.blob();
      })
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `enterprise_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => alert(err.message));
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchSearch =
        (r.order_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.product || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchRegion = regionFilter === 'All' || r.region === regionFilter;
      return matchSearch && matchRegion;
    });
  }, [records, searchTerm, regionFilter]);

  const uniqueRegions = useMemo(() => {
    const set = new Set(records.map((r) => r.region).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [records]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header and Export Toolbar */}
      <div className="p-5 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Live Transactions Telemetry</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time enterprise order ledger with ML revenue projections ({filteredRecords.length} records)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-rose-400 hover:text-rose-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search order ID, product, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Region:</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/70 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
          >
            {uniqueRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-800/60">
            <tr>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Order ID</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Region</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Product</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Units Sold</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Revenue</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Margin</th>
              <th className="px-5 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Segment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-300">
                      {records.length === 0
                        ? 'No dataset uploaded yet'
                        : 'No records matching criteria'}
                    </span>
                    <span className="text-xs text-slate-500 max-w-sm">
                      {records.length === 0
                        ? 'Upload a CSV or XLSX spreadsheet above to ingest your transactions and view the ledger.'
                        : 'Try adjusting your search query or region filter.'}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((r, index) => (
                <tr
                  key={r.order_id || index}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-indigo-400">
                    {r.order_id}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs">{r.date}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                      {r.region}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs">{r.category}</td>
                  <td className="px-5 py-3.5 text-slate-200 font-medium text-xs">{r.product}</td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs font-mono">{r.units_sold}</td>
                  <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono text-xs">
                    ${Number(r.revenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 text-xs font-mono">
                    {(Number(r.profit_margin) * 100).toFixed(1)}%
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">{r.customer_role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataGrid;
