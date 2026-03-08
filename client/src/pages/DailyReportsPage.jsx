import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import DailyReport from '../components/DailyReport';
import { RefreshCw, FileText } from 'lucide-react';

export default function DailyReportsPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    setError('');
    setReportData(null);

    try {
      const response = await getReports();
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load reports. Please upload and calculate salary first.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loader type="card" text="Loading daily reports..." />;
  }

  if (error) {
    return <div style={{ maxWidth: '1200px', margin: '0 auto' }}><Alert type="danger" message={error} /></div>;
  }

  if (!reportData || !reportData.dailyReports || reportData.dailyReports.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Alert type="success" message="No daily reports available. Please upload attendance files and calculate salary first." />
      </div>
    );
  }

  const totalSalary = reportData.dailyReports.reduce((sum, day) => {
    return sum + day.reduce((daySum, record) => daySum + record.finalSalary, 0);
  }, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText className="text-primary" /> Daily Salary Reports
        </h2>
        <button onClick={loadReports} className="btn btn-secondary">
          <RefreshCw size={16} /> Refresh Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Upload Date</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{new Date(reportData.uploadDate).toLocaleDateString()}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Employees</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{reportData.totalEmployees}</div>
        </div>
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Total Days</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{reportData.dailyReports.length}</div>
        </div>
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.875rem', color: '#CCFBF1', marginBottom: '0.25rem' }}>Total Salary</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Rs. {totalSalary.toFixed(0)}</div>
        </div>
      </div>

      <DailyReport dailyReports={reportData.dailyReports} />
    </div>
  );
}