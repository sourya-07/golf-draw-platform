import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import SubscriptionGate from '../components/SubscriptionGate';

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newScore, setNewScore] = useState('');
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch scores — only if user is logged in
  const { data, isLoading } = useQuery({
    queryKey: ['scores'],
    queryFn: async () => {
      const res = await api.get('/scores');
      return res.data.scores;
    },
    enabled: !!user,
  });

  // Add score mutation
  const addMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/scores', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scores']);
      setNewScore('');
      setErrorMsg('');
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to add score');
    }
  });

  // Delete score mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => api.delete(`/scores/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['scores'])
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newScore || !scoreDate) return;
    addMutation.mutate({ score: parseInt(newScore), score_date: scoreDate });
  };

  return (
    <SubscriptionGate>
      <div className="page dashboard">
        <h1 style={{marginBottom: '2rem'}}>Welcome to the Clubhouse, {user?.full_name || 'Golfer'}</h1>
        
        <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', alignItems: 'start'}}>
          
          <div style={{background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <h2>My Scores (Active Entry)</h2>
            <p style={{color: '#4A4A4A', marginBottom: '1.5rem'}}>These 5 scores will be entered into the next draw.</p>
            
            <form onSubmit={handleAdd} style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
              <input 
                type="number" min="1" max="45" placeholder="Score (1-45)" 
                value={newScore} onChange={e=>setNewScore(e.target.value)} required
                style={{padding: '0.5rem', flex: 1}}
              />
              <input 
                type="date" value={scoreDate} onChange={e=>setScoreDate(e.target.value)} required
                style={{padding: '0.5rem'}}
              />
              <button type="submit" className="btn btn-primary" disabled={addMutation.isPending}>
                {addMutation.isPending ? 'Adding...' : 'Add Score'}
              </button>
            </form>
            {errorMsg && <p style={{color: 'red', marginBottom: '1rem'}}>{errorMsg}</p>}

            {isLoading ? <p>Loading scores...</p> : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                {data?.length === 0 ? <p>No scores entered yet.</p> : null}
                {data?.map(s => (
                  <div key={s.id} style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', background: '#F8F9FA', borderRadius: '8px'}}>
                    <div>
                      <strong style={{fontSize: '1.25rem', color: '#0D9488'}}>{s.score}</strong> 
                      <span style={{marginLeft: '1rem', color: '#666'}}>{s.score_date}</span>
                    </div>
                    <button onClick={() => deleteMutation.mutate(s.id)} className="btn btn-outline" style={{padding: '0.25rem 0.75rem'}}>Delete</button>
                  </div>
                ))}
              </div>
            )}
            
            <p style={{marginTop: '2rem', fontSize: '0.875rem', color: '#666'}}>
              * Note: Only your latest 5 entries are kept. Adding a 6th will automatically remove your oldest entry.
            </p>
          </div>

          <div style={{display: 'grid', gap: '2rem'}}>
            <div style={{background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <h3>My Charity Impact</h3>
              <p style={{color: '#4A4A4A', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                You are contributing {user?.charity_percentage || 10}% of your fee.
              </p>
            </div>
            <div style={{background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '2px solid #0D9488'}}>
              <h3 style={{color: '#0D9488'}}>Upcoming Draw</h3>
              <p style={{marginTop: '0.5rem'}}>Status: <strong>Active</strong></p>
            </div>
          </div>
          
        </div>
      </div>
    </SubscriptionGate>
  );
};

export default Dashboard;
