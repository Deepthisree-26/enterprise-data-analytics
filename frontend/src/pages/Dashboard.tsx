import React, { useEffect, useState } from 'react';
import { fetchKPIs, fetchForecast, fetchDataRecords } from '../services/dataService';
import { getUserRole } from '../utils/auth';
import KPICard from '../components/KPICard';
import ForecastChart from '../components/ForecastChart';
import RegionPieChart from '../components/RegionPieChart';
import DataGrid from '../components/DataGrid';
import UploadForm from '../components/UploadForm';
import ChatWidget from '../components/ChatWidget';
import MLSimulator from '../components/MLSimulator';
import ManagerReports from '../components/ManagerReports';
import AdminControlPanel from '../components/AdminControlPanel';

interface KPI {
  label: string;
  value: string | number;
}

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

const Dashboard: React.FC = () => {
  const role = getUserRole() || 'Analyst';
  const [kpis, setKPIs] = useState<KPI[]>([
    { label: 'Total Revenue', value: '$0.00' },
    { label: 'Units Sold', value: '0' },
    { label: 'Model R² Accuracy', value: 'N/A' },
  ]);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [records, setRecords] = useState<Record[]>([]);

  const loadData = () => {
    fetchKPIs()
      .then((data) => {
        if (data && data.length > 0) {
          setKPIs(data);
        } else {
          setKPIs([
            { label: 'Total Revenue', value: '$0.00' },
            { label: 'Units Sold', value: '0' },
            { label: 'Model R² Accuracy', value: 'N/A' },
          ]);
        }
      })
      .catch(console.error);

    fetchForecast()
      .then((data) => {
        setForecastData(data || []);
      })
      .catch(console.error);

    fetchDataRecords()
      .then((data) => {
        setRecords(data || []);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getHeaderInfo = () => {
    switch (role.toLowerCase()) {
      case 'analyst':
        return {
          title: 'Analyst Data Workbench & Telemetry',
          subtitle: 'Dataset ingestion hub, transaction ledger validation, and ML predictive simulation',
          badge: 'Analyst Workspace',
          badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
      case 'manager':
        return {
          title: 'Executive Performance & Strategic Overview',
          subtitle: 'Real-time enterprise financial scorecards, regional revenue share, and audited reports',
          badge: 'Executive View',
          badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'admin':
        return {
          title: 'Platform Administration & System Governance',
          subtitle: 'Microservice infrastructure health, user access controls, and database pipeline maintenance',
          badge: 'Admin Console',
          badgeColor: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        };
      default:
        return {
          title: 'Enterprise Performance Overview',
          subtitle: 'Real-time business telemetry, linear regression projections, and transaction ledger',
          badge: 'Telemetry Active',
          badgeColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header with Role Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {header.title}
            </h2>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${header.badgeColor}`}>
              {header.badge}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {header.subtitle}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/70 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} label={kpi.label} value={kpi.value} />
        ))}
      </div>

      {/* ROLE-SPECIFIC WORKSPACE WORKFLOWS */}

      {/* === 1. DATA ANALYST WORKSPACE === */}
      {role.toLowerCase() === 'analyst' && (
        <div className="space-y-6">
          {/* Workflow step 1: Dataset Ingestion */}
          <div id="upload-section">
            <UploadForm onUploadSuccess={loadData} />
          </div>

          {/* Workflow step 2: Interactive ML Simulator */}
          <div id="ml-simulator">
            <MLSimulator />
          </div>

          {/* Workflow step 3: Predictive Curves & Regional telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ForecastChart data={forecastData} />
            <RegionPieChart records={records} />
          </div>

          {/* Workflow step 4: Full tabular transaction ledger with filtering */}
          <div id="data-grid">
            <DataGrid records={records} />
          </div>
        </div>
      )}

      {/* === 2. EXECUTIVE MANAGER WORKSPACE === */}
      {role.toLowerCase() === 'manager' && (
        <div className="space-y-6">
          {/* Executive Action: Boardroom Briefs & Formal Exports */}
          <div id="manager-reports">
            <ManagerReports />
          </div>

          {/* Strategic High-Level Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5" id="manager-charts">
            <ForecastChart data={forecastData} />
            <RegionPieChart records={records} />
          </div>

          {/* Executive Ledger Review */}
          <div id="data-grid">
            <DataGrid records={records} />
          </div>
        </div>
      )}

      {/* === 3. SYSTEM ADMINISTRATOR WORKSPACE === */}
      {role.toLowerCase() === 'admin' && (
        <div className="space-y-6">
          {/* Microservices Health, User Role Management, and Database Purge */}
          <div id="admin-controls">
            <AdminControlPanel onDataReset={loadData} />
          </div>

          {/* Administrative Ingestion Override */}
          <div id="upload-section">
            <UploadForm onUploadSuccess={loadData} />
          </div>

          {/* Transaction Ledger & Pipeline Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ForecastChart data={forecastData} />
            <RegionPieChart records={records} />
          </div>

          <div id="data-grid">
            <DataGrid records={records} />
          </div>
        </div>
      )}

      {/* Fallback for unauthenticated or undefined role */}
      {!['analyst', 'manager', 'admin'].includes(role.toLowerCase()) && (
        <div className="space-y-6">
          <UploadForm onUploadSuccess={loadData} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ForecastChart data={forecastData} />
            <RegionPieChart records={records} />
          </div>
          <DataGrid records={records} />
        </div>
      )}

      {/* Floating AI Business Intelligence Copilot */}
      <ChatWidget />
    </div>
  );
};

export default Dashboard;
