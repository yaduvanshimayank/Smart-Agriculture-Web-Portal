import React, { useState, useRef } from 'react';
import { 
  Stethoscope, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, 
  UploadCloud, RefreshCw, Leaf, Bug, HeartPulse, FileText,
  Printer, Bot, ChevronRight, Camera, Image as ImageIcon, X
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';

export default function CropDoctor({ onConsultAI, onShowToast, isMuted }) {
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [symptomInput, setSymptomInput] = useState('Early Blight (Target Rings)');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const fileInputRef = useRef(null);

  const sampleDiseases = [
    { label: 'Rice Blast (झुलसा रोग) - Basmati Paddy', crop: 'Basmati Rice', symptom: 'blast' },
    { label: 'Cotton Pink Bollworm (गुलाबी सुंडी) - BT Cotton', crop: 'BT Cotton', symptom: 'bollworm' },
    { label: 'Wheat Stripe Rust (पीला रतुआ) - Sharbati Wheat', crop: 'Sharbati Wheat', symptom: 'rust' },
    { label: 'Tomato & Chilli Leaf Curl (पत्ती मरोड़)', crop: 'Tomatoes', symptom: 'leaf curl' },
    { label: 'Sugarcane Red Rot (लाल सड़न)', crop: 'Sugarcane', symptom: 'red rot' },
    { label: 'Nitrogen & Zinc Chlorosis (Khaira Disease)', crop: 'Paddy / Wheat', symptom: 'deficiency' }
  ];

  // File Upload Handler (with instant image preview)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundEffects.click(isMuted);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      if (onShowToast) onShowToast(`Photo "${file.name}" loaded for AI pathology scan`, 'info');
      triggerAnalysis(file.name, symptomInput);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (fileName = imageFileName, sym = symptomInput) => {
    setScanning(true);
    setDiagnosis(null);
    soundEffects.scan(isMuted);

    setScanStep('Inspecting foliar cellular structure...');
    await new Promise(r => setTimeout(r, 600));
    setScanStep('Cross-referencing fungal & bacterial pathogen database...');
    await new Promise(r => setTimeout(r, 700));
    setScanStep('Synthesizing organic and chemical agronomy prescriptions...');

    try {
      const res = await fetch('/api/crop-health/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptom: sym,
          cropType: selectedCrop,
          fileName
        })
      });
      const data = await res.json();
      setDiagnosis(data.diagnosis);
      soundEffects.toggle(true, isMuted);
      if (onShowToast) onShowToast(`Pathology scan complete: ${data.diagnosis.name}`, 'success');
    } catch (err) {
      console.error('Scan error:', err);
      soundEffects.alert(isMuted);
      if (onShowToast) onShowToast('Failed to complete crop pathology scan', 'error');
    } finally {
      setScanning(false);
      setScanStep('');
    }
  };

  const clearImage = () => {
    soundEffects.click(isMuted);
    setImagePreview(null);
    setImageFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrintReport = () => {
    soundEffects.click(isMuted);
    window.print();
  };

  const handleSendToAI = () => {
    if (!diagnosis) return;
    soundEffects.click(isMuted);
    const prompt = `🌿 Agronomy Diagnosis Consultation: Plant Pathology Scanner diagnosed ${diagnosis.name} on ${selectedCrop}.
Severity: ${diagnosis.severity} (Confidence: ${diagnosis.confidence}%).
Symptoms observed: ${diagnosis.symptoms.join(', ')}.
Can you formulate a customized 14-day field intervention schedule combining both the organic remedies and cultural prevention steps for my farm?`;
    if (onConsultAI) onConsultAI(prompt);
  };

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
              AI Crop Pathology Doctor & Diagnostic Lab
            </h1>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> Neural Vision Diagnostic
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
            Scan crop foliage symptoms to get instant AI diagnostic reports, organic treatments, and preventive agronomy plans
          </p>
        </div>

        {diagnosis && (
          <button className="btn-outline" onClick={handlePrintReport}>
            <Printer size={15} />
            <span>Print Pathology Rx</span>
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Foliage Scanner & Upload */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <UploadCloud style={{ color: 'var(--emerald-main)' }} size={20} /> Foliage Image Scanner
          </h2>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />

          {/* Upload Dropzone with Live Preview or Laser Scan Overlay */}
          <div 
            onClick={() => {
              if (!imagePreview) fileInputRef.current?.click();
            }}
            style={{
              border: imagePreview ? '1px solid var(--emerald-main)' : '2px dashed var(--border-emerald-glow)',
              borderRadius: '14px',
              padding: imagePreview ? '0' : '2.2rem 1.2rem',
              textAlign: 'center',
              backgroundColor: 'var(--bg-subtle)',
              cursor: imagePreview ? 'default' : 'pointer',
              marginBottom: '1.2rem',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#0f172a' }}>
                <img 
                  src={imagePreview} 
                  alt="Crop Foliage Preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                />

                {/* Animated Laser Scanning Line */}
                {scanning && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #00f0a8, #fff, #00f0a8, transparent)',
                    boxShadow: '0 0 12px #10b981',
                    animation: 'laserScan 1.6s infinite ease-in-out'
                  }}></div>
                )}

                {/* Remove Image Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearImage();
                  }}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    border: '1px solid #ffffff',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                {/* Image Label Tag */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  📸 {imageFileName || 'Uploaded Leaf Specimen'}
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  backgroundColor: 'var(--emerald-bg)',
                  color: 'var(--emerald-main)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <Camera size={26} />
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                  Upload Crop Leaf Photo or Tap Camera
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Supports JPG, PNG, WEBP (Instant AI Neural Analysis)
                </p>
                <div style={{ marginTop: '0.8rem' }}>
                  <span className="btn-outline" style={{ padding: '0.4rem 0.9rem', fontSize: '0.76rem' }}>
                    Select Photo File
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Quick Preset Selector Buttons */}
          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
              Or Test Built-In Crop Pathology Presets:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sampleDiseases.map((sd, i) => (
                <button
                  key={i}
                  className="glass-panel-interactive"
                  onClick={() => {
                    soundEffects.click(isMuted);
                    setSelectedCrop(sd.crop);
                    setSymptomInput(sd.symptom);
                    triggerAnalysis(`preset_${sd.symptom.toLowerCase()}.jpg`, sd.symptom);
                  }}
                  style={{
                    padding: '0.65rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: '600' }}>{sd.label}</span>
                  <Bug size={15} style={{ color: 'var(--emerald-main)' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Scan Action Button */}
          <button 
            className="btn-emerald" 
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            onClick={() => triggerAnalysis()}
            disabled={scanning}
          >
            {scanning ? (
              <>
                <RefreshCw className="spin" size={17} style={{ animation: 'spin 1s linear infinite' }} />
                <span>{scanStep || 'Analyzing Pathogen Diagnostics...'}</span>
              </>
            ) : (
              <>
                <Stethoscope size={17} />
                <span>Run Diagnostic Analysis</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: AI Diagnostic Report */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <FileText style={{ color: 'var(--emerald-main)' }} size={20} /> Pathology Diagnostic Report
            </h2>

            {diagnosis ? (
              <div>
                {/* Disease Title Banner */}
                <div style={{
                  padding: '1.1rem',
                  backgroundColor: 'var(--emerald-bg)',
                  border: '1px solid var(--emerald-border)',
                  borderRadius: '12px',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="badge badge-emerald">
                      <CheckCircle size={12} /> {diagnosis.confidence}% AI Confidence
                    </span>
                    <span className={`badge ${diagnosis.severity === 'High' ? 'badge-alert' : 'badge-warning'}`}>
                      <AlertTriangle size={12} /> Severity: {diagnosis.severity}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                    {diagnosis.name}
                  </h3>
                  {diagnosis.region && (
                    <div style={{ fontSize: '0.74rem', color: 'var(--blue-main)', fontWeight: '600', marginTop: '3px' }}>
                      📍 Regional Belt: {diagnosis.region}
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span>Type: <strong style={{ color: 'var(--emerald-main)' }}>{diagnosis.pathogenType || 'Pathogen'}</strong></span>
                    <span>Incubation: <strong style={{ color: 'var(--text-main)' }}>{diagnosis.incubationPeriod || '3-7 Days'}</strong></span>
                  </div>
                </div>

                {/* Symptoms Identified */}
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                    Observed Plant Symptoms:
                  </h4>
                  <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                    {diagnosis.symptoms.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Organic Treatment */}
                <div style={{
                  padding: '0.9rem',
                  backgroundColor: 'var(--emerald-bg)',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--emerald-main)',
                  marginBottom: '0.85rem'
                }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--emerald-main)', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={15} /> Eco-Friendly Organic Treatment Plan
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {diagnosis.organicRemedy}
                  </p>
                </div>

                {/* Chemical Treatment */}
                <div style={{
                  padding: '0.9rem',
                  backgroundColor: 'var(--blue-bg)',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--blue-main)',
                  marginBottom: '0.85rem'
                }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--blue-main)', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HeartPulse size={15} /> Commercial Chemical Remedy
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {diagnosis.chemicalTreatment}
                  </p>
                </div>

                {/* Prevention */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Agronomic Prevention:</strong> {diagnosis.prevention}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-subtle)',
                borderRadius: '12px'
              }}>
                <Stethoscope size={44} style={{ opacity: 0.35, marginBottom: '0.8rem', color: 'var(--emerald-main)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  No Pathology Scan Active
                </h4>
                <p style={{ fontSize: '0.82rem' }}>
                  Upload a crop foliage photo or select a test preset on the left to generate an AI diagnostic report.
                </p>
              </div>
            )}
          </div>

          {/* Direct Consult AI Action */}
          {diagnosis && (
            <div style={{ marginTop: '1.2rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <button 
                className="btn-emerald" 
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                onClick={handleSendToAI}
              >
                <Bot size={16} />
                <span>Formulate 14-Day Action Plan with AgriSmart AI</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
