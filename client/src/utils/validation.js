/**
 * Email and Password validation utilities for AgriSmart Authentication
 */

export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC 5322 compliant regex for web form validation
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return re.test(email.trim());
}

export function getPasswordValidationRules(password = '') {
  return [
    { id: 'length', label: 'At least 8 characters long', valid: password.length >= 8 },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { id: 'number', label: 'One numerical digit (0-9)', valid: /[0-9]/.test(password) },
    { id: 'special', label: 'One special symbol (!@#$%^&*...)', valid: /[^A-Za-z0-9]/.test(password) }
  ];
}

export function calculatePasswordStrength(password = '') {
  if (!password) {
    return { score: 0, label: 'None', color: 'var(--text-dim)', percent: 0 };
  }

  const rules = getPasswordValidationRules(password);
  const passedCount = rules.filter(r => r.valid).length;

  if (passedCount <= 2) {
    return { score: 1, label: 'Weak', color: 'var(--rose-alert)', percent: 25 };
  }
  if (passedCount <= 4) {
    return { score: 2, label: 'Fair / Moderate', color: 'var(--amber-warning)', percent: 65 };
  }
  return { score: 3, label: 'Strong & Secure', color: 'var(--emerald-main)', percent: 100 };
}
