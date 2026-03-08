import React from 'react';
import Card from './Card';
import Table from './Table';
import { Download, Users, Calendar, Clock, Banknote } from 'lucide-react';

export default function SummaryReport({ summary, onExport, isExporting }) {
  if (!summary || summary.length === 0) {
    return null;
  }

  const totalSalary = summary.reduce((acc, emp) => acc + emp.totalSalary, 0);
  const totalDays = summary.reduce((acc, emp) => Math.max(acc, emp.totalDaysProcessed), 0);
  const totalOvertime = summary.reduce((acc, emp) => acc + emp.totalOvertimeDuration, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Statistic Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
            <Users size={20} />
            <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Employees</h5>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{summary.length}</p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
            <Banknote size={20} />
            <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Salary</h5>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Rs. {totalSalary.toFixed(2)}</p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>
            <Clock size={20} />
            <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Total Overtime</h5>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{totalOvertime.toFixed(1)} hrs</p>
        </div>

        <div style={{ backgroundColor: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', color: '#8B5CF6' }}>
            <Calendar size={20} />
            <h5 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>Max Days Processed</h5>
          </div>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>{totalDays}</p>
        </div>
      </div>

      <Card title="Combined Salary Summary">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Detailed summary across all uploaded sheets for {summary.length} employees
          </p>
          {onExport && (
            <button onClick={onExport} disabled={isExporting} className="btn btn-primary">
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export Excel Report'}
            </button>
          )}
        </div>

        <Table>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Days Processed</th>
              <th>Absent Days</th>
              <th>Total Late</th>
              <th>Total Early</th>
              <th>Total Overtime</th>
              <th>Total Salary</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((emp) => (
              <tr key={emp.employeeId}>
                <td><strong>{emp.employeeId}</strong></td>
                <td>{emp.firstName} {emp.lastName}</td>
                <td>{emp.totalDaysProcessed}</td>
                <td>{emp.numberOfAbsentDays}</td>
                <td>{emp.totalLateDuration.toFixed(2)} hrs</td>
                <td>{emp.totalEarlyLeaveDuration.toFixed(2)} hrs</td>
                <td>{emp.totalOvertimeDuration.toFixed(2)} hrs</td>
                <td>
                  <strong style={{ color: 'var(--color-primary)' }}>Rs. {emp.totalSalary.toFixed(2)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
