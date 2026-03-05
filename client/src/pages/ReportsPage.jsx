import React, { useState, useEffect } from 'react';
import { getReports, exportSalaryReport } from '../services/api';
import DailyReport from '../components/DailyReport';
import SummaryReport from '../components/SummaryReport';

export default function ReportsPage() {
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
    // Clear any previously shown report data to avoid stale display
    setReportData(null);

    try {
      const response = await getReports();
      setReportData(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load reports. Please upload and calculate salary first.'
      );
      // Ensure no stale report is shown on error
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError('');

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
        <div className="loading-message">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      {reportData && (
        <>
          <div className="card">
            <div className="card-header">
              <h3>Salary Report Summary</h3>
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
            </div>
          </div>

          <DailyReport dailyReports={reportData.dailyReports} />
          <SummaryReport
            summary={reportData.summary}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </>
      )}
    </div>
  );
}
