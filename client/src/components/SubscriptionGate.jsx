import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { Navigate } from 'react-router-dom';

const SubscriptionGate = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isActive, loading: subLoading } = useSubscription();

  if (authLoading || subLoading) {
    return <div className="page loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isActive) {
    // If user is logged in but has no active sub, redirect home or pricing
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
