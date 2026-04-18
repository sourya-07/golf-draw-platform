import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';

// Pages
import Home from './pages/Home';
import Charities from './pages/Charities';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Admin Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';
import AdminReports from './pages/admin/AdminReports';

// Guards
import AdminGate from './components/AdminGate';

const queryClient = new QueryClient();

const Navigation = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="logo">Digital Heroes</div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/charities">Charities</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.is_admin && (
              <Link to="/admin" style={{ color: '#F59E0B', fontWeight: 700 }}>Admin</Link>
            )}
            <button className="btn btn-outline" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary">Login</Link>
        )}
      </nav>
    </header>
  );
};

// Admin uses full-width layout (no max-width container)
const MainContent = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  return (
    <main className={`main-content${isAdmin ? ' admin-full' : ''}`}>
      {children}
    </main>
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
              <MainContent>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<Home />} />
                  <Route path="/charities" element={<Charities />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Subscriber */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Admin — protected by AdminGate */}
                  <Route path="/admin" element={<AdminGate><AdminOverview /></AdminGate>} />
                  <Route path="/admin/users" element={<AdminGate><AdminUsers /></AdminGate>} />
                  <Route path="/admin/draws" element={<AdminGate><AdminDraws /></AdminGate>} />
                  <Route path="/admin/charities" element={<AdminGate><AdminCharities /></AdminGate>} />
                  <Route path="/admin/winners" element={<AdminGate><AdminWinners /></AdminGate>} />
                  <Route path="/admin/reports" element={<AdminGate><AdminReports /></AdminGate>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </MainContent>
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
