import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Thermometer, Sun, Wind, Activity, RefreshCw, 
  AlertTriangle, CheckCircle2, Sprout, Compass, BatteryCharging,
  TrendingUp, CloudRain, Zap, FileSpreadsheet, Bot, ChevronRight,
  Sliders, ShieldAlert, Printer, Search, Play, Stethoscope, Camera,
  Clock, X, ExternalLink, Leaf, Eye, FileText, Bug
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchUserDetectionHistory } from '../services/plantDetectionService.js';

export default function Dashboard({ onConsultAI, onShowToast, isMuted, onNavigateTab }) {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [hoverPoint, setHoverPoint] = useState(null);
  const [irrigatingZoneId, setIrrigatingZoneId] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [loadingDetections, setLoadingDetections] = useState(true);
  const [selectedDetectionModal, setSelectedDetectionModal] = useState(null);
  const chartRef = useRef(null);

  // Fetch telemetry mesh data from backend
  const fetchTelemetry = async (range = timeRange) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/telemetry?range=${range}`);
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
      if (onShowToast) onShowToast('Failed to reach IoT telemetry mesh', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch real plant detection history from Supabase
  const loadDetections = async () => {
    if (!user?.id) return;
    try {
      setLoadingDetections(true);
      const data = await fetchUserDetectionHistory(user.id);
      setRecentDetections(data);
    } catch (err) {
      console.warn('Could not load plant detections for dashboard:', err);
    } finally {
      setLoadingDetections(false);
    }
  };

  useEffect(() => {
    fetchTelemetry(timeRange);
    const interval = setInterval(() => fetchTelemetry(timeRange), 12000);
    return () => clearInterval(interval);
  }, [timeRange]);

  useEffect(() => {
    loadDetections();
  }, [user?.id]);

  // Pulse Irrigate a Zone
  const handleIrrigateZone = async (zone) => {
    try {
      setIrrigatingZoneId(zone.id);
      soundEffects.toggle(true, isMuted);
      const res = await fetch('/api/telemetry/irrigate-zone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zoneId: zone.id })
      });
      const data = await res.json();
      if (data.success) {
        if (onShowToast) onShowToast(`💦 Pulsed irrigation initiated for ${zone.name}`, 'success');
        fetchTelemetry(timeRange);
      }
    } catch (err) {
      console.error('Irrigation error:', err);
      if (onShowToast) onShowToast('Failed to trigger irrigation valve', 'error');
    } finally {
      setTimeout(() => setIrrigatingZoneId(null), 1000);
    }
  };

  // Weather Forecast Data for Agro-Climatic Zone
  const weatherForecast = [
    { day: 'Today', temp: '24°C / 16°C', rainProb: '10%', condition: 'Sunny', icon: Sun, et0: '4.8 mm/d' },
    { day: 'Tomorrow', temp: '21°C / 14°C', rainProb: '85%', condition: 'Heavy Rain', icon: CloudRain, et0: '1.2 mm/d' },
    { day: 'Thu', temp: '22°C / 15°C', rainProb: '40%', condition: 'Scattered Showers', icon: CloudRain, et0: '2.5 mm/d' },
    { day: 'Fri', temp: '25°C / 17°C', rainProb: '0%', condition: 'Clear Sky', icon: Sun, et0: '5.2 mm/d' },
    { day: 'Sat', temp: '27°C / 18°C', rainProb: '5%', condition: 'Partly Cloudy', icon: Sun, et0: '5.6 mm/d' }
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    soundEffects.click(isMuted);
    if (!telemetry || !telemetry.zones) return;
    const headers = [
      'Zone ID', 'Zone Name', 'Crop Type', 'Area', 'Status',
      'Soil Moisture (%)', 'Soil Temp (°C)', 'Air Humidity (%)', 'Soil pH',
      'Nitrogen N (mg/kg)', 'Phosphorus P (mg/kg)', 'Potassium K (mg/kg)',
      'Sunlight (Lux)', 'Node Battery (%)', 'Last Irrigated'
    ];
    
    const rows = telemetry.zones.map(z => [
      z.id,
      `"${z.name}"`,
      `"${z.crop}"`,
      `"${z.area}"`,
      z.status,
      z.soilMoisture,
      z.soilTemp,
      z.airHumidity,
      z.ph,
      z.npk?.n || 0,
      z.npk?.p || 0,
      z.npk?.k || 0,
      z.sunlightLux,
      z.battery,
      `"${z.lastIrrigated}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agri_telemetry_mesh_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('CSV Telemetry report generated and downloaded', 'success');
  };

  const handlePrintReport = () => {
    soundEffects.click(isMuted);
    window.print();
  };

  const zones = telemetry?.zones || [];
  const filteredZones = zones.filter(z => {
    const matchesFilter = selectedZoneFilter === 'all' || z.id.toString() === selectedZoneFilter;
    const matchesSearch = searchTerm.trim() === '' || 
      z.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      z.crop.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Calculate real metrics from actual data
  const totalScansCount = recentDetections.length;
  const criticalDetectionsCount = recentDetections.filter(d => d.severity === 'High' || d.severity === 'Critical').length;
  const avgMoisture = zones.length > 0 
    ? (zones.reduce((sum, z) => sum + (parseFloat(z.soilMoisture) || 0), 0) / zones.length).toFixed(1)
    : '0.0';
  const attentionZones = zones.filter(z => z.status === 'Attention' || parseFloat(z.soilMoisture) < 30);

  const historyData = telemetry?.history || [];

  // SVG Chart Geometry Calculations
  const chartWidth = 720;
  const chartHeight = 170;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const pointsCount = historyData.length;

  const getX = (i) => padLeft + (i / Math.max(1, pointsCount - 1)) * (chartWidth - padLeft - padRight);
  const getYMoisture = (val) => chartHeight - padBottom - ((val - 20) / 60) * (chartHeight - padTop - padBottom);
  const getYTemp = (val) => chartHeight - padBottom - ((val - 10) / 25) * (chartHeight - padTop - padBottom);

  const moisturePath = historyData.length > 0 
    ? historyData.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYMoisture(pt.moisture)}`, '')
    : '';
  const moistureAreaPath = historyData.length > 0
    ? `${moisturePath} L ${getX(pointsCount - 1)} ${chartHeight - padBottom} L ${getX(0)} ${chartHeight - padBottom} Z`
    : '';
  const tempPath = historyData.length > 0
    ? historyData.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYTemp(pt.temp)}`, '')
    : '';

  return (
    <div>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.4rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Precision Agriculture IoT Mesh
            </h1>
            <span className="badge badge-emerald">
              <span className="status-dot"></span> {zones.length > 0 ? `${zones.length * 12} Nodes Active` : 'Mesh Connected'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
            Live soil microclimate, NPK chemistry analytics, evapotranspiration rates & automated irrigation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={handlePrintReport} title="Print Operational PDF">
            <Printer size={15} />
            <span>Print View</span>
          </button>

          <button className="btn-outline" onClick={handleExportCSV} title="Export CSV Data">
            <FileSpreadsheet size={15} />
            <span>Export CSV</span>
          </button>
          
          <button 
            className="btn-emerald" 
            onClick={() => {
              soundEffects.click(isMuted);
              fetchTelemetry(timeRange);
              loadDetections();
              if (onShowToast) onShowToast('Dashboard telemetry & Supabase records synced', 'success');
            }} 
            disabled={loading}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Mesh</span>
          </button>
        </div>
      </div>

      {/* Indian Agro-Climatic Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--emerald-border)',
        borderRadius: '12px',
        padding: '0.85rem 1.1rem',
        marginBottom: '1.4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.8rem',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>🇮🇳</span>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Indian Crop Calendar: Active Rabi Season (रबी सीज़न)
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>PAU / ICAR Monitored</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Sharbati Wheat, Yellow Mustard & Desi Chana in vegetative tiller stage • Evapotranspiration ET0: Favorable
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span className="badge badge-sky" style={{ fontSize: '0.7rem' }}>
            PMKSY Micro-Drip Active
          </span>
          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
            Soil NPK Target 4:2:1
          </span>
        </div>
      </div>

      {/* 4 Summary Stats Cards Grid - Real Data from Supabase & Mesh */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem',
        marginBottom: '1.6rem'
      }}>
        {/* Card 1: Real User Plant Scans (from Supabase plant_detections) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--emerald-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Your Plant Health Scans</span>
            <Stethoscope size={17} style={{ color: 'var(--emerald-main)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--emerald-main)', letterSpacing: '-0.02em' }}>
            {totalScansCount} {totalScansCount === 1 ? 'Scan' : 'Scans'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalScansCount > 0 ? 'Verified in Supabase Database' : 'No scans yet — Upload photo'}
          </div>
        </div>

        {/* Card 2: Pathology Health Status (Real count of high/critical alerts) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--blue-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Pathology Alerts</span>
            <Bug size={17} style={{ color: 'var(--blue-main)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: criticalDetectionsCount > 0 ? 'var(--rose-alert)' : 'var(--blue-main)', letterSpacing: '-0.02em' }}>
            {criticalDetectionsCount} {criticalDetectionsCount === 1 ? 'Action Rx' : 'Action Rx'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {criticalDetectionsCount > 0 ? 'Severe pathogen requiring treatment' : 'No critical crop pathogens detected'}
          </div>
        </div>

        {/* Card 3: Real Soil Moisture Average (from IoT Mesh Zones) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--amber-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Average Soil Moisture</span>
            <Droplets size={17} style={{ color: 'var(--amber-warning)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--amber-warning)', letterSpacing: '-0.02em' }}>
            {avgMoisture}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--amber-warning)', marginTop: '4px', fontWeight: '600' }}>
            {parseFloat(avgMoisture) > 40 ? 'Optimal root hydration balance' : 'Moderate hydration level'}
          </div>
        </div>

        {/* Card 4: Active Zone Attention (Calculated from real zones) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--rose-alert)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Zone Moisture Alerts</span>
            <AlertTriangle size={17} style={{ color: 'var(--rose-alert)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: attentionZones.length > 0 ? 'var(--rose-alert)' : 'var(--emerald-main)', letterSpacing: '-0.02em' }}>
            {attentionZones.length} {attentionZones.length === 1 ? 'Zone' : 'Zones'}
          </div>
          <div style={{ fontSize: '0.74rem', color: attentionZones.length > 0 ? 'var(--rose-alert)' : 'var(--emerald-main)', marginTop: '4px', fontWeight: '600' }}>
            {attentionZones.length > 0 
              ? `${attentionZones[0].name} requires irrigation`
              : 'All operational zones in optimal moisture range'}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Real Plant Pathology History Section (Connected to Supabase) */}
      {/* ==================================================================== */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.1rem', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '1.12rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Stethoscope size={18} style={{ color: 'var(--emerald-main)' }} />
              Recent Plant Pathology Scans & Lab History
            </h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Specimens stored in private Supabase Storage and records protected with Row Level Security (RLS).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {onNavigateTab && (
              <button
                className="btn-emerald"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                onClick={() => onNavigateTab('crop-doctor')}
              >
                <Camera size={14} />
                <span>New Plant Scan</span>
              </button>
            )}
          </div>
        </div>

        {loadingDetections ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="auth-spinner" style={{ color: 'var(--emerald-main)', margin: '0 auto 0.6rem' }} />
            <p style={{ fontSize: '0.84rem' }}>Syncing detection records from Supabase...</p>
          </div>
        ) : recentDetections.length === 0 ? (
          /* Meaningful Empty State */
          <div style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            border: '2px dashed var(--border-subtle)',
            borderRadius: '14px',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <Leaf size={36} style={{ color: 'var(--emerald-main)', opacity: 0.5, marginBottom: '0.6rem' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
              No disease detection history yet. Upload a plant image to get started.
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.25rem' }}>
              Upload crop leaf photographs to detect plant pathogens, track health trends, and store diagnostic reports.
            </p>
            {onNavigateTab && (
              <button
                className="btn-emerald"
                style={{ padding: '0.55rem 1.2rem', fontSize: '0.82rem' }}
                onClick={() => onNavigateTab('crop-doctor')}
              >
                <Camera size={14} />
                <span>Open Crop Doctor Lab</span>
              </button>
            )}
          </div>
        ) : (
          /* Real Detections List */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {recentDetections.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedDetectionModal(item)}
                className="glass-panel-interactive"
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className={`badge ${item.severity === 'High' || item.severity === 'Critical' ? 'badge-alert' : 'badge-emerald'}`} style={{ fontSize: '0.64rem' }}>
                      {item.severity || 'Moderate'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '8px',
                      backgroundColor: '#0f172a',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {item.signedUrl ? (
                        <img
                          src={item.signedUrl}
                          alt={item.original_filename}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Leaf size={20} />
                        </div>
                      )}
                    </div>

                    <div style={{ overflow: 'hidden' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--emerald-main)', fontWeight: '700' }}>
                        {item.crop_type || 'Crop Leaf'}
                      </span>
                      <h4 style={{
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        margin: '2px 0',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.detected_disease || 'Diagnosis In Progress'}
                      </h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Conf: <strong>{item.confidence ? `${item.confidence}%` : 'N/A'}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '0.74rem',
                  color: 'var(--emerald-main)',
                  fontWeight: '700'
                }}>
                  <span>View Details</span>
                  <ChevronRight size={13} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Detection Detail Modal */}
      {selectedDetectionModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(5, 15, 10, 0.78)',
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
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-elevated)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: 'var(--emerald-main)' }} />
                Pathology Scan Report
              </h3>
              <button
                onClick={() => setSelectedDetectionModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {selectedDetectionModal.signedUrl && (
              <div style={{ height: '220px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0f172a', marginBottom: '1.1rem', border: '1px solid var(--border-subtle)' }}>
                <img
                  src={selectedDetectionModal.signedUrl}
                  alt={selectedDetectionModal.original_filename}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            <div style={{
              padding: '0.9rem',
              backgroundColor: 'var(--emerald-bg)',
              borderRadius: '10px',
              border: '1px solid var(--emerald-border)',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  {selectedDetectionModal.confidence ? `${selectedDetectionModal.confidence}% Confidence` : 'Verified'}
                </span>
                <span className={`badge ${selectedDetectionModal.severity === 'High' ? 'badge-alert' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                  Severity: {selectedDetectionModal.severity || 'Moderate'}
                </span>
              </div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: '4px 0' }}>
                {selectedDetectionModal.detected_disease}
              </h4>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Crop: <strong>{selectedDetectionModal.crop_type}</strong> • Scanned on: {new Date(selectedDetectionModal.created_at).toLocaleString()}
              </div>
            </div>

            {selectedDetectionModal.details?.organicRemedy && (
              <div style={{ marginBottom: '0.85rem', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px', borderLeft: '3px solid var(--emerald-main)' }}>
                <h5 style={{ fontSize: '0.82rem', color: 'var(--emerald-main)', fontWeight: '700', marginBottom: '4px' }}>
                  Eco-Friendly Organic Treatment:
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {selectedDetectionModal.details.organicRemedy}
                </p>
              </div>
            )}

            {selectedDetectionModal.details?.chemicalTreatment && (
              <div style={{ marginBottom: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-subtle)', borderRadius: '10px', borderLeft: '3px solid var(--blue-main)' }}>
                <h5 style={{ fontSize: '0.82rem', color: 'var(--blue-main)', fontWeight: '700', marginBottom: '4px' }}>
                  Chemical Remedy:
                </h5>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {selectedDetectionModal.details.chemicalTreatment}
                </p>
              </div>
            )}

            <button
              className="btn-emerald"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setSelectedDetectionModal(null)}
            >
              Close Specimen Report
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Charts & Microclimate Weather */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '1.4rem',
        marginBottom: '1.8rem'
      }}>
        {/* Historical Time-Series Chart */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Activity size={17} style={{ color: 'var(--emerald-main)' }} /> Soil Microclimate Telemetry Trends
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Continuous sensor stream (Moisture % vs Temperature °C)
              </p>
            </div>

            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {['24h', '7d', '30d'].map(range => (
                <button
                  key={range}
                  onClick={() => {
                    soundEffects.click(isMuted);
                    setTimeRange(range);
                  }}
                  style={{
                    padding: '4px 9px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: timeRange === range ? 'var(--emerald-main)' : 'transparent',
                    color: timeRange === range ? '#ffffff' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Area Chart with Tooltip */}
          <div 
            ref={chartRef}
            className="chart-container" 
            style={{ height: '180px', position: 'relative' }}
            onMouseLeave={() => setHoverPoint(null)}
          >
            {hoverPoint && (
              <div 
                className="chart-tooltip" 
                style={{ 
                  left: `${hoverPoint.x}px`, 
                  top: `${hoverPoint.y}px` 
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--emerald-main)', marginBottom: '2px' }}>
                  🕒 {hoverPoint.data.time}
                </div>
                <div style={{ color: 'var(--blue-main)', fontWeight: '600' }}>💧 Soil Moisture: <strong>{hoverPoint.data.moisture}%</strong></div>
                <div style={{ color: 'var(--emerald-main)', fontWeight: '600' }}>🌡️ Soil Temp: <strong>{hoverPoint.data.temp}°C</strong></div>
                <div style={{ color: 'var(--text-muted)' }}>💨 Air Humidity: <strong>{hoverPoint.data.humidity}%</strong></div>
              </div>
            )}

            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {[
                { val: '60%', y: getYMoisture(60) },
                { val: '40%', y: getYMoisture(40) },
                { val: '20%', y: getYMoisture(20) }
              ].map((grid, idx) => (
                <g key={idx}>
                  <line 
                    x1={padLeft} y1={grid.y} 
                    x2={chartWidth - padRight} y2={grid.y} 
                    stroke="var(--border-subtle)" 
                    strokeDasharray="4 4" 
                  />
                  <text 
                    x={padLeft - 6} y={grid.y + 3} 
                    fontSize="10" 
                    fill="var(--text-dim)" 
                    textAnchor="end"
                  >
                    {grid.val}
                  </text>
                </g>
              ))}

              {moistureAreaPath && (
                <path d={moistureAreaPath} fill="url(#moistureGrad)" />
              )}
              {moisturePath && (
                <path d={moisturePath} fill="none" stroke="#0284c7" strokeWidth="2.5" />
              )}
              {tempPath && (
                <path d={tempPath} fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />
              )}

              {historyData.map((pt, i) => (
                <circle
                  key={i}
                  cx={getX(i)}
                  cy={getYMoisture(pt.moisture)}
                  r={hoverPoint?.index === i ? 6 : 3.5}
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={(e) => {
                    const rect = chartRef.current.getBoundingClientRect();
                    setHoverPoint({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top - 70,
                      data: pt,
                      index: i
                    });
                  }}
                />
              ))}

              {historyData.map((pt, i) => (
                <text
                  key={i}
                  x={getX(i)}
                  y={chartHeight - 6}
                  fontSize="10"
                  fill="var(--text-muted)"
                  textAnchor="middle"
                >
                  {pt.time}
                </text>
              ))}
            </svg>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginTop: '0.8rem',
            fontSize: '0.76rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--blue-main)', display: 'inline-block' }}></span>
              Soil Moisture % (Drip Managed)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', backgroundColor: 'var(--emerald-main)', borderTop: '1px dashed var(--emerald-main)', display: 'inline-block' }}></span>
              Root Temperature °C
            </span>
          </div>
        </div>

        {/* 5-Day Weather & Evapotranspiration Panel */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Sun size={17} style={{ color: 'var(--amber-warning)' }} /> Regional Microclimate & ET₀
            </h3>
            <span className="badge badge-indigo" style={{ fontSize: '0.68rem' }}>
              Precision Drip Sync
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weatherForecast.map((wf, idx) => {
              const Icon = wf.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: idx === 0 ? 'var(--emerald-bg)' : 'var(--bg-subtle)',
                    border: idx === 0 ? '1px solid var(--emerald-border)' : '1px solid var(--border-subtle)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon size={17} style={{ color: idx === 0 ? 'var(--emerald-main)' : 'var(--blue-main)' }} />
                    <strong style={{ color: 'var(--text-main)', width: '65px' }}>{wf.day}</strong>
                    <span style={{ color: 'var(--text-secondary)' }}>{wf.condition}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: 'var(--blue-main)', fontWeight: '600' }}>💧 {wf.rainProb}</span>
                    <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{wf.temp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sensor Zone Filter & Search Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.2rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Operational Crop Zones ({filteredZones.length})
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search zones or crops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="auth-input"
              style={{
                paddingLeft: '32px',
                paddingTop: '0.45rem',
                paddingBottom: '0.45rem',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>

          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="auth-input"
            style={{
              paddingTop: '0.45rem',
              paddingBottom: '0.45rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Farm Sectors</option>
            {zones.map(z => (
              <option key={z.id} value={z.id.toString()}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sensor Zone Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '1.2rem'
      }}>
        {filteredZones.map((zone) => {
          const isIrrigating = irrigatingZoneId === zone.id;
          return (
            <div 
              key={zone.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.3rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.8rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {zone.name}
                    </h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--emerald-main)', fontWeight: '600', marginTop: '2px' }}>
                      {zone.crop} • {zone.area}
                    </div>
                  </div>

                  <span className={`badge ${zone.status === 'Optimal' ? 'badge-emerald' : 'badge-alert'}`}>
                    {zone.status === 'Optimal' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                    {zone.status}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Droplets size={11} style={{ color: 'var(--blue-main)' }} /> Soil Moisture
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: parseFloat(zone.soilMoisture) < 30 ? 'var(--rose-alert)' : 'var(--blue-main)', marginTop: '2px' }}>
                      {zone.soilMoisture} %
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={11} style={{ color: 'var(--emerald-main)' }} /> Soil Temp
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                      {zone.soilTemp} °C
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Wind size={11} style={{ color: 'var(--blue-main)' }} /> Air Humidity
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                      {zone.airHumidity} %
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Soil pH Level
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--emerald-main)', marginTop: '2px' }}>
                      {zone.ph} pH
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', marginBottom: '1.1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    NPK Nutrient Ratios (mg/kg)
                  </span>

                  <div className="npk-bar-container">
                    <div className="npk-bar-item">
                      <span className="npk-label">N</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.n / 180) * 100)}%`, backgroundColor: 'var(--emerald-main)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--emerald-main)' }}>{zone.npk.n}</span>
                    </div>

                    <div className="npk-bar-item">
                      <span className="npk-label">P</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.p / 90) * 100)}%`, backgroundColor: 'var(--blue-main)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--blue-main)' }}>{zone.npk.p}</span>
                    </div>

                    <div className="npk-bar-item">
                      <span className="npk-label">K</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.k / 220) * 100)}%`, backgroundColor: 'var(--amber-warning)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--amber-warning)' }}>{zone.npk.k}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn-outline"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
                    onClick={() => handleIrrigateZone(zone)}
                    disabled={isIrrigating}
                  >
                    <Droplets size={13} style={{ color: 'var(--blue-main)' }} />
                    <span>{isIrrigating ? 'Pulsing...' : 'Quick Irrigate'}</span>
                  </button>

                  <button
                    className="btn-emerald"
                    style={{ flex: 1.3, fontSize: '0.78rem', padding: '0.45rem' }}
                    onClick={() => {
                      if (onConsultAI) {
                        onConsultAI(`🌾 Agronomy analysis for ${zone.name} (${zone.crop}): Soil Moisture is ${zone.soilMoisture}%, Temp is ${zone.soilTemp}°C, pH is ${zone.ph}, NPK is N:${zone.npk.n} P:${zone.npk.p} K:${zone.npk.k}. What specific irrigation, fertilization, or crop care steps do you recommend?`);
                      }
                    }}
                  >
                    <Bot size={13} />
                    <span>Consult AI</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '2px'
                }}>
                  <span>Irrigated: {zone.lastIrrigated}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BatteryCharging size={11} style={{ color: 'var(--emerald-main)' }} /> {zone.battery}% Power
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
