import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

// Pages
import Home from './pages/Home';
import Charities from './pages/Charities';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const queryClient = new QueryClient();

const Navigation = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className="navbar">
      <div className="logo">Digital Heroes</div>
      <nav>
        <a href="/">Home</a>
        <a href="/charities">Charities</a>
        {user ? (
          <>
            <a href="/dashboard">Dashboard</a>
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </>
        ) : (
          <a href="/login" className="btn btn-primary">Login</a>
        )}
      </nav>
    </header>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="app-container">
              <Navigation />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/charities" element={<Charities />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
              </main>
              <footer className="footer">
                <p>&copy; {new Date().getFullYear()} Digital Heroes Golf Club</p>
              </footer>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
