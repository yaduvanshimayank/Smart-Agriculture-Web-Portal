import React, { useState, useEffect, useRef } from 'react';
import { 
  Droplets, Thermometer, Sun, Wind, Activity, RefreshCw, 
  AlertTriangle, CheckCircle2, Sprout, Compass, BatteryCharging,
  TrendingUp, CloudRain, Zap, FileSpreadsheet, Bot, ChevronRight,
  Sliders, ShieldAlert, Printer, Search, Play
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';

export default function Dashboard({ onConsultAI, onShowToast, isMuted }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [hoverPoint, setHoverPoint] = useState(null);
  const [irrigatingZoneId, setIrrigatingZoneId] = useState(null);
  const chartRef = useRef(null);

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

  useEffect(() => {
    fetchTelemetry(timeRange);
    const interval = setInterval(() => fetchTelemetry(timeRange), 12000);
    return () => clearInterval(interval);
  }, [timeRange]);

  // Quick Action to Pulse Irrigate a Zone
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

  // Weather Forecast Data
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

  // Print Telemetry Report
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

  const historyData = telemetry?.history || [
    { time: '00:00', moisture: 42.0, temp: 18.5, humidity: 72 },
    { time: '04:00', moisture: 41.2, temp: 17.8, humidity: 76 },
    { time: '08:00', moisture: 48.4, temp: 21.2, humidity: 68 },
    { time: '12:00', moisture: 44.1, temp: 26.4, humidity: 54 },
    { time: '16:00', moisture: 39.5, temp: 25.1, humidity: 59 },
    { time: '20:00', moisture: 46.0, temp: 20.3, humidity: 71 },
    { time: 'Now', moisture: 46.5, temp: 22.4, humidity: 64.2 }
  ];

  // SVG Chart Geometry Calculations
  const chartWidth = 720;
  const chartHeight = 170;
  const padLeft = 40;
  const padRight = 20;
  const padTop = 15;
  const padBottom = 25;
  const pointsCount = historyData.length;

  const getX = (i) => padLeft + (i / Math.max(1, pointsCount - 1)) * (chartWidth - padLeft - padRight);
  // Moisture: 20% to 80% scale
  const getYMoisture = (val) => chartHeight - padBottom - ((val - 20) / 60) * (chartHeight - padTop - padBottom);
  // Temp: 10°C to 35°C scale
  const getYTemp = (val) => chartHeight - padBottom - ((val - 10) / 25) * (chartHeight - padTop - padBottom);

  const moisturePath = historyData.reduce((acc, pt, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYMoisture(pt.moisture)}`, '');
  const moistureAreaPath = `${moisturePath} L ${getX(pointsCount - 1)} ${chartHeight - padBottom} L ${getX(0)} ${chartHeight - padBottom} Z`;

  const tempPath = historyData.reduce((acc, pt, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYTemp(pt.temp)}`, '');

  return (
    <div>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.6rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Precision Agriculture IoT Mesh
            </h1>
            <span className="badge badge-emerald">
              <span className="status-dot"></span> 48 Nodes Live
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
            Real-time soil microclimate, NPK chemistry analytics, evapotranspiration rates & automated irrigation
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
              if (onShowToast) onShowToast('Mesh telemetry synced across all 48 sensor nodes', 'success');
            }} 
            disabled={loading}
          >
            <RefreshCw size={15} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Mesh</span>
          </button>
        </div>
      </div>

      {/* Indian Agro-Climatic & Seasonal Banner */}
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
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.3rem' }}>🇮🇳</span>
          <div>
            <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              Indian Crop Calendar: Active Rabi Season (रबी सीज़न)
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>PAU / ICAR Monitored</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Sharbati Wheat, Yellow Mustard & Desi Chana in vegetative tiller stage • Western Disturbance Moisture: Favorable
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

      {/* 4 Summary Stats Cards Grid with White Main Surfaces & Subordinate Accents */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem',
        marginBottom: '1.6rem'
      }}>
        {/* Card 1: Farm Health (Emerald Subordinate) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--emerald-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Farm Health Index</span>
            <Activity size={17} style={{ color: 'var(--emerald-main)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--emerald-main)', letterSpacing: '-0.02em' }}>
            {telemetry?.overallHealthIndex || 94.8}%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--emerald-main)', marginTop: '4px', fontWeight: '600' }}>
            +2.4% vs last week (Optimal Soil Conditions)
          </div>
        </div>

        {/* Card 2: Water Conservation (Sky Blue Subordinate) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--blue-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Water Conserved</span>
            <Droplets size={17} style={{ color: 'var(--blue-main)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--blue-main)', letterSpacing: '-0.02em' }}>
            18,400 L
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--blue-main)', marginTop: '4px', fontWeight: '600' }}>
            ⚡ 28% water saved via precision drip cycles
          </div>
        </div>

        {/* Card 3: Yield Projection (Harvest Amber Subordinate) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--amber-warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Harvest Yield Projection</span>
            <TrendingUp size={17} style={{ color: 'var(--amber-warning)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--amber-warning)', letterSpacing: '-0.02em' }}>
            42.5 Tons
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--amber-warning)', marginTop: '4px', fontWeight: '600' }}>
            +14% projected yield gain vs baseline
          </div>
        </div>

        {/* Card 4: Active Alerts (Rose Alert Subordinate) */}
        <div className="glass-panel" style={{ padding: '1.3rem', borderTop: '3px solid var(--rose-alert)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: '600' }}>Active Field Alerts</span>
            <AlertTriangle size={17} style={{ color: 'var(--rose-alert)' }} />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--rose-alert)', letterSpacing: '-0.02em' }}>
            1 Attention
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--rose-alert)', marginTop: '4px', fontWeight: '600' }}>
            Zone 3 (Orchard): Moisture at 27% (Below 30%)
          </div>
        </div>
      </div>

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
            {/* Dynamic Interactive Floating Tooltip */}
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

              {/* Y-Axis Gridlines & Scale Labels */}
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
                    fill="var(--text-dim)" 
                    fontSize="9" 
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {grid.val}
                  </text>
                </g>
              ))}

              {/* Area Fill */}
              <path d={moistureAreaPath} fill="url(#moistureGrad)" />

              {/* Moisture Line */}
              <path d={moisturePath} fill="none" stroke="#0284c7" strokeWidth="2.5" />

              {/* Temperature Line */}
              <path d={tempPath} fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="3 3" />

              {/* Points & Hover Hit Areas */}
              {historyData.map((pt, i) => {
                const cx = getX(i);
                const cyM = getYMoisture(pt.moisture);
                const isHovered = hoverPoint?.index === i;
                return (
                  <g key={i}>
                    {/* Hover Target Circle */}
                    <circle
                      cx={cx}
                      cy={cyM}
                      r="16"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        const rect = chartRef.current?.getBoundingClientRect();
                        const clientX = e.clientX - (rect?.left || 0);
                        const clientY = cyM;
                        setHoverPoint({ index: i, data: pt, x: clientX, y: clientY });
                      }}
                    />
                    
                    {/* Visual Dot */}
                    <circle
                      cx={cx}
                      cy={cyM}
                      r={isHovered ? 6 : 4}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2 : 1.5}
                      style={{ pointerEvents: 'none', transition: 'r 0.15s ease' }}
                    />

                    {/* Temp Dot */}
                    <circle
                      cx={cx}
                      cy={getYTemp(pt.temp)}
                      r={isHovered ? 5 : 3}
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="1"
                      style={{ pointerEvents: 'none', transition: 'r 0.15s ease' }}
                    />

                    {/* Time Label on X-Axis */}
                    <text
                      x={cx}
                      y={chartHeight - 4}
                      fill="var(--text-muted)"
                      fontSize="9.5"
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {pt.time}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Chart Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '0.6rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#0284c7', borderRadius: '2px' }}></span>
              <span>Soil Moisture (%)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#059669', borderRadius: '2px', borderStyle: 'dashed' }}></span>
              <span>Soil Temp (°C)</span>
            </span>
          </div>
        </div>

        {/* 5-Day Microclimate Weather Advisory */}
        <div className="glass-panel" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.7rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Sun size={17} style={{ color: 'var(--amber-warning)' }} /> Weather & Evapotranspiration ($ET_0$)
              </h3>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                Automated Advisory
              </span>
            </div>

            {/* Smart Rain Advisory Banner */}
            <div style={{
              backgroundColor: 'var(--blue-bg)',
              border: '1px solid var(--blue-border)',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              marginBottom: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CloudRain size={22} style={{ color: 'var(--blue-main)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.78rem' }}>
                <strong style={{ color: 'var(--blue-dark)', display: 'block' }}>Rain Expected Tomorrow (85% Probability)</strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  Smart drip irrigation automatically queued for 24h delay to conserve ~1,400 Liters.
                </span>
              </div>
            </div>

            {/* 5-Day Forecast Grid */}
            <div className="weather-grid">
              {weatherForecast.map((w, idx) => {
                const IconComponent = w.icon;
                return (
                  <div key={idx} className="weather-card">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{w.day}</span>
                    <IconComponent size={18} style={{ color: w.rainProb !== '0%' ? 'var(--blue-main)' : 'var(--amber-warning)', margin: '4px auto' }} />
                    <span style={{ fontSize: '0.74rem', fontWeight: '700', display: 'block', color: 'var(--text-main)' }}>{w.temp.split('/')[0]}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--blue-main)', display: 'block', fontWeight: '600' }}>☔ {w.rainProb}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.9rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.6rem' }}>
            <span>Average Evapotranspiration: <strong style={{ color: 'var(--emerald-main)' }}>3.8 mm/day</strong></span>
            <span>Solar Radiation Index: <strong style={{ color: 'var(--amber-warning)' }}>High (UV 7.2)</strong></span>
          </div>
        </div>
      </div>

      {/* Field Zones Section Header & Interactive Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.2rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Sprout style={{ color: 'var(--emerald-main)' }} size={20} /> Field Zones & Root-Zone Soil Chemistry
          </h2>
          <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
            {filteredZones.length} of {zones.length} Zones
          </span>
        </div>

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Quick Search */}
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search crop or zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.45rem 0.8rem 0.45rem 2rem',
                fontSize: '0.78rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                width: '160px'
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button 
              className={`zone-filter-tab ${selectedZoneFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                soundEffects.click(isMuted);
                setSelectedZoneFilter('all');
              }}
            >
              All Zones
            </button>
            {zones.map(z => (
              <button
                key={z.id}
                className={`zone-filter-tab ${selectedZoneFilter === z.id.toString() ? 'active' : ''}`}
                onClick={() => {
                  soundEffects.click(isMuted);
                  setSelectedZoneFilter(z.id.toString());
                }}
              >
                {z.name.split('-')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Field Zones Cards Grid (White Main Surface with Subordinate Accent Highlights) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
        gap: '1.2rem'
      }}>
        {filteredZones.map((zone) => {
          const isWarning = zone.status !== 'Optimal';
          const isIrrigating = irrigatingZoneId === zone.id;

          return (
            <div 
              key={zone.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.4rem',
                borderLeft: isWarning ? '4px solid var(--amber-warning)' : '4px solid var(--emerald-main)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Zone Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-main)' }}>{zone.name}</h3>
                    {zone.soilType && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--emerald-main)', fontWeight: '600', marginTop: '2px' }}>
                        🌾 {zone.soilType}
                      </div>
                    )}
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Crop: <strong style={{ color: 'var(--text-main)' }}>{zone.crop}</strong> • {zone.area}
                    </div>
                  </div>
                  <span className={`badge ${isWarning ? 'badge-warning' : 'badge-emerald'}`}>
                    {isWarning ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {zone.status}
                  </span>
                </div>

                {/* Progress Bar for Moisture */}
                <div style={{ marginBottom: '1.1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Droplets size={13} style={{ color: 'var(--blue-main)' }} /> Soil Moisture Content
                    </span>
                    <span style={{ fontWeight: '700', color: zone.soilMoisture < 30 ? 'var(--amber-warning)' : 'var(--blue-main)' }}>
                      {zone.soilMoisture}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <div style={{
                      width: `${Math.min(100, zone.soilMoisture)}%`,
                      height: '100%',
                      background: zone.soilMoisture < 30 
                        ? 'linear-gradient(90deg, var(--amber-light), var(--rose-light))'
                        : 'linear-gradient(90deg, var(--blue-main), var(--emerald-main))',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>

                {/* Key Metrics Grid (Crisp Sub-surface) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.7rem',
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.9rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={11} style={{ color: 'var(--rose-alert)' }} /> Soil Temp
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

                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sun size={11} style={{ color: 'var(--amber-warning)' }} /> Sunlight Lux
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                      {(zone.sunlightLux / 1000).toFixed(1)} kLx
                    </div>
                  </div>
                </div>

                {/* Visual NPK Target Chemistry Bars */}
                <div style={{ fontSize: '0.78rem', marginBottom: '1.1rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                    NPK Nutrient Ratios vs Crop Target (mg/kg)
                  </span>

                  <div className="npk-bar-container">
                    {/* Nitrogen (Emerald) */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Nitrogen (N)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.n / 180) * 100)}%`, backgroundColor: 'var(--emerald-main)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--emerald-main)' }}>{zone.npk.n}</span>
                    </div>

                    {/* Phosphorus (Blue) */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Phosphorus (P)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.p / 90) * 100)}%`, backgroundColor: 'var(--blue-main)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--blue-main)' }}>{zone.npk.p}</span>
                    </div>

                    {/* Potassium (Amber) */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Potassium (K)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.k / 220) * 100)}%`, backgroundColor: 'var(--amber-warning)' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: 'var(--amber-warning)' }}>{zone.npk.k}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{
                paddingTop: '0.85rem',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Pulse Irrigate Action */}
                  <button
                    className="btn-outline"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '0.45rem' }}
                    onClick={() => handleIrrigateZone(zone)}
                    disabled={isIrrigating}
                  >
                    <Droplets size={13} style={{ color: 'var(--blue-main)' }} />
                    <span>{isIrrigating ? 'Pulsing...' : 'Quick Irrigate'}</span>
                  </button>

                  {/* Consult AI Button */}
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
