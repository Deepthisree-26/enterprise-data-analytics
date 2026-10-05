import React, { useState } from 'react';
import {
  predictRevenue,
  predictCustomerChurn,
  predictStockout,
  predictMarketing,
} from '../services/dataService';
import MLSimulator from '../components/MLSimulator';

const PredictiveAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'customers' | 'inventory' | 'marketing'>('sales');

  // Customer churn state
  const [churnAge, setChurnAge] = useState<number>(38);
  const [churnOrders, setChurnOrders] = useState<number>(2);
  const [churnSpend, setChurnSpend] = useState<number>(1200);
  const [churnRecency, setChurnRecency] = useState<number>(45);
  const [churnResult, setChurnResult] = useState<any>(null);
  const [churnLoading, setChurnLoading] = useState<boolean>(false);

  // Inventory stockout state
  const [stockProduct, setStockProduct] = useState<string>('Enterprise Cloud Suite');
  const [stockQty, setStockQty] = useState<number>(45);
  const [stockRunRate, setStockRunRate] = useState<number>(3.5);
  const [stockLeadTime, setStockLeadTime] = useState<number>(14);
  const [stockResult, setStockResult] = useState<any>(null);
  const [stockLoading, setStockLoading] = useState<boolean>(false);

  // Marketing performance state
  const [mktChannel, setMktChannel] = useState<string>('Search');
  const [mktSpend, setMktSpend] = useState<number>(5000);
  const [mktAudience, setMktAudience] = useState<number>(25000);
  const [mktResult, setMktResult] = useState<any>(null);
  const [mktLoading, setMktLoading] = useState<boolean>(false);

  const handlePredictChurn = async (e: React.FormEvent) => {
    e.preventDefault();
    setChurnLoading(true);
    try {
      const res = await predictCustomerChurn({
        age: Number(churnAge),
        total_orders: Number(churnOrders),
        total_spend: Number(churnSpend),
        days_since_last_purchase: Number(churnRecency),
      });
      setChurnResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Prediction failed');
    } finally {
      setChurnLoading(false);
    }
  };

  const handlePredictStockout = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockLoading(true);
    try {
      const res = await predictStockout({
        product_name: stockProduct,
        stock_quantity: Number(stockQty),
        daily_run_rate: Number(stockRunRate),
        lead_time_days: Number(stockLeadTime),
      });
      setStockResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Stockout prediction failed');
    } finally {
      setStockLoading(false);
    }
  };

  const handlePredictMarketing = async (e: React.FormEvent) => {
    e.preventDefault();
    setMktLoading(true);
    try {
      const res = await predictMarketing({
        channel: mktChannel,
        marketing_spend: Number(mktSpend),
        target_customers: Number(mktAudience),
      });
      setMktResult(res);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Marketing prediction failed');
    } finally {
      setMktLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 text-slate-100">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2.5 mb-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Predictive Analytics & Simulation
          </h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
            Scikit-Learn ML Engines
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Explainable, department-tailored machine learning inference models powering revenue forecasting, customer retention, inventory buffers, and marketing ROI.
        </p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'sales', label: '📈 Sales Revenue Forecasting', icon: '💼' },
          { id: 'customers', label: '👥 Customer Churn Prediction', icon: '🛡️' },
          { id: 'inventory', label: '📦 Inventory Stockout Modeling', icon: '🏭' },
          { id: 'marketing', label: '🎯 Marketing Campaign Estimator', icon: '🚀' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Sales Revenue Forecasting */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-1">Multivariate Revenue Simulator (Linear Regression)</h2>
            <p className="text-xs text-slate-400 mb-6">
              Simulate unit volume and margin thresholds against current trained dataset coefficients.
            </p>
            <MLSimulator />
          </div>
        </div>
      )}

      {/* TAB 2: Customer Churn Prediction */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-1">Customer Churn Risk Evaluator</h2>
            <p className="text-xs text-slate-400 mb-5">
              Supervised classification on customer purchase frequency, tenure, and recency inactivity.
            </p>

            <form onSubmit={handlePredictChurn} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Customer Age</label>
                <input
                  type="number"
                  value={churnAge}
                  onChange={(e) => setChurnAge(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Lifetime Total Orders</label>
                <input
                  type="number"
                  value={churnOrders}
                  onChange={(e) => setChurnOrders(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Total Lifetime Spend ($)</label>
                <input
                  type="number"
                  value={churnSpend}
                  onChange={(e) => setChurnSpend(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Days Since Last Purchase</label>
                <input
                  type="number"
                  value={churnRecency}
                  onChange={(e) => setChurnRecency(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={churnLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                {churnLoading ? 'Running Churn Inference...' : 'Predict Churn Probability'}
              </button>
            </form>
          </div>

          {/* Results Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Inference Diagnostics</h2>
              <p className="text-xs text-slate-400 mb-6">Real-time risk scoring and recommended retention playbook.</p>

              {churnResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Predicted Churn Probability</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block font-mono">
                        {(churnResult.churn_probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        churnResult.risk_level === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : churnResult.risk_level === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {churnResult.risk_level} Risk
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-300">Telemetry Key Drivers:</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {churnResult.key_drivers.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40">
                    <span className="text-xs font-bold text-indigo-300 block mb-1">Recommended Retention Action:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{churnResult.retention_strategy}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  Fill in customer attributes and click predict to see model scoring.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Inventory Stockout Modeling */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-1">Stockout Buffer & Run-Rate Forecaster</h2>
            <p className="text-xs text-slate-400 mb-5">
              Determines days of supply remaining based on sales burn rate and supplier delivery lead time.
            </p>

            <form onSubmit={handlePredictStockout} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">SKU / Product Name</label>
                <input
                  type="text"
                  value={stockProduct}
                  onChange={(e) => setStockProduct(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Current Stock Quantity</label>
                <input
                  type="number"
                  value={stockQty}
                  onChange={(e) => setStockQty(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Average Daily Sales Rate (Units/Day)</label>
                <input
                  type="number"
                  step="0.1"
                  value={stockRunRate}
                  onChange={(e) => setStockRunRate(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Supplier Lead Time (Days)</label>
                <input
                  type="number"
                  value={stockLeadTime}
                  onChange={(e) => setStockLeadTime(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={stockLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                {stockLoading ? 'Calculating Stockout Risk...' : 'Forecast Stockout Buffer'}
              </button>
            </form>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Warehouse Replenishment Guidance</h2>
              <p className="text-xs text-slate-400 mb-6">Actionable inventory safety calculations.</p>

              {stockResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Days of Supply Remaining</span>
                      <span className="text-3xl font-extrabold text-white mt-1 block font-mono">
                        {stockResult.days_until_stockout} Days
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        stockResult.stockout_risk.includes('Critical')
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {stockResult.stockout_risk}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Recommended Purchase Order Quantity</span>
                      <span className="text-2xl font-bold text-indigo-400 mt-1 block font-mono">
                        {stockResult.recommended_reorder_qty} Units
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block mb-1">Replenishment Urgency:</span>
                    <p className="text-xs text-amber-300 font-semibold">{stockResult.reorder_urgency}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  Provide inventory parameters to compute days of supply.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Marketing Campaign Estimator */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-white mb-1">Omnichannel ROI & Conversion Simulator</h2>
            <p className="text-xs text-slate-400 mb-5">
              Simulate expected conversion funnel, revenue attribution, and blended campaign ROI.
            </p>

            <form onSubmit={handlePredictMarketing} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Acquisition Channel</label>
                <select
                  value={mktChannel}
                  onChange={(e) => setMktChannel(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Search">Search (Google / Bing Ads)</option>
                  <option value="Email">Email Marketing & Newsletters</option>
                  <option value="Social">Social (LinkedIn / X Ads)</option>
                  <option value="Display">Display Retargeting</option>
                  <option value="Event">Event / Executive Webinar</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Planned Marketing Spend ($)</label>
                <input
                  type="number"
                  value={mktSpend}
                  onChange={(e) => setMktSpend(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Target Customer Audience Size</label>
                <input
                  type="number"
                  value={mktAudience}
                  onChange={(e) => setMktAudience(Number(e.target.value))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={mktLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-600/20"
              >
                {mktLoading ? 'Simulating Campaign Funnel...' : 'Forecast Campaign Performance'}
              </button>
            </form>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-white mb-1">Campaign Funnel Projections</h2>
              <p className="text-xs text-slate-400 mb-6">Predicted pipeline output and channel efficiency.</p>

              {mktResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold block">Forecasted Attributed Revenue</span>
                      <span className="text-3xl font-extrabold text-emerald-400 mt-1 block font-mono">
                        ${mktResult.projected_revenue.toLocaleString()}
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {mktResult.projected_roi}% ROI
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-xs text-slate-400 font-semibold block">Projected Leads</span>
                      <span className="text-xl font-bold text-white mt-1 block font-mono">
                        {mktResult.projected_leads.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                      <span className="text-xs text-slate-400 font-semibold block">Projected Conversions</span>
                      <span className="text-xl font-bold text-indigo-400 mt-1 block font-mono">
                        {mktResult.projected_conversions.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Channel Efficiency Rating:</span>
                    <span className="text-xs font-bold text-indigo-300 font-mono">
                      {mktResult.channel_efficiency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                  Configure campaign variables and run prediction to forecast returns.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalyticsPage;
