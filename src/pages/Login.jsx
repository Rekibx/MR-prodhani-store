import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { FiLock, FiMail, FiUserPlus } from 'react-icons/fi';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, authError, isAuthenticated } = useAuth();
  const [localError, setLocalError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const origin = location.state?.from?.pathname || '/shop';
      navigate(origin, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLocalError('');
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Automatically logged in after sign up
        if (email.toLowerCase() === 'admin@mrprodhani.com') {
          import('firebase/database').then(({ ref, set }) => {
            import('../firebase/config').then(({ db }) => {
              set(ref(db, `admins/${userCredential.user.uid}`), true).catch(console.error);
            });
          });
        }
      } else {
        await login(email, password);
      }
    } catch (error) {
      if (isSignUp) {
        setLocalError(error.message || 'Failed to create account.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="gradient-text">
          {isSignUp ? <FiUserPlus style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> : <FiLock style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />}
          {isSignUp ? 'Create Account' : 'Account Login'}
        </h1>
        <p className="subtitle">{isSignUp ? 'Sign up to place orders' : 'Sign in to your account'}</p>

        <form className="login-form" onSubmit={handleSubmit}>
          {(authError || localError) && <div className="login-error">{localError || authError}</div>}

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
            {isLoggingIn ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => { setIsSignUp(!isSignUp); setLocalError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
