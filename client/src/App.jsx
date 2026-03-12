import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Navbar';
import Footer from './components/Footer';
import UploadPage from './pages/UploadPage';
import DailyReportsPage from './pages/DailyReportsPage';
import SummaryReportPage from './pages/SummaryReportPage';
import ReportHistoryPage from './pages/ReportHistoryPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import EmployeeSettingsPage from './pages/EmployeeSettingsPage';
import LoginPage from './pages/LoginPage';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

// clearSessionData API call used to reset backend state when app loads
import { clearSessionData } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const location = useLocation();

  let defaultPage = 'upload';
  if (location.pathname.includes('daily')) defaultPage = 'daily-reports';
  else if (location.pathname.includes('summary')) defaultPage = 'summary-report';
  else if (location.pathname.includes('report-history')) defaultPage = 'report-history';
  else if (location.pathname.includes('employee')) defaultPage = 'employee-settings';

  const [currentPage, setCurrentPage] = useState(defaultPage);

  // clear any stale session data on initial mount so every user starts with a clean slate
  useEffect(() => {
    const reset = async () => {
      try {
        if (isAuthenticated) {
          await clearSessionData();
        }
      } catch (err) {
        // Handle 401 (unauthorized) seamlessly -> token might be old/expired
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
        console.error('failed to clear session on app load', err);
      }
    };
    reset();
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="main-wrapper">
        <Header onLogout={handleLogout} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/upload" replace />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/employee-settings" element={<EmployeeSettingsPage />} />
            <Route path="/daily-reports" element={<DailyReportsPage />} />
            <Route path="/summary-report" element={<SummaryReportPage />} />
            <Route path="/report-history" element={<ReportHistoryPage />} />
            <Route path="/report-history/:reportId" element={<ReportDetailsPage />} />
            <Route path="*" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
