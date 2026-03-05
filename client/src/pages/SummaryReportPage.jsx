import React, { useState, useEffect } from 'react';
import { getReports, exportSalaryReport } from '../services/api';

export default function SummaryReportPage() {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-message">Loading summary report...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!reportData || !reportData.summary || reportData.summary.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-info">No summary report available. Please upload and calculate salary first.</div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <div className="card">
        <div className="card-header">
          <h3>Combined Salary Summary</h3>
          <p className="text-muted">Combined salary totals across all uploaded attendance files</p>
        </div>
        <div className="card-body">
          <div className="report-info">
            <div className="info-item">
              <strong>Upload Date:</strong>{' '}
              {new Date(reportData.uploadDate).toLocaleDateString()}
            </div>
            <div className="info-item">
              <strong>Files Processed:</strong> {reportData.filesProcessed}
            </div>
            <div className="info-item">
              <strong>Total Employees:</strong> {reportData.totalEmployees}
            </div>
            <div className="info-item">
              <strong>Calculation Date:</strong>{' '}
              {new Date(reportData.calculationDate).toLocaleDateString()}
            </div>
          </div>

          <div className="settings-info">
            <strong>Salary Rules Applied:</strong>
            <ul>
              <li>Late Penalty: ₹{reportData.penalties.latePenalty}/hour</li>
              <li>
                Early Leave Penalty: ₹
                {reportData.penalties.earlyLeavePenalty}/hour
              </li>
              <li>Overtime Pay: ₹{reportData.overtimeRate}/hour</li>
            </ul>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Total Days</th>
                  <th>Total Late Hours</th>
                  <th>Total Early Leave Hours</th>
                  <th>Total Overtime Hours</th>
                  <th>Total Salary</th>
                </tr>
              </thead>
              <tbody>
                {reportData.summary.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td>{emp.firstName} {emp.lastName}</td>
                    <td>{emp.employeeId}</td>
                    <td>{emp.totalDaysProcessed}</td>
                    <td>{emp.totalLateDuration.toFixed(2)}</td>
                    <td>{emp.totalEarlyLeaveDuration.toFixed(2)}</td>
                    <td>{emp.totalOvertimeDuration.toFixed(2)}</td>
                    <td>₹{emp.totalSalary.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="export-section">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn btn-info"
            >
              {isExporting ? 'Exporting...' : 'Download Excel Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}