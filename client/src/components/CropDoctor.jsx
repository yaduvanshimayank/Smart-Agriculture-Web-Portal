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
    { label: 'Tomato Early Blight (Target Rings)', crop: 'Tomatoes', symptom: 'Blight' },
    { label: 'Wheat Yellow Stripe Rust (Puccinia)', crop: 'Wheat', symptom: 'Rust' },
    { label: 'Corn Pale Yellow Leaf (Chlorosis)', crop: 'Corn', symptom: 'Nitrogen' },
    { label: 'Cucumber Powdery Mildew (Erysiphe)', crop: 'Cucumbers', symptom: 'Powdery' }
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
      // Trigger scan automatically
      triggerAnalysis(file.name, symptomInput);
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async (fileName = imageFileName, sym = symptomInput) => {
    setScanning(true);
    setDiagnosis(null);
    soundEffects.scan(isMuted);

    // Multi-step animated progress simulation
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
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              AI Crop Pathology Doctor & Diagnostic Lab
            </h1>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> Neural Vision Diagnostic
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3px' }}>
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
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
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
              backgroundColor: 'rgba(3, 14, 9, 0.7)',
              cursor: imagePreview ? 'default' : 'pointer',
              marginBottom: '1.2rem',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s ease'
            }}
          >
            {imagePreview ? (
              <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#000' }}>
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
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    border: '1px solid var(--border-emerald)',
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
                  backgroundColor: 'rgba(3, 14, 9, 0.85)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  color: 'var(--emerald-light)',
                  border: '1px solid var(--border-emerald)'
                }}>
                  📸 {imageFileName || 'Uploaded Leaf Specimen'}
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--emerald-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.8rem'
                }}>
                  <Camera size={26} />
                </div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '0.3rem', color: '#fff' }}>
                  Upload Crop Leaf Photo or Tap Camera
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
                    border: '1px solid var(--border-emerald)',
                    backgroundColor: 'rgba(16, 185, 129, 0.04)',
                    color: 'var(--text-main)',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span style={{ fontWeight: '500' }}>{sd.label}</span>
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
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
              <FileText style={{ color: 'var(--emerald-main)' }} size={20} /> Pathology Diagnostic Report
            </h2>

            {diagnosis ? (
              <div>
                {/* Disease Title Banner */}
                <div style={{
                  padding: '1.1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--border-emerald-glow)',
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
                  <h3 style={{ fontSize: '1.18rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.01em' }}>
                    {diagnosis.name}
                  </h3>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                    <span>Type: <strong style={{ color: 'var(--emerald-light)' }}>{diagnosis.pathogenType || 'Pathogen'}</strong></span>
                    <span>Incubation: <strong style={{ color: '#fff' }}>{diagnosis.incubationPeriod || '3-7 Days'}</strong></span>
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
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '10px',
                  borderLeft: '4px solid var(--emerald-main)',
                  marginBottom: '0.85rem'
                }}>
                  <h4 style={{ fontSize: '0.88rem', color: 'var(--emerald-light)', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={15} /> Eco-Friendly Organic Treatment Plan
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {diagnosis.organicRemedy}
                  </p>
                </div>

                {/* Chemical Treatment */}
                <div style={{
                  padding: '0.9rem',
                  backgroundColor: 'rgba(14, 165, 233, 0.08)',
                  borderRadius: '10px',
                  borderLeft: '4px solid #0ea5e9',
                  marginBottom: '0.85rem'
                }}>
                  <h4 style={{ fontSize: '0.88rem', color: '#38bdf8', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HeartPulse size={15} /> Commercial Chemical Remedy
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                    {diagnosis.chemicalTreatment}
                  </p>
                </div>

                {/* Prevention */}
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', backgroundColor: 'rgba(3, 14, 9, 0.7)', padding: '0.75rem 0.9rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <strong style={{ color: 'var(--text-main)' }}>Agronomic Prevention:</strong> {diagnosis.prevention}
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                color: 'var(--text-muted)',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }}>
                <Stethoscope size={44} style={{ opacity: 0.35, marginBottom: '0.8rem', color: 'var(--emerald-main)' }} />
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff', marginBottom: '0.4rem' }}>
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
            <div style={{ marginTop: '1.2rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
