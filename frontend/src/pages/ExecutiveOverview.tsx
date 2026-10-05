import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchExecutiveOverview } from '../services/dataService';
import { getUserRole } from '../utils/auth';

const ExecutiveOverview: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const role = getUserRole();

  const loadData = () => {
    setLoading(true);
    fetchExecutiveOverview()
      .then((res) => {
        setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <svg className="animate-spin w-8 h-8 text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm text-slate-400 font-semibold">Loading Executive Telemetry...</span>
        </div>
      </div>
    );
  }

  const cards = data?.cards || [];
  const depts = data?.departments || {};
  const cross = data?.cross_analytics || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Executive Enterprise Overview
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-amber-500/10 text-amber-300 border-amber-500/30">
              Executive Boardroom View
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Unified telemetry synthesizing real-time operational datasets across all enterprise business units.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <span>↻ Refresh Telemetry</span>
          </button>
          <Link
            to="/reports"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/20"
          >
            <span>📑 Board Reports (PDF/Excel)</span>
          </Link>
        </div>
      </div>

      {/* TOP 8 EXECUTIVE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {cards.map((card: any, idx: number) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
              card.has_data
                ? 'bg-slate-900/90 border-slate-800 shadow-sm'
                : 'bg-slate-950/40 border-dashed border-slate-800/80 opacity-75'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-400 truncate block">
              {card.label}
            </span>
            <span
              className={`text-base font-extrabold mt-1.5 block tracking-tight ${
                card.has_data ? 'text-white' : 'text-slate-500 text-xs italic font-normal'
              }`}
            >
              {card.value}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-indigo-400 mt-2 font-mono">
              {card.dept}
            </span>
          </div>
        ))}
      </div>

      {/* CROSS-DEPARTMENT ANALYTICS INSIGHTS */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-md backdrop-blur-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚡</span>
            <h2 className="text-lg font-bold text-white">Cross-Department Strategic Intelligence</h2>
          </div>
          <span className="text-xs text-indigo-400 font-semibold">Relational Datasets Correlation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Top Revenue Customers (Sales join Customers) */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Top Revenue Customers</span>
                <span className="text-[10px] text-indigo-400 font-normal">Sales × Customers</span>
              </h3>
              {cross.top_revenue_customers && cross.top_revenue_customers.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {cross.top_revenue_customers.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-300 truncate max-w-[140px]">{c.customer_name}</span>
                      <span className="font-mono font-bold text-emerald-400">${c.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">
                  Requires both Sales and Customer datasets to be ingested.
                </p>
              )}
            </div>
          </div>

          {/* High Sales but Low Inventory Products */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>High Velocity / Low Stock</span>
                <span className="text-[10px] text-amber-400 font-normal">Sales × Inventory</span>
              </h3>
              {cross.high_sales_low_inventory && cross.high_sales_low_inventory.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {cross.high_sales_low_inventory.map((p: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-300 truncate max-w-[130px]">{p.product_name}</span>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {p.stock_quantity} in stock
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">
                  No stockout risks detected across top sales SKUs, or inventory dataset is pending upload.
                </p>
              )}
            </div>
          </div>

          {/* Top Marketing Channels */}
          <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Top Marketing Channels</span>
                <span className="text-[10px] text-indigo-400 font-normal">Marketing Telemetry</span>
              </h3>
              {cross.channel_performance && cross.channel_performance.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {cross.channel_performance.map((ch: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-slate-800/50">
                      <span className="text-slate-300">{ch.channel}</span>
                      <span className="font-mono font-bold text-indigo-400">${ch.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-4">
                  Marketing campaigns dataset not yet ingested.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENT SCORECARDS WITH ZERO FAKE DATA & CLEAR EMPTY STATES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Sales Performance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💼</span>
                <h3 className="text-sm font-bold text-white">Sales Performance</h3>
              </div>
              <Link to="/sales" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.Sales?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total Revenue</span>
                  <span className="font-bold font-mono text-white">${depts.Sales.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Gross Profit</span>
                  <span className="font-bold font-mono text-emerald-400">${depts.Sales.profit?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Profit Margin</span>
                  <span className="font-bold font-mono text-white">{depts.Sales.margin?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Units Sold</span>
                  <span className="font-mono text-slate-300">{depts.Sales.units?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No Sales dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload Sales Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 2. Customer Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👥</span>
                <h3 className="text-sm font-bold text-white">Customer Health</h3>
              </div>
              <Link to="/customers" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.Customers?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total Accounts</span>
                  <span className="font-bold font-mono text-white">{depts.Customers.total?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Active Accounts</span>
                  <span className="font-bold font-mono text-emerald-400">{depts.Customers.active?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Churned Accounts</span>
                  <span className="font-bold font-mono text-rose-400">{depts.Customers.churned?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Average Spend / Account</span>
                  <span className="font-mono text-slate-300">${depts.Customers.avg_spend?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No Customer dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload Customer Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Inventory Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🏭</span>
                <h3 className="text-sm font-bold text-white">Inventory Health</h3>
              </div>
              <Link to="/inventory" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.Inventory?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Inventory Valuation</span>
                  <span className="font-bold font-mono text-white">${depts.Inventory.total_value?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total SKUs Monitored</span>
                  <span className="font-bold font-mono text-slate-200">{depts.Inventory.sku_count?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Low Stock SKUs</span>
                  <span className="font-bold font-mono text-amber-400">{depts.Inventory.low_stock}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Out of Stock SKUs</span>
                  <span className="font-bold font-mono text-rose-400">{depts.Inventory.out_of_stock}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No Inventory dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload Inventory Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Financial Performance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💰</span>
                <h3 className="text-sm font-bold text-white">Financial Performance</h3>
              </div>
              <Link to="/finance" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.Finance?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Recognized Revenue</span>
                  <span className="font-bold font-mono text-white">${depts.Finance.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Operating Expenses</span>
                  <span className="font-bold font-mono text-rose-400">${depts.Finance.expenses?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Net Operating Profit</span>
                  <span className="font-bold font-mono text-emerald-400">${depts.Finance.net_profit?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Budget Variance</span>
                  <span className="font-mono text-slate-300">${depts.Finance.variance?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No Financial dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload Finance Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. Marketing Performance */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🎯</span>
                <h3 className="text-sm font-bold text-white">Marketing Performance</h3>
              </div>
              <Link to="/marketing" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.Marketing?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total Spend</span>
                  <span className="font-bold font-mono text-white">${depts.Marketing.spend?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Attributed Revenue</span>
                  <span className="font-bold font-mono text-indigo-400">${depts.Marketing.revenue?.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Marketing ROI</span>
                  <span className="font-bold font-mono text-emerald-400">{depts.Marketing.roi?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total Leads & Conversions</span>
                  <span className="font-mono text-slate-300">{depts.Marketing.leads?.toLocaleString()} / {depts.Marketing.conversions?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No Marketing dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload Marketing Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. HR Overview */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">👔</span>
                <h3 className="text-sm font-bold text-white">HR Overview</h3>
              </div>
              <Link to="/hr" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                Explore →
              </Link>
            </div>
            {depts.HR?.has_data ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Total Headcount</span>
                  <span className="font-bold font-mono text-white">{depts.HR.total_employees?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Active Employees</span>
                  <span className="font-bold font-mono text-emerald-400">{depts.HR.active_employees?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">Avg Attendance</span>
                  <span className="font-bold font-mono text-slate-200">{depts.HR.avg_attendance?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60 text-xs">
                  <span className="text-slate-400">High Attrition Risk</span>
                  <span className="font-mono text-rose-400 font-bold">{depts.HR.high_attrition} employee(s)</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center my-4">
                <p className="text-xs text-slate-400">No HR dataset has been uploaded yet.</p>
                {role?.toLowerCase() !== 'manager' && (
                  <Link to="/analyst/data-ingestion" className="text-[11px] text-indigo-400 hover:underline mt-1 inline-block">
                    Upload HR Dataset →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOverview;
