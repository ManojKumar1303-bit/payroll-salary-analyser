import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import SalarySettings from '../components/SalarySettings';
import EmployeeSalaryTable from '../components/EmployeeSalaryTable';
import DailyReport from '../components/DailyReport';
import SummaryReport from '../components/SummaryReport';
import {
  calculateSalary,
  exportSalaryReport,
  clearSessionData,
} from '../services/api';

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedEmployees, setUploadedEmployees] = useState([]);
  const [settings, setSettings] = useState({
    latePenalty: 50,
    earlyLeavePenalty: 50,
    overtimeRate: 100,
  });
  const [dailyReports, setDailyReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleUploadSuccess = (responseData) => {
    // Append new files to existing list
    const newFiles = responseData.fileNames.map(name => ({ name, uploadedAt: new Date() }));
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Update employees list (server already merges and deduplicates)
    setUploadedEmployees(responseData.employees);
    
    setDailyReports([]);
    setSummary([]);
    setError('');
    setSuccessMessage('');
  };

  const handleSettingsChange = (newSettings) => {
    setSettings(newSettings);
  };

  const handleSalarySubmit = async (employeeSalaries) => {
    setIsCalculating(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await calculateSalary(
        employeeSalaries,
        {
          latePenalty: settings.latePenalty,
          earlyLeavePenalty: settings.earlyLeavePenalty,
        },
        settings.overtimeRate
      );

      setDailyReports(response.data.dailyReports);
      setSummary(response.data.summary);
      setSuccessMessage('Salary calculated successfully!');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to calculate salary. Please try again.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError('');

    try {
      const response = await exportSalaryReport();

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary_report_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccessMessage('Report exported successfully!');
    } catch (err) {
      setError('Failed to export report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to clear all data and start over?')) {
      try {
        await clearSessionData();
        setUploadedFiles([]);
        setUploadedEmployees([]);
        setDailyReports([]);
        setSummary([]);
        setError('');
        setSuccessMessage('Data cleared. Ready for new upload.');
      } catch (err) {
        setError('Failed to clear data.');
      }
    }
  };

  return (
    <div className="container">
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && (
        <div className="alert alert-success">{successMessage}</div>
      )}

      <FileUpload onUploadSuccess={handleUploadSuccess} uploadedFiles={uploadedFiles} />

      <SalarySettings onSettingsChange={handleSettingsChange} />

      {uploadedEmployees.length > 0 && (
        <EmployeeSalaryTable
          employees={uploadedEmployees}
          onSalarySubmit={handleSalarySubmit}
          isLoading={isCalculating}
        />
      )}

      {dailyReports.length > 0 && <DailyReport dailyReports={dailyReports} />}

      {summary.length > 0 && (
        <>
          <SummaryReport
            summary={summary}
            onExport={handleExport}
            isExporting={isExporting}
          />

          <div className="action-buttons">
            <button
              onClick={handleReset}
              className="btn btn-warning"
            >
              Start New Calculation
            </button>
          </div>
        </>
      )}
    </div>
  );
}
