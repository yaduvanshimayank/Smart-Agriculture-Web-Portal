import React, { useState } from 'react';
import { 
  supabaseUrl, 
  supabaseAnonKey, 
  isSupabaseConfigured, 
  setCustomSupabaseConfig 
} from '../lib/supabaseClient.js';
import { 
  X, Database, Shield, Check, Copy, ExternalLink, 
  RefreshCw, CheckCircle2, AlertTriangle, KeyRound
} from 'lucide-react';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState(supabaseUrl || '');
  const [key, setKey] = useState(supabaseAnonKey || '');
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setCustomSupabaseConfig(url, key);
  };

  const handleReset = () => {
    setCustomSupabaseConfig('', '');
  };

  const copySqlSchema = () => {
    const sqlText = `-- Supabase Schema for Smart Agriculture Portal
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  phone TEXT,
  farm_name TEXT DEFAULT 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)',
  role TEXT DEFAULT 'Agricultural Lead & Farm Manager',
  theme TEXT DEFAULT 'light',
  audio_muted BOOLEAN DEFAULT false,
  preferences JSONB DEFAULT '{"notifications": true}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: 'var(--shadow-elevated)',
        padding: '1.75rem'
      }}>
        {/* Header */}
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
              <Database size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                Supabase Backend Setup
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Status:{' '}
                <strong style={{ color: isConfigured ? 'var(--emerald-main)' : 'var(--amber-warning)' }}>
                  {isConfigured ? 'Connected to Live Supabase' : 'Running in Local Demo Mode'}
                </strong>
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
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: isConfigured ? 'var(--emerald-bg)' : 'var(--amber-bg)',
          borderRadius: '10px',
          border: `1px solid ${isConfigured ? 'var(--emerald-border)' : 'var(--amber-border)'}`,
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          {isConfigured ? (
            <CheckCircle2 size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: 'var(--amber-warning)', flexShrink: 0, marginTop: '2px' }} />
          )}
          <div>
            {isConfigured ? (
              <span>Your portal is connected to your Supabase PostgreSQL instance. All authentication and profiles are persistent.</span>
            ) : (
              <span>To connect real Supabase, copy your Project URL & Anon Key from the Supabase dashboard (<strong>Project Settings &gt; API</strong>).</span>
            )}
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Supabase Project URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="auth-input"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Supabase Anon / Public Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                className="auth-input"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="auth-btn-primary"
              style={{ width: 'auto', padding: '0.6rem 1.4rem', fontSize: '0.84rem' }}
            >
              <RefreshCw size={14} />
              <span>Apply & Reconnect</span>
            </button>
          </div>
        </form>

        {/* SQL Schema Copy Helper */}
        <div style={{
          padding: '1rem',
          backgroundColor: 'var(--bg-subtle)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} style={{ color: 'var(--emerald-main)' }} />
              Database SQL Migration Script
            </span>
            <button
              type="button"
              onClick={copySqlSchema}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.75rem',
                color: copied ? 'var(--emerald-main)' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied SQL!' : 'Copy SQL'}</span>
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Run the SQL script located in <code>supabase/schema.sql</code> in your Supabase SQL Editor to initialize the <code>profiles</code> table, triggers, and Row Level Security policies.
          </p>
        </div>
      </div>
    </div>
  );
}
