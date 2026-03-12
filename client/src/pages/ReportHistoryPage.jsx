import React, { useState, useEffect } from 'react';
import { getReportHistory, deleteReportHistory } from '../services/api';
import { Eye, Calendar, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const ReportHistoryPage = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await getReportHistory();
      setReports(res.data.reports || []);
    } catch (err) {
      console.error('Failed to fetch report history:', err);
      setError('Could not load report history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReport = (id) => {
    navigate(`/report-history/${id}`);
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteReportHistory(id);
        setReports(reports.filter(r => r._id !== id));
      } catch (err) {
        console.error('Failed to delete report:', err);
        setError('Failed to delete report. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader message="Loading report history..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h2>Report History</h2>
        <p className="page-description">View previously calculated payroll summary reports</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--danger-light)', color: 'var(--danger)', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      <div className="card" style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
        <div className="card-body p-0" style={{ padding: 0 }}>
          {reports.length === 0 ? (
            <div className="empty-state" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <div className="empty-state-icon" style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                <Calendar size={32} />
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>No Reports Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>You haven't generated any salary reports yet. Upload attendance data and run a calculation first.</p>
            </div>
          ) : (
            <div className="table-responsive" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)' }}>Calculation Date</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Employees</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Deductions</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Overtime</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Salary</th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={16} className="text-secondary" />
                          <span style={{ fontWeight: '500' }}>{formatDate(report.date || report.createdAt)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <span className="badge badge-primary">{report.totalEmployees}</span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>
                        Rs. {(report.totalDeductions || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>
                        Rs. {(report.totalOvertime || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                        Rs. {(report.totalSalary || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleViewReport(report._id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontSize: '0.875rem'
                            }}
                          >
                            <Eye size={14} /> View
                          </button>
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDeleteReport(report._id)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              fontSize: '0.875rem',
                              color: 'var(--danger)',
                              borderColor: 'var(--danger)'
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportHistoryPage;
