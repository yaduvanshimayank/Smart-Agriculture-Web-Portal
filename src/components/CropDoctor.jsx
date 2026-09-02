import React, { useState } from 'react';
import { 
  Stethoscope, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, 
  UploadCloud, RefreshCw, Leaf, Bug, HeartPulse, FileText
} from 'lucide-react';

export default function CropDoctor() {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [symptomInput, setSymptomInput] = useState('Early Blight (Target Rings)');
  const [scanning, setScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  const sampleDiseases = [
    { label: 'Tomato Target Rings & Leaf Spot', symptom: 'Blight' },
    { label: 'Wheat Yellow Stripe Rust', symptom: 'Rust' },
    { label: 'Corn Pale Yellow Leaf (Chlorosis)', symptom: 'Nitrogen' },
    { label: 'Cucumber White Powdery Spots', symptom: 'Powdery' }
  ];

  const handleScan = async (overrideSymptom) => {
    const sym = overrideSymptom || symptomInput;
    setScanning(true);
    setDiagnosis(null);

    try {
      const res = await fetch('/api/crop-health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: sym,
          cropType: selectedCrop
        })
      });
      const data = await res.json();
      setDiagnosis(data.diagnosis);
    } catch (err) {
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '1.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800' }}>AI Crop Health Doctor & Disease Diagnostics</h1>
          <span className="badge badge-emerald">
            <Sparkles size={12} /> Neural Vision Diagnostic
          </span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Scan crop foliage symptoms to get instant AI diagnostic reports, organic treatments, and preventive agronomy plans
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.8rem' }}>
        {/* Left Column: Diagnostic Input Scanner */}
        <div className="glass-panel" style={{ padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud style={{ color: 'var(--emerald-main)' }} size={22} /> Upload or Select Symptom
          </h2>

          {/* Photo Dropzone Simulation */}
          <div 
            onClick={() => handleScan()}
            style={{
              border: '2px dashed var(--border-emerald-glow)',
              borderRadius: '14px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: 'rgba(5, 20, 14, 0.6)',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '54px', height: '54px', borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--emerald-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Leaf size={28} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.3rem' }}>
              Drag & Drop Crop Foliage Photo Here
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Supports JPG, PNG, WEBP (Max 15MB) or click to run AI analysis demo
            </p>
          </div>

          {/* Sample preset selector */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '600' }}>
              Quick Sample Symptom Selectors:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sampleDiseases.map((sd, i) => (
                <button
                  key={i}
                  className="glass-panel-interactive"
                  onClick={() => {
                    setSymptomInput(sd.symptom);
                    handleScan(sd.symptom);
                  }}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-emerald)',
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{sd.label}</span>
                  <Bug size={16} style={{ color: 'var(--emerald-main)' }} />
                </button>
              ))}
            </div>
          </div>

          <button 
            className="btn-emerald" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
            onClick={() => handleScan()}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <RefreshCw className="spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Plant Cellular Pathology...
              </>
            ) : (
              <>
                <Stethoscope size={18} />
                Run AI Diagnostic Analysis
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Diagnostic Report */}
        <div className="glass-panel" style={{ padding: '1.8rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText style={{ color: 'var(--emerald-main)' }} size={22} /> Diagnostic Pathology Report
          </h2>

          {diagnosis ? (
            <div>
              {/* Disease Title Banner */}
              <div style={{
                padding: '1.2rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid var(--border-emerald-glow)',
                borderRadius: '12px',
                marginBottom: '1.4rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span className="badge badge-emerald">
                    <CheckCircle size={12} /> {diagnosis.confidence}% AI Confidence
                  </span>
                  <span className={`badge ${diagnosis.severity === 'High' ? 'badge-alert' : 'badge-warning'}`}>
                    <AlertTriangle size={12} /> Severity: {diagnosis.severity}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#ffffff' }}>
                  {diagnosis.name}
                </h3>
              </div>

              {/* Symptoms Identified */}
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                  Observed Symptoms:
                </h4>
                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                  {diagnosis.symptoms.map((s, idx) => (
                    <li key={idx} style={{ marginBottom: '0.3rem' }}>{s}</li>
                  ))}
                </ul>
              </div>

              {/* Organic Remedy */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '10px',
                borderLeft: '4px solid var(--emerald-main)',
                marginBottom: '1rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--emerald-light)', fontWeight: '700', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf size={16} /> Eco-Friendly / Organic Treatment Plan
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {diagnosis.organicRemedy}
                </p>
              </div>

              {/* Chemical Treatment */}
              <div style={{
                padding: '1rem',
                backgroundColor: 'rgba(14, 165, 233, 0.08)',
                borderRadius: '10px',
                borderLeft: '4px solid #0ea5e9',
                marginBottom: '1rem'
              }}>
                <h4 style={{ fontSize: '0.9rem', color: '#38bdf8', fontWeight: '700', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartPulse size={16} /> Commercial Chemical Remedy
                </h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                  {diagnosis.chemicalTreatment}
                </p>
              </div>

              {/* Prevention */}
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'rgba(5, 20, 14, 0.6)', padding: '0.8rem 1rem', borderRadius: '10px' }}>
                <strong style={{ color: 'var(--text-main)' }}>Prevention & Agronomy Best Practice:</strong> {diagnosis.prevention}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-muted)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '12px'
            }}>
              <Stethoscope size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Select a symptom or click "Run AI Diagnostic Analysis" on the left to inspect plant pathology.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
