import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ManagerChat from './pages/ManagerChat';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

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
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manager-chat"
              element={
                <ProtectedRoute allowedRoles={["Admin", "Analyst", "Manager"]}>
                  <ManagerChat />
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
