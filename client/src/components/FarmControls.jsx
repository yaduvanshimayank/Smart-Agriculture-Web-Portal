import React, { useState, useEffect } from 'react';
import { 
  Sliders, Power, Plane, Wind, Droplets, CheckCircle, 
  RefreshCw, Play, ShieldAlert, Cpu
} from 'lucide-react';

export default function FarmControls() {
  const [controls, setControls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [droneFlying, setDroneFlying] = useState(false);

  const fetchControls = async () => {
    try {
      const res = await fetch('/api/farm-controls');
      const data = await res.json();
      setControls(data);
    } catch (err) {
      console.error('Failed to fetch farm controls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const toggleDevice = async (device, key, value) => {
    try {
      const res = await fetch('/api/farm-controls/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, key, value })
      });
      const data = await res.json();
      if (data.success) {
        setControls(data.updatedState);
      }
    } catch (err) {
      console.error('Error toggling device:', err);
    }
  };

  const triggerDroneMission = () => {
    setDroneFlying(true);
    setTimeout(() => {
      setDroneFlying(false);
      toggleDevice('droneSprayer', 'lastMission', 'Just Now (Autonomous Aerial Treatment Completed)');
    }, 4000);
  };

  if (!controls && loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Connecting to IoT Actuators & Smart Controllers...</p>
      </div>
    );
  }

  const drip = controls?.dripIrrigation || {};
  const drone = controls?.droneSprayer || {};
  const vent = controls?.greenhouseVentilation || {};

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Smart Automation & Hardware Controls</h1>
          <span className="badge badge-emerald">
            <Cpu size={12} /> SCADA Control Active
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Remote management for precision drip solenoid valves, autonomous drone sprayers, and climate fans
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Card 1: Drip Irrigation Valves */}
        <div className="glass-panel" style={{ padding: '1.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Droplets size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Smart Drip Irrigation</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Solenoid Valve Array</span>
              </div>
            </div>

            <button 
              className={`badge ${drip.status === 'AUTOMATIC' ? 'badge-emerald' : 'badge-warning'}`}
              onClick={() => toggleDevice('dripIrrigation', 'status', drip.status === 'AUTOMATIC' ? 'MANUAL' : 'AUTOMATIC')}
              style={{ cursor: 'pointer', border: 'none' }}
            >
              Mode: {drip.status}
            </button>
          </div>

          {/* Zones Toggle Ticker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'zone1Active', name: 'Zone Alpha (North Wheat)' },
              { id: 'zone2Active', name: 'Zone Beta (South Tomato)' },
              { id: 'zone3Active', name: 'Zone Gamma (East Orchard)' },
              { id: 'zone4Active', name: 'Zone Delta (West Corn)' }
            ].map(z => (
              <div 
                key={z.id}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'rgba(5, 20, 14, 0.6)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-emerald)'
                }}
              >
                <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{z.name}</span>
                <button
                  onClick={() => toggleDevice('dripIrrigation', z.id, !drip[z.id])}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: 'none',
                    backgroundColor: drip[z.id] ? 'var(--emerald-main)' : 'rgba(255,255,255,0.1)',
                    color: drip[z.id] ? '#03140c' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  <Power size={12} /> {drip[z.id] ? 'FLOW ON' : 'CLOSED'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Autonomous Drone Sprayer */}
        <div className="glass-panel" style={{ padding: '1.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-light)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Plane size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>AgriFly Drone Sprayer</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>GPS Precision UAV</span>
              </div>
            </div>
            <span className="badge badge-emerald">
              {droneFlying ? 'FLIGHT MISSION ACTIVE' : drone.status}
            </span>
          </div>

          <div style={{ backgroundColor: 'rgba(5, 20, 14, 0.6)', padding: '1rem', borderRadius: '10px', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Payload Type:</span>
              <strong style={{ color: 'var(--text-main)' }}>{drone.payload}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
              <span>Battery Charge:</span>
              <strong style={{ color: 'var(--emerald-light)', fontFamily: 'var(--font-mono)' }}>{drone.battery}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>Last Mission:</span>
              <strong style={{ color: 'var(--text-muted)' }}>{drone.lastMission}</strong>
            </div>
          </div>

          <button 
            className="btn-emerald" 
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={triggerDroneMission}
            disabled={droneFlying}
          >
            {droneFlying ? (
              <>
                <RefreshCw className="spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Drone Executing Aerial Spray Pattern...
              </>
            ) : (
              <>
                <Play size={18} /> Launch Autonomous Spray Mission
              </>
            )}
          </button>
        </div>

        {/* Card 3: Greenhouse Climate Control */}
        <div className="glass-panel" style={{ padding: '1.6rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Wind size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Greenhouse Ventilation</h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>HVAC & Cooling Fans</span>
              </div>
            </div>
            <span className="badge badge-emerald">
              {vent.status}
            </span>
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
              Fan Circulation Speed Level:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['LOW', 'MEDIUM', 'HIGH', 'AUTO'].map(speed => (
                <button
                  key={speed}
                  onClick={() => toggleDevice('greenhouseVentilation', 'fanSpeed', speed)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: vent.fanSpeed === speed ? '1px solid var(--emerald-main)' : '1px solid var(--border-emerald)',
                    backgroundColor: vent.fanSpeed === speed ? 'rgba(16,185,129,0.2)' : 'rgba(5, 20, 14, 0.6)',
                    color: vent.fanSpeed === speed ? 'var(--emerald-light)' : 'var(--text-muted)',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'rgba(5, 20, 14, 0.6)', padding: '0.8rem 1rem', borderRadius: '10px' }}>
            <span>Target Humidity: <strong>{vent.targetHumidity}%</strong></span>
            <span>Current: <strong style={{ color: 'var(--emerald-light)' }}>{vent.humidity}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
