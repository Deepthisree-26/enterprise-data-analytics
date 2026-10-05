import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ManagerChat from './pages/ManagerChat';
import DataIngestionCenter from './pages/DataIngestionCenter';
import ExecutiveOverview from './pages/ExecutiveOverview';
import DepartmentDashboard from './pages/DepartmentDashboard';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import DataExplorerPage from './pages/DataExplorerPage';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Admin Module Pages
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAccessControlPage from './pages/admin/AdminAccessControlPage';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminDataManagementPage from './pages/admin/AdminDataManagementPage';
import AdminUploadHistoryPage from './pages/admin/AdminUploadHistoryPage';
import AdminDataQualityPage from './pages/admin/AdminDataQualityPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminActivityPage from './pages/admin/AdminActivityPage';
import AdminSystemHealthPage from './pages/admin/AdminSystemHealthPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

const App: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-[#090d16] text-slate-100 antialiased">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="flex h-screen bg-[#090d16] text-slate-100 overflow-hidden font-sans antialiased">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#090d16]">
          <Routes>
            {/* Core Dashboard Workspace */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Analyst Data Ingestion Center */}
            <Route
              path="/analyst/data-ingestion"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst"]}>
                  <DataIngestionCenter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyst/data_ingestion"
              element={<Navigate to="/analyst/data-ingestion" replace />}
            />

            {/* Executive Manager Overview */}
            <Route
              path="/manager/executive"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <ExecutiveOverview />
                </ProtectedRoute>
              }
            />

            {/* Department-Specific Dashboards */}
            <Route
              path="/sales"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="Sales" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="Customers" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="Inventory" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="Finance" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marketing"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="Marketing" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hr"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <DepartmentDashboard departmentName="HR" />
                </ProtectedRoute>
              }
            />

            {/* Predictive Analytics Suite */}
            <Route
              path="/predictive-analytics"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <PredictiveAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* Audit & Board Reports (PDF/Excel) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Data Explorer */}
            <Route
              path="/data-explorer"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst"]}>
                  <DataExplorerPage />
                </ProtectedRoute>
              }
            />

            {/* Executive AI Copilot */}
            <Route
              path="/manager-chat"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <ManagerChat />
                </ProtectedRoute>
              }
            />

            {/* ==================================================== */}
            {/* ADMIN MANAGEMENT & GOVERNANCE MODULE ROUTES */}
            {/* ==================================================== */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminOverviewPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/access-control"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminAccessControlPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/data-management"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDataManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload-history"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminUploadHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/data-quality"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminDataQualityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminAuditLogsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/system-health"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminSystemHealthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/alerts"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminAlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={["Admin"]}>
                  <AdminSettingsPage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
