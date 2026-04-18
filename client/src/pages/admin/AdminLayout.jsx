import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/admin', label: '📊 Overview', exact: true },
  { path: '/admin/users', label: '👥 Users' },
  { path: '/admin/draws', label: '🎯 Draws' },
  { path: '/admin/charities', label: '💚 Charities' },
  { path: '/admin/winners', label: '🏆 Winners' },
  { path: '/admin/reports', label: '📈 Reports' },
];

const AdminLayout = ({ children, title }) => {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px', flexShrink: 0, background: '#1a1a1a', color: '#fff',
        padding: '2rem 0', position: 'sticky', top: '70px', height: 'calc(100vh - 70px)',
        overflowY: 'auto',
      }}>
        <div style={{ padding: '0 1.5rem 1.5rem', borderBottom: '1px solid #333' }}>
          <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', color: '#888', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Admin Console
          </p>
          <p style={{ fontWeight: 700, color: '#0D9488' }}>Digital Heroes</p>
        </div>
        <nav style={{ marginTop: '1rem' }}>
          {navItems.map(({ path, label, exact }) => {
            const isActive = exact ? location.pathname === path : location.pathname.startsWith(path);
            return (
              <Link key={path} to={path} style={{
                display: 'block', padding: '0.75rem 1.5rem', color: isActive ? '#0D9488' : '#ccc',
                background: isActive ? 'rgba(13,148,136,0.1)' : 'transparent',
                borderLeft: isActive ? '3px solid #0D9488' : '3px solid transparent',
                textDecoration: 'none', fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s', fontSize: '0.9rem',
              }}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '1.5rem', marginTop: 'auto', borderTop: '1px solid #333', position: 'absolute', bottom: 0, width: '100%' }}>
          <Link to="/dashboard" style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        {title && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a1a1a' }}>{title}</h1>
            <div style={{ height: '3px', width: '48px', background: '#0D9488', marginTop: '0.5rem', borderRadius: '2px' }} />
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
