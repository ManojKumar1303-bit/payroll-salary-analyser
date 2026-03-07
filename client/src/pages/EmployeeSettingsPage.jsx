import React, { useState, useEffect, useRef } from 'react';
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function EmployeeSettingsPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    dailySalary: '',
    latePenalty: 50,
    earlyLeavePenalty: 50,
    overtimeRate: 100,
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getAllEmployees();
      setEmployees(response.data.employees || []);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to load employees. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      employeeId: '',
      name: '',
      dailySalary: '',
      latePenalty: 50,
      earlyLeavePenalty: 50,
      overtimeRate: 100,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (employee) => {
    setFormData({
      employeeId: employee.employeeId,
      name: employee.name,
      dailySalary: employee.dailySalary,
      latePenalty: employee.latePenalty,
      earlyLeavePenalty: employee.earlyLeavePenalty,
      overtimeRate: employee.overtimeRate,
    });
    setEditingId(employee.employeeId);
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'employeeId' ? value : (
        ['dailySalary', 'latePenalty', 'earlyLeavePenalty', 'overtimeRate'].includes(name)
          ? parseFloat(value) || ''
          : value
      ),
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.employeeId || !formData.name || formData.dailySalary === '') {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      if (editingId) {
        // Update existing employee
        await updateEmployee(formData.employeeId, {
          name: formData.name,
          dailySalary: formData.dailySalary,
          latePenalty: formData.latePenalty,
          earlyLeavePenalty: formData.earlyLeavePenalty,
          overtimeRate: formData.overtimeRate,
        });
        setSuccessMessage('Employee updated successfully!');
      } else {
        // Create new employee
        await createEmployee(formData);
        setSuccessMessage('Employee created successfully!');
      }

      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to save employee. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = async (employeeId) => {
    if (window.confirm(`Are you sure you want to delete employee ${employeeId}?`)) {
      setIsLoading(true);
      setError('');

      try {
        await deleteEmployee(employeeId);
        setSuccessMessage('Employee deleted successfully!');
        fetchEmployees();
      } catch (err) {
        setError(
          err.response?.data?.error ||
          'Failed to delete employee. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/employees/import`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import employees');
      }

      setSuccessMessage(data.message || 'Employees imported successfully!');
      fetchEmployees();
    } catch (err) {
      setError(
        err.message ||
        'Failed to import employees. Please check the file format.'
      );
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter((emp) =>
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="container">
      <h2 style={{ marginBottom: '20px' }}>👥 Employee Settings</h2>

      {/* Alerts */}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {successMessage && (
        <div className="alert alert-success">✓ {successMessage}</div>
      )}

      {/* Search and Add Button */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '14px',
          }}
        />
        <button
          onClick={handleAddClick}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          ➕ Add Employee
        </button>
        <button
          onClick={handleImportClick}
          disabled={isLoading || isImporting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading || isImporting ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {isImporting ? '⏳ Importing...' : '📥 Import Employees'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isLoading || isImporting}
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => !isLoading && setShowForm(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '500px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '20px' }}>
              {editingId ? 'Edit Employee' : 'Add New Employee'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Employee ID *
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleFormChange}
                  disabled={!!editingId}
                  placeholder="e.g., 1234567890"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                    opacity: editingId ? 0.6 : 1,
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Manoj Kumar U"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Daily Salary (Rs.) *
                </label>
                <input
                  type="number"
                  name="dailySalary"
                  value={formData.dailySalary}
                  onChange={handleFormChange}
                  placeholder="e.g., 300"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Late Penalty (Rs./hour)
                </label>
                <input
                  type="number"
                  name="latePenalty"
                  value={formData.latePenalty}
                  onChange={handleFormChange}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Early Leave Penalty (Rs./hour)
                </label>
                <input
                  type="number"
                  name="earlyLeavePenalty"
                  value={formData.earlyLeavePenalty}
                  onChange={handleFormChange}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
                  Overtime Rate (Rs./hour)
                </label>
                <input
                  type="number"
                  name="overtimeRate"
                  value={formData.overtimeRate}
                  onChange={handleFormChange}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Table */}
      {isLoading && !showForm ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Loading employees...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
          }}
        >
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            {searchTerm ? 'No employees found matching your search.' : 'No employees configured yet.'}
          </p>
          {!searchTerm && (
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '10px' }}>
              Click "Add Employee" to create the first employee.
            </p>
          )}
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                    Employee ID
                  </th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600 }}>
                    Name
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                    Daily Salary
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                    Late Penalty
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                    Early Leave Penalty
                  </th>
                  <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600 }}>
                    Overtime Rate
                  </th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((emp, idx) => (
                  <tr
                    key={emp.employeeId}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: idx % 2 === 0 ? '#f9fafb' : 'white',
                      ':hover': { backgroundColor: '#f3f4f6' },
                    }}
                  >
                    <td
                      style={{
                        padding: '12px',
                        fontWeight: 500,
                        color: '#1f2937',
                      }}
                    >
                      {emp.employeeId}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {emp.name}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      Rs. {emp.dailySalary}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      Rs. {emp.latePenalty}/hr
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      Rs. {emp.earlyLeavePenalty}/hr
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      Rs. {emp.overtimeRate}/hr
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditClick(emp)}
                        disabled={isLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          marginRight: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(emp.employeeId)}
                        disabled={isLoading}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#d1d5db' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ← Previous
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === page ? '#2563eb' : '#e5e7eb',
                    color: currentPage === page ? 'white' : '#1f2937',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: currentPage === page ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#d1d5db' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Info Box */}
      <div
        style={{
          marginTop: '30px',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          padding: '15px',
          color: '#1e40af',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px' }}>
          <strong>ℹ️ Note:</strong> These employee settings will be used automatically during salary
          calculation. Make sure all employees in your attendance files are configured here.
        </p>
      </div>
    </div>
  );
}
