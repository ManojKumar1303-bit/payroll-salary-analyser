import React, { useState, useEffect } from 'react';

export default function EmployeeSalaryTable({ employees, onSalarySubmit, isLoading }) {
  const [salaries, setSalaries] = useState({});

  useEffect(() => {
    // Initialize salaries object
    const initialSalaries = {};
    employees.forEach((emp) => {
      initialSalaries[emp.employeeId] = 300;
    });
    setSalaries(initialSalaries);
  }, [employees]);

  const handleSalaryChange = (employeeId, value) => {
    setSalaries({
      ...salaries,
      [employeeId]: value,
    });
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

  if (employees.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Employee Salary Setup</h3>
        <p className="text-muted">Enter daily salary for each employee</p>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Daily Salary (₹)</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td>{emp.employeeId}</td>
                    <td>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.department}</td>
                    <td>
                      <input
                        type="number"
                        value={salaries[emp.employeeId] || ''}
                        onChange={(e) =>
                          handleSalaryChange(emp.employeeId, e.target.value)
                        }
                        placeholder="Enter salary"
                        className="form-control input-salary"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-success btn-lg"
          >
            {isLoading ? 'Calculating Salary...' : 'Calculate Salary'}
          </button>
        </form>
      </div>
    </div>
  );
}
