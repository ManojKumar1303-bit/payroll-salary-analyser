import axios from 'axios';

// Use environment variable for API base; front-end will set VITE_API_URL in production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * Upload multiple Excel files
 */
export const uploadAttendanceFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  return apiClient.post('/upload-attendance', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * Get uploaded files and employees
 */
export const getUploadedData = async () => {
  return apiClient.get('/uploaded-data');
};

/**
 * Calculate salary based on settings
 * @param {Object} employeeSalaries - Manual employee salary mapping (legacy)
 * @param {Object} penalties - Penalty settings
 * @param {number} overtimeRate - Overtime rate
 * @param {boolean} useDatabase - If true, use database employee configuration
 */
export const calculateSalary = async (employeeSalaries, penalties, overtimeRate, useDatabase = false) => {
  return apiClient.post('/calculate-salary', {
    employeeSalaries,
    penalties,
    overtimeRate,
    useDatabase,
  });
};

/**
 * Get stored reports
 */
export const getReports = async () => {
  return apiClient.get('/reports');
};

/**
 * Export salary report as Excel
 */
export const exportSalaryReport = async () => {
  return apiClient.get('/export-report', {
    responseType: 'blob',
  });
};

/**
 * Clear session data
 */
export const clearSessionData = async () => {
  return apiClient.post('/clear');
};

// ============================================
// EMPLOYEE MANAGEMENT API FUNCTIONS
// ============================================

/**
 * Get all employees from database
 */
export const getAllEmployees = async () => {
  return apiClient.get('/employees');
};

/**
 * Get a single employee by employeeId
 */
export const getEmployeeById = async (employeeId) => {
  return apiClient.get(`/employees/${employeeId}`);
};

/**
 * Create a new employee
 */
export const createEmployee = async (employeeData) => {
  return apiClient.post('/employees', employeeData);
};

/**
 * Update employee by employeeId
 */
export const updateEmployee = async (employeeId, employeeData) => {
  return apiClient.put(`/employees/${employeeId}`, employeeData);
};

/**
 * Delete employee by employeeId (permanent deletion)
 */
export const deleteEmployee = async (employeeId) => {
  return apiClient.delete(`/employees/${employeeId}`);
};

/**
 * Bulk create or update employees
 */
export const bulkUpsertEmployees = async (employees) => {
  return apiClient.post('/employees/bulk-upsert', { employees });
};

export default apiClient;
