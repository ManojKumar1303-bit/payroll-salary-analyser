import React from 'react';
import Card from './Card';
import Table from './Table';

export default function DailyReport({ dailyReports }) {
  if (!dailyReports || dailyReports.length === 0) {
    return null;
  }

  const getStatusBadgeClass = (status) => {
    if (!status) return 'neutral';
    if (status.includes('Absent')) return 'danger';
    if (status.includes('Late') || status.includes('Early')) return 'warning';
    return 'success';
  };

  return (
    <Card title="📅 Daily Salary Reports">
      <div style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Detailed breakdown of salary calculations for each working day
      </div>
      <div>
        {dailyReports.map((dayReport, dayIndex) => {
          // Get date from first record in the day
          const date = dayReport[0]?.date || `Day ${dayIndex + 1}`;
          const totalSalary = dayReport.reduce((sum, record) => sum + record.finalSalary, 0);
          const presentCount = dayReport.filter(r => !r.attendanceStatus?.includes('Absent')).length;

          return (
            <div key={dayIndex} style={{ marginBottom: '2rem' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>
                  📆 <strong>{date}</strong>
                </h4>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {presentCount} Present | Total: <strong style={{ color: 'var(--color-text)' }}>Rs. {totalSalary.toFixed(2)}</strong>
                </div>
              </div>

              <Table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Employee Name</th>
                    <th>Shift</th>
                    <th>Late (hrs)</th>
                    <th>Early (hrs)</th>
                    <th>OT (hrs)</th>
                    <th>Base</th>
                    <th>Late Ded.</th>
                    <th>Early Ded.</th>
                    <th>OT Bonus</th>
                    <th>Final Salary</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dayReport.map((record, idx) => (
                    <tr key={idx}>
                      <td><strong>{record.employeeId}</strong></td>
                      <td>{record.firstName} {record.lastName}</td>
                      <td>{record.shift}</td>
                      <td>{record.lateDuration.toFixed(2)}</td>
                      <td>{record.earlyLeaveDuration.toFixed(2)}</td>
                      <td>{record.overtimeDuration.toFixed(2)}</td>
                      <td>Rs. {record.baseSalary.toFixed(2)}</td>
                      <td style={{ color: 'var(--color-danger)' }}>
                        -Rs. {record.lateDeduction.toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--color-danger)' }}>
                        -Rs. {record.earlyLeaveDeduction.toFixed(2)}
                      </td>
                      <td style={{ color: 'var(--color-success)' }}>
                        +Rs. {record.overtimePayment.toFixed(2)}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                          Rs. {record.finalSalary.toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span
                          className={`badge badge-${getStatusBadgeClass(record.attendanceStatus)}`}
                        >
                          {record.attendanceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
