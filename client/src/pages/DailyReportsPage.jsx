import React, { useState, useEffect } from 'react';
import { getReports } from '../services/api';

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
      setError(
        err.response?.data?.error ||
        'Failed to load reports. Please upload and calculate salary first.'
      );
      setReportData(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-message">Loading daily reports...</div>
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

  if (!reportData || !reportData.dailyReports || reportData.dailyReports.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-info">No daily reports available. Please upload and calculate salary first.</div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h3>Daily Salary Reports</h3>
          <p className="text-muted">Salary report for each uploaded attendance Excel file</p>
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
            {reportData.dailyReports.map((dayReport, dayIndex) => {
              // Get date from first record in the day
              const date = dayReport[0]?.date || `Day ${dayIndex + 1}`;

              return (
                <div key={dayIndex} className="daily-report-section">
                  <h4>
                    Date: <strong>{date}</strong>
                  </h4>
                  <table className="table table-sm table-striped">
                    <thead>
                      <tr>
                        <th>Employee Name</th>
                        <th>Employee ID</th>
                        <th>Late Duration</th>
                        <th>Early Leave Duration</th>
                        <th>Overtime Duration</th>
                        <th>Final Salary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayReport.map((record, idx) => (
                        <tr key={idx}>
                          <td>{record.firstName} {record.lastName}</td>
                          <td>{record.employeeId}</td>
                          <td>{record.lateDuration.toFixed(2)} hrs</td>
                          <td>{record.earlyLeaveDuration.toFixed(2)} hrs</td>
                          <td>{record.overtimeDuration.toFixed(2)} hrs</td>
                          <td>₹{record.finalSalary.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}