import React, { useState, useEffect } from 'react';
import { 
  Droplets, Thermometer, Sun, Wind, Activity, RefreshCw, 
  AlertTriangle, CheckCircle2, Sprout, Compass, BatteryCharging,
  TrendingUp, CloudRain, Zap, FileSpreadsheet, Bot, ChevronRight,
  Sliders, ShieldAlert
} from 'lucide-react';

export default function Dashboard({ onConsultAI }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [hoverDataIndex, setHoverDataIndex] = useState(null);

  const fetchTelemetry = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/telemetry');
      const data = await res.json();
      setTelemetry(data);
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  // Mock historical data for time-series charts (24h trend)
  const historicalSeries = [
    { time: '00:00', moisture: 42, temp: 18.5, humidity: 72 },
    { time: '04:00', moisture: 41, temp: 17.8, humidity: 76 },
    { time: '08:00', moisture: 48, temp: 21.2, humidity: 68 },
    { time: '12:00', moisture: 44, temp: 26.4, humidity: 54 },
    { time: '16:00', moisture: 39, temp: 25.1, humidity: 59 },
    { time: '20:00', moisture: 46, temp: 20.3, humidity: 71 },
    { time: 'Now', moisture: 46.5, temp: 22.4, humidity: 64.2 }
  ];

  // 5-day weather forecast mock
  const weatherForecast = [
    { day: 'Today', temp: '24°C / 16°C', rainProb: '10%', condition: 'Sunny', icon: Sun, et0: '4.8 mm/d' },
    { day: 'Tomorrow', temp: '21°C / 14°C', rainProb: '85%', condition: 'Heavy Rain', icon: CloudRain, et0: '1.2 mm/d' },
    { day: 'Thu', temp: '22°C / 15°C', rainProb: '40%', condition: 'Scattered Showers', icon: CloudRain, et0: '2.5 mm/d' },
    { day: 'Fri', temp: '25°C / 17°C', rainProb: '0%', condition: 'Clear Sky', icon: Sun, et0: '5.2 mm/d' },
    { day: 'Sat', temp: '27°C / 18°C', rainProb: '5%', condition: 'Partly Cloudy', icon: Sun, et0: '5.6 mm/d' }
  ];

  // Handle CSV Export
  const handleExportCSV = () => {
    if (!telemetry || !telemetry.zones) return;
    const headers = ['Zone ID', 'Zone Name', 'Crop Type', 'Area', 'Status', 'Soil Moisture (%)', 'Soil Temp (°C)', 'Air Humidity (%)', 'pH', 'Nitrogen (mg/kg)', 'Phosphorus (mg/kg)', 'Potassium (mg/kg)', 'Battery (%)'];
    
    const rows = telemetry.zones.map(z => [
      z.id, `"${z.name}"`, `"${z.crop}"`, `"${z.area}"`, z.status,
      z.soilMoisture, z.soilTemp, z.airHumidity, z.ph,
      z.npk.n, z.npk.p, z.npk.k, z.battery
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agri_telemetry_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!telemetry && loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: 'var(--emerald-main)' }} />
        <p style={{ fontWeight: '600' }}>Connecting to Smart Agriculture IoT Mesh...</p>
      </div>
    );
  }

  const zones = telemetry?.zones || [];
  const filteredZones = selectedZoneFilter === 'all' 
    ? zones 
    : zones.filter(z => z.id.toString() === selectedZoneFilter);

  // SVG Chart Calculation
  const chartWidth = 700;
  const chartHeight = 160;
  const padding = 20;
  const pointsCount = historicalSeries.length;
  
  const getX = (index) => padding + (index / (pointsCount - 1)) * (chartWidth - 2 * padding);
  const getYMoisture = (val) => chartHeight - padding - ((val - 30) / 40) * (chartHeight - 2 * padding);
  const getYTemp = (val) => chartHeight - padding - ((val - 10) / 25) * (chartHeight - 2 * padding);

  const moisturePath = historicalSeries.reduce((acc, pt, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYMoisture(pt.moisture)}`, '');
  
  const moistureAreaPath = `${moisturePath} L ${getX(pointsCount - 1)} ${chartHeight - padding} L ${getX(0)} ${chartHeight - padding} Z`;

  const tempPath = historicalSeries.reduce((acc, pt, i) => 
    `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYTemp(pt.temp)}`, '');

  return (
    <div>
      {/* Top Banner Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.8rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Precision Agriculture IoT Dashboard
            </h1>
            <span className="badge badge-emerald">
              <span className="status-dot"></span> 48 Sensor Nodes Live
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time soil microclimate, NPK chemistry analytics, evapotranspiration rates & automated irrigation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-outline" onClick={handleExportCSV} title="Export CSV Report">
            <FileSpreadsheet size={16} />
            <span>Export CSV</span>
          </button>
          
          <button className="btn-outline" onClick={fetchTelemetry} disabled={loading}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Mesh</span>
          </button>
        </div>
      </div>

      {/* Top Summary Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginBottom: '1.8rem'
      }}>
        {/* Card 1: Farm Health */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Farm Health Index</span>
            <Activity size={18} style={{ color: 'var(--emerald-main)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--emerald-light)', fontFamily: 'var(--font-mono)' }}>
            94.8%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-main)', marginTop: '4px' }}>
            +2.4% vs last week (Optimal Soil Conditions)
          </div>
        </div>

        {/* Card 2: Water Conservation */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Water Saved (Month)</span>
            <Droplets size={18} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
            18,400 L
          </div>
          <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '4px' }}>
            ⚡ 28% water saved via precision drip cycles
          </div>
        </div>

        {/* Card 3: Yield Projection */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Harvest Yield Forecast</span>
            <TrendingUp size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fbbf24', fontFamily: 'var(--font-mono)' }}>
            42.5 Tons
          </div>
          <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '4px' }}>
            +14% projected yield gain vs baseline
          </div>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="glass-panel" style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            <span>Active Field Alerts</span>
            <AlertTriangle size={18} style={{ color: 'var(--amber-warning)' }} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--amber-warning)', fontFamily: 'var(--font-mono)' }}>
            1 Warning
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber-warning)', marginTop: '4px' }}>
            Zone 3: Moisture 28% (Below 30% target)
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Charts & Microclimate Weather */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {/* Historical Time-Series Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} style={{ color: 'var(--emerald-main)' }} /> Soil Microclimate Telemetry Trends
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Continuous 24-hour sensor stream (Moisture % vs Temperature °C)
              </p>
            </div>

            {/* Time Range Selector */}
            <div style={{ display: 'flex', gap: '4px', background: 'rgba(5, 20, 14, 0.8)', padding: '3px', borderRadius: '8px' }}>
              {['24h', '7d', '30d'].map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  style={{
                    padding: '3px 8px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '5px',
                    backgroundColor: timeRange === range ? 'var(--emerald-main)' : 'transparent',
                    color: timeRange === range ? '#03140c' : 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Area Chart */}
          <div className="chart-container" style={{ height: '170px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1={padding} y1={chartHeight/2} x2={chartWidth - padding} y2={chartHeight/2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="rgba(255,255,255,0.1)" />

              {/* Area Fill */}
              <path d={moistureAreaPath} fill="url(#moistureGrad)" />

              {/* Moisture Line */}
              <path d={moisturePath} fill="none" stroke="#60a5fa" strokeWidth="2.5" />

              {/* Temperature Line */}
              <path d={tempPath} fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" />

              {/* Points & Hover Triggers */}
              {historicalSeries.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={getX(i)}
                    cy={getYMoisture(pt.moisture)}
                    r={hoverDataIndex === i ? "6" : "4"}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                    onMouseEnter={() => setHoverDataIndex(i)}
                  />
                  <circle
                    cx={getX(i)}
                    cy={getYTemp(pt.temp)}
                    r={hoverDataIndex === i ? "5" : "3"}
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1"
                    style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                    onMouseEnter={() => setHoverDataIndex(i)}
                  />
                  <text
                    x={getX(i)}
                    y={chartHeight - 4}
                    fill="var(--text-muted)"
                    fontSize="10"
                    textAnchor="middle"
                  >
                    {pt.time}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#60a5fa', borderRadius: '2px' }}></span> Soil Moisture (%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', backgroundColor: '#10b981', borderRadius: '2px', borderStyle: 'dashed' }}></span> Soil Temp (°C)
            </span>
          </div>
        </div>

        {/* 5-Day Microclimate & Smart Irrigation Advisory */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sun size={18} style={{ color: '#fbbf24' }} /> Weather & Evapotranspiration ($ET_0$)
              </h3>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                Precision Advisory
              </span>
            </div>

            {/* Smart Rain Advisory Alert Banner */}
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '10px',
              padding: '0.8rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <CloudRain size={22} style={{ color: '#60a5fa', flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem' }}>
                <strong style={{ color: '#93c5fd', display: 'block' }}>Rain Expected Tomorrow (85% Probability)</strong>
                <span style={{ color: 'var(--text-muted)' }}>
                  Smart drip irrigation automatically paused for 24h to save approx. 1,200 Liters.
                </span>
              </div>
            </div>

            {/* 5-Day Forecast Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '6px'
            }}>
              {weatherForecast.map((w, idx) => {
                const IconComponent = w.icon;
                return (
                  <div key={idx} className="weather-card">
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{w.day}</span>
                    <IconComponent size={18} style={{ color: w.rainProb !== '0%' ? '#60a5fa' : '#fbbf24', margin: '4px 0' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', display: 'block' }}>{w.temp.split('/')[0]}</span>
                    <span style={{ fontSize: '0.65rem', color: '#60a5fa', display: 'block' }}>☔ {w.rainProb}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
            <span>Average Evapotranspiration Rate: <strong style={{ color: 'var(--emerald-light)' }}>3.8 mm/day</strong></span>
            <span>Solar Radiation Index: <strong style={{ color: '#fbbf24' }}>High</strong></span>
          </div>
        </div>
      </div>

      {/* Field Zones Section Header & Filter Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sprout style={{ color: 'var(--emerald-main)' }} size={22} /> Field Zones & Soil Microclimate Breakdown
        </h2>

        {/* Zone Filter Tab Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button 
            className={`zone-filter-tab ${selectedZoneFilter === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedZoneFilter('all')}
          >
            All Zones ({zones.length})
          </button>
          {zones.map(z => (
            <button
              key={z.id}
              className={`zone-filter-tab ${selectedZoneFilter === z.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedZoneFilter(z.id.toString())}
            >
              {z.name.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Field Zones Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem'
      }}>
        {filteredZones.map((zone) => {
          const isWarning = zone.status !== 'Optimal';
          return (
            <div 
              key={zone.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.5rem',
                borderColor: isWarning ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-emerald)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Zone Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{zone.name}</h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Crop: <strong style={{ color: 'var(--emerald-light)' }}>{zone.crop}</strong> • {zone.area}
                    </div>
                  </div>
                  <span className={`badge ${isWarning ? 'badge-warning' : 'badge-emerald'}`}>
                    {isWarning ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                    {zone.status}
                  </span>
                </div>

                {/* Progress Bar for Moisture */}
                <div style={{ marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Droplets size={14} style={{ color: '#3b82f6' }} /> Soil Moisture Content
                    </span>
                    <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', color: zone.soilMoisture < 30 ? 'var(--amber-warning)' : 'var(--emerald-light)' }}>
                      {zone.soilMoisture}%
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${zone.soilMoisture}%`,
                      height: '100%',
                      background: zone.soilMoisture < 30 
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : 'linear-gradient(90deg, #3b82f6, #10b981)',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.8rem',
                  backgroundColor: 'rgba(5, 20, 14, 0.6)',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1.2rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Thermometer size={12} /> Soil Temp
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {zone.soilTemp} °C
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Wind size={12} /> Air Humidity
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {zone.airHumidity} %
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Soil pH Level
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--emerald-light)' }}>
                      {zone.ph} pH
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Sun size={12} /> Sunlight
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {(zone.sunlightLux / 1000).toFixed(1)} kLx
                    </div>
                  </div>
                </div>

                {/* Visual NPK Target Chemistry Bars */}
                <div style={{ fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.6rem', fontWeight: '600' }}>
                    NPK Nutrient Ratios vs Crop Target (mg/kg)
                  </span>

                  <div className="npk-bar-container">
                    {/* Nitrogen */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Nitrogen (N)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.n / 180) * 100)}%`, backgroundColor: '#10b981' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: '#34d399' }}>{zone.npk.n}</span>
                    </div>

                    {/* Phosphorus */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Phosphorus (P)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.p / 90) * 100)}%`, backgroundColor: '#3b82f6' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: '#60a5fa' }}>{zone.npk.p}</span>
                    </div>

                    {/* Potassium */}
                    <div className="npk-bar-item">
                      <span className="npk-label">Potassium (K)</span>
                      <div className="npk-track">
                        <div className="npk-fill" style={{ width: `${Math.min(100, (zone.npk.k / 220) * 100)}%`, backgroundColor: '#f59e0b' }}></div>
                      </div>
                      <span className="npk-value" style={{ color: '#fbbf24' }}>{zone.npk.k}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div style={{
                paddingTop: '0.9rem',
                borderTop: '1px solid rgba(255,255,255,0.05)'
              }}>
                <button
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '0.55rem' }}
                  onClick={() => {
                    if (onConsultAI) {
                      onConsultAI(`🌾 I am analyzing ${zone.name} (${zone.crop}). Current metrics: Soil Moisture is ${zone.soilMoisture}%, Soil Temp is ${zone.soilTemp}°C, pH is ${zone.ph}, NPK is N:${zone.npk.n} P:${zone.npk.p} K:${zone.npk.k}. What specific irrigation, fertilization, or crop care steps do you recommend?`);
                    }
                  }}
                >
                  <Bot size={14} />
                  <span>Consult AgriGroq AI on {zone.name.split('-')[0]}</span>
                  <ChevronRight size={14} />
                </button>
                
                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.7rem'
                }}>
                  <span>Irrigated: {zone.lastIrrigated}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <BatteryCharging size={12} /> {zone.battery}% Node Power
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
