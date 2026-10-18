import React, { useState, useEffect } from 'react';
import { 
  Sliders, Power, Plane, Wind, Droplets, CheckCircle, 
  RefreshCw, Play, ShieldAlert, Cpu, AlertTriangle, Gauge,
  Clock, Thermometer, Compass, Flame, Fan
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';

export default function FarmControls({ onShowToast, isMuted }) {
  const [controls, setControls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [droneFlying, setDroneFlying] = useState(false);
  const [droneProgress, setDroneProgress] = useState(0);

  const fetchControls = async () => {
    try {
      setLoading(true);
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
    soundEffects.toggle(value === true || value === 'AUTOMATIC' || value === 'ACTIVE', isMuted);
    try {
      const res = await fetch('/api/farm-controls/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, key, value })
      });
      const data = await res.json();
      if (data.success) {
        setControls(data.updatedState);
        if (onShowToast) onShowToast(`Actuator command applied: ${device} -> ${key}`, 'success');
      }
    } catch (err) {
      console.error('Error toggling device:', err);
      soundEffects.alert(isMuted);
      if (onShowToast) onShowToast('Failed to transmit actuator command to mesh', 'error');
    }
  };

  const handleMasterValves = async (turnOn) => {
    soundEffects.toggle(turnOn, isMuted);
    try {
      const res = await fetch('/api/farm-controls/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device: 'masterIrrigation', value: turnOn })
      });
      const data = await res.json();
      if (data.success) {
        setControls(data.updatedState);
        if (onShowToast) onShowToast(turnOn ? 'All 4 irrigation solenoid valves opened' : 'EMERGENCY: All irrigation valves shut OFF', turnOn ? 'info' : 'warning');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerDroneMission = () => {
    soundEffects.scan(isMuted);
    setDroneFlying(true);
    setDroneProgress(5);
    if (onShowToast) onShowToast('AgriFly UAV taking off for GPS waypoint autonomous spray mission', 'info');

    const interval = setInterval(() => {
      setDroneProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDroneFlying(false);
          soundEffects.toggle(true, isMuted);
          toggleDevice('droneSprayer', 'lastMission', 'Just Now (Autonomous Aerial Treatment Completed)');
          if (onShowToast) onShowToast('AgriFly UAV returned to docking station. 100% acreage coverage completed.', 'success');
          return 100;
        }
        return prev + 25;
      });
    }, 900);
  };

  if (!controls && loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--emerald-main)' }} />
        <p style={{ marginTop: '0.8rem', fontWeight: '600' }}>Connecting to SCADA Actuators & Smart Controllers...</p>
      </div>
    );
  }

  const drip = controls?.dripIrrigation || {};
  const drone = controls?.droneSprayer || {};
  const vent = controls?.greenhouseVentilation || {};

  const payloadOptions = [
    'IFFCO Nano Urea (4% N foliar spray)',
    'Indigenous Neem Astra 10% (Bio-Pesticide)',
    'Jeevamrut Microbial Foliar Extract',
    'Copper Hydroxide 40% (Bio-Fungicide)',
    'Bacillus thuringiensis (Bt var. kurstaki)'
  ];

  return (
    <div>
      {/* Title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.6rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              SCADA Actuators & Automation Controls
            </h1>
            <span className="badge badge-emerald">
              <Cpu size={11} /> SCADA Mesh Active
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
            Remote solenoid valve arrays, autonomous UAV aerial sprayers, and climate environmental actuators
          </p>
        </div>

        <button 
          className="btn-outline" 
          onClick={() => {
            soundEffects.click(isMuted);
            fetchControls();
            if (onShowToast) onShowToast('Hardware telemetry re-synced', 'info');
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Actuators</span>
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.4rem'
      }}>
        {/* Card 1: Drip Irrigation Valves */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: 'var(--blue-bg)',
                  color: 'var(--blue-main)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: '700', color: 'var(--text-main)' }}>Smart Drip Irrigation</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Solenoid Valve Array • 2.8 Bar</span>
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

            {/* Master Control Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.1rem' }}>
              <button
                className="btn-outline"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
                onClick={() => handleMasterValves(true)}
              >
                <Power size={13} style={{ color: 'var(--emerald-main)' }} /> Open All Valves
              </button>
              <button
                className="btn-danger"
                style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem', justifyContent: 'center' }}
                onClick={() => handleMasterValves(false)}
              >
                <AlertTriangle size={13} /> Master Valve Stop
              </button>
            </div>

            {/* Individual Zones Toggle Ticker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'zone1Active', name: 'Zone Alpha (North Wheat)' },
                { id: 'zone2Active', name: 'Zone Beta (South Tomato)' },
                { id: 'zone3Active', name: 'Zone Gamma (East Orchard)' },
                { id: 'zone4Active', name: 'Zone Delta (West Corn)' }
              ].map(z => {
                const isActive = drip[z.id];
                return (
                  <div 
                    key={z.id}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.65rem 0.9rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', display: 'block' }}>{z.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Flow: {isActive ? '1.8 L/min (Nominal)' : '0.0 L/min (Closed)'}</span>
                    </div>

                    <button
                      onClick={() => toggleDevice('dripIrrigation', z.id, !isActive)}
                      style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: isActive ? 'var(--emerald-main)' : 'var(--bg-surface)',
                        color: isActive ? '#ffffff' : 'var(--text-muted)',
                        boxShadow: isActive ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                        fontWeight: '700',
                        fontSize: '0.74rem',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <Power size={11} /> {isActive ? 'VALVE ON' : 'CLOSED'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Drip Runtime Selector */}
          <div style={{
            marginTop: '1.2rem',
            paddingTop: '0.8rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={13} /> Scheduled Duration:
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  onClick={() => toggleDevice('dripIrrigation', 'scheduledDurationMin', mins)}
                  style={{
                    padding: '3px 7px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    border: drip.scheduledDurationMin === mins ? '1px solid var(--emerald-main)' : '1px solid var(--border-subtle)',
                    backgroundColor: drip.scheduledDurationMin === mins ? 'var(--emerald-bg)' : 'transparent',
                    color: drip.scheduledDurationMin === mins ? 'var(--emerald-main)' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Autonomous Drone Sprayer */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: 'var(--emerald-bg)',
                  color: 'var(--emerald-main)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Plane size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: '700', color: 'var(--text-main)' }}>AgriFly Drone Sprayer</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>GPS Precision Hexacopter UAV</span>
                </div>
              </div>
              <span className="badge badge-emerald">
                {droneFlying ? 'IN FLIGHT MISSION' : drone.status}
              </span>
            </div>

            {/* Flight Mission HUD / Radar Simulation */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1.1rem',
              marginBottom: '1rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {droneFlying && (
                <div style={{
                  position: 'absolute',
                  right: '15px',
                  top: '15px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid var(--emerald-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '100%',
                    height: '2px',
                    backgroundColor: 'var(--emerald-main)',
                    animation: 'radarSweep 2s linear infinite',
                    transformOrigin: 'center'
                  }}></div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', marginBottom: '0.8rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Battery Status:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--emerald-main)', fontFamily: 'monospace' }}>
                    {drone.battery}%
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Flight Altitude:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                    {drone.flightAltitudeMeters || 3.5} m
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Spray Coverage:</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--blue-main)', fontFamily: 'monospace' }}>
                    {drone.sprayCoverageHa || 12.4} Ha
                  </div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>GPS Mesh RTK:</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--emerald-main)' }}>
                    ± 2 cm Lock
                  </div>
                </div>
              </div>

              {/* Progress Bar when in mission */}
              {droneFlying && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '0.3rem', color: 'var(--emerald-main)', fontWeight: '700' }}>
                    <span>Executing Swath Pattern...</span>
                    <span>{droneProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${droneProgress}%`, height: '100%', backgroundColor: 'var(--emerald-main)', transition: 'width 0.8s ease' }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Select Payload Dropdown */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
                Foliar Spray Payload Formula:
              </label>
              <select
                value={drone.payload}
                onChange={(e) => toggleDevice('droneSprayer', 'payload', e.target.value)}
                disabled={droneFlying}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.8rem',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {payloadOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.9rem' }}>
            <button 
              className="btn-emerald" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
              onClick={triggerDroneMission}
              disabled={droneFlying}
            >
              {droneFlying ? (
                <>
                  <RefreshCw className="spin" size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Autonomous Aerial Mission in Progress...</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Launch Autonomous Aerial Spray Mission</span>
                </>
              )}
            </button>
            <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Last flight: {drone.lastMission}
            </div>
          </div>
        </div>

        {/* Card 3: Greenhouse Climate & Actuators */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: 'var(--amber-bg)',
                  color: 'var(--amber-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Fan size={22} className={vent.fanSpeed !== 'LOW' ? 'spin' : ''} style={{ animation: vent.fanSpeed !== 'LOW' ? 'spin 3s linear infinite' : 'none' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.08rem', fontWeight: '700', color: 'var(--text-main)' }}>Greenhouse Climate Actuators</h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>HVAC, Foggers & Circulation</span>
                </div>
              </div>
              <span className="badge badge-emerald">
                {vent.status}
              </span>
            </div>

            {/* Target Temperature Setpoint */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Thermometer size={13} style={{ color: 'var(--rose-alert)' }} /> Target Canopy Temp
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {vent.targetTemp || 24} °C
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--emerald-main)', display: 'block', fontWeight: '600' }}>
                  Current: {vent.currentTemp || 25.5} °C
                </span>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '700' }}
                  onClick={() => toggleDevice('greenhouseVentilation', 'targetTemp', Math.max(16, (vent.targetTemp || 24) - 1))}
                >
                  -
                </button>
                <button
                  className="btn-outline"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', fontWeight: '700' }}
                  onClick={() => toggleDevice('greenhouseVentilation', 'targetTemp', Math.min(32, (vent.targetTemp || 24) + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* Target Humidity Slider */}
            <div style={{ marginBottom: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Target Relative Humidity Setpoint:</span>
                <strong style={{ color: 'var(--emerald-main)' }}>{vent.targetHumidity}%</strong>
              </div>
              <input 
                type="range"
                min="50"
                max="90"
                value={vent.targetHumidity || 65}
                onChange={(e) => toggleDevice('greenhouseVentilation', 'targetHumidity', Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--emerald-main)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                <span>50% (Dry)</span>
                <span>Current: {vent.humidity}%</span>
                <span>90% (Tropical)</span>
              </div>
            </div>

            {/* Fan Speed Buttons */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: '600' }}>
                Circulation Fan Speed:
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['LOW', 'MEDIUM', 'HIGH', 'AUTO'].map(speed => (
                  <button
                    key={speed}
                    onClick={() => toggleDevice('greenhouseVentilation', 'fanSpeed', speed)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: vent.fanSpeed === speed ? '1px solid var(--emerald-main)' : '1px solid var(--border-subtle)',
                      backgroundColor: vent.fanSpeed === speed ? 'var(--emerald-bg)' : 'var(--bg-surface)',
                      color: vent.fanSpeed === speed ? 'var(--emerald-main)' : 'var(--text-muted)',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-Actuator Toggles: Fogger & Exhaust */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.9rem'
          }}>
            <button
              onClick={() => toggleDevice('greenhouseVentilation', 'mistFogger', !vent.mistFogger)}
              style={{
                padding: '0.55rem',
                borderRadius: '8px',
                border: vent.mistFogger ? '1px solid var(--blue-main)' : '1px solid var(--border-subtle)',
                backgroundColor: vent.mistFogger ? 'var(--blue-bg)' : 'var(--bg-surface)',
                color: vent.mistFogger ? 'var(--blue-main)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Droplets size={13} /> {vent.mistFogger ? 'Fogger ON' : 'Fogger OFF'}
            </button>

            <button
              onClick={() => toggleDevice('greenhouseVentilation', 'exhaustFan', !vent.exhaustFan)}
              style={{
                padding: '0.55rem',
                borderRadius: '8px',
                border: vent.exhaustFan ? '1px solid var(--emerald-main)' : '1px solid var(--border-subtle)',
                backgroundColor: vent.exhaustFan ? 'var(--emerald-bg)' : 'var(--bg-surface)',
                color: vent.exhaustFan ? 'var(--emerald-main)' : 'var(--text-muted)',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Wind size={13} /> {vent.exhaustFan ? 'Exhaust Active' : 'Exhaust Idle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
