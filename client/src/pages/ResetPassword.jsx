import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  getPasswordValidationRules, 
  calculatePasswordStrength 
} from '../utils/validation.js';
import { 
  Sprout, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, 
  AlertTriangle, CheckCircle2, ShieldCheck, Loader2, KeyRound, Check, HelpCircle
} from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);

  const { updatePassword, session, isRecoveryMode, isConfigured } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const rules = getPasswordValidationRules(password);
  const strength = calculatePasswordStrength(password);
  const allRulesPassed = rules.every(r => r.valid);

  // Validate that the user actually arrived with a valid recovery token/session
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';

    const hasRecoveryParam = 
      hash.includes('type=recovery') || 
      search.includes('type=recovery') || 
      hash.includes('access_token') || 
      search.includes('code=') ||
      isRecoveryMode ||
      !!session;

    // In demo mode without configured Supabase, allow testing the reset page freely
    if (!isConfigured || hasRecoveryParam) {
      setIsValidSession(true);
    } else {
      setIsValidSession(false);
    }

    setCheckingLink(false);
  }, [session, isRecoveryMode, isConfigured, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password) {
      setError('Please enter a new password.');
      return;
    }

    if (!allRulesPassed) {
      setError('Your new password must satisfy all security requirements listed below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setSubmitting(true);

    try {
      await updatePassword(password);
      setSuccess('Your password has been successfully updated! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      let msg = err.message || 'Failed to update password. Your recovery link may have expired.';
      if (msg.toLowerCase().includes('token') || msg.toLowerCase().includes('expired')) {
        msg = 'This password recovery link has expired or has already been used. Please request a new link.';
        setIsValidSession(false);
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingLink) {
    return (
      <div className="auth-page-container">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Loader2 size={32} className="auth-spinner" style={{ color: 'var(--emerald-main)', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Verifying cryptographic recovery token...
          </p>
        </div>
      </div>
    );
  }

  // Gracefully handle invalid or expired recovery links
  if (!isValidSession) {
    return (
      <div className="auth-page-container">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--rose-bg)',
            border: '2px solid var(--rose-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--rose-alert)',
            margin: '0 auto 1.25rem'
          }}>
            <AlertTriangle size={32} />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
            Recovery Link Expired or Invalid
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            The password recovery link you used is invalid, has expired, or has already been consumed. For security reasons, recovery tokens are single-use and expire within a short timeframe.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/forgot-password" className="auth-btn-primary" style={{ textDecoration: 'none', justifyContent: 'center' }}>
              Request New Recovery Link
            </Link>
            <Link to="/login" className="auth-link" style={{ fontSize: '0.82rem', marginTop: '6px' }}>
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Set New <span style={{ color: 'var(--emerald-main)' }}>Password</span>
          </h1>
          <p className="auth-subtitle">
            Enter a strong new password to regain full access to your smart agriculture portal.
          </p>
        </div>

        {/* Alerts */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* New Password */}
          <div className="auth-field">
            <label htmlFor="reset-new-password" className="auth-label">
              New Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                placeholder="Enter new strong password"
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

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <div className="password-strength-container">
                <div className="password-strength-bar-bg">
                  <div 
                    className="password-strength-bar-fill"
                    style={{ 
                      width: `${strength.percent}%`,
                      backgroundColor: strength.color
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginTop: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                  <span style={{ color: strength.color, fontWeight: '700' }}>{strength.label}</span>
                </div>

                <div className="password-rules-list">
                  {rules.map((rule) => (
                    <div 
                      key={rule.id}
                      className={`password-rule-item ${rule.valid ? 'rule-passed' : 'rule-pending'}`}
                    >
                      {rule.valid ? (
                        <Check size={12} className="rule-icon-check" />
                      ) : (
                        <span className="rule-dot" />
                      )}
                      <span>{rule.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="auth-field">
            <label htmlFor="reset-confirm-password" className="auth-label">
              Confirm New Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                className="auth-input"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <span style={{ fontSize: '0.74rem', color: 'var(--rose-alert)', marginTop: '4px', display: 'block' }}>
                Passwords do not match
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || (password.length > 0 && !allRulesPassed)}
            className="auth-btn-primary"
            id="reset-submit-btn"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={14} /> Back to Sign In
          </Link>
        </div>

        <div className="auth-security-badge">
          <ShieldCheck size={14} style={{ color: 'var(--emerald-main)' }} />
          <span>New password encrypted immediately on transmission</span>
        </div>
      </div>
    </div>
  );
}
