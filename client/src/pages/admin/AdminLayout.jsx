import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Heart, Trophy, BarChart2, ArrowLeft } from 'lucide-react';

const navItems = [
  { path: '/admin',           label: 'Overview',  Icon: LayoutDashboard, exact: true },
  { path: '/admin/users',     label: 'Users',     Icon: Users },
  { path: '/admin/draws',     label: 'Draws',     Icon: Target },
  { path: '/admin/charities', label: 'Charities', Icon: Heart },
  { path: '/admin/winners',   label: 'Winners',   Icon: Trophy },
  { path: '/admin/reports',   label: 'Reports',   Icon: BarChart2 },
];

const AdminLayout = ({ children, title }) => {
  const location = useLocation();

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 73px)',
      background: '#FAF9F6',
    }}>
      {/* Light sidebar */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: '#FFFFFF',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        padding: '1.5rem 0',
        position: 'sticky',
        top: '73px',
        height: 'calc(100vh - 73px)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Brand header */}
        <div style={{
          padding: '0 1.25rem 1.25rem',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          marginBottom: '0.5rem',
        }}>
          <p style={{
            fontSize: '0.65rem',
            letterSpacing: '0.12em',
            color: '#9ca3af',
            textTransform: 'uppercase',
            fontWeight: 600,
            marginBottom: '0.25rem',
          }}>
            Admin Console
          </p>
          <p style={{ fontWeight: 800, color: '#0D9488', fontSize: '1rem' }}>Digital Heroes</p>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '0.5rem 0' }}>
          {navItems.map(({ path, label, Icon, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 1.25rem',
                  color: isActive ? '#0D9488' : '#4A4A4A',
                  background: isActive ? 'rgba(13,148,136,0.07)' : 'transparent',
                  borderLeft: `3px solid ${isActive ? '#0D9488' : 'transparent'}`,
                  textDecoration: 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  borderRadius: '0 8px 8px 0',
                  margin: '1px 0.5rem 1px 0',
                }}
              >
                <Icon
                  size={16}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#0D9488' : '#6b7280'}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Back link */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(0,0,0,0.06)',
        }}>
          <Link to="/dashboard" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#9ca3af',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 500,
            transition: 'color 0.15s',
          }}>
            <ArrowLeft size={13} strokeWidth={2} />
            Dashboard
          </Link>
        </div>
      </aside>

      {/* Main area */}
      <main style={{
        flex: 1,
        padding: '2.5rem',
        overflow: 'auto',
        minWidth: 0,
      }}>
        {title && (
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#1a1a1a',
              letterSpacing: '-0.3px',
            }}>{title}</h1>
            <div style={{
              height: '3px',
              width: '40px',
              background: 'linear-gradient(90deg, #0D9488, #10b981)',
              marginTop: '0.5rem',
              borderRadius: '2px',
            }} />
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
