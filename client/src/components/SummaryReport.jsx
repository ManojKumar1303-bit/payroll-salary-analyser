import React from 'react';

export default function SummaryReport({ summary, onExport, isExporting }) {
  if (!summary || summary.length === 0) {
    return null;
  }

  const totalSalary = summary.reduce((acc, emp) => acc + emp.totalSalary, 0);
  const totalDays = summary.reduce(
    (acc, emp) => Math.max(acc, emp.totalDaysProcessed),
    0
  );

  return (
    <div className="card">
      <div className="card-header">
        <h3>Combined Salary Summary</h3>
        <p className="text-muted">
          Total salary across all uploaded sheets for {summary.length} employees
        </p>
      </div>
      <div className="card-body">
        <div className="summary-stats">
          <div className="stat-box">
            <h5>Total Days Processed</h5>
            <p className="stat-value">{totalDays}</p>
          </div>
          <div className="stat-box">
            <h5>Total Employees</h5>
            <p className="stat-value">{summary.length}</p>
          </div>
          <div className="stat-box">
            <h5>Total Salary</h5>
            <p className="stat-value">₹{totalSalary.toFixed(2)}</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Days Processed</th>
                <th>Absent Days</th>
                <th>Total Late Hours</th>
                <th>Total Early Leave Hours</th>
                <th>Total Overtime Hours</th>
                <th>Total Salary</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((emp) => (
                <tr key={emp.employeeId}>
                  <td>{emp.employeeId}</td>
                  <td>
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td>{emp.totalDaysProcessed}</td>
                  <td>{emp.numberOfAbsentDays}</td>
                  <td>{emp.totalLateDuration.toFixed(2)}</td>
                  <td>{emp.totalEarlyLeaveDuration.toFixed(2)}</td>
                  <td>{emp.totalOvertimeDuration.toFixed(2)}</td>
                  <td>
                    <strong>₹{emp.totalSalary.toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="export-section">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="btn btn-info"
          >
            {isExporting ? 'Exporting...' : 'Download Excel Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
