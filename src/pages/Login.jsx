import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLock, FiMail } from 'react-icons/fi';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, authError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(email, password);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="gradient-text">
          <FiLock style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Admin Login
        </h1>
        <p className="subtitle">Use your Firebase credentials for access</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {authError && <div className="login-error">{authError}</div>}

          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
              <input
                id="login-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{ paddingLeft: '3rem' }}
              />
            </div>
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

          <button type="submit" className="login-btn" disabled={isLoggingIn}>
            {isLoggingIn ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
