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
 */
export const calculateSalary = async (employeeSalaries, penalties, overtimeRate) => {
  return apiClient.post('/calculate-salary', {
    employeeSalaries,
    penalties,
    overtimeRate,
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

export default apiClient;
