import React, { useState, useEffect } from 'react';

export default function SalarySettings({ onSettingsChange }) {
  const [latePenalty, setLatePenalty] = useState(50);
  const [earlyLeavePenalty, setEarlyLeavePenalty] = useState(50);
  const [overtimeRate, setOvertimeRate] = useState(50);

  useEffect(() => {
    // Notify parent of settings change
    onSettingsChange({
      latePenalty: parseFloat(latePenalty),
      earlyLeavePenalty: parseFloat(earlyLeavePenalty),
      overtimeRate: parseFloat(overtimeRate),
    });
  }, [latePenalty, earlyLeavePenalty, overtimeRate]);

  return (
    <div className="card">
      <div className="card-header">
        <h3>Salary Calculation Settings</h3>
      </div>
      <div className="card-body">
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="late-penalty">Late Penalty (₹/hour):</label>
            <input
              id="late-penalty"
              type="number"
              value={latePenalty}
              onChange={(e) => setLatePenalty(e.target.value)}
              className="form-control"
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="early-leave-penalty">
              Early Leave Penalty (₹/hour):
            </label>
            <input
              id="early-leave-penalty"
              type="number"
              value={earlyLeavePenalty}
              onChange={(e) => setEarlyLeavePenalty(e.target.value)}
              className="form-control"
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="overtime-rate">Overtime Pay (₹/hour):</label>
            <input
              id="overtime-rate"
              type="number"
              value={overtimeRate}
              onChange={(e) => setOvertimeRate(e.target.value)}
              className="form-control"
              min="0"
              step="1"
            />
          </div>
        </div>

        <div className="settings-summary">
          <p>
            <strong>Current Settings:</strong>
          </p>
          <ul>
            <li>Late Penalty: ₹{latePenalty}/hour</li>
            <li>Early Leave Penalty: ₹{earlyLeavePenalty}/hour</li>
            <li>Overtime Pay: ₹{overtimeRate}/hour</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
