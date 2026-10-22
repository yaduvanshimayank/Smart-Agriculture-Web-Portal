import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Bot, Stethoscope, Sliders, TrendingUp, 
  Sprout, Activity, Zap, ShieldCheck, Volume2, VolumeX,
  Clock, MapPin, CheckCircle2, AlertTriangle, Info, Bell,
  Sun, Moon, LogOut, User, Settings, Database
} from 'lucide-react';

import Dashboard from './components/Dashboard.jsx';
import AgriGroqChat from './components/AgriGroqChat.jsx';
import CropDoctor from './components/CropDoctor.jsx';
import FarmControls from './components/FarmControls.jsx';
import MarketPrices from './components/MarketPrices.jsx';
import UserProfileModal from './components/UserProfileModal.jsx';
import SupabaseConfigModal from './components/SupabaseConfigModal.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { soundEffects } from './utils/audio.js';

/**
 * Main Authenticated Precision Agriculture Portal
 */
function PortalDashboard({ onOpenConfigModal }) {
  const { user, profile, signOut, isConfigured } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialPrompt, setInitialPrompt] = useState('');
  const [theme, setTheme] = useState(() => localStorage.getItem('agri_theme') || 'light');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [selectedFarm, setSelectedFarm] = useState(profile?.farm_name || 'Punjab Agro-Hub — Ludhiana (Alluvial Basin)');
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('agri_muted') === 'true');
  const [toasts, setToasts] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Sync farm name if profile updates
  useEffect(() => {
    if (profile?.farm_name) {
      setSelectedFarm(profile.farm_name);
    }
  }, [profile?.farm_name]);

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('agri_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    soundEffects.click(isMuted);
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(nextTheme === 'light' ? '☀️ Clean White theme active' : '🌙 Deep Emerald theme active', 'info');
  };

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
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
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

  const handleLogout = async () => {
    soundEffects.click(isMuted);
    try {
      await signOut();
      showToast('Session securely terminated', 'info');
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'IoT Telemetry Mesh', icon: LayoutDashboard, shortcut: '1' },
    { id: 'chat', label: 'AI Farm Advisor', icon: Bot, badge: 'Groq Live', shortcut: '2' },
    { id: 'crop-doctor', label: 'AI Crop Pathology', icon: Stethoscope, shortcut: '3' },
    { id: 'controls', label: 'Farm Controls & Valves', icon: Sliders, shortcut: '4' },
    { id: 'market', label: 'Commodity Prices', icon: TrendingUp, shortcut: '5' }
  ];

  const displayName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : 'Farm Manager');
  const userInitials = displayName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'FM';

  return (
    <div className="app-container" data-theme={theme}>
      {/* Toast Notification Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type === 'warning' ? 'toast-warning' : t.type === 'error' ? 'toast-error' : ''}`}>
            {t.type === 'warning' && <AlertTriangle size={18} style={{ color: 'var(--amber-warning)', flexShrink: 0 }} />}
            {t.type === 'error' && <AlertTriangle size={18} style={{ color: 'var(--rose-alert)', flexShrink: 0 }} />}
            {t.type === 'info' && <Info size={18} style={{ color: 'var(--blue-main)', flexShrink: 0 }} />}
            {t.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--emerald-main)', flexShrink: 0 }} />}
            <span style={{ fontWeight: '500' }}>{t.message}</span>
          </div>
        ))}
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onShowToast={showToast}
      />

      {/* Desktop Left Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          {/* App Branding */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1.2rem',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              flexShrink: 0
            }}>
              <Sprout size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h2 style={{ fontSize: '1.22rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                  AgriSmart <span style={{ color: 'var(--emerald-main)' }}>AI</span>
                </h2>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '500' }}>
                Precision Agriculture Portal
              </span>
            </div>
          </div>

          {/* Authenticated User Profile Card */}
          <div className="sidebar-user-card">
            <div 
              onClick={() => setShowProfileModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}
              title="Click to view & edit profile"
            >
              <div className="user-avatar-circle">
                {userInitials}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ 
                  fontSize: '0.84rem', 
                  fontWeight: '700', 
                  color: 'var(--text-main)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {displayName}
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  color: 'var(--emerald-main)', 
                  fontWeight: '600',
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {profile?.role || 'Agricultural Lead'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setShowProfileModal(true)}
                title="Profile Settings"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <Settings size={15} />
              </button>
              <button
                onClick={handleLogout}
                title="Sign Out"
                id="sidebar-logout-btn"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--rose-alert)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Farm Sector Selector */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.35rem', fontWeight: '600' }}>
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
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Punjab Agro-Hub — Ludhiana (Alluvial Basin)">Punjab Agro-Hub — Ludhiana (Alluvial Basin)</option>
              <option value="Maharashtra Deccan Agri-Zone — Vidarbha (Black Cotton Soil)">Maharashtra Deccan Agri-Zone — Vidarbha (Black Cotton Soil)</option>
              <option value="Gujarat Saurashtra Organic Block — Rajkot (Semi-Arid Drip)">Gujarat Saurashtra Organic Block — Rajkot (Semi-Arid Drip)</option>
              <option value="Uttar Pradesh Gangetic Farm — Varanasi (Sugarcane & Rice)">Uttar Pradesh Gangetic Farm — Varanasi (Sugarcane & Rice)</option>
              <option value="Karnataka Precision Polyhouse — Bengaluru Rural (Red Laterite Soil)">Karnataka Precision Polyhouse — Bengaluru Rural (Red Laterite Soil)</option>
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
                    padding: '0.72rem 0.95rem',
                    borderRadius: '10px',
                    border: isActive ? '1px solid var(--emerald-main)' : '1px solid transparent',
                    backgroundColor: isActive ? 'var(--emerald-bg)' : 'transparent',
                    color: isActive ? 'var(--emerald-main)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                    <Icon size={18} style={{ color: isActive ? 'var(--emerald-main)' : 'var(--text-muted)', flexShrink: 0 }} />
                    <span>{item.label}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.badge && (
                      <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '0.12rem 0.4rem' }}>
                        {item.badge}
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '0.1rem 0.3rem', fontFamily: 'monospace' }}>
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
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.76rem',
          color: 'var(--text-muted)'
        }}>
          {/* Supabase Connection Status Pill */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.6rem',
            padding: '4px 6px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={13} style={{ color: isConfigured ? 'var(--emerald-main)' : 'var(--amber-warning)' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: '600', color: isConfigured ? 'var(--emerald-main)' : 'var(--amber-warning)' }}>
                {isConfigured ? 'Supabase DB Live' : 'Demo Mode DB'}
              </span>
            </div>
            {onOpenConfigModal && (
              <button
                onClick={onOpenConfigModal}
                title="Supabase Settings"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Settings size={12} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="status-dot"></span>
              <span>Mesh: <strong style={{ color: 'var(--text-main)' }}>48 Live</strong></span>
            </div>
            
            {/* Controls: Theme & Audio */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to White Main Mode'}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
              </button>

              <button
                onClick={toggleSound}
                title={isMuted ? 'Unmute Audio UI Feedback' : 'Mute Audio UI Feedback'}
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  color: isMuted ? 'var(--text-dim)' : 'var(--emerald-main)',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>

          <div style={{ color: 'var(--emerald-main)', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
            <ShieldCheck size={13} /> Agronomy Guardrail & Groq Online
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
              color: '#fff'
            }}>
              <Sprout size={18} />
            </div>
            <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)' }}>
              AgriSmart <span style={{ color: 'var(--emerald-main)' }}>AI</span>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* User Chip on Mobile */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--emerald-bg)',
                color: 'var(--emerald-main)',
                border: '1px solid var(--emerald-border)',
                fontWeight: '700',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Profile"
            >
              {userInitials}
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--rose-alert)',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '8px'
              }}
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>

            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '8px'
              }}
            >
              {theme === 'light' ? <Moon size={13} /> : <Sun size={13} />}
            </button>
            <button
              onClick={toggleSound}
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-subtle)',
                color: isMuted ? 'var(--text-dim)' : 'var(--emerald-main)',
                cursor: 'pointer',
                padding: '5px 8px',
                borderRadius: '8px'
              }}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
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
                  border: isActive ? '1px solid var(--emerald-main)' : '1px solid var(--border-subtle)',
                  backgroundColor: isActive ? 'var(--emerald-bg)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--emerald-main)' : 'var(--text-secondary)',
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
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-indigo">
              <Zap size={11} /> Autonomous Precision Portal
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} style={{ color: 'var(--emerald-main)' }} />
              <strong style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{currentTime}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              🇮🇳 Bharat Agri-Network / APMC Connected
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Telemetry Mesh: <strong style={{ color: 'var(--emerald-main)' }}>48/48 Nodes</strong>
            </span>
            <span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>
              <ShieldCheck size={12} /> Groq LLM Connected
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
              onNavigateTab={switchTab}
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
              onDetectionComplete={() => {
                showToast('Specimen and pathology diagnosis saved to Supabase', 'success');
              }}
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

/**
 * Root Application Router with Session and Route Protection
 */
export default function App() {
  const [showConfigModal, setShowConfigModal] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SupabaseConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
        />

        <Routes>
          {/* Public Auth Routes (Redirect to / if already authenticated) */}
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <Login onOpenConfigModal={() => setShowConfigModal(true)} />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/forgot-password" 
            element={
              <PublicOnlyRoute>
                <ForgotPassword />
              </PublicOnlyRoute>
            } 
          />

          {/* Password Reset Route (accessible from Supabase recovery email link) */}
          <Route 
            path="/reset-password" 
            element={<ResetPassword />} 
          />

          {/* Protected Routes (Requires authenticated Supabase session) */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <PortalDashboard onOpenConfigModal={() => setShowConfigModal(true)} />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
