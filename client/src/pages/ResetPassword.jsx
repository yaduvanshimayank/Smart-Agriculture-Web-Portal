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
  const [urlError, setUrlError] = useState('');

  // Demo & Manual OTP verification states
  const [demoEmail, setDemoEmail] = useState('');
  const [manualOtpMode, setManualOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const { 
    updatePassword, 
    verifyRecoveryOtp, 
    exchangeRecoveryCode, 
    session, 
    loading, 
    isRecoveryMode, 
    isConfigured 
  } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  const rules = getPasswordValidationRules(password);
  const strength = calculatePasswordStrength(password);
  const allRulesPassed = rules.every(r => r.valid);

  // Validate recovery tokens, PKCE codes, and active sessions
  useEffect(() => {
    let active = true;

    async function evaluateRecoveryState() {
      // If auth state is still initializing from storage, wait
      if (loading) return;

      const searchParams = new URLSearchParams(location.search);
      const hash = window.location.hash || '';

      // 1. Check for demo email parameter
      const demoParam = searchParams.get('demo_email');
      if (demoParam) {
        if (!active) return;
        setDemoEmail(demoParam);
        setIsValidSession(true);
        setCheckingLink(false);
        return;
      }

      // Check if email was passed in query
      const emailQuery = searchParams.get('email');
      if (emailQuery) {
        setOtpEmail(emailQuery);
      }

      // 2. Check for explicit error parameters from Supabase redirect
      const errorDesc = searchParams.get('error_description');
      const hashErrorDesc = hash.includes('error_description=') 
        ? decodeURIComponent(hash.split('error_description=')[1].split('&')[0].replace(/\+/g, ' '))
        : '';

      if (errorDesc || hashErrorDesc) {
        if (!active) return;
        setUrlError(errorDesc || hashErrorDesc || 'The password recovery link has expired or is invalid.');
        setIsValidSession(false);
        setCheckingLink(false);
        return;
      }

      // 3. Handle PKCE code parameter (?code=...)
      const code = searchParams.get('code');
      if (code && exchangeRecoveryCode) {
        try {
          await exchangeRecoveryCode(code);
          if (!active) return;
          setIsValidSession(true);
          setCheckingLink(false);
          return;
        } catch (exchangeErr) {
          console.warn('PKCE code exchange error:', exchangeErr.message);
          // If code exchange failed (e.g. cross-browser/device link click without verifier),
          // offer manual OTP / token fallback rather than a hard failure
          if (!active) return;
          setUrlError(exchangeErr.message || 'Unable to exchange verification code. You can enter an OTP code directly below.');
          setManualOtpMode(true);
          setCheckingLink(false);
          return;
        }
      }

      // 4. Check for active recovery session or recovery mode
      const hasRecoveryTokenInHash = 
        hash.includes('type=recovery') || 
        hash.includes('access_token=');

      if (session || isRecoveryMode || hasRecoveryTokenInHash || !isConfigured) {
        if (!active) return;
        setIsValidSession(true);
        setCheckingLink(false);
        return;
      }

      // If no valid session or parameters were found
      if (!active) return;
      setIsValidSession(false);
      setCheckingLink(false);
    }

    evaluateRecoveryState();

    return () => {
      active = false;
    };
  }, [loading, session, isRecoveryMode, isConfigured, location, exchangeRecoveryCode]);

  // Handle manual OTP code verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setUrlError('');

    if (!otpEmail.trim()) {
      setError('Please provide your registered account email.');
      return;
    }
    if (!otpToken.trim()) {
      setError('Please enter the 6-digit OTP or recovery token.');
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyRecoveryOtp({ email: otpEmail, token: otpToken });
      setIsValidSession(true);
      setManualOtpMode(false);
      setSuccess('Recovery token verified! You can now set your new password.');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err.message || 'Invalid or expired OTP token. Please check the code or request a new one.');
    } finally {
      setVerifyingOtp(false);
    }
  };

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
      await updatePassword(password, demoEmail || otpEmail);
      setSuccess('Your password has been successfully updated! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1800);
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

  if (checkingLink || loading) {
    return (
      <div className="auth-page-container">
        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <Loader2 size={36} className="auth-spinner" style={{ color: 'var(--emerald-main)', margin: '0 auto 1.25rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
            Securing Cryptographic Handshake
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Validating cryptographic recovery token & establishing secure session...
          </p>
        </div>
      </div>
    );
  }

  // Handle manual OTP entry or fallback
  if (manualOtpMode || (!isValidSession && !urlError)) {
    return (
      <div className="auth-page-container">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-icon">
              <KeyRound size={28} />
            </div>
            <h1 className="auth-title">
              Enter <span style={{ color: 'var(--emerald-main)' }}>Recovery Token</span>
            </h1>
            <p className="auth-subtitle">
              Enter your account email and the 6-digit recovery code or token from your confirmation email.
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertTriangle size={18} style={{ color: 'var(--rose-alert)', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="auth-form" noValidate>
            <div className="auth-field">
              <label htmlFor="otp-email" className="auth-label">
                Account Email
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="otp-email"
                  type="email"
                  placeholder="operator@farmmesh.in"
                  value={otpEmail}
                  onChange={(e) => setOtpEmail(e.target.value)}
                  disabled={verifyingOtp}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="otp-token" className="auth-label">
                6-Digit Recovery Token / OTP
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="otp-token"
                  type="text"
                  placeholder="e.g. 123456"
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value)}
                  disabled={verifyingOtp}
                  className="auth-input"
                  style={{ letterSpacing: '2px', fontWeight: '700' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={verifyingOtp}
              className="auth-btn-primary"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 size={18} className="auth-spinner" />
                  <span>Verifying Token...</span>
                </>
              ) : (
                <>
                  <span>Verify & Proceed to Set Password</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.82rem' }}>
              Request a new recovery email
            </Link>
            <Link to="/login" className="auth-link" style={{ fontSize: '0.82rem' }}>
              Return to Sign In
            </Link>
          </div>
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

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            {urlError || 'The password recovery link you used is invalid, has expired, or has already been consumed. For security reasons, recovery tokens are single-use and expire within a short timeframe.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                setUrlError('');
                setManualOtpMode(true);
              }}
              className="auth-btn-primary"
              style={{ justifyContent: 'center' }}
            >
              Enter OTP Code or Token Manually
            </button>

            <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.82rem', marginTop: '4px' }}>
              Request New Recovery Link
            </Link>
            <Link to="/login" className="auth-link" style={{ fontSize: '0.82rem' }}>
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
