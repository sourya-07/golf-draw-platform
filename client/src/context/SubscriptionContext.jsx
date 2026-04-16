import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['subscriptionSettings'],
    queryFn: async () => {
      if (!user) return null;
      const res = await api.get('/payments/status');
      return res.data;
    },
    enabled: !!user, // only fetch if logged in
  });

  const value = {
    status: data?.subscription_status || 'inactive',
    plan: data?.subscription_plan,
    isActive: data?.subscription_status === 'active',
    loading: isLoading,
    refreshSubscription: refetch,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
