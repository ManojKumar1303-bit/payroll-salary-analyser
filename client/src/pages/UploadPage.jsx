import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import DailyReport from '../components/DailyReport';
import SummaryReport from '../components/SummaryReport';
import Alert from '../components/Alert';
import {
  calculateSalary,
  exportSalaryReport,
  clearSessionData,
} from '../services/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    const newFiles = responseData.fileNames.map(name => ({ name, uploadedAt: new Date() }));
    setUploadedFiles(prevFiles => [...prevFiles, ...newFiles]);
    setUploadedEmployees(responseData.employees);
    setDailyReports([]);
    setSummary([]);
    setError('');
    setSuccessMessage('');
    await calculateUsingEmployeeSettings();
  };

  const calculateUsingEmployeeSettings = async () => {
    setIsCalculating(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await calculateSalary({}, {}, null, true);
      setDailyReports(response.data.dailyReports);
      setSummary(response.data.summary);
      setSkippedEmployees(response.data.skippedEmployees || []);
      if (response.data.skippedEmployees && response.data.skippedEmployees.length > 0) {
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
        setError(err.response?.data?.error || 'Failed to clear data. Please try again.');
      }
    }
  };

  const currentStep = summary.length > 0 ? 2 : 1;
  const steps = ['Upload', 'Review'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Progress Steps */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'white',
                  backgroundColor: idx + 1 <= currentStep ? 'var(--color-primary)' : 'var(--border-color)',
                  transition: 'all 0.3s ease',
                }}
              >
                {idx + 1 <= currentStep ? '✓' : idx + 1}
              </div>
              <span style={{
                fontWeight: 500,
                color: idx + 1 <= currentStep ? 'var(--color-text)' : 'var(--color-text-muted)'
              }}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '40px',
                    height: '2px',
                    backgroundColor: idx + 1 < currentStep ? 'var(--color-primary)' : 'var(--border-color)',
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {error && <Alert type="danger" message={error} />}
      {successMessage && <Alert type="success" message={successMessage} />}

      {/* Skipped Employees Warning */}
      {skippedEmployees.length > 0 && (
        <div style={{
          backgroundColor: 'var(--color-warning-bg)',
          border: '1px solid #FCD34D',
          borderRadius: 'var(--border-radius)',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            color: '#B45309',
            fontSize: '1rem',
            fontWeight: 600,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertTriangle size={20} />
            Skipped Employees ({skippedEmployees.length})
          </div>
          <p style={{ color: '#92400E', fontSize: '0.875rem', marginBottom: '1rem' }}>
            The following employees from the attendance file were not configured in Employee Settings and were skipped from salary calculation:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.5rem',
          }}>
            {skippedEmployees.map((name, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid #FDE68A',
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  color: '#92400E',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {name}
              </div>
            ))}
          </div>
          <p style={{ color: '#92400E', fontSize: '0.875rem', marginTop: '1rem', marginBottom: 0 }}>
            <strong style={{ fontWeight: 600 }}>Tip:</strong> Add these employees to Employee Settings and re-upload the file to include them.
          </p>
        </div>
      )}

      {/* Step 1: File Upload */}
      <FileUpload onUploadSuccess={handleUploadSuccess} uploadedFiles={uploadedFiles} />

      {/* Step 2: Review Reports */}
      {dailyReports.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <DailyReport dailyReports={dailyReports} />
        </div>
      )}

      {summary.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <SummaryReport
            summary={summary}
            onExport={handleExport}
            isExporting={isExporting}
          />

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-start' }}>
            <button
              onClick={handleClear}
              className="btn btn-secondary"
              title="Clear all data and start a new calculation"
            >
              <RefreshCw size={16} />
              Start New Calculation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
