import React from 'react';

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid var(--border-color)',
            padding: '20px',
            textAlign: 'center',
            color: '#475569',
            fontSize: '0.875rem',
            width: '100%',
            flexShrink: 0
        }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 500 }}>
                Copyright &copy; {new Date().getFullYear()} Kaaraalan Goli Soda and Cattle Farms. All rights reserved.
            </p>
            <p style={{ margin: 0 }}>
                Developed and maintained by Manoj Kumar U.
            </p>
        </footer>
    );
}
