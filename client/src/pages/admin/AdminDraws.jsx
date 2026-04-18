import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const statusColor = { draft: ['#f3f4f6','#374151'], simulated: ['#fef3c7','#92400e'], published: ['#d1fae5','#065f46'] };

const AdminDraws = () => {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ draw_month: '', draw_type: 'random', jackpot_amount: '' });
  const [simResult, setSimResult] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminDraws'],
    queryFn: async () => { const r = await api.get('/admin/draws'); return r.data; },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/draws', payload),
    onSuccess: () => { qc.invalidateQueries(['adminDraws']); setShowCreate(false); setForm({ draw_month: '', draw_type: 'random', jackpot_amount: '' }); },
  });

  const simulateMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/draws/${id}/simulate`),
    onSuccess: (res) => { qc.invalidateQueries(['adminDraws']); setSimResult(res.data.simulation); },
  });

  const publishMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/draws/${id}/publish`),
    onSuccess: () => qc.invalidateQueries(['adminDraws']),
  });

  return (
    <AdminLayout title="Draw Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowCreate(true)} className="btn btn-primary">+ Create Draw</button>
      </div>

      {/* Create Draw Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '420px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Create New Draw</h3>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Draw Month</span>
              <input type="month" value={form.draw_month} onChange={e => setForm(f => ({ ...f, draw_month: e.target.value + '-01' }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Draw Type</span>
              <select value={form.draw_type} onChange={e => setForm(f => ({ ...f, draw_type: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </label>
            <label style={{ display: 'block', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Jackpot Override (£, optional)</span>
              <input type="number" value={form.jackpot_amount} onChange={e => setForm(f => ({ ...f, jackpot_amount: e.target.value }))}
                placeholder="Auto-calculated if empty"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => createMutation.mutate(form)} className="btn btn-primary" style={{ flex: 1 }} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
              <button onClick={() => setShowCreate(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Result */}
      {simResult && (
        <div style={{ background: '#fff', border: '2px solid #6366f1', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Simulation Result</h3>
            <button onClick={() => setSimResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>×</button>
          </div>
          <p style={{ marginTop: '0.5rem' }}>Winning Numbers: <strong>{simResult.winningNumbers?.join(', ')}</strong></p>
          <p>Total Entries: <strong>{simResult.totalEntries}</strong></p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            {[['5-match', simResult.fiveMatch], ['4-match', simResult.fourMatch], ['3-match', simResult.threeMatch]].map(([tier, count]) => (
              <div key={tier} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '0.75rem 1.25rem', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, fontSize: '1.25rem' }}>{count ?? 0}</p>
                <p style={{ fontSize: '0.75rem', color: '#888' }}>{tier} winners</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draws Table */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '2rem' }}>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Month', 'Type', 'Numbers', 'Status', 'Jackpot', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.draws?.map(d => {
                const [bg, color] = statusColor[d.status] || ['#f3f4f6', '#374151'];
                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{d.draw_month?.slice(0, 7)}</td>
                    <td style={{ padding: '0.875rem 1rem', color: '#666' }}>{d.draw_type}</td>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{d.winning_numbers?.join(' · ')}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: bg, color }}>{d.status}</span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#666' }}>{d.jackpot_amount ? `£${d.jackpot_amount}` : '—'}</td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {d.status === 'draft' && (
                          <button onClick={() => simulateMutation.mutate(d.id)} disabled={simulateMutation.isPending}
                            style={{ padding: '4px 10px', border: '1px solid #6366f1', color: '#6366f1', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Simulate
                          </button>
                        )}
                        {(d.status === 'draft' || d.status === 'simulated') && (
                          <button onClick={() => { if (confirm('Publish this draw? This cannot be undone.')) publishMutation.mutate(d.id); }}
                            disabled={publishMutation.isPending}
                            style={{ padding: '4px 10px', border: '1px solid #0D9488', color: '#0D9488', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.75rem' }}>
                            Publish
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!data?.draws?.length && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No draws yet. Create your first draw above.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDraws;
