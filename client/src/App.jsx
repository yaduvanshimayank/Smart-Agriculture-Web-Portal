import React, { useState } from 'react';
import { 
  LayoutDashboard, Bot, Stethoscope, Sliders, TrendingUp, 
  Sprout, Activity, Zap, ShieldCheck
} from 'lucide-react';

import Dashboard from './components/Dashboard.jsx';
import AgriGroqChat from './components/AgriGroqChat.jsx';
import CropDoctor from './components/CropDoctor.jsx';
import FarmControls from './components/FarmControls.jsx';
import MarketPrices from './components/MarketPrices.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [initialPrompt, setInitialPrompt] = useState('');

  const handleConsultAI = (prompt) => {
    setInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const navItems = [
    { id: 'chat', label: 'AI Farm Advisor', icon: Bot, badge: 'Farming AI' },
    { id: 'dashboard', label: 'IoT Telemetry Mesh', icon: LayoutDashboard },
    { id: 'crop-doctor', label: 'AI Crop Pathology', icon: Stethoscope },
    { id: 'controls', label: 'Farm Controls & Valves', icon: Sliders },
    { id: 'market', label: 'Commodity Prices', icon: TrendingUp }
  ];

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div>
          {/* App Branding Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingBottom: '1.4rem',
            marginBottom: '1.5rem',
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
              color: '#03140c',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
            }}>
              <Sprout size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
                AgriSmart <span style={{ color: 'var(--emerald-light)' }}>AI</span>
              </h2>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                Precision Agriculture Portal
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: isActive ? '1px solid var(--emerald-main)' : '1px solid transparent',
                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: isActive ? 'var(--emerald-light)' : 'var(--text-muted)',
                    fontWeight: isActive ? '700' : '500',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon size={20} style={{ color: isActive ? 'var(--emerald-main)' : 'var(--text-muted)' }} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div style={{
          paddingTop: '1.2rem',
          borderTop: '1px solid var(--border-emerald)',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <span className="status-dot"></span>
            <span>Server: <strong>Online (Port 5000)</strong></span>
          </div>
          <div style={{ color: 'var(--emerald-light)', fontSize: '0.72rem' }}>
            🌾 Agricultural Guardrail Active
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Floating Utility Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.8rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-emerald">
              <Zap size={12} /> Smart Farming System
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              AI Intelligence Engine: <strong style={{ color: 'var(--emerald-light)' }}>Active</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.78rem' }}>
              <ShieldCheck size={14} /> Mesh Connected
            </span>
          </div>
        </header>

        {/* View Switcher */}
        {activeTab === 'chat' && (
          <AgriGroqChat 
            initialPrompt={initialPrompt}
            onClearInitialPrompt={() => setInitialPrompt('')}
          />
        )}
        {activeTab === 'dashboard' && <Dashboard onConsultAI={handleConsultAI} />}
        {activeTab === 'crop-doctor' && <CropDoctor />}
        {activeTab === 'controls' && <FarmControls />}
        {activeTab === 'market' && <MarketPrices />}
      </main>
    </div>
  );
}
