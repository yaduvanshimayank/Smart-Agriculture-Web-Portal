import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail } from '../utils/validation.js';
import { 
  Sprout, Mail, ArrowRight, ArrowLeft, AlertTriangle, 
  CheckCircle2, ShieldCheck, Loader2, KeyRound
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !validateEmail(email)) {
      setError('Please provide a valid email format to receive the recovery link.');
      return;
    }

    setSubmitting(true);

    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      // To prevent user enumeration attacks, still display generic confirmation
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-icon">
            <KeyRound size={28} />
          </div>
          <h1 className="auth-title">
            Reset <span style={{ color: 'var(--emerald-main)' }}>Password</span>
          </h1>
          <p className="auth-subtitle">
            Enter the registered email associated with your agricultural account. We'll send you an encrypted password recovery link.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert auth-alert-error" role="alert">
            <AlertTriangle size={18} style={{ color: 'var(--rose-alert)', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Confirmation State */}
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'var(--emerald-bg)',
              border: '2px solid var(--emerald-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-main)',
              margin: '0 auto 1.25rem'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Recovery Link Dispatched
            </h3>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              If an account with the email <strong style={{ color: 'var(--emerald-main)' }}>{email}</strong> exists in our system, you will receive a secure password reset link shortly.
            </p>

            <div style={{
              padding: '0.9rem',
              background: 'var(--bg-subtle)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              Please verify your spam/junk folder if the email does not appear in your primary inbox within 2 minutes.
            </div>

            <Link 
              to="/login" 
              className="auth-btn-primary" 
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          /* Reset Form */
          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="forgot-email" className="auth-label">
                Registered Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={18} className="auth-input-icon" />
                <input
                  id="forgot-email"
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

            <button
              type="submit"
              disabled={submitting}
              className="auth-btn-primary"
              id="forgot-submit-btn"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  <span>Dispatching Link...</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        {!submitted && (
          <div className="auth-footer">
            <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        )}

        {/* Security badge */}
        <div className="auth-security-badge">
          <ShieldCheck size={14} style={{ color: 'var(--emerald-main)' }} />
          <span>One-Time Cryptographic Token via Supabase Auth</span>
        </div>
      </div>
    </div>
  );
}
