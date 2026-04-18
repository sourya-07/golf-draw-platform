import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const statusStyles = {
  pending:  { bg: '#fef3c7', color: '#92400e' },
  approved: { bg: '#d1fae5', color: '#065f46' },
  rejected: { bg: '#fee2e2', color: '#991b1b' },
};
const payoutStyles = {
  pending: { bg: '#f3f4f6', color: '#374151' },
  paid:    { bg: '#d1fae5', color: '#065f46' },
};

const AdminWinners = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['adminWinners'],
    queryFn: async () => { const r = await api.get('/admin/winners'); return r.data; },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/admin/winners/${id}/verify`, { status }),
    onSuccess: () => qc.invalidateQueries(['adminWinners']),
  });

  const payoutMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/winners/${id}/payout`),
    onSuccess: () => qc.invalidateQueries(['adminWinners']),
  });

  return (
    <AdminLayout title="Winners Management">
      {isLoading ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!data?.winners?.length && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#888' }}>
              No winners yet. Winners appear after a draw is published.
            </div>
          )}
          {data?.winners?.map(w => {
            const vs = statusStyles[w.status] || statusStyles.pending;
            const ps = payoutStyles[w.payout_status] || payoutStyles.pending;
            return (
              <div key={w.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ fontWeight: 700 }}>{w.user?.full_name || 'Unknown'} <span style={{ color: '#888', fontWeight: 400 }}>— {w.user?.email}</span></p>
                    <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Draw: {w.draw_entry?.draw?.draw_month?.slice(0, 7)} · Tier: <strong>{w.draw_entry?.prize_tier || '—'}</strong> · Prize: <strong>£{w.draw_entry?.prize_amount || '0'}</strong>
                    </p>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      Submitted: {w.created_at ? new Date(w.created_at).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: vs.bg, color: vs.color }}>
                      Verification: {w.status}
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, background: ps.bg, color: ps.color }}>
                      Payout: {w.payout_status}
                    </span>
                  </div>
                </div>

                {w.proof_image_url && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Proof submitted:</p>
                    <a href={w.proof_image_url} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-block', background: '#f8f9fa', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', color: '#0D9488', textDecoration: 'none' }}>
                      📎 View Proof
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                  {w.status === 'pending' && (
                    <>
                      <button onClick={() => verifyMutation.mutate({ id: w.id, status: 'approved' })}
                        style={{ padding: '6px 16px', background: '#0D9488', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => verifyMutation.mutate({ id: w.id, status: 'rejected' })}
                        style={{ padding: '6px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                  {w.status === 'approved' && w.payout_status === 'pending' && (
                    <button onClick={() => { if (confirm('Mark payout as completed?')) payoutMutation.mutate(w.id); }}
                      style={{ padding: '6px 16px', background: '#F59E0B', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                      💰 Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminWinners;
