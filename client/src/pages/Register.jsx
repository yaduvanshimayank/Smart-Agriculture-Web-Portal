import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  validateEmail, 
  getPasswordValidationRules, 
  calculatePasswordStrength 
} from '../utils/validation.js';
import { 
  Sprout, User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  AlertTriangle, CheckCircle2, ShieldCheck, Loader2, Sparkles, Check, X, MailCheck
} from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { signUp, isConfigured } = useAuth();
  const navigate = useNavigate();

  const rules = getPasswordValidationRules(password);
  const strength = calculatePasswordStrength(password);
  const allRulesPassed = rules.every(r => r.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setVerificationPending(false);

    // 1. Validation checks
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full legal or operating name (at least 2 characters).');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      setError('Please provide a valid email address (e.g. farmer@agriportal.org).');
      return;
    }

    if (!allRulesPassed) {
      setError('Please ensure your password satisfies all security requirements shown below.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await signUp({
        email,
        password,
        fullName: fullName.trim(),
        rememberMe: true
      });

      if (res?.needsEmailVerification) {
        setVerificationPending(true);
        setSuccess(`Verification email sent to ${email}. Please check your inbox to confirm your account.`);
      } else {
        setSuccess('Account created successfully! Preparing your precision agriculture dashboard...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1200);
      }
    } catch (err) {
      console.error('Registration error:', err);
      let msg = err.message || 'Unable to complete registration. Please try again.';
      const lower = msg.toLowerCase();
      if (lower.includes('already registered') || lower.includes('unique constraint') || lower.includes('user already exists')) {
        msg = 'An account with this email address already exists. Please log in instead or use Forgot Password.';
      } else if (lower.includes('email rate limit') || lower.includes('rate limit') || err.code === 'over_email_send_rate_limit' || err.status === 429) {
        msg = "Supabase Free Tier email rate limit reached (3 emails/hour limit). To register immediately without waiting, please turn OFF 'Confirm email' in your Supabase Dashboard: Authentication > Providers > Email, then click Save.";
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // If email verification is pending, show high-clarity notification card
  if (verificationPending) {
    return (
      <div className="auth-page-container">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--emerald-bg)',
            border: '2px solid var(--emerald-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald-main)',
            margin: '0 auto 1.25rem'
          }}>
            <MailCheck size={32} />
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.6rem' }}>
            Verify Your Email
          </h2>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            We have dispatched an activation link to <br />
            <strong style={{ color: 'var(--emerald-main)' }}>{email}</strong>.<br />
            Please click the link in your email to activate your account and start managing your precision telemetry mesh.
          </p>

          <div style={{
            padding: '1rem',
            background: 'var(--bg-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            textAlign: 'left'
          }}>
            <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
              Didn't receive the email?
            </div>
            Check your spam/junk folder, or verify that your email address was typed correctly.
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <Link to="/login" className="auth-btn-primary" style={{ textDecoration: 'none', width: 'auto', padding: '0.75rem 1.5rem' }}>
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
            <Sprout size={28} />
          </div>
          <h1 className="auth-title">
            Create Portal <span style={{ color: 'var(--emerald-main)' }}>Account</span>
          </h1>
          <p className="auth-subtitle">
            Join the precision agriculture network to automate irrigation, diagnose crops, and monitor telemetry.
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
          {/* Full Name */}
          <div className="auth-field">
            <label htmlFor="register-name" className="auth-label">
              Full Name / Operator Name
            </label>
            <div className="auth-input-wrapper">
              <User size={18} className="auth-input-icon" />
              <input
                id="register-name"
                type="text"
                name="name"
                autoComplete="name"
                placeholder="e.g. Harpreet Singh"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={submitting}
                className="auth-input"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="auth-field">
            <label htmlFor="register-email" className="auth-label">
              Email Address
            </label>
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                id="register-email"
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
            <label htmlFor="register-password" className="auth-label">
              Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="new-password"
                autoComplete="new-password"
                placeholder="Create strong password"
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

                {/* Password Criteria Checklist */}
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

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="register-confirm-password" className="auth-label">
              Confirm Password
            </label>
            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Re-enter password"
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
            id="register-submit-btn"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="auth-spinner" />
                <span>Registering Account & Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <Link to="/login" className="auth-link">
            Sign In here
          </Link>
        </div>

        {/* Security badge */}
        <div className="auth-security-badge">
          <ShieldCheck size={14} style={{ color: 'var(--emerald-main)' }} />
          <span>Passkeys & Hashes encrypted with Argon2/Bcrypt via Supabase</span>
        </div>
      </div>
    </div>
  );
}
