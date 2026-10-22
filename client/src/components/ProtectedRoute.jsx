import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Sprout, ShieldCheck, Lock, ArrowRight, UserPlus, 
  Activity, Stethoscope, Droplets, Sparkles, CheckCircle2
} from 'lucide-react';

export function LoadingScreen({ message = 'Verifying Agricultural Mesh Authentication...' }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      color: 'var(--text-main)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
          animation: 'pulse 2s infinite ease-in-out'
        }}>
          <Sprout size={36} />
        </div>
      </div>

      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '0.5rem'
      }}>
        AgriSmart <span style={{ color: 'var(--emerald-main)' }}>AI</span>
      </h3>

      <p style={{
        fontSize: '0.88rem',
        color: 'var(--text-muted)',
        maxWidth: '320px'
      }}>
        {message}
      </p>

      <div style={{
        marginTop: '1.5rem',
        width: '160px',
        height: '4px',
        background: 'var(--bg-subtle)',
        borderRadius: '2px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '50%',
          height: '100%',
          background: 'var(--emerald-main)',
          borderRadius: '2px',
          animation: 'shimmer 1.5s infinite linear'
        }} />
      </div>
    </div>
  );
}

/**
 * Clean, professional authentication gate shown when unauthenticated users access the dashboard
 */
export function DashboardAuthGate() {
  const location = useLocation();
  const { signInWithDemo } = useAuth();

  return (
    <div className="auth-page-container">
      {/* Background Gradients */}
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card" style={{ maxWidth: '560px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        {/* Brand Icon */}
        <div className="auth-logo-icon" style={{ margin: '0 auto 1.25rem' }}>
          <Sprout size={32} />
        </div>

        <span className="badge badge-emerald" style={{ display: 'inline-flex', marginBottom: '0.8rem' }}>
          <ShieldCheck size={12} /> Autonomous Precision Agriculture
        </span>

        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: '800',
          letterSpacing: '-0.02em',
          color: 'var(--text-main)',
          marginBottom: '0.6rem'
        }}>
          AgriSmart <span style={{ color: 'var(--emerald-main)' }}>AI Portal</span>
        </h1>

        <p style={{
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          maxWidth: '440px',
          margin: '0 auto 1.75rem'
        }}>
          Sign in to your authorized operator account to access the IoT telemetry mesh, automated irrigation valves, and the AI crop pathology lab.
        </p>

        {/* Feature Highlights Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
          gap: '10px',
          marginBottom: '1.75rem',
          textAlign: 'left'
        }}>
          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Stethoscope size={16} style={{ color: 'var(--emerald-main)', marginBottom: '4px' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Crop Pathology</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>AI foliar scans & Rx</div>
          </div>

          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Activity size={16} style={{ color: 'var(--blue-main)', marginBottom: '4px' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Telemetry Mesh</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>48 Live soil sensors</div>
          </div>

          <div style={{
            padding: '0.85rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)'
          }}>
            <Droplets size={16} style={{ color: 'var(--amber-warning)', marginBottom: '4px' }} />
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>Drip Automation</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Microclimate valves</div>
          </div>
        </div>

        {/* Action Buttons: Login and Create Account */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.5rem' }}>
          <Link
            to="/login"
            state={{ from: location }}
            className="auth-btn-primary"
            style={{ textDecoration: 'none', fontSize: '0.95rem', padding: '0.85rem' }}
            id="gate-login-btn"
          >
            <Lock size={16} />
            <span>Sign In to Dashboard</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/register"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.8rem',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
            id="gate-register-btn"
          >
            <UserPlus size={16} style={{ color: 'var(--emerald-main)' }} />
            <span>Create Operator Account</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await signInWithDemo();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '0.8rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px dashed var(--emerald-main)',
              color: 'var(--emerald-main)',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            id="gate-demo-btn"
          >
            <Sparkles size={16} />
            <span>Instant Demo Operator Access (1-Click)</span>
          </button>
        </div>

        {/* Security Assurance */}
        <div className="auth-security-badge" style={{ marginTop: 0 }}>
          <ShieldCheck size={14} style={{ color: 'var(--emerald-main)' }} />
          <span>Protected by Supabase Auth with Row-Level Security (RLS)</span>
        </div>
      </div>
    </div>
  );
}

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    // When user is not logged in, render clean authentication screen with Login and Create Account
    return <DashboardAuthGate />;
  }

  return children;
}
