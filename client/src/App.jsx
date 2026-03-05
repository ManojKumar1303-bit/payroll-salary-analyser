import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import UploadPage from './pages/UploadPage';
import DailyReportsPage from './pages/DailyReportsPage';
import SummaryReportPage from './pages/SummaryReportPage';

function App() {
  const [currentPage, setCurrentPage] = useState('upload');

  return (
    <div className="app">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />

      <main className="main-content">
        {currentPage === 'upload' && <UploadPage />}
        {currentPage === 'daily-reports' && <DailyReportsPage />}
        {currentPage === 'summary-report' && <SummaryReportPage />}
      </main>

      <footer className="footer">
        <p>
          © 2026 Payroll Management System | Biometric Attendance Based Salary
          Calculator
        </p>
      </footer>
    </div>
  );
}

export default App;
