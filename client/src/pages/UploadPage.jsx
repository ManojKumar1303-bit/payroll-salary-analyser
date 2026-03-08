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
        // Don't set as error - set as warning message instead
        // Error will show the warning, but results will still be displayed
        setSuccessMessage('Salary calculated successfully! (See warning below)');
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

      {/* Skipped Employees Warning */}
      {skippedEmployees.length > 0 && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '2px solid #f59e0b',
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '20px',
          marginTop: '10px',
        }}>
          <div style={{
            color: '#b45309',
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            Skipped Employees ({skippedEmployees.length})
          </div>
          <p style={{
            color: '#92400e',
            fontSize: '14px',
            marginBottom: '12px',
            margin: '0 0 12px 0',
          }}>
            The following employees from the attendance file were not configured in Employee Settings and were skipped from salary calculation:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '8px',
          }}>
            {skippedEmployees.map((name, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(179, 29, 29, 0.05)',
                  border: '1px solid #dc2626',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  color: '#7f1d1d',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                • {name}
              </div>
            ))}
          </div>
          <p style={{
            color: '#92400e',
            fontSize: '13px',
            marginTop: '12px',
            marginBottom: 0,
          }}>
            💡 <strong>Tip:</strong> Add these employees to Employee Settings and re-upload the file to include them in salary calculations.
          </p>
        </div>
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
