import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const Metric = ({ label, value, sub, accent }) => (
  <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderLeft: `5px solid ${accent || '#0D9488'}` }}>
    <p style={{ fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    <p style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', marginTop: '0.5rem' }}>{value ?? '—'}</p>
    {sub && <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>{sub}</p>}
  </div>
);

const AdminReports = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => { const r = await api.get('/admin/reports'); return r.data; },
    refetchInterval: 30000, // refresh every 30s
  });

  const activeRate = data?.totalUsers ? Math.round((data.activeUsers / data.totalUsers) * 100) : 0;

  return (
    <AdminLayout title="Reports & Analytics">
      {isLoading ? <p>Loading...</p> : (
        <>
          {/* Key Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <Metric label="Total Users" value={data?.totalUsers} accent="#0D9488" sub={`${activeRate}% active`} />
            <Metric label="Active Subscribers" value={data?.activeUsers} accent="#F59E0B" sub="Paying members" />
            <Metric label="Inactive Users" value={(data?.totalUsers || 0) - (data?.activeUsers || 0)} accent="#e5e7eb" />
            <Metric label="Total Draws Run" value={data?.totalDraws} accent="#6366f1" />
            <Metric label="Verified Winners" value={data?.totalWinners} accent="#ec4899" />
            <Metric label="Est. Monthly Prize Pool" value={`£${(data?.estimatedMonthlyPool || 0).toFixed(2)}`} accent="#10b981" sub="Based on £2/subscriber" />
          </div>

          {/* Conversion bar */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Subscriber Conversion Rate</h3>
            <div style={{ background: '#f0f0f0', borderRadius: '999px', height: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${activeRate}%`, background: 'linear-gradient(90deg, #0D9488, #10b981)', height: '100%', borderRadius: '999px', transition: 'width 0.6s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
              <span>{data?.activeUsers} active</span>
              <span>{activeRate}%</span>
              <span>{data?.totalUsers} total</span>
            </div>
          </div>

          {/* Charity Allocations */}
          {data?.charityAllocations?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Charity Allocation Breakdown</h3>
              <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                {data.charityAllocations.length} active subscribers with charity allocations
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {/* Group by charity_percentage */}
                {Object.entries(
                  data.charityAllocations.reduce((acc, u) => {
                    const pct = u.charity_percentage || 10;
                    acc[pct] = (acc[pct] || 0) + 1;
                    return acc;
                  }, {})
                ).sort(([a], [b]) => a - b).map(([pct, count]) => (
                  <div key={pct} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '1rem 1.5rem', textAlign: 'center', minWidth: '100px' }}>
                    <p style={{ fontWeight: 800, fontSize: '1.5rem', color: '#0D9488' }}>{pct}%</p>
                    <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>{count} user{count !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
