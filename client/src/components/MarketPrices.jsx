import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, RefreshCw, 
  BarChart3, Globe, ShieldCheck, ShoppingCart, Search,
  Bot, ChevronRight, Bell, Check, Sparkles
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';

export default function MarketPrices({ onConsultAI, onShowToast, isMuted }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [alertActiveId, setAlertActiveId] = useState(null);

  const fetchPrices = async (currency = selectedCurrency) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/market-prices?currency=${currency}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch market prices:', err);
      if (onShowToast) onShowToast('Failed to sync global commodity ticker', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(selectedCurrency);
  }, [selectedCurrency]);

  const handleCurrencyChange = (curr) => {
    soundEffects.click(isMuted);
    setSelectedCurrency(curr);
    if (onShowToast) onShowToast(`Commodity prices converted to ${curr}`, 'info');
  };

  const handleSetAlert = (item) => {
    soundEffects.toggle(true, isMuted);
    setAlertActiveId(item.id);
    setTimeout(() => setAlertActiveId(null), 2500);
    if (onShowToast) onShowToast(`Price movement alert active for ${item.name}`, 'success');
  };

  const handleConsultAIOnCommodity = (item) => {
    soundEffects.click(isMuted);
    const prompt = `📊 Agricultural Commodity Economics: ${item.name} is trading at ${item.symbol}${item.price} per ${item.unit} (24h Trend: ${item.change24h > 0 ? '+' : ''}${item.change24h}%, Sentiment: ${item.sentiment}). Market advice indicates: "${item.advice}". As a precision farm economist, should I sell my surplus inventory now, store in grain silos, or hedge with futures contracts?`;
    if (onConsultAI) onConsultAI(prompt);
  };

  const commodities = data?.commodities || [];
  const categories = ['All', 'Grains', 'Oilseeds', 'Cash Crops'];

  const filteredCommodities = commodities.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.advice.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              Agricultural Commodity Market Intelligence
            </h1>
            <span className="badge badge-emerald">
              <Globe size={11} /> Global Grain Index
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3px' }}>
            Real-time crop market prices, 7-day sparkline trends, and export recommendation advice
          </p>
        </div>

        {/* Currency Switcher & Refresh */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Currency Switcher Buttons */}
          <div style={{ display: 'flex', gap: '3px', background: 'rgba(3, 14, 9, 0.8)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-emerald)' }}>
            {['USD', 'EUR', 'INR', 'GBP', 'CAD'].map(curr => (
              <button
                key={curr}
                onClick={() => handleCurrencyChange(curr)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '5px',
                  border: 'none',
                  backgroundColor: selectedCurrency === curr ? 'var(--emerald-main)' : 'transparent',
                  color: selectedCurrency === curr ? '#021209' : 'var(--text-muted)',
                  fontWeight: '700',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {curr}
              </button>
            ))}
          </div>

          <button 
            className="btn-outline" 
            onClick={() => {
              soundEffects.click(isMuted);
              fetchPrices(selectedCurrency);
              if (onShowToast) onShowToast('Commodity index refreshed from global markets', 'info');
            }} 
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Sync Prices</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.2rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`zone-filter-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                soundEffects.click(isMuted);
                setSelectedCategory(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            placeholder="Search commodity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.45rem 0.8rem 0.45rem 2rem',
              fontSize: '0.78rem',
              backgroundColor: 'rgba(3, 14, 9, 0.8)',
              border: '1px solid var(--border-emerald)',
              borderRadius: '8px',
              color: '#fff',
              outline: 'none',
              width: '180px'
            }}
          />
        </div>
      </div>

      {/* Commodity Tickers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
        gap: '1.2rem'
      }}>
        {filteredCommodities.map((item) => {
          const isUp = item.change24h > 0;
          const history = item.history7d || [item.price * 0.96, item.price * 0.98, item.price * 1.01, item.price];
          
          // Generate Mini SVG Sparkline
          const sparkWidth = 140;
          const sparkHeight = 36;
          const min = Math.min(...history);
          const max = Math.max(...history);
          const range = Math.max(0.01, max - min);
          
          const sparkPoints = history.map((val, idx) => {
            const x = (idx / (history.length - 1)) * sparkWidth;
            const y = sparkHeight - 4 - ((val - min) / range) * (sparkHeight - 8);
            return `${x},${y}`;
          }).join(' ');

          return (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{item.name}</h3>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Category: <strong style={{ color: 'var(--emerald-light)' }}>{item.category}</strong> • Per {item.unit}
                    </div>
                  </div>

                  <div style={{
                    padding: '0.25rem 0.55rem',
                    borderRadius: '8px',
                    backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                    color: isUp ? 'var(--emerald-light)' : 'var(--rose-alert)',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {isUp ? '+' : ''}{item.change24h}%
                  </div>
                </div>

                {/* Price Display & 7-Day Sparkline */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '1.9rem', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#ffffff', letterSpacing: '-0.02em' }}>
                    {item.symbol}{item.price.toFixed(2)}
                  </div>

                  {/* SVG Sparkline */}
                  <div style={{ width: `${sparkWidth}px`, height: `${sparkHeight}px` }}>
                    <svg width={sparkWidth} height={sparkHeight} style={{ overflow: 'visible' }}>
                      <polyline
                        fill="none"
                        stroke={isUp ? '#10b981' : '#f43f5e'}
                        strokeWidth="2.2"
                        points={sparkPoints}
                      />
                    </svg>
                    <div style={{ fontSize: '0.64rem', color: 'var(--text-dim)', textAlign: 'right', marginTop: '2px' }}>
                      7-day trajectory
                    </div>
                  </div>
                </div>

                {/* Market Sentiment & Advice */}
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'rgba(3, 14, 9, 0.75)',
                  padding: '0.8rem 0.9rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-emerald)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ color: 'var(--emerald-light)', fontSize: '0.78rem' }}>
                      Market Advisory:
                    </strong>
                    <span className={`badge ${item.sentiment === 'Bullish' || item.sentiment === 'Strong Buy' ? 'badge-emerald' : 'badge-warning'}`} style={{ fontSize: '0.62rem' }}>
                      {item.sentiment || 'Neutral'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.78rem', lineHeight: '1.45', display: 'block' }}>
                    {item.advice}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  className="btn-outline"
                  style={{ flex: 1, fontSize: '0.76rem', padding: '0.45rem' }}
                  onClick={() => handleSetAlert(item)}
                >
                  {alertActiveId === item.id ? <Check size={12} style={{ color: 'var(--emerald-light)' }} /> : <Bell size={12} />}
                  <span>{alertActiveId === item.id ? 'Alert Set' : 'Price Alert'}</span>
                </button>

                <button
                  className="btn-emerald"
                  style={{ flex: 1.4, fontSize: '0.76rem', padding: '0.45rem' }}
                  onClick={() => handleConsultAIOnCommodity(item)}
                >
                  <Bot size={13} />
                  <span>Consult AI Strategy</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
