import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

const Charities = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['charities'],
    queryFn: async () => {
      const res = await api.get('/charities');
      return res.data.charities;
    }
  });

  return (
    <div className="page">
      <h1 style={{textAlign: 'center', marginBottom: '3rem'}}>Our Charity Partners</h1>
      
      {isLoading ? <p style={{textAlign: 'center'}}>Loading charities...</p> : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem'}}>
          {data?.map(c => (
            <div key={c.id} style={{background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
              <div style={{height: '200px', background: '#eee'}}>
                {c.image_url && <img src={c.image_url} alt={c.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
              </div>
              <div style={{padding: '1.5rem'}}>
                {c.is_featured && <span style={{display: 'inline-block', padding: '0.25rem 0.5rem', background: '#0D9488', color: '#fff', fontSize: '0.75rem', borderRadius: '4px', marginBottom: '0.5rem'}}>Featured Partner</span>}
                <h3 style={{marginBottom: '0.5rem'}}>{c.name}</h3>
                <p style={{color: '#666', fontSize: '0.875rem'}}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Charities;
