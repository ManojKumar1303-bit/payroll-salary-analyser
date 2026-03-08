import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Navbar';
import Footer from './components/Footer';
import UploadPage from './pages/UploadPage';
import DailyReportsPage from './pages/DailyReportsPage';
import SummaryReportPage from './pages/SummaryReportPage';
import EmployeeSettingsPage from './pages/EmployeeSettingsPage';

// clearSessionData API call used to reset backend state when app loads
import { clearSessionData } from './services/api';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');

  // clear any stale session data on initial mount so every user starts with a clean slate
  useEffect(() => {
    const reset = async () => {
      try {
        await clearSessionData();
      } catch (err) {
        // log but don't block rendering
        console.error('failed to clear session on app load', err);
      }
    };
    reset();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="main-wrapper">
        <Header />

        <main className="main-content">
          {currentPage === 'upload' && <UploadPage />}
          {currentPage === 'employee-settings' && <EmployeeSettingsPage />}
          {currentPage === 'daily-reports' && <DailyReportsPage />}
          {currentPage === 'summary-report' && <SummaryReportPage />}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
