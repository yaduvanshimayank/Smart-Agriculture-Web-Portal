import React, { useState } from 'react';
import { Key, CheckCircle, Shield, ExternalLink, X } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
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
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--border-emerald)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--emerald-main)'
          }}>
            <Key size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Configure Groq API Key</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Powers AgriGroq AI Precision Assistant</p>
          </div>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
          Enter your Groq API key to unlock real-time agricultural answers powered by <strong>llama-3.3-70b-versatile</strong>. Your API key is stored securely in your browser session.
        </p>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--emerald-light)' }}>
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
                backgroundColor: 'rgba(5, 20, 14, 0.9)',
                border: '1px solid var(--border-emerald)',
                borderRadius: '10px',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{
            padding: '0.8rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            borderRadius: '10px',
            border: '1px dashed var(--border-emerald)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.8rem',
            color: 'var(--text-muted)'
          }}>
            <Shield size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0 }} />
            <span>Don't have a key? Get a free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--emerald-light)', textDecoration: 'underline' }}>console.groq.com <ExternalLink size={12} style={{ display: 'inline' }} /></a></span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-emerald">
              {savedSuccess ? (
                <>
                  <CheckCircle size={18} /> Saved!
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
