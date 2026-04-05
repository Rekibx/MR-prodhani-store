import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLock } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect via effect
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="gradient-text">
          <FiLock style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Admin Login
        </h1>
        <p className="subtitle">Enter your credentials to access the dashboard</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {authError && <div className="login-error">{authError}</div>}

          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
