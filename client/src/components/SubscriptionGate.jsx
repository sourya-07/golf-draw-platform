import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Navigate, useSearchParams } from 'react-router-dom';

const SubscriptionGate = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading, refreshSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const justSubscribed = searchParams.get('subscription') === 'success';

  // Poll for active status after checkout success (webhook may take a few seconds)
  useEffect(() => {
    if (!justSubscribed || isActive) return;

    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(async () => {
      attempts++;
      await refreshSubscription();
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 2000); // poll every 2 seconds up to 20 seconds

    return () => clearInterval(interval);
  }, [justSubscribed, isActive, refreshSubscription]);

  if (authLoading || subLoading) {
    return <div className="page loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user just came back from Stripe checkout, show activating state
  if (!isActive && justSubscribed) {
    return (
      <div className="page" style={{textAlign: 'center', marginTop: '4rem'}}>
        <h2>🎉 Activating Your Subscription...</h2>
        <p style={{marginTop: '1rem', color: '#666'}}>
          Please wait a moment while we confirm your payment.
        </p>
        <div style={{marginTop: '2rem', display: 'flex', justifyContent: 'center'}}>
          <div style={{
            width: '40px', height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#0D9488',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{
          maxWidth: '520px', width: '100%', textAlign: 'center',
          background: '#fff', borderRadius: '24px', padding: '3rem 2.5rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}>
          {/* Lock icon */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0D9488, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2rem',
          }}>🔒</div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '0.75rem' }}>
            Members Only Content
          </h2>

          <p style={{ color: '#666', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
            To see this content, please subscribe to Digital Heroes.
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Join our community of golfers making a difference — track your scores, enter monthly draws, and support the charity of your choice.
          </p>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '2rem', textAlign: 'left' }}>
            {[
              '🏌️  Track your Stableford golf scores',
              '🎯  Enter monthly prize draws automatically',
              '💚  Support your chosen charity every month',
              '🏆  Win real cash prizes and make an impact',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#444' }}>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <a href="/#pricing" className="btn btn-primary" style={{ display: 'block', width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '12px', textDecoration: 'none' }}>
            Subscribe Now — It's Free to Start
          </a>
          <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#aaa' }}>
            No credit card required for your first month.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default SubscriptionGate;
