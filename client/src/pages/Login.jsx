import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail } from '../utils/validation.js';
import { 
  Sprout, Mail, Lock, Eye, EyeOff, ArrowRight, 
  AlertTriangle, CheckCircle2, ShieldCheck, Loader2, Sparkles, Settings
} from 'lucide-react';

export default function Login({ onOpenConfigModal }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signIn, signInWithDemo, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email format (e.g. farmer@agriportal.org).');
      return;
    }

    if (!password) {
      setError('Please enter your portal password.');
      return;
    }

    setSubmitting(true);

    try {
      await signIn({ email, password, rememberMe });
      setSuccess('Authentication verified! Redirecting to Telemetry Mesh...');
      setTimeout(() => {
        const originPath = location.state?.from?.pathname || '/';
        navigate(originPath, { replace: true });
      }, 500);
    } catch (err) {
      console.error('Login error:', err);
      let msg = err.message || 'Authentication failed. Please check credentials.';
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = 'Invalid email or password. Please verify your credentials and try again.';
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        msg = 'Your email address has not been confirmed yet. Please verify your email inbox.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      {/* Background Accent Gradients */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo-icon">
            <Sprout size={28} />
          </div>
          <h1 className="auth-title">
            AgriSmart <span style={{ color: 'var(--emerald-main)' }}>AI</span>
          </h1>
          <p className="auth-subtitle">
            Sign in to access your IoT telemetry mesh, automated irrigation, and farm intelligence.
          </p>

          {!isConfigured && (
            <div className="auth-setup-notice">
              <Sparkles size={14} style={{ color: 'var(--amber-warning)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <span>Demo mode active. Connect Supabase credentials for production.</span>
              </div>
              {onOpenConfigModal && (
                <button
                  type="button"
                  onClick={onOpenConfigModal}
                  className="auth-config-link-btn"
                  title="Configure Supabase Keys"
                >
                  <Settings size={13} /> Setup
                </button>
              )}
            </div>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertTriangle size={18} style={{ color: 'var(--rose-alert)', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success" role="alert">
            <CheckCircle2 size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email Address */}
          <div className="auth-field">
            <label htmlFor="login-email" className="auth-label">
              Registered Email
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="login-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="operator@farmmesh.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="login-password" className="auth-label">
                Security Password
              </label>
              <Link 
                to="/forgot-password" 
                className="auth-link"
                style={{ fontSize: '0.78rem', fontWeight: '600' }}
              >
                Forgot password?
              </Link>
            </div>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                className="auth-input"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Option */}
          <div className="auth-checkbox-row">
            <label className="auth-checkbox-label">
              <input
                type="checkbox"
                id="login-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-checkbox"
                disabled={submitting}
              />
              <span>Remember this device</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="auth-btn-primary"
            id="login-submit-btn"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Operator Quick Access */}
        <div style={{ margin: '1.25rem 0 0.25rem', textAlign: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.78rem'
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>or explore immediately</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          <button
            type="button"
            id="login-demo-btn"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await signInWithDemo();
                setSuccess('Demo operator session initialized! Opening portal...');
                setTimeout(() => {
                  navigate('/', { replace: true });
                }, 400);
              } catch (err) {
                setError('Failed to initialize demo: ' + err.message);
              } finally {
                setSubmitting(false);
              }
            }}
            style={{
              width: '100%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.8rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed var(--emerald-main)',
              color: 'var(--emerald-main)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={16} />
            <span>Instant Demo Operator Access (1-Click)</span>
          </button>
        </div>

        {/* Card Footer Link */}
        <div className="auth-footer">
          <span>New to AgriSmart Portal?</span>{' '}
          <Link to="/register" className="auth-link">
            Create an Account
          </Link>
        </div>

        {/* Security Assurance Badge */}
        <div className="auth-security-badge">
          <ShieldCheck size={14} style={{ color: 'var(--emerald-main)' }} />
          <span>Secured with Supabase Auth & 256-bit Row-Level Encryption</span>
        </div>
      </div>
    </div>
  );
}
