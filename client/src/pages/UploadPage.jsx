import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
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
  const [dailyReports, setDailyReports] = useState([]);
  const [summary, setSummary] = useState([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [skippedEmployees, setSkippedEmployees] = useState([]);

  const handleUploadSuccess = async (responseData) => {
    // Append new files to existing list
    const newFiles = responseData.fileNames.map(name => ({ name, uploadedAt: new Date() }));
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Update employees list (server already merges and deduplicates)
    setUploadedEmployees(responseData.employees);
    
    setDailyReports([]);
    setSummary([]);
    setError('');
    setSuccessMessage('');

    // Automatically calculate using Employee Settings after upload
    await calculateUsingEmployeeSettings();
  };

  const calculateUsingEmployeeSettings = async () => {
    setIsCalculating(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await calculateSalary(
        {},
        {}, // No settings passed - using employee-specific configuration
        null,
        true // Use database employee configuration
      );

      setDailyReports(response.data.dailyReports);
      setSummary(response.data.summary);
      setSkippedEmployees(response.data.skippedEmployees || []);

      if (response.data.skippedEmployees && response.data.skippedEmployees.length > 0) {
        setError(`⚠️ ${response.data.skippedEmployees.length} employee(s) were skipped because they are not configured in Employee Settings: ${response.data.skippedEmployees.join(', ')}`);
      } else {
        setSuccessMessage('Salary calculated successfully using Employee Settings!');
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to calculate salary. Please check Employee Settings and try again.'
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

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all data and start over?')) {
      try {
        await clearSessionData();
        setUploadedFiles([]);
        setUploadedEmployees([]);
        setDailyReports([]);
        setSummary([]);
        setSkippedEmployees([]);
        setError('');
        setSuccessMessage('Data cleared. Ready for new upload.');
      } catch (err) {
        // API failed; keep UI intact but show error
        setError(
          err.response?.data?.error ||
          'Failed to clear data. Please try again.'
        );
      }
    }
  };

  // Progress indicators
  const currentStep = summary.length > 0 ? 2 : 1;
  const steps = ['Upload', 'Review'];

  return (
    <div className="container">
      {/* Progress Steps */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: 'white',
                  backgroundColor: idx + 1 <= currentStep ? '#2563eb' : '#e5e7eb',
                  transition: 'all 0.3s ease',
                }}
              >
                {idx + 1 <= currentStep ? '✓' : idx + 1}
              </div>
              <span style={{ fontWeight: 600, color: idx + 1 <= currentStep ? '#2563eb' : '#9ca3af' }}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '30px',
                    height: '2px',
                    backgroundColor: idx + 1 < currentStep ? '#2563eb' : '#e5e7eb',
                    margin: '0 5px',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {successMessage && (
        <div className="alert alert-success">✓ {successMessage}</div>
      )}

      {/* Step 1: File Upload */}
      <FileUpload onUploadSuccess={handleUploadSuccess} uploadedFiles={uploadedFiles} />

      {/* Step 2: Review Reports */}
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
              onClick={handleClear}
              className="btn btn-warning btn-lg"
              title="Clear all data and start a new calculation"
            >
              🔄 Start New Calculation
            </button>
          </div>
        </>
      )}
    </div>
  );
}
