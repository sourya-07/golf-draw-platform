import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, accent, sub }) => (
  <div style={{
    background: '#fff', borderRadius: '16px', padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderTop: `4px solid ${accent || '#0D9488'}`,
  }}>
    <p style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#1a1a1a', marginTop: '0.5rem' }}>{value ?? '—'}</p>
    {sub && <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{sub}</p>}
  </div>
);

const AdminOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => { const r = await api.get('/admin/reports'); return r.data; },
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', { limit: 5 }],
    queryFn: async () => { const r = await api.get('/admin/users?limit=5'); return r.data; },
  });

  return (
    <AdminLayout title="Overview">
      {isLoading ? (
        <p>Loading stats...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <StatCard label="Total Users" value={data?.totalUsers} accent="#0D9488" />
            <StatCard label="Active Subscribers" value={data?.activeUsers} accent="#F59E0B" />
            <StatCard label="Total Draws" value={data?.totalDraws} accent="#6366f1" />
            <StatCard label="Verified Winners" value={data?.totalWinners} accent="#ec4899" />
            <StatCard label="Est. Monthly Pool" value={`£${(data?.estimatedMonthlyPool || 0).toFixed(2)}`} accent="#10b981" sub="£2 per active sub" />
          </div>

          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700 }}>Recent Members</h3>
              <Link to="/admin/users" style={{ color: '#0D9488', fontSize: '0.875rem', textDecoration: 'none' }}>View all →</Link>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Name', 'Email', 'Status', 'Plan', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersData?.users?.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600 }}>{u.full_name || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#666', fontSize: '0.875rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span style={{
                        padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                        background: u.subscription_status === 'active' ? '#d1fae5' : '#fee2e2',
                        color: u.subscription_status === 'active' ? '#065f46' : '#991b1b',
                      }}>{u.subscription_status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#666', fontSize: '0.875rem' }}>{u.subscription_plan || '—'}</td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#666', fontSize: '0.875rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            {[
              { label: '+ Create Draw', to: '/admin/draws', color: '#6366f1' },
              { label: '+ Add Charity', to: '/admin/charities', color: '#0D9488' },
              { label: 'Review Winners', to: '/admin/winners', color: '#F59E0B' },
              { label: 'View Reports', to: '/admin/reports', color: '#ec4899' },
            ].map(({ label, to, color }) => (
              <Link key={to} to={to} style={{
                display: 'block', padding: '1rem 1.5rem', background: color, color: '#fff',
                borderRadius: '12px', textDecoration: 'none', fontWeight: 600, textAlign: 'center',
                transition: 'opacity 0.2s',
              }}>{label}</Link>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminOverview;
