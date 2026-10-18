import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Bot, Stethoscope, Sliders, TrendingUp, 
  Sprout, Activity, Zap, ShieldCheck, Volume2, VolumeX,
  Clock, MapPin, CheckCircle2, AlertTriangle, Info, Bell
} from 'lucide-react';

import Dashboard from './components/Dashboard.jsx';
import AgriGroqChat from './components/AgriGroqChat.jsx';
import CropDoctor from './components/CropDoctor.jsx';
import FarmControls from './components/FarmControls.jsx';
import MarketPrices from './components/MarketPrices.jsx';
import { soundEffects } from './utils/audio.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [selectedFarm, setSelectedFarm] = useState('Green Valley Farm — Sector Alpha');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('agri_muted') === 'true');
  const [toasts, setToasts] = useState([]);

  // Toast notification dispatcher
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener (1-5 to switch tabs)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (e.key === '1') switchTab('dashboard');
      if (e.key === '2') switchTab('chat');
      if (e.key === '3') switchTab('crop-doctor');
      if (e.key === '4') switchTab('controls');
      if (e.key === '5') switchTab('market');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    localStorage.setItem('agri_muted', String(nextMuted));
    if (!nextMuted) soundEffects.click(false);
    showToast(nextMuted ? 'UI Sound Effects Muted' : 'UI Audio Feedback Enabled', 'info');
  };

  const switchTab = (tabId) => {
    soundEffects.click(isMuted);
    setActiveTab(tabId);
  };

  const handleConsultAI = (prompt) => {
    soundEffects.click(isMuted);
    setInitialPrompt(prompt);
    setActiveTab('chat');
    showToast('Agronomy telemetry query routed to AgriGroq AI', 'info');
  };

  const navItems = [
    { id: 'dashboard', label: 'IoT Telemetry Mesh', icon: LayoutDashboard, shortcut: '1' },
    { id: 'chat', label: 'AI Farm Advisor', icon: Bot, badge: 'Guardrail', shortcut: '2' },
    { id: 'crop-doctor', label: 'AI Crop Pathology', icon: Stethoscope, shortcut: '3' },
    { id: 'controls', label: 'Farm Controls & Valves', icon: Sliders, shortcut: '4' },
    { id: 'market', label: 'Commodity Prices', icon: TrendingUp, shortcut: '5' }
  ];

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'warning' ? 'toast-warning' : t.type === 'error' ? 'toast-error' : ''}`}>
            {t.type === 'warning' && <AlertTriangle size={18} style={{ color: 'var(--amber-warning)', flexShrink: 0 }} />}
            {t.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--rose-alert)', flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={18} style={{ color: '#38bdf8', flexShrink: 0 }} />}
            {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--emerald-light)', flexShrink: 0 }} />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* Desktop Left Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          {/* App Branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1.2rem',
            marginBottom: '1.2rem',
            borderBottom: '1px solid var(--border-emerald)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#021209',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
              flexShrink: 0
            }}>
              <Sprout size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
                  AgriSmart <span style={{ color: 'var(--emerald-light)' }}>AI</span>
                </h2>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Precision Agriculture Portal
              </span>
            </div>
          </div>

          {/* Farm Sector Selector */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem' }}>
              <MapPin size={11} style={{ color: 'var(--emerald-main)' }} /> Active Operation
            </label>
            <select
              value={selectedFarm}
              onChange={(e) => {
                setSelectedFarm(e.target.value);
                showToast(`Switched operational view to ${e.target.value}`, 'info');
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.7rem',
                backgroundColor: 'rgba(5, 20, 14, 0.9)',
                border: '1px solid var(--border-emerald)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Green Valley Farm — Sector Alpha">Green Valley Farm — Sector Alpha</option>
              <option value="Highland AgroTech — East Plots">Highland AgroTech — East Plots</option>
              <option value="SunRidge Hydroponic Hub">SunRidge Hydroponic Hub</option>
            </select>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => switchTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    borderRadius: '10px',
                    border: isActive ? '1px solid var(--emerald-main)' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.16)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--emerald-light)' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.badge && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                        {item.badge}
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '0.1rem 0.3rem', fontFamily: 'var(--font-mono)' }}>
                      {item.shortcut}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div style={{
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-emerald)',
          fontSize: '0.76rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot"></span>
              <span>IoT Mesh: <strong>48 Nodes</strong></span>
            </div>
            
            {/* Audio Feedback Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Unmute Audio UI Feedback' : 'Mute Audio UI Feedback'}
              style={{
                background: 'none',
                border: 'none',
                color: isMuted ? 'var(--text-dim)' : 'var(--emerald-light)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px'
              }}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>

          <div style={{ color: 'var(--emerald-light)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ShieldCheck size={12} /> Agronomy Safety Guardrail Active
          </div>
        </div>
      </aside>

      {/* Mobile Top Navigation Header */}
      <div className="mobile-top-nav">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#021209'
            }}>
              <Sprout size={18} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff' }}>
              AgriSmart <span style={{ color: 'var(--emerald-light)' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={toggleSound}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--border-emerald)',
                color: isMuted ? 'var(--text-dim)' : 'var(--emerald-light)',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '8px'
              }}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
              <span className="status-dot"></span> Live
            </span>
          </div>
        </div>

        {/* Horizontally Scrollable Tabs for Mobile */}
        <div className="mobile-tabs-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => switchTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  padding: '0.45rem 0.8rem',
                  borderRadius: '20px',
                  border: isActive ? '1px solid var(--emerald-main)' : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(5, 20, 14, 0.8)',
                  color: isActive ? 'var(--emerald-light)' : 'var(--text-muted)',
                  fontSize: '0.78rem',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer'
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Floating Utility Status Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid rgba(16, 185, 129, 0.14)',
          flexWrap: 'wrap',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald">
              <Zap size={11} /> Smart Autonomous Portal
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} style={{ color: 'var(--emerald-light)' }} />
              <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>{currentTime}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Telemetry Mesh: <strong style={{ color: 'var(--emerald-light)' }}>48/48 Verified</strong>
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              <ShieldCheck size={12} /> Enterprise Ready
            </span>
          </div>
        </header>

        {/* View Switcher with Smooth Animation */}
        <div className="fade-in" key={activeTab}>
          {activeTab === 'dashboard' && (
            <Dashboard 
              onConsultAI={handleConsultAI} 
              onShowToast={showToast} 
              isMuted={isMuted}
            />
          )}
          {activeTab === 'chat' && (
            <AgriGroqChat 
              initialPrompt={initialPrompt}
              onClearInitialPrompt={() => setInitialPrompt('')}
              onShowToast={showToast}
              isMuted={isMuted}
            />
          )}
          {activeTab === 'crop-doctor' && (
            <CropDoctor 
              onConsultAI={handleConsultAI} 
              onShowToast={showToast}
              isMuted={isMuted}
            />
          )}
          {activeTab === 'controls' && (
            <FarmControls 
              onShowToast={showToast}
              isMuted={isMuted}
            />
          )}
          {activeTab === 'market' && (
            <MarketPrices 
              onConsultAI={handleConsultAI} 
              onShowToast={showToast}
              isMuted={isMuted}
            />
          )}
        </div>
      </main>
    </div>
  );
}
