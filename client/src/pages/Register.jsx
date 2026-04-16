import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ email, password, full_name: fullName });
      // auto login after register
      await login(email, password);
      // Redirect to home or pricing selection
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="page auth-page" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <h1>Join the Club</h1>
      <p style={{marginBottom: '2rem'}}>Start driving impact today.</p>
      {error && <p style={{color: 'red'}}>{error}</p>}
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <input 
          type="text" 
          placeholder="Full Name" 
          value={fullName} 
          onChange={(e)=>setFullName(e.target.value)} 
          required 
          style={{padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc'}}
        />
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)} 
          required 
          style={{padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc'}}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)} 
          required 
          style={{padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc'}}
        />
        <button type="submit" className="btn btn-primary">Create Account</button>
      </form>
      <p style={{marginTop: '1rem', textAlign: 'center'}}>
        Already registered? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
