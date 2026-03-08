import React, { useState, useRef } from 'react';
import { uploadAttendanceFiles } from '../services/api';
import Card from './Card';
import Alert from './Alert';
import Loader from './Loader';
import { UploadCloud, FileSpreadsheet, XCircle } from 'lucide-react';

export default function FileUpload({ onUploadSuccess, uploadedFiles = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragover, setIsDragover] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files) => {
    const validFiles = files.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['xlsx', 'xls'].includes(ext);
    });

    if (validFiles.length !== files.length) {
      setError(`Only Excel files (.xlsx, .xls) are allowed. ${files.length - validFiles.length} file(s) were rejected.`);
    } else {
      setError('');
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setSuccess('');
  };

  const handleDragover = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragover(true);
  };

  const handleDragleave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragover(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragover(false);
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one Excel file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await uploadAttendanceFiles(selectedFiles);
      setSuccess(`Successfully uploaded and parsed ${response.data.fileNames.length} file(s) with ${response.data.totalRecords} records`);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload files. Check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Upload Attendance Files">
      {isLoading && <Loader fullPage text="Uploading and Parsing Excel Files..." />}

      <div style={{ marginBottom: '1.5rem' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{ display: 'none' }}
        />

        <div
          className={`upload-dropzone ${isDragover ? 'dragover' : ''}`}
          onDragOver={handleDragover}
          onDragLeave={handleDragleave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud size={48} className="upload-icon" />
          <div className="upload-text">Drag and drop your Excel files here</div>
          <div className="upload-hint" style={{ marginBottom: '1rem' }}>or click to browse (.xlsx, .xls)</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span>Supported formats: .xlsx, .xls</span>
            <span>Maximum file size: 50MB</span>
          </div>
        </div>
      </div>

      {error && <Alert type="warning" message={error} />}
      {success && <Alert type="success" message={success} />}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Selected Files ({selectedFiles.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {selectedFiles.map((file, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)',
                padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius)', fontSize: '0.875rem'
              }}>
                <FileSpreadsheet size={16} style={{ color: 'var(--color-primary)' }} />
                <span style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="btn-icon">
                  <XCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Already Uploaded ({uploadedFiles.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {uploadedFiles.map((file, idx) => (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                backgroundColor: 'var(--color-success-bg)', color: '#166534',
                padding: '0.5rem 0.75rem', borderRadius: 'var(--border-radius)', fontSize: '0.875rem'
              }}>
                <FileSpreadsheet size={16} />
                <span>{typeof file === 'string' ? file : file.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button
          className="btn btn-secondary"
          onClick={handleClear}
          disabled={isLoading || selectedFiles.length === 0}
        >
          Clear Selection
        </button>
        <button
          className="btn btn-primary"
          onClick={handleUpload}
          disabled={isLoading || selectedFiles.length === 0}
          style={{ flex: 1 }}
        >
          {isLoading ? 'Uploading...' : 'Calculate Salary'}
        </button>
      </div>
    </Card>
  );
}
