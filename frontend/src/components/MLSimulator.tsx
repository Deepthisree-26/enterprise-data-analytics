import React, { useState } from 'react';
import api from '../services/api';

const MLSimulator: React.FC = () => {
  const [units, setUnits] = useState<number>(75);
  const [margin, setMargin] = useState<number>(0.42);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [r2Score, setR2Score] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSimulate = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const resp = await api.post('/api/predict', {
        order_id: 'SIM-001',
        date: new Date().toISOString().split('T')[0],
        region: 'North America',
        category: 'AI Analytics',
        product: 'Simulation Model',
        units_sold: units,
        revenue: 0.0,
        profit_margin: margin,
        customer_role: 'Enterprise',
      });
      setPrediction(resp.data.predicted_revenue);
      if (resp.data.r2_score !== undefined) {
        setR2Score(resp.data.r2_score);
      }
    } catch (err: any) {
      setPrediction(null);
      setErrorMsg(err.response?.data?.detail || 'No dataset uploaded yet. Please upload a CSV/XLSX file first to train the ML regression model.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <h3 className="text-base font-bold text-white">Analyst ML Predictive Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Test multivariate linear regression projections based on units sold and margin elasticity
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          {r2Score !== null ? `Model R²: ${r2Score.toFixed(2)}` : 'Model: Awaiting Dataset'}
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Projected Units Sold</span>
              <span className="text-indigo-400 font-bold font-mono">{units} units</span>
            </div>
            <input
              type="range"
              min="1"
              max="300"
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Target Profit Margin</span>
              <span className="text-emerald-400 font-bold font-mono">{(margin * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.01"
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Running Simulation...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Run Regression Simulation</span>
              </>
            )}
          </button>
        </div>

        {/* Prediction Results Display */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-center">
          <div className="text-xs text-slate-400 mb-1 font-medium">Model Output Forecast</div>
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 font-mono">
            {prediction !== null
              ? `$${prediction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0.00'}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Estimated Gross Profit:</span>
            <span className="text-emerald-400 font-mono font-bold">
              {prediction !== null
                ? `$${(prediction * margin).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : '$0.00'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLSimulator;
