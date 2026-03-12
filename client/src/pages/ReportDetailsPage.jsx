import React, { useState, useEffect } from 'react';
import { getReportById } from '../services/api';
import { Users, DollarSign, Clock, AlertTriangle, ArrowLeft, IndianRupee } from 'lucide-react';
import Loader from '../components/Loader';
import { useParams, useNavigate } from 'react-router-dom';

const ReportDetailsPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [salaryChecklist, setSalaryCheklist] = useState({});

  useEffect(() => {
    fetchReportDetails();
  }, [reportId]);

  const fetchReportDetails = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await getReportById(reportId);
      setSelectedReport(res.data.report);
    } catch (err) {
      console.error('Failed to fetch report details:', err);
      setError('Could not load report details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryCheckboxChange = (employeeId) => {
    setSalaryCheklist((prev) => ({
      ...prev,
      [employeeId]: !prev[employeeId],
    }));
  };

  const handleBackToList = () => {
    navigate('/report-history');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader message="Fetching report details..." />
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="page-container">
        <div className="alert alert-danger">
          Report not found.
        </div>
        <button onClick={handleBackToList} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        <button 
          onClick={handleBackToList}
          className="btn btn-secondary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start', marginBottom: '1rem', border: 'none', background: 'var(--bg-card)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back to History
        </button>
        <h2>Report Details</h2>
        <p className="page-description">Generated on {formatDate(selectedReport.date)}</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="summary-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="summary-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Users size={20} className="text-primary" />
            <h3>Total Employees</h3>
          </div>
          <p className="summary-card-value" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{selectedReport.totalEmployees}</p>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="summary-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <IndianRupee size={20} className="text-success" />
            <h3>Total Salary payout</h3> 
          </div>
          <p className="summary-card-value" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Rs. {selectedReport.totalSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="summary-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Clock size={20} className="text-info" />
            <h3>Total Overtime pay</h3>
          </div>
          <p className="summary-card-value" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Rs. {selectedReport.totalOvertime.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="summary-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={20} className="text-warning" />
            <h3>Total Deductions</h3>
          </div>
          <p className="summary-card-value" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Rs. {selectedReport.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <div className="summary-card" style={{ backgroundColor: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
          <div className="summary-card-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <IndianRupee size={20} className="text-accent" />
            <h3>Salary Paid</h3>
          </div>
          <p className="summary-card-value" style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
            {Object.values(salaryChecklist).filter(Boolean).length} / {selectedReport.employees?.length || 0}
          </p>
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Employee Details Breakdown</h3>
        </div>
        <div className="card-body p-0" style={{ padding: 0 }}>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Employee ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Shift</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Lost Hours</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Deductions</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Overtime Pay</th>
                  <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Final Salary</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>✓ Paid</th>
                </tr>
              </thead>
              <tbody>
                {selectedReport.employees && selectedReport.employees.map((emp, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem' }}><span className="badge badge-secondary">{emp.employeeId}</span></td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      {emp.name}
                      {emp.status !== 'Normal' && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--danger)' }}>({emp.status})</span>}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{emp.shift}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--warning)' }}>
                      {(emp.lateHours + emp.earlyLeaveHours).toFixed(2)} hrs
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>
                      Rs. {(emp.lateDeduction + emp.earlyDeduction).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>Rs. {emp.overtimeBonus.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Rs. {emp.finalSalary.toFixed(2)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={salaryChecklist[emp.employeeId] || false}
                        onChange={() => handleSalaryCheckboxChange(emp.employeeId)}
                        style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer', accentColor: 'var(--success)' }}
                        title={`Mark salary paid for ${emp.name}`}
                      />
                    </td>
                  </tr>
                ))}
                {(!selectedReport.employees || selectedReport.employees.length === 0) && (
                  <tr>
                    <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No employee details found for this report.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailsPage;
