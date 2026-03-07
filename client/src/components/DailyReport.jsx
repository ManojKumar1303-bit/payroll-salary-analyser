import React from 'react';

export default function DailyReport({ dailyReports }) {
  if (!dailyReports || dailyReports.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>📅 Daily Salary Reports</h3>
        <p>Detailed breakdown of salary calculations for each working day</p>
      </div>
      <div className="card-body">
        {dailyReports.map((dayReport, dayIndex) => {
          // Get date from first record in the day
          const date = dayReport[0]?.date || `Day ${dayIndex + 1}`;
          const totalSalary = dayReport.reduce((sum, record) => sum + record.finalSalary, 0);
          const presentCount = dayReport.filter(r => !r.attendanceStatus?.includes('Absent')).length;

          return (
            <div key={dayIndex} className="daily-report-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>📆 <strong>{date}</strong></h4>
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                  {presentCount} Present | Total: <strong style={{ color: '#2563eb' }}>Rs. {totalSalary.toFixed(2)}</strong>
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
                      <th className="numeric">Base</th>
                      <th className="numeric">Late Ded.</th>
                      <th className="numeric">Early Ded.</th>
                      <th className="numeric">OT Bonus</th>
                      <th className="numeric">Final Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayReport.map((record, idx) => (
                      <tr key={idx}>
                        <td><strong>{record.employeeId}</strong></td>
                        <td>
                          {record.firstName} {record.lastName}
                        </td>
                        <td>{record.shift}</td>
                        <td className="numeric">{record.lateDuration.toFixed(2)}</td>
                        <td className="numeric">{record.earlyLeaveDuration.toFixed(2)}</td>
                        <td className="numeric">{record.overtimeDuration.toFixed(2)}</td>
                        <td className="numeric">Rs. {record.baseSalary.toFixed(2)}</td>
                        <td className="numeric" style={{ color: '#ef4444' }}>
                          -Rs. {record.lateDeduction.toFixed(2)}
                        </td>
                        <td className="numeric" style={{ color: '#ef4444' }}>
                          -Rs. {record.earlyLeaveDeduction.toFixed(2)}
                        </td>
                        <td className="numeric" style={{ color: '#10b981' }}>
                          +Rs. {record.overtimePayment.toFixed(2)}
                        </td>
                        <td className="numeric">
                          <strong style={{ color: '#2563eb', fontSize: '15px' }}>
                            Rs. {record.finalSalary.toFixed(2)}
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
    </div>
  );
}
