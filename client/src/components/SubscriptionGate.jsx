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
      <div className="page" style={{textAlign: 'center', marginTop: '4rem'}}>
        <h2>Subscription Required</h2>
        <p>You need an active subscription to access the dashboard and enter scores.</p>
        <br/>
        <a href="/" className="btn btn-primary">View Pricing</a>
      </div>
    );
  }

  return children;
};

export default SubscriptionGate;
