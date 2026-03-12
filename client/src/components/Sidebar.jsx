import React from 'react';
import { LayoutDashboard, UploadCloud, FileText, BarChart3, History, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { id: 'upload', path: '/upload', label: 'Upload & Calculate', icon: UploadCloud },
        { id: 'daily-reports', path: '/daily-reports', label: 'Daily Report', icon: FileText },
        { id: 'summary-report', path: '/summary-report', label: 'Summary Report', icon: BarChart3 },
        { id: 'report-history', path: '/report-history', label: 'Report History', icon: History },
        { id: 'employee-settings', path: '/employee-settings', label: 'Employee Settings', icon: Users },
    ];

    const getCurrentId = () => {
      const active = navItems.find(item => location.pathname.startsWith(item.path));
      return active ? active.id : 'upload';
    };

    const currentPage = getCurrentId();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <LayoutDashboard className="brand-icon" size={24} />
                <h2>Dashboard</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                            style={{ gap: '1rem', padding: '0.875rem 1.25rem', width: '100%', border: 'none', background: 'transparent', textAlign: 'left' }}
                        >
                            <span className="icon"><Icon size={24} className="sidebar-icon" /></span>
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
