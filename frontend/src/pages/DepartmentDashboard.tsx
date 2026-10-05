import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchDepartmentAnalytics } from '../services/dataService';
import { getUserRole } from '../utils/auth';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

interface Props {
  departmentName?: string;
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const DepartmentDashboard: React.FC<Props> = ({ departmentName }) => {
  const { dept } = useParams<{ dept?: string }>();
  const activeDept = (departmentName || dept || 'Sales').trim();
  const normalizedDept = activeDept.charAt(0).toUpperCase() + activeDept.slice(1).toLowerCase();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const role = getUserRole();

  const loadData = () => {
    setLoading(true);
    fetchDepartmentAnalytics(normalizedDept)
      .then((res) => {
        setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [normalizedDept]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm text-slate-400 font-semibold">Loading {normalizedDept} Telemetry...</span>
        </div>
      </div>
    );
  }

  // Proper empty state when no dataset uploaded
  if (!data || !data.has_data) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 shadow-xl backdrop-blur-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-3xl flex items-center justify-center mx-auto">
            📊
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            No {normalizedDept} Dataset Uploaded Yet
          </h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Telemetry is awaiting ingestion. Once an Analyst uploads the {normalizedDept} dataset, real-time KPI scorecards and trend charts will automatically populate here.
          </p>
          {role?.toLowerCase() !== 'manager' ? (
            <div className="pt-2">
              <Link
                to="/analyst/data-ingestion"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/20 inline-flex items-center space-x-2"
              >
                <span>Go to Data Ingestion Center</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
                Awaiting Data Analyst ingestion
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const metrics = data.metrics || {};
  const charts = data.charts || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {normalizedDept} Analytics & Telemetry
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              Live Database Telemetry
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Real-time functional indicators, breakdowns, and trend analytics for the {normalizedDept} department.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <span>↻ Refresh</span>
          </button>
          <Link
            to="/reports"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <span>📑 Export {normalizedDept} Report</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.entries(metrics).map(([key, val]: [string, any], idx) => {
          let formattedVal = val;
          if (typeof val === 'number') {
            if (key.includes('revenue') || key.includes('profit') || key.includes('spend') || key.includes('value')) {
              formattedVal = `$${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            } else if (key.includes('margin') || key.includes('rate') || key.includes('attendance') || key.includes('roi')) {
              formattedVal = `${val.toFixed(1)}%`;
            } else {
              formattedVal = val.toLocaleString();
            }
          }
          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm"
            >
              <span className="text-xs font-semibold text-slate-400 capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="text-xl font-extrabold text-white mt-2 font-mono">
                {formattedVal}
              </span>
            </div>
          );
        })}
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Render relevant charts based on department */}
        {normalizedDept === 'Sales' && (
          <>
            {charts.revenue_trend && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Revenue Trend (Last 12 Periods)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={charts.revenue_trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.regional && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Revenue by Region</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.regional}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="region" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {normalizedDept === 'Customers' && (
          <>
            {charts.segment && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Customers by Segment</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.segment}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="segment" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.status && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Customer Status Breakdown</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.status}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {charts.status.map((_: any, idx: number) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {normalizedDept === 'Inventory' && (
          <>
            {charts.by_category && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Inventory Valuation by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.by_category}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.status && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">SKU Stock Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.status}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="status" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {normalizedDept === 'Finance' && (
          <>
            {charts.budget_vs_actual && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Budget vs Actual by Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.budget_vs_actual}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="budget" fill="#64748b" radius={[4, 4, 0, 0]} name="Budget" />
                      <Bar dataKey="actual" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.expenses_by_category && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Expenses by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.expenses_by_category}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="amount" fill="#ef4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}

        {normalizedDept === 'Marketing' && (
          <>
            {charts.channel_roi && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Channel Performance & ROI</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.channel_roi}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="channel" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="spend" fill="#ef4444" radius={[4, 4, 0, 0]} name="Spend" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.campaign_performance && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm overflow-x-auto">
                <h3 className="text-sm font-bold text-white mb-3">Top Campaigns Table</h3>
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-2">Campaign</th>
                      <th className="py-2 px-2">Channel</th>
                      <th className="py-2 px-2">Spend</th>
                      <th className="py-2 px-2">Revenue</th>
                      <th className="py-2 px-2">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {charts.campaign_performance.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-2 font-medium text-slate-200">{c.campaign_name}</td>
                        <td className="py-2 px-2 text-slate-400">{c.channel}</td>
                        <td className="py-2 px-2 font-mono text-slate-300">${c.spend.toLocaleString()}</td>
                        <td className="py-2 px-2 font-mono text-emerald-400 font-bold">${c.revenue.toLocaleString()}</td>
                        <td className="py-2 px-2 font-mono text-indigo-400 font-bold">{c.roi?.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {normalizedDept === 'HR' && (
          <>
            {charts.by_department && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Headcount by Department</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.by_department}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {charts.attrition_risk && (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-white mb-4">Attrition Risk Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.attrition_risk}
                        dataKey="count"
                        nameKey="risk"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DepartmentDashboard;
