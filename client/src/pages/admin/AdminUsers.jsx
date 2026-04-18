import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import AdminLayout from './AdminLayout';

const badge = (status) => {
  const map = {
    active: ['#d1fae5', '#065f46'],
    inactive: ['#f3f4f6', '#374151'],
    cancelled: ['#fee2e2', '#991b1b'],
    lapsed: ['#fef3c7', '#92400e'],
  };
  const [bg, color] = map[status] || ['#f3f4f6', '#374151'];
  return (
    <span style={{ padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: bg, color }}>
      {status}
    </span>
  );
};

const AdminUsers = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', search, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: 50 });
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      const r = await api.get(`/admin/users?${params}`);
      return r.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => api.put(`/admin/users/${id}`, updates),
    onSuccess: () => { qc.invalidateQueries(['adminUsers']); setEditUser(null); },
  });

  const openEdit = (user) => { setEditUser(user); setEditForm({ full_name: user.full_name, subscription_status: user.subscription_status, is_admin: user.is_admin }); };

  return (
    <AdminLayout title="User Management">
      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '0.6rem 1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="cancelled">Cancelled</option>
          <option value="lapsed">Lapsed</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {isLoading ? <p style={{ padding: '2rem' }}>Loading...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                {['Name', 'Email', 'Status', 'Plan', 'Admin', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.users?.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f8f9fa' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{u.full_name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#666', fontSize: '0.875rem' }}>{u.email}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>{badge(u.subscription_status)}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#666', fontSize: '0.875rem' }}>{u.subscription_plan || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>{u.is_admin ? '✅' : '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', color: '#666', fontSize: '0.875rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <button onClick={() => openEdit(u)} style={{ padding: '4px 12px', border: '1px solid #0D9488', color: '#0D9488', borderRadius: '6px', background: 'transparent', cursor: 'pointer', fontSize: '0.8rem' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ padding: '1rem', borderTop: '1px solid #f0f0f0', color: '#888', fontSize: '0.8rem' }}>
          {data?.total || 0} total users
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '400px', maxWidth: '90vw' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Edit User: {editUser.email}</h3>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Full Name</span>
              <input value={editForm.full_name || ''} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </label>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '4px' }}>Subscription Status</span>
              <select value={editForm.subscription_status || ''} onChange={e => setEditForm(f => ({ ...f, subscription_status: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="cancelled">Cancelled</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!editForm.is_admin} onChange={e => setEditForm(f => ({ ...f, is_admin: e.target.checked }))} />
              <span style={{ fontSize: '0.9rem' }}>Admin privileges</span>
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => updateMutation.mutate({ id: editUser.id, updates: editForm })}
                className="btn btn-primary" style={{ flex: 1 }} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditUser(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
