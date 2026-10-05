import React, { useState, useEffect } from 'react';
import { fetchDepartmentRecords } from '../services/dataService';

const departmentsList = ['Sales', 'Customers', 'Products', 'Inventory', 'Finance', 'Marketing', 'HR'];

const DataExplorerPage: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<string>('Sales');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadData = () => {
    setLoading(true);
    fetchDepartmentRecords(selectedDept, page, 50, searchTerm)
      .then((res) => {
        setRecords(res.records || []);
        setTotalRecords(res.total_records || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [selectedDept, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Data Explorer & Ledger
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
            Database Record Browser
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Inspect, filter, and audit ingested records across all functional enterprise tables in real time.
        </p>
      </div>

      {/* Department Selector & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          {departmentsList.map((d) => (
            <button
              key={d}
              onClick={() => {
                setSelectedDept(d);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDept === d
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-950/40 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Search ${selectedDept}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">
            {selectedDept} Records ({totalRecords.toLocaleString()} Total)
          </h2>
          <span className="text-xs text-slate-400">Page {page}</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
            <svg className="animate-spin w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Querying {selectedDept} table...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No records found for {selectedDept}. Upload a dataset in the Data Ingestion Center to inspect records.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/50">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  {Object.keys(records[0] || {}).map((col) => (
                    <th key={col} className="py-2.5 px-3">
                      {col.replace(/_/g, ' ').toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    {Object.values(r).map((val: any, cidx) => (
                      <td key={cidx} className="py-2.5 px-3 text-slate-300 font-mono">
                        {String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalRecords > 50 && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800 mt-4">
            <span>Showing up to 50 records per page</span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
              >
                Previous
              </button>
              <button
                disabled={page * 50 >= totalRecords}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 disabled:opacity-40 hover:bg-slate-700 text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataExplorerPage;
