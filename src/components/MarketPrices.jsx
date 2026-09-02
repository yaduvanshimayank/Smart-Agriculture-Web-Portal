import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, RefreshCw, 
  BarChart3, Globe, ShieldCheck, ShoppingCart
} from 'lucide-react';

export default function MarketPrices() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/market-prices');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  if (!data && loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
        <p>Fetching Commodity Market Index & Futures...</p>
      </div>
    );
  }

  const commodities = data?.commodities || [];

  return (
    <div>
      {/* Title */}
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
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>Agricultural Commodity Market Intelligence</h1>
            <span className="badge badge-emerald">
              <Globe size={12} /> Global Grain Index
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Real-time crop market prices, 24h price trends, and export recommendation advice
          </p>
        </div>

        <button className="btn-outline" onClick={fetchPrices} disabled={loading}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh Market Index</span>
        </button>
      </div>

      {/* Commodity Tickers Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.4rem'
      }}>
        {commodities.map((item) => {
          const isUp = item.change24h > 0;
          return (
            <div key={item.id} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{item.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Per {item.unit}</span>
                </div>
                <div style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '8px',
                  backgroundColor: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: isUp ? 'var(--emerald-light)' : 'var(--rose-alert)',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isUp ? '+' : ''}{item.change24h}%
                </div>
              </div>

              <div style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'var(--font-mono)', marginBottom: '0.8rem', color: '#ffffff' }}>
                ${item.price.toFixed(2)}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                backgroundColor: 'rgba(5, 20, 14, 0.6)',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--border-emerald)'
              }}>
                <strong style={{ color: 'var(--emerald-light)', display: 'block', marginBottom: '0.2rem' }}>
                  Market Advice:
                </strong>
                {item.advice}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
