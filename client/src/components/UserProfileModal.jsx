import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  X, User, Mail, MapPin, Shield, Phone, Calendar, 
  Check, Save, Loader2, LogOut, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, onShowToast }) {
  const { user, profile, updateProfile, signOut } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [farmName, setFarmName] = useState(profile?.farm_name || 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [role, setRole] = useState(profile?.role || 'Agricultural Lead & Farm Manager');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile({
        full_name: fullName.trim(),
        farm_name: farmName,
        phone: phone.trim(),
        role: role.trim()
      });
      setSaveSuccess(true);
      if (onShowToast) {
        onShowToast('Profile preferences synchronized with Supabase database', 'success');
      }
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      if (onShowToast) {
        onShowToast(`Failed to save: ${err.message}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 15, 10, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-emerald)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-elevated)',
        padding: '1.75rem'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'var(--emerald-bg)',
              color: 'var(--emerald-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Operator Profile & Settings
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Supabase User UUID: <code style={{ fontSize: '0.7rem' }}>{user?.id?.slice(0, 13)}...</code>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {saveSuccess && (
          <div className="auth-alert auth-alert-success" style={{ marginBottom: '1rem' }}>
            <CheckCircle2 size={16} />
            <span>Profile successfully updated in Supabase PostgreSQL!</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Full Name */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-input-icon" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="auth-input"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Account Email (Supabase Auth)
              </label>
              <div className="auth-input-wrapper" style={{ opacity: 0.75 }}>
                <Mail size={16} className="auth-input-icon" />
                <input
                  type="email"
                  value={user?.email || profile?.email || ''}
                  disabled
                  className="auth-input"
                  style={{ cursor: 'not-allowed', backgroundColor: 'var(--bg-subtle)' }}
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Agronomy Role / Title
              </label>
              <div className="auth-input-wrapper">
                <Shield size={16} className="auth-input-icon" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="auth-input"
                  placeholder="e.g. Chief Agronomist & Telemetry Lead"
                />
              </div>
            </div>

            {/* Primary Farm Location */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Primary Farm Location
              </label>
              <div className="auth-input-wrapper">
                <MapPin size={16} className="auth-input-icon" />
                <select
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="auth-input"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="Punjab Agro-Hub — Ludhiana (Alluvial Basin)">Punjab Agro-Hub — Ludhiana (Alluvial Basin)</option>
                  <option value="Maharashtra Deccan Agri-Zone — Vidarbha (Black Cotton Soil)">Maharashtra Deccan Agri-Zone — Vidarbha (Black Cotton Soil)</option>
                  <option value="Gujarat Saurashtra Organic Block — Rajkot (Semi-Arid Drip)">Gujarat Saurashtra Organic Block — Rajkot (Semi-Arid Drip)</option>
                  <option value="Uttar Pradesh Gangetic Farm — Varanasi (Sugarcane & Rice)">Uttar Pradesh Gangetic Farm — Varanasi (Sugarcane & Rice)</option>
                  <option value="Karnataka Precision Polyhouse — Bengaluru Rural (Red Laterite Soil)">Karnataka Precision Polyhouse — Bengaluru Rural (Red Laterite Soil)</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Emergency Alert Phone (SMS Telemetry)
              </label>
              <div className="auth-input-wrapper">
                <Phone size={16} className="auth-input-icon" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="auth-input"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Meta Information */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.85rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: '8px',
              fontSize: '0.76rem',
              color: 'var(--text-muted)'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={13} />
                Joined: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active'}
              </span>
              <span style={{ color: 'var(--emerald-main)', fontWeight: '600' }}>
                RLS: Protected
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'transparent',
                  color: 'var(--rose-alert)',
                  border: '1px solid var(--rose-border)',
                  padding: '0.55rem 0.9rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    padding: '0.55rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="auth-btn-primary"
                  style={{ width: 'auto', padding: '0.55rem 1.2rem', fontSize: '0.82rem' }}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="auth-spinner" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
