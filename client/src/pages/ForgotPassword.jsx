import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { validateEmail } from '../utils/validation.js';
import { 
  Sprout, Mail, ArrowRight, ArrowLeft, AlertTriangle, 
  CheckCircle2, ShieldCheck, Loader2, KeyRound, Sparkles, HelpCircle
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmed = email.trim();
    if (!trimmed || !validateEmail(trimmed)) {
      setError('Please provide a valid email format to receive the recovery link.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await resetPassword(trimmed);
      setResetResult(res);
      setSubmitted(true);
    } catch (err) {
      console.error('Password reset request error:', err);
      let msg = err.message || 'Unable to dispatch recovery link. Please try again.';
      if (
        err.status === 429 || 
        msg.toLowerCase().includes('rate limit') || 
        msg.toLowerCase().includes('security purposes') ||
        err.code === 'over_email_send_rate_limit'
      ) {
        msg = 'Supabase email rate limit active: Requests are permitted once every 60 seconds (free tier default: max 3/hour). Please wait a moment before trying again, or test with the instant demo reset.';
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('operator@farmmesh.in');
    setError('');
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
            <div style={{ flex: 1, fontSize: '0.84rem', lineHeight: '1.4' }}>
              <span>{error}</span>
              {error.includes('rate limit') && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => navigate('/reset-password?demo_email=operator@farmmesh.in')}
                    className="auth-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: '0.82rem' }}
                  >
                    👉 Click here to test instant password reset with demo account
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Confirmation State */}
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
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

            {resetResult?.isDemo ? (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Local Account Detected
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  The account <strong style={{ color: 'var(--emerald-main)' }}>{email}</strong> is a local demo/test account. You can set a new password directly right now!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
                  <Link 
                    to={`/reset-password?demo_email=${encodeURIComponent(email)}`} 
                    className="auth-btn-primary" 
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Recovery Link Dispatched
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  If an account with the email <strong style={{ color: 'var(--emerald-main)' }}>{email}</strong> exists in our system, you will receive a secure password reset link shortly.
                </p>

                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem',
                  textAlign: 'left',
                  lineHeight: '1.5'
                }}>
                  Please check your spam or junk folder if the email does not appear in your primary inbox within 2 minutes.
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'var(--emerald-bg)',
                  borderRadius: '10px',
                  border: '1px solid var(--emerald-border)',
                  fontSize: '0.82rem',
                  color: 'var(--text-secondary)',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <KeyRound size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Received an OTP or token?</span>
                    <div style={{ marginTop: '4px' }}>
                      <Link 
                        to={`/reset-password?email=${encodeURIComponent(email)}`}
                        className="auth-link"
                        style={{ fontSize: '0.8rem' }}
                      >
                        Click here to enter token & reset password &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Link 
              to="/login" 
              className="auth-link" 
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            >
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Testing demo?</span>
                <button
                  type="button"
                  onClick={handleFillDemo}
                  style={{ background: 'none', border: 'none', color: 'var(--emerald-main)', cursor: 'pointer', fontWeight: '600', padding: 0 }}
                >
                  Use operator@farmmesh.in
                </button>
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
