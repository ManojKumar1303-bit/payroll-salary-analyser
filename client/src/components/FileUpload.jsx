import React, { useState } from 'react';
import { uploadAttendanceFiles } from '../services/api';

export default function FileUpload({ onUploadSuccess, uploadedFiles = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDragover, setIsDragover] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    // Validate files
    const validFiles = files.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['xlsx', 'xls'].includes(ext);
    });

    if (validFiles.length !== files.length) {
      setError(
        `Only Excel files (.xlsx, .xls) are allowed. ${files.length - validFiles.length} file(s) were rejected.`
      );
    } else {
      setError('');
    }

    setSelectedFiles(validFiles);
    setSuccess('');
    setUploadProgress(0);
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
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one Excel file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const response = await uploadAttendanceFiles(selectedFiles);
      setSuccess(
        `Successfully uploaded and parsed ${response.data.fileNames.length} file(s) with ${response.data.totalRecords} records`
      );
      setSelectedFiles([]);
      setUploadProgress(100);

      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.value = '';
      }

      onUploadSuccess(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Failed to upload files. Check server connection.'
      );
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>📁 Upload Attendance Files</h3>
        <p>Select Excel files with biometric attendance data</p>
      </div>
      <div className="card-body">
        {/* Hidden File Input */}
        <input
          id="file-input"
          type="file"
          multiple
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          disabled={isLoading}
          style={{
            display: 'none',
          }}
        />

        {/* Drag & Drop Area */}
        <label
          htmlFor="file-input"
          className={`drag-drop-area ${isDragover ? 'dragover' : ''}`}
          onDragover={handleDragover}
          onDragleave={handleDragleave}
          onDrop={handleDrop}
          style={{ cursor: 'pointer', display: 'block' }}
        >
          <div className="drag-icon">📤</div>
          <p>
            Drag and drop your Excel files here or
            <br />
            <strong>click to browse</strong>
          </p>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>
            Supported formats: .xlsx, .xls
          </p>
        </label>

        {/* Alerts */}
        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✓ {success}</div>}

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <p>📋 {selectedFiles.length} file(s) selected for upload:</p>
            <ul>
              {selectedFiles.map((file, idx) => (
                <li key={idx}>
                  <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="uploaded-files">
            <p>✓ {uploadedFiles.length} file(s) already uploaded:</p>
            <ul>
              {uploadedFiles.map((file, idx) => (
                <li key={idx}>{file.name || file}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="upload-progress">
            <div
              className="upload-progress-bar"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Upload Button */}
        <div className="action-buttons">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleUpload}
            disabled={isLoading || selectedFiles.length === 0}
          >
            {isLoading ? (
              <>
                <span className="spinner" style={{ display: 'inline-block', marginRight: '10px' }} />
                Uploading...
              </>
            ) : (
              '✓ Upload Files'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
