import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useContext(AuthContext);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!emailOrUsername.trim() || !password) {
      setError('Please provide all credentials.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(emailOrUsername, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={28} />
          </div>
          <h2 className="auth-title">LeadCenter CRM</h2>
          <p className="auth-subtitle">Sign in to manage client relations</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'hsl(var(--destructive) / 0.15)',
            border: '1px solid hsl(var(--destructive) / 0.3)',
            color: 'hsl(var(--destructive-foreground))',
            padding: '0.75rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <div className="input-container">
              <Mail className="input-icon" size={16} />
              <input
                type="text"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="e.g. admin"
                className="form-input form-input-with-icon"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-container">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="form-input form-input-with-icon"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '1rem' }} disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Admin seed notice banner */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          borderRadius: 'var(--radius)',
          backgroundColor: 'hsl(var(--accent))',
          border: '1px solid hsl(var(--border))',
          fontSize: '0.8rem',
          lineHeight: '1.4'
        }}>
          <div style={{ 
            fontWeight: 700, 
            color: 'hsl(var(--accent-foreground))', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            marginBottom: '0.25rem'
          }}>
            <Sparkles size={14} /> Seeding Account Enabled
          </div>
          <p style={{ color: 'hsl(var(--foreground) / 0.8)' }}>
            A default admin profile has been pre-seeded. Enter:
          </p>
          <div style={{ 
            fontFamily: 'monospace', 
            marginTop: '0.25rem', 
            padding: '0.25rem', 
            backgroundColor: 'hsl(var(--background))', 
            borderRadius: '4px',
            color: 'hsl(var(--foreground))' 
          }}>
            Username: <strong style={{ color: 'hsl(var(--primary))' }}>admin</strong><br/>
            Password: <strong style={{ color: 'hsl(var(--primary))' }}>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
