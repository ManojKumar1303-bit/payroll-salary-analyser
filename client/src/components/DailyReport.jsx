import React from 'react';

export default function DailyReport({ dailyReports }) {
  if (!dailyReports || dailyReports.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Daily Salary Reports</h3>
        <p className="text-muted">Detailed salary breakdown for each day</p>
      </div>
      <div className="card-body">
        {dailyReports.map((dayReport, dayIndex) => {
          // Get date from first record in the day
          const date = dayReport[0]?.date || `Day ${dayIndex + 1}`;

          return (
            <div key={dayIndex} className="daily-report-section">
              <h4>
                Date: <strong>{date}</strong>
              </h4>
              <div className="table-responsive">
                <table className="table table-sm table-striped">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Shift</th>
                      <th>Late (hrs)</th>
                      <th>Early Leave (hrs)</th>
                      <th>Overtime (hrs)</th>
                      <th>Base Salary</th>
                      <th>Late Deduction</th>
                      <th>Early Leave Deduction</th>
                      <th>Overtime Payment</th>
                      <th>Final Salary</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayReport.map((record, idx) => (
                      <tr key={idx}>
                        <td>{record.employeeId}</td>
                        <td>
                          {record.firstName} {record.lastName}
                        </td>
                        <td>{record.shift}</td>
                        <td>{record.lateDuration.toFixed(2)}</td>
                        <td>{record.earlyLeaveDuration.toFixed(2)}</td>
                        <td>{record.overtimeDuration.toFixed(2)}</td>
                        <td>₹{record.baseSalary.toFixed(2)}</td>
                        <td>-₹{record.lateDeduction.toFixed(2)}</td>
                        <td>-₹{record.earlyLeaveDeduction.toFixed(2)}</td>
                        <td>+₹{record.overtimePayment.toFixed(2)}</td>
                        <td>
                          <strong>₹{record.finalSalary.toFixed(2)}</strong>
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
