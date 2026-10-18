import React, { useState, useEffect } from 'react';
import { Key, CheckCircle, Shield, ExternalLink, X, Trash2 } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setInputKey(apiKey || '');
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 900);
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '520px',
        padding: '2rem',
        position: 'relative',
        boxShadow: 'var(--shadow-elevated)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.2rem', right: '1.2rem',
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'var(--emerald-bg)', border: '1px solid var(--emerald-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--emerald-main)'
          }}>
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>Configure Groq API Key</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Powers AgriGroq AI Real-Time Assistant</p>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
          Enter your Groq API key to unlock real-time agricultural answers powered by high-speed Groq models. If left blank, the portal operates automatically using the system's verified key or built-in Smart Agronomy Engine.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '0.4rem', color: 'var(--emerald-main)' }}>
              Groq API Key (gsk_...)
            </label>
            <input 
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="gsk_..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontFamily: 'monospace',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{
            padding: '0.8rem 1rem',
            backgroundColor: 'var(--emerald-bg)',
            borderRadius: '10px',
            border: '1px dashed var(--emerald-border)',
            marginBottom: '1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)'
          }}>
            <Shield size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0 }} />
            <span>Don't have a key? Get a free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--emerald-main)', fontWeight: '600', textDecoration: 'underline' }}>console.groq.com <ExternalLink size={11} style={{ display: 'inline' }} /></a></span>
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            {apiKey && (
              <button type="button" className="btn-danger" onClick={handleClear} style={{ marginRight: 'auto' }}>
                <Trash2 size={14} /> Clear Key
              </button>
            )}
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-emerald">
              {savedSuccess ? (
                <>
                  <CheckCircle size={16} /> Saved!
                </>
              ) : (
                'Save Key & Activate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
