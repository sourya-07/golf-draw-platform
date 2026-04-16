import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const Home = () => {
  const { user } = useAuth();
  const { isActive, refreshSubscription } = useSubscription();

  const handleSubscribe = async (plan) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      const { data } = await api.post('/payments/create-checkout', { plan });
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert('Failed to start checkout. Check console.');
    }
  };

  return (
    <div className="page homepage">
      <motion.section 
        className="hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', padding: '4rem 0' }}
      >
        <span style={{color: '#0D9488', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.875rem'}}>Digital Heroes Golf Club</span>
        <h1 style={{fontSize: '3.5rem', marginTop: '1rem', marginBottom: '1.5rem'}}>Drive Impact. Win Big.</h1>
        <p style={{fontSize: '1.25rem', color: '#4A4A4A', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.6}}>
          A modern golf performance tracker built for the socially conscious. Track your scores, support leading charities, and enter our monthly prize draw.
        </p>
        
        {isActive ? (
          <a href="/dashboard" className="btn btn-primary" style={{padding: '1rem 2rem', fontSize: '1.125rem'}}>Go to Dashboard</a>
        ) : (
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            <button onClick={() => handleSubscribe('monthly')} className="btn btn-primary" style={{padding: '1rem 2rem', fontSize: '1.125rem'}}>
              Subscribe Monthly — Free
            </button>
            <button onClick={() => handleSubscribe('yearly')} className="btn btn-outline" style={{padding: '1rem 2rem', fontSize: '1.125rem'}}>
              Subscribe Yearly — Free
            </button>
          </div>
        )}
      </motion.section>

      <section style={{margin: '5rem 0'}}>
        <h2 style={{textAlign: 'center', marginBottom: '3rem'}}>How It Works</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
          <div style={{background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <h3>1. Track & Improve</h3>
            <p style={{color: '#4A4A4A'}}>Log up to 5 scores per month as you play. Watch your performance statistics improve.</p>
          </div>
          <div style={{background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <h3>2. Support a Cause</h3>
            <p style={{color: '#4A4A4A'}}>Choose a charity. At least 10% of your subscription goes directly to your chosen cause.</p>
          </div>
          <div style={{background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'}}>
            <h3>3. Win the Draw</h3>
            <p style={{color: '#4A4A4A'}}>Your 5 latest scores become your lottery numbers for our monthly algorithmic draw.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
