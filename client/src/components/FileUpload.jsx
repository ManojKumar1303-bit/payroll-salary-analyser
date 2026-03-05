import React, { useState } from 'react';
import { uploadAttendanceFiles } from '../services/api';

export default function FileUpload({ onUploadSuccess, uploadedFiles = [] }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['xlsx', 'xls'].includes(ext);
    });

    if (validFiles.length !== files.length) {
      setError(
        `Only Excel files (.xlsx, .xls) are allowed. ${files.length - validFiles.length} files were rejected.`
      );
    } else {
      setError('');
    }

    setSelectedFiles(validFiles);
    setSuccess('');
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
      setSuccess(
        `Successfully uploaded and parsed ${response.data.fileNames.length} file(s) with ${response.data.totalRecords} records`
      );
      setSelectedFiles([]);

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
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Upload Attendance Files</h3>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label htmlFor="file-input">Select Excel Files (Multiple allowed):</label>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="form-control"
          />
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p className="text-info">
                {selectedFiles.length} file(s) selected for upload:
              </p>
              <ul>
                {selectedFiles.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
          
          {uploadedFiles.length > 0 && (
            <div className="uploaded-files">
              <p className="text-success">
                {uploadedFiles.length} file(s) already uploaded:
              </p>
              <ul>
                {uploadedFiles.map((file, idx) => (
                  <li key={idx}>
                    {file.name} 
                    <small className="text-muted">
                      (uploaded {file.uploadedAt ? new Date(file.uploadedAt).toLocaleString() : 'previously'})
                    </small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button
          onClick={handleUpload}
          disabled={isLoading || selectedFiles.length === 0}
          className="btn btn-primary"
        >
          {isLoading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
    </div>
  );
}
