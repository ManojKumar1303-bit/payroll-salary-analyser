import React from 'react';
import { LayoutDashboard, UploadCloud, FileText, BarChart3, Users } from 'lucide-react';

const Sidebar = ({ currentPage, onPageChange }) => {
    const navItems = [
        { id: 'upload', label: 'Upload & Calculate', icon: UploadCloud },
        { id: 'daily-reports', label: 'Daily Report', icon: FileText },
        { id: 'summary-report', label: 'Summary Report', icon: BarChart3 },
        { id: 'employee-settings', label: 'Employee Settings', icon: Users },
    ];

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
                            onClick={() => onPageChange(item.id)}
                            style={{ gap: '1rem', padding: '0.875rem 1.25rem' }}
                        >
                            <Icon size={24} className="sidebar-icon" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
};

export default Sidebar;
