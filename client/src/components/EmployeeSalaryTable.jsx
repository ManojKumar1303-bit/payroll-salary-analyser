import React, { useState, useEffect } from 'react';

export default function EmployeeSalaryTable({ employees, onSalarySubmit, isLoading }) {
  const [salaries, setSalaries] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Initialize salaries object
    const initialSalaries = {};
    employees.forEach((emp) => {
      initialSalaries[emp.employeeId] = 300;
    });
    setSalaries(initialSalaries);
    setHasChanges(false);
  }, [employees]);

  const handleSalaryChange = (employeeId, value) => {
    setSalaries({
      ...salaries,
      [employeeId]: value,
    });
    setHasChanges(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all salaries are entered
    const allFilled = employees.every(
      (emp) => salaries[emp.employeeId] && salaries[emp.employeeId] !== ''
    );

    if (!allFilled) {
      alert('Please enter daily salary for all employees');
      return;
    }

    // Convert to numeric values
    const numericSalaries = {};
    employees.forEach((emp) => {
      numericSalaries[emp.employeeId] = parseFloat(salaries[emp.employeeId]);
    });

    onSalarySubmit(numericSalaries);
  };

  const totalMonthly = employees.reduce((sum, emp) => {
    return sum + (parseFloat(salaries[emp.employeeId]) || 0) * 30;
  }, 0);

  const averageDaily = employees.length > 0 ? 
    employees.reduce((sum, emp) => sum + (parseFloat(salaries[emp.employeeId]) || 0) / employees.length, 0) 
    : 0;

  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>💰 Employee Salary Setup</h3>
        <p>Configure daily salary for {employees.length} employee(s)</p>
      </div>
      <div className="card-body">
        {/* Summary Stats */}
        <div className="summary-stats" style={{ marginBottom: '24px' }}>
          <div className="stat-box">
            <h5>Employees</h5>
            <div className="stat-value">{employees.length}</div>
          </div>
          <div className="stat-box">
            <h5>Avg Daily Salary</h5>
            <div className="stat-value">Rs. {averageDaily.toFixed(0)}</div>
          </div>
          <div className="stat-box">
            <h5>Est. Monthly</h5>
            <div className="stat-value">Rs. {totalMonthly.toFixed(0)}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th className="numeric">Daily Salary (Rs.)</th>
                  <th className="numeric">Est. Monthly</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const daily = parseFloat(salaries[emp.employeeId]) || 0;
                  const monthly = daily * 30;
                  
                  return (
                    <tr key={emp.employeeId}>
                      <td><strong>{emp.employeeId}</strong></td>
                      <td>
                        {emp.firstName} {emp.lastName}
                      </td>
                      <td>{emp.department}</td>
                      <td className="numeric">
                        <input
                          type="number"
                          value={salaries[emp.employeeId] || ''}
                          onChange={(e) =>
                            handleSalaryChange(emp.employeeId, e.target.value)
                          }
                          placeholder="Enter salary"
                          className="form-control input-salary"
                          min="0"
                          step="1"
                          required
                        />
                      </td>
                      <td className="numeric">
                        <strong style={{ color: '#2563eb' }}>
                          Rs. {monthly.toFixed(0)}
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-success btn-lg"
            >
              {isLoading ? (
                <>
                  <span className="spinner" style={{ display: 'inline-block', marginRight: '10px' }} />
                  Calculating...
                </>
              ) : (
                '✓ Calculate Salary'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
