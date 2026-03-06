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
        <div className="loading-message">
          <div className="spinner" />
          <span>Loading daily reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">⚠️ {error}</div>
      </div>
    );
  }

  if (!reportData || !reportData.dailyReports || reportData.dailyReports.length === 0) {
    return (
      <div className="container">
        <div className="alert alert-info">
          💡 No daily reports available. Please upload and calculate salary first.
        </div>
      </div>
    );
  }

  const totalSalary = reportData.dailyReports.reduce((sum, day) => {
    return sum + day.reduce((daySum, record) => daySum + record.finalSalary, 0);
  }, 0);

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h3>📅 Daily Salary Reports</h3>
          <p>Detailed salary breakdown for each working day from attendance records</p>
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

          {/* Summary Stats */}
          <div className="summary-stats">
            <div className="stat-box">
              <h5>Total Days</h5>
              <div className="stat-value">{reportData.dailyReports.length}</div>
            </div>
            <div className="stat-box">
              <h5>Total Salary</h5>
              <div className="stat-value">₹{totalSalary.toFixed(0)}</div>
            </div>
            <div className="stat-box">
              <h5>Avg per Day</h5>
              <div className="stat-value">
                ₹{(totalSalary / reportData.dailyReports.length).toFixed(0)}
              </div>
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

          {/* Daily Reports */}
          <div style={{ marginTop: '24px' }}>
            {reportData.dailyReports.map((dayReport, dayIndex) => {
              // Get date from first record in the day
              const date = dayReport[0]?.date || `Day ${dayIndex + 1}`;
              const daySalary = dayReport.reduce((sum, r) => sum + r.finalSalary, 0);
              const presentCount = dayReport.filter(r => !r.attendanceStatus?.includes('Absent')).length;

              return (
                <div key={dayIndex} className="daily-report-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0 }}>📆 <strong>{date}</strong></h4>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {presentCount} Present | Total: <strong style={{ color: '#2563eb' }}>₹{daySalary.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm table-striped">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Employee Name</th>
                          <th>Shift</th>
                          <th className="numeric">Late (hrs)</th>
                          <th className="numeric">Early (hrs)</th>
                          <th className="numeric">OT (hrs)</th>
                          <th className="numeric">Final Salary</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayReport.map((record, idx) => (
                          <tr key={idx}>
                            <td><strong>{record.employeeId}</strong></td>
                            <td>{record.firstName} {record.lastName}</td>
                            <td>{record.shift}</td>
                            <td className="numeric">{record.lateDuration.toFixed(2)}</td>
                            <td className="numeric">{record.earlyLeaveDuration.toFixed(2)}</td>
                            <td className="numeric">{record.overtimeDuration.toFixed(2)}</td>
                            <td className="numeric">
                              <strong style={{ color: '#2563eb', fontSize: '15px' }}>
                                ₹{record.finalSalary.toFixed(2)}
                              </strong>
                            </td>
                            <td>
                              <span
                                className={`badge badge-${
                                  record.attendanceStatus?.includes('Absent')
                                    ? 'danger'
                                    : 'success'
                                }`}
                              >
                                {record.attendanceStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Refresh Button */}
          <div className="action-buttons">
            <button
              onClick={loadReports}
              className="btn btn-secondary"
              title="Refresh the report data"
            >
              🔄 Refresh Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}