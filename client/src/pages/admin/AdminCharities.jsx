import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const AdminCharities = () => {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', is_featured: false });

  const { data, isLoading } = useQuery({
    queryKey: ['adminCharities'],
    queryFn: async () => { const r = await api.get('/charities'); return r.data; },
  });

  const createMutation = useMutation({
    mutationFn: (payload) => api.post('/admin/charities', payload),
    onSuccess: () => { qc.invalidateQueries(['adminCharities']); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => api.put(`/admin/charities/${id}`, payload),
    onSuccess: () => { qc.invalidateQueries(['adminCharities']); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/charities/${id}`),
    onSuccess: () => qc.invalidateQueries(['adminCharities']),
  });

  const featuredMutation = useMutation({
    mutationFn: (id) => api.put(`/admin/charities/${id}/feature`),
    onSuccess: () => qc.invalidateQueries(['adminCharities']),
  });

  const resetForm = () => { setShowForm(false); setEditItem(null); setForm({ name: '', description: '', image_url: '', is_featured: false }); };
  const openEdit = (c) => { setEditItem(c); setForm({ name: c.name, description: c.description || '', image_url: c.image_url || '', is_featured: c.is_featured }); setShowForm(true); };

  const handleSubmit = () => {
    if (editItem) updateMutation.mutate({ id: editItem.id, payload: form });
    else createMutation.mutate(form);
  };

  return (
    <AdminLayout title="Charity Management">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Charity</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '480px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editItem ? 'Edit Charity' : 'Add New Charity'}</h3>
            {[
              { label: 'Name *', key: 'name', type: 'text' },
              { label: 'Image URL', key: 'image_url', type: 'url' },
            ].map(({ label, key, type }) => (
              <label key={key} style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>{label}</span>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
              </label>
            ))}
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Description</span>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', resize: 'vertical' }} />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} />
              <span style={{ fontSize: '0.9rem' }}>Featured charity</span>
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 1 }}
                disabled={createMutation.isPending || updateMutation.isPending}>
                {editItem ? 'Update' : 'Create'}
              </button>
              <button onClick={resetForm} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Charity Grid */}
      {isLoading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {data?.charities?.map(c => (
            <div key={c.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              {c.image_url && <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />}
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</h3>
                  {c.is_featured && <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '999px', fontWeight: 600 }}>Featured</span>}
                </div>
                <p style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{c.description?.slice(0, 80)}...</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  <button onClick={() => openEdit(c)} style={{ padding: '4px 12px', border: '1px solid #0D9488', color: '#0D9488', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => featuredMutation.mutate(c.id)} style={{ padding: '4px 12px', border: '1px solid #F59E0B', color: '#F59E0B', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>
                    {c.is_featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }}
                    style={{ padding: '4px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCharities;
