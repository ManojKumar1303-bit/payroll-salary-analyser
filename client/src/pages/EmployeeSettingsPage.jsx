import React, { useState, useEffect, useRef } from 'react';
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/api';
import Card from '../components/Card';
import Table from '../components/Table';
import Alert from '../components/Alert';
import { Search, UserPlus, UploadCloud, Edit2, Trash2, Info, Users } from 'lucide-react';

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
      setError(err.response?.data?.error || 'Failed to load employees. Please try again.');
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
        await updateEmployee(formData.employeeId, {
          name: formData.name,
          dailySalary: formData.dailySalary,
          latePenalty: formData.latePenalty,
          earlyLeavePenalty: formData.earlyLeavePenalty,
          overtimeRate: formData.overtimeRate,
        });
        setSuccessMessage('Employee updated successfully!');
      } else {
        await createEmployee(formData);
        setSuccessMessage('Employee created successfully!');
      }
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save employee. Please try again.');
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
        setError(err.response?.data?.error || 'Failed to delete employee. Please try again.');
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
      setError(err.message || 'Failed to import employees. Please check the file format.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users className="text-primary" /> Employee Settings
        </h2>
      </div>

      {error && <Alert type="danger" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Action Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            placeholder="Search by ID or Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: '100%', padding: '0.625rem 1rem 0.625rem 2.5rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
          />
        </div>
        <button
          onClick={handleAddClick}
          disabled={isLoading}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <UserPlus size={16} /> Add Employee
        </button>
        <button
          onClick={handleImportClick}
          disabled={isLoading || isImporting}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-accent)', color: 'white', borderColor: 'var(--color-accent)' }}
        >
          <UploadCloud size={16} /> {isImporting ? 'Importing...' : 'Import Excel'}
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

      {/* Main Table */}
      <Card title="Employee Directory" noPadding>
        {isLoading && !showForm ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem auto' }} />
            <p>Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <p style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--color-text)' }}>
              {searchTerm ? 'No employees found matching your search.' : 'No employees configured yet.'}
            </p>
            {!searchTerm && (
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Click "Add Employee" or "Import Excel" to get started.
              </p>
            )}
          </div>
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Daily Salary</th>
                  <th>Late Penalty</th>
                  <th>Early Leave Penalty</th>
                  <th>Overtime Rate</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedEmployees.map((emp) => (
                  <tr key={emp.employeeId}>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{emp.employeeId}</strong></td>
                    <td>{emp.name}</td>
                    <td>Rs. {emp.dailySalary}</td>
                    <td>Rs. {emp.latePenalty}/hr</td>
                    <td>Rs. {emp.earlyLeavePenalty}/hr</td>
                    <td>Rs. {emp.overtimeRate}/hr</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditClick(emp)}
                          disabled={isLoading}
                          style={{ padding: '0.5rem', backgroundColor: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(emp.employeeId)}
                          disabled={isLoading}
                          style={{ padding: '0.5rem', backgroundColor: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--color-bg)' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries
                </span>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'white', borderRadius: '0.375rem', fontSize: '0.875rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid',
                        borderColor: currentPage === page ? 'var(--color-primary)' : 'var(--border-color)',
                        backgroundColor: currentPage === page ? 'var(--color-primary)' : 'white',
                        color: currentPage === page ? 'white' : 'var(--color-text)',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
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
                    style={{ padding: '0.5rem 0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'white', borderRadius: '0.375rem', fontSize: '0.875rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#F0FDF4', color: '#166534', borderRadius: 'var(--border-radius)', border: '1px solid #BBF7D0' }}>
        <Info size={20} className="flex-shrink-0" />
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
          <strong>Note:</strong> These employee settings will be used automatically during salary calculation. Make sure all employees in your attendance files are configured here.
        </p>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => !isLoading && setShowForm(false)}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {editingId ? 'Edit Employee Details' : 'Add New Employee'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleFormChange}
                  disabled={!!editingId}
                  placeholder="e.g., EMP001"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none', backgroundColor: editingId ? '#F3F4F6' : 'white', cursor: editingId ? 'not-allowed' : 'text' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., John Doe"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Daily Salary (Rs.) *</label>
                <input
                  type="number"
                  name="dailySalary"
                  value={formData.dailySalary}
                  onChange={handleFormChange}
                  placeholder="e.g., 500"
                  step="0.01"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Late Penalty (Rs./hr)</label>
                  <input
                    type="number"
                    name="latePenalty"
                    value={formData.latePenalty}
                    onChange={handleFormChange}
                    step="0.01"
                    style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Early Leave (Rs./hr)</label>
                  <input
                    type="number"
                    name="earlyLeavePenalty"
                    value={formData.earlyLeavePenalty}
                    onChange={handleFormChange}
                    step="0.01"
                    style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text)' }}>Overtime Rate (Rs./hr)</label>
                <input
                  type="number"
                  name="overtimeRate"
                  value={formData.overtimeRate}
                  onChange={handleFormChange}
                  step="0.01"
                  style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--border-color)', borderRadius: '0.375rem', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={isLoading}
                  style={{ padding: '0.625rem 1.25rem', backgroundColor: 'white', color: 'var(--color-text)', border: '1px solid var(--border-color)', borderRadius: '0.375rem', cursor: isLoading ? 'not-allowed' : 'pointer', fontWeight: 500, fontSize: '0.875rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{ opacity: isLoading ? 0.7 : 1 }}
                >
                  {isLoading ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
