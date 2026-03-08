import React, { useState, useEffect } from 'react';
import { getReports, exportSalaryReport } from '../services/api';
import Card from '../components/Card';
import Loader from '../components/Loader';
import Alert from '../components/Alert';
import Table from '../components/Table';
import { Download, RefreshCw, BarChart3, Users, Banknote, Clock, Calendar } from 'lucide-react';

export default function SummaryReportPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [salaryChecklist, setSalaryCheklist] = useState({});

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

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await exportSalaryReport();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccessMessage('Report exported successfully!');
    } catch (err) {
      setError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSalaryCheckboxChange = (employeeId) => {
    setSalaryCheklist((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  if (isLoading) {
    return <Loader type="card" text="Loading summary report..." />;
  }

  if (error) {
    return <div style={{ maxWidth: '1200px', margin: '0 auto' }}><Alert type="danger" message={error} /></div>;
  }

  if (!reportData || !reportData.summary || reportData.summary.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <Alert type="success" message="No summary report available. Please upload attendance files and calculate salary first." />
      </div>
    );
  }

  const totalGrossSalary = reportData.summary.reduce((sum, emp) => sum + emp.totalSalary, 0);
  const totalLateDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalLateDuration, 0);
  const totalEarlyLeaveDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalEarlyLeaveDuration, 0);
  const totalOvertimeDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalOvertimeDuration, 0);
  const paidCount = Object.values(salaryChecklist).filter(Boolean).length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 className="text-primary" /> Combined Salary Summary
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadReports} className="btn btn-secondary">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleExport} disabled={isExporting} className="btn btn-primary">
            <Download size={16} /> {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>

      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#CCFBF1' }}>
            <Banknote size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Salary</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rs. {totalGrossSalary.toFixed(0)}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
            <Users size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Employees</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{reportData.summary.length}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
            <Clock size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Avg per Employee</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>Rs. {(totalGrossSalary / reportData.summary.length).toFixed(0)}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
            <Calendar size={20} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Salary Paid</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{paidCount} / {reportData.summary.length}</div>
        </div>
      </div>

      <Card title="Summary Breakdown">
        <Table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>ID</th>
              <th>Days</th>
              <th>Late (hrs)</th>
              <th>Early (hrs)</th>
              <th>OT (hrs)</th>
              <th>Total Salary</th>
              <th style={{ textAlign: 'center' }}>✓ Paid</th>
            </tr>
          </thead>
          <tbody>
            {reportData.summary.map((emp) => (
              <tr key={emp.employeeId}>
                <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                <td>{emp.employeeId}</td>
                <td>{emp.totalDaysProcessed}</td>
                <td>{emp.totalLateDuration.toFixed(2)}</td>
                <td>{emp.totalEarlyLeaveDuration.toFixed(2)}</td>
                <td>{emp.totalOvertimeDuration.toFixed(2)}</td>
                <td>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-primary)' }}>
                    Rs. {emp.totalSalary.toFixed(2)}
                  </strong>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={salaryChecklist[emp.employeeId] || false}
                    onChange={() => handleSalaryCheckboxChange(emp.employeeId)}
                    style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer', accentColor: 'var(--color-success)' }}
                    title={`Mark salary paid for ${emp.firstName} ${emp.lastName}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}