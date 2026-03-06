import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign in');
    }
  };

  return (
    <div className="container">
      <div className="form">
        <h1 className="title">SpendWise</h1>
        <p className="subtitle">AI-driven personal finance insights</p>

        {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="demo-section">
            <p className="demo-title">Demo accounts:</p>
            <p className="demo-line">Admin: admin@spendwise.com</p>
            <p className="demo-line">User: sarah@example.com</p>
            <p className="demo-note">Password: demo123</p>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <p className="footer">
            Don't have an account? <Link to="/signup" className="link">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;