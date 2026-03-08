import React from 'react';

export default function Footer() {
    return (
        <footer style={{
            backgroundColor: 'var(--bg-main)',
            borderTop: '1px solid var(--border-color)',
            padding: '1.5rem',
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '0.875rem'
        }}>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)', fontWeight: 500 }}>
                Copyright &copy; {new Date().getFullYear()} Kaaraalan Goli Soda and Cattle Farms. All rights reserved.
            </p>
            <p style={{ margin: 0 }}>
                Developed and maintained by Manoj Kumar U.
            </p>
        </footer>
    );
}
