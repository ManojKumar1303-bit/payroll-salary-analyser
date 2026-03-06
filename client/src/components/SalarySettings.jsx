import React, { useState, useEffect } from 'react';

export default function SalarySettings({ onSettingsChange }) {
  const [latePenalty, setLatePenalty] = useState(50);
  const [earlyLeavePenalty, setEarlyLeavePenalty] = useState(50);
  const [overtimeRate, setOvertimeRate] = useState(50);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    // Notify parent of settings change
    onSettingsChange({
      latePenalty: parseFloat(latePenalty),
      earlyLeavePenalty: parseFloat(earlyLeavePenalty),
      overtimeRate: parseFloat(overtimeRate),
    });
  }, [latePenalty, earlyLeavePenalty, overtimeRate]);

  const handleReset = () => {
    setLatePenalty(50);
    setEarlyLeavePenalty(50);
    setOvertimeRate(50);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>⚙️ Salary Calculation Settings</h3>
        <p>Configure penalties and overtime rates for salary calculations</p>
      </div>
      <div className="card-body">
        <div className="settings-grid">
          <div className="form-group">
            <label htmlFor="late-penalty">
              Penalty for Late Hours
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                (₹/hour)
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                id="late-penalty"
                type="number"
                value={latePenalty}
                onChange={(e) => setLatePenalty(e.target.value)}
                className="form-control"
                min="0"
                step="1"
              />
              <span style={{ fontWeight: 700, color: '#2563eb', minWidth: '50px' }}>
                ₹{parseFloat(latePenalty).toFixed(0)}/hr
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="early-leave-penalty">
              Penalty for Early Leave Hours
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                (₹/hour)
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                id="early-leave-penalty"
                type="number"
                value={earlyLeavePenalty}
                onChange={(e) => setEarlyLeavePenalty(e.target.value)}
                className="form-control"
                min="0"
                step="1"
              />
              <span style={{ fontWeight: 700, color: '#2563eb', minWidth: '50px' }}>
                ₹{parseFloat(earlyLeavePenalty).toFixed(0)}/hr
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="overtime-rate">
              Overtime Pay Rate
              <span style={{ fontSize: '12px', opacity: 0.7, marginLeft: '4px' }}>
                (₹/hour)
              </span>
            </label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                id="overtime-rate"
                type="number"
                value={overtimeRate}
                onChange={(e) => setOvertimeRate(e.target.value)}
                className="form-control"
                min="0"
                step="1"
              />
              <span style={{ fontWeight: 700, color: '#10b981', minWidth: '50px' }}>
                ₹{parseFloat(overtimeRate).toFixed(0)}/hr
              </span>
            </div>
          </div>
        </div>

        {/* Settings Summary */}
        {showSummary && (
          <div className="settings-summary">
            <strong>💡 Current Settings Summary</strong>
            <ul style={{ marginTop: '10px' }}>
              <li>
                <strong>Late Deduction:</strong> ₹{parseFloat(latePenalty).toFixed(0)}/hour
              </li>
              <li>
                <strong>Early Leave Deduction:</strong> ₹{parseFloat(earlyLeavePenalty).toFixed(0)}/hour
              </li>
              <li>
                <strong>Overtime Bonus:</strong> ₹{parseFloat(overtimeRate).toFixed(0)}/hour
              </li>
            </ul>
          </div>
        )}

        {/* Reset Button */}
        <div className="action-buttons">
          <button
            className="btn btn-secondary"
            onClick={handleReset}
          >
            🔄 Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
