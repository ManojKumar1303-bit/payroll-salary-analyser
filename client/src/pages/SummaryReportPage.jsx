import React, { useState, useEffect } from 'react';
import { getReports, exportSalaryReport } from '../services/api';

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
      setError(
        err.response?.data?.error ||
        'Failed to load reports. Please upload and calculate salary first.'
      );
      setReportData(null);
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

      // Create download link
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
    return (
      <div className="container">
        <div className="loading-message">
          <div className="spinner" />
          <span>Loading summary report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">📋 {error}</div>
      </div>
    );
  }

  if (!reportData || !reportData.summary || reportData.summary.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-info">
          💡 No summary report available. Please upload and calculate salary first.
        </div>
      </div>
    );
  }

  const totalGrossSalary = reportData.summary.reduce((sum, emp) => sum + emp.totalSalary, 0);
  const totalLateDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalLateDuration, 0);
  const totalEarlyLeaveDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalEarlyLeaveDuration, 0);
  const totalOvertimeDuration = reportData.summary.reduce((sum, emp) => sum + emp.totalOvertimeDuration, 0);
  const paidCount = Object.values(salaryChecklist).filter(Boolean).length;

  return (
    <div className="container">
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {successMessage && (
        <div className="alert alert-success">✓ {successMessage}</div>
      )}

      {/* Summary Stats */}
      <div className="summary-stats">
        <div className="stat-box">
          <h5>Total Salary</h5>
          <div className="stat-value">₹{totalGrossSalary.toFixed(0)}</div>
        </div>
        <div className="stat-box">
          <h5>Employees</h5>
          <div className="stat-value">{reportData.summary.length}</div>
        </div>
        <div className="stat-box">
          <h5>Avg per Employee</h5>
          <div className="stat-value">₹{(totalGrossSalary / reportData.summary.length).toFixed(0)}</div>
        </div>
        <div className="stat-box">
          <h5>Salary Paid</h5>
          <div className="stat-value">{paidCount}/{reportData.summary.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📊 Combined Salary Summary Report</h3>
          <p>Comprehensive salary totals across all uploaded attendance files</p>
        </div>
        <div className="card-body">
          {/* Report Info */}
          <div className="report-info">
            <div className="info-item">
              <strong>📅 Upload Date</strong>
              <div>{new Date(reportData.uploadDate).toLocaleDateString()}</div>
            </div>
            <div className="info-item">
              <strong>📁 Files Processed</strong>
              <div>{reportData.filesProcessed}</div>
            </div>
            <div className="info-item">
              <strong>👥 Total Employees</strong>
              <div>{reportData.totalEmployees}</div>
            </div>
            <div className="info-item">
              <strong>📆 Calculation Date</strong>
              <div>{new Date(reportData.calculationDate).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Settings Info */}
          <div className="settings-summary">
            <strong>⚙️ Salary Rules Applied</strong>
            <ul style={{ marginTop: '10px' }}>
              <li>
                <strong>Late Penalty:</strong> ₹{reportData.penalties.latePenalty}/hour
              </li>
              <li>
                <strong>Early Leave Penalty:</strong> ₹{reportData.penalties.earlyLeavePenalty}/hour
              </li>
              <li>
                <strong>Overtime Pay:</strong> ₹{reportData.overtimeRate}/hour
              </li>
            </ul>
          </div>

          {/* Duration Summary */}
          <div className="summary-stats" style={{ marginTop: '24px' }}>
            <div className="stat-box">
              <h5>Total Late Hours</h5>
              <div className="stat-value">{totalLateDuration.toFixed(1)}</div>
            </div>
            <div className="stat-box">
              <h5>Total Early Leave Hours</h5>
              <div className="stat-value">{totalEarlyLeaveDuration.toFixed(1)}</div>
            </div>
            <div className="stat-box">
              <h5>Total Overtime Hours</h5>
              <div className="stat-value">{totalOvertimeDuration.toFixed(1)}</div>
            </div>
          </div>

          {/* Summary Table */}
          <div className="table-responsive" style={{ marginTop: '24px' }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>ID</th>
                  <th className="numeric">Days</th>
                  <th className="numeric">Late (hrs)</th>
                  <th className="numeric">Early (hrs)</th>
                  <th className="numeric">OT (hrs)</th>
                  <th className="numeric">Total Salary</th>
                  <th style={{ textAlign: 'center' }}>✓ Paid</th>
                </tr>
              </thead>
              <tbody>
                {reportData.summary.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td><strong>{emp.firstName} {emp.lastName}</strong></td>
                    <td>{emp.employeeId}</td>
                    <td className="numeric">{emp.totalDaysProcessed}</td>
                    <td className="numeric">{emp.totalLateDuration.toFixed(2)}</td>
                    <td className="numeric">{emp.totalEarlyLeaveDuration.toFixed(2)}</td>
                    <td className="numeric">{emp.totalOvertimeDuration.toFixed(2)}</td>
                    <td className="numeric">
                      <strong style={{ fontSize: '15px', color: '#2563eb' }}>
                        ₹{emp.totalSalary.toFixed(2)}
                      </strong>
                    </td>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={salaryChecklist[emp.employeeId] || false}
                        onChange={() => handleSalaryCheckboxChange(emp.employeeId)}
                        className="salary-checkbox"
                        title={`Mark salary paid for ${emp.firstName} ${emp.lastName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Section */}
          <div className="export-section">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-primary btn-lg"
            >
              {isExporting ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', marginRight: '10px' }} />
                  Exporting...
                </>
              ) : (
                '📥 Download Excel Report'
              )}
            </button>
            <button
              onClick={loadReports}
              className="btn btn-secondary"
              title="Refresh the report data"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}