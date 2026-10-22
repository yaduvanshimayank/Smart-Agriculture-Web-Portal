import React, { useState, useRef, useEffect } from 'react';
import { 
  Stethoscope, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, 
  UploadCloud, RefreshCw, Leaf, Bug, HeartPulse, FileText,
  Printer, Bot, ChevronRight, Camera, Image as ImageIcon, X,
  Clock, Trash2, History, ExternalLink, AlertCircle, ArrowRight
} from 'lucide-react';
import { soundEffects } from '../utils/audio.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  validateImageFile, 
  uploadAndAnalyzePlantImage, 
  fetchUserDetectionHistory,
  deleteDetectionRecord 
} from '../services/plantDetectionService.js';

export default function CropDoctor({ onConsultAI, onShowToast, isMuted, onDetectionComplete }) {
  const { user } = useAuth();
  const [selectedCrop, setSelectedCrop] = useState('Tomatoes');
  const [symptomInput, setSymptomInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFileName, setImageFileName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeView, setActiveView] = useState('scan'); // 'scan' | 'history'
  const fileInputRef = useRef(null);

  // Load real detection history from Supabase
  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      setLoadingHistory(true);
      const records = await fetchUserDetectionHistory(user.id);
      setHistory(records);
    } catch (err) {
      console.warn('Failed to load detection history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  // File Upload Handler (Validates format and size immediately)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMsg(validation.error);
      soundEffects.alert(isMuted);
      if (onShowToast) onShowToast(validation.error, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    soundEffects.click(isMuted);
    setSelectedFile(file);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
      if (onShowToast) onShowToast(`Photo "${file.name}" loaded for AI pathology analysis`, 'info');
    };
    reader.readAsDataURL(file);
  };

  // Run the full Supabase Storage + Pathology Model pipeline
  const runAnalysis = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select or capture a plant foliage photo first.');
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    setScanning(true);
    setErrorMsg('');
    setDiagnosis(null);
    soundEffects.scan(isMuted);

    try {
      const result = await uploadAndAnalyzePlantImage({
        file: selectedFile,
        cropType: selectedCrop,
        symptomNote: symptomInput,
        user,
        onStepChange: (step) => setScanStep(step)
      });

      setDiagnosis(result.diagnosis);
      if (result.signedUrl) {
        setImagePreview(result.signedUrl);
      }
      soundEffects.toggle(true, isMuted);
      if (onShowToast) onShowToast(`Diagnostic analysis complete: ${result.diagnosis.name}`, 'success');

      // Refresh history
      await loadHistory();
      if (onDetectionComplete) onDetectionComplete();
    } catch (err) {
      console.error('Plant diagnosis pipeline error:', err);
      soundEffects.alert(isMuted);
      setErrorMsg(err.message || 'Failed to complete plant pathology diagnosis.');
      if (onShowToast) onShowToast(`Analysis error: ${err.message}`, 'error');
    } finally {
      setScanning(false);
      setScanStep('');
    }
  };

  const clearImage = () => {
    soundEffects.click(isMuted);
    setSelectedFile(null);
    setImagePreview(null);
    setImageFileName('');
    setDiagnosis(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePrintReport = () => {
    soundEffects.click(isMuted);
    window.print();
  };

  const handleSelectPastScan = (scan) => {
    soundEffects.click(isMuted);
    setDiagnosis(scan.details || {
      name: scan.detected_disease,
      confidence: scan.confidence,
      severity: scan.severity,
      symptoms: ['Historical recorded foliar symptom'],
      organicRemedy: 'Consult detailed agronomy history in Supabase records.',
      chemicalTreatment: 'Refer to original diagnostic prescription.',
      prevention: 'Maintain preventive integrated pest management (IPM).'
    });
    setSelectedCrop(scan.crop_type || 'Crop Leaf Specimen');
    setImagePreview(scan.signedUrl || null);
    setImageFileName(scan.original_filename);
    setActiveView('scan');
    if (onShowToast) onShowToast(`Loaded historical scan: ${scan.detected_disease}`, 'info');
  };

  const handleDeleteScan = async (e, scan) => {
    e.stopPropagation();
    soundEffects.click(isMuted);
    try {
      await deleteDetectionRecord(scan.id, scan.image_path);
      setHistory(prev => prev.filter(item => item.id !== scan.id));
      if (onShowToast) onShowToast('Detection record removed', 'info');
      if (onDetectionComplete) onDetectionComplete();
    } catch (err) {
      if (onShowToast) onShowToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleSendToAI = () => {
    if (!diagnosis) return;
    soundEffects.click(isMuted);
    const symptomsText = Array.isArray(diagnosis.symptoms) ? diagnosis.symptoms.join(', ') : 'foliar pathogen';
    const prompt = `🌿 Agronomy Diagnosis Consultation: Plant Pathology Scanner diagnosed ${diagnosis.name} on ${selectedCrop}.
Severity: ${diagnosis.severity} (Confidence: ${diagnosis.confidence}%).
Symptoms observed: ${symptomsText}.
Can you formulate a customized 14-day field intervention schedule combining both the organic remedies and cultural prevention steps for my farm?`;
    if (onConsultAI) onConsultAI(prompt);
  };

  return (
    <div>
      {/* Title & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.4rem',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              AI Crop Pathology Doctor & Diagnostic Lab
            </h1>
            <span className="badge badge-emerald">
              <Sparkles size={11} /> Supabase Storage Integrated
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '3px' }}>
            Upload authentic plant leaves to store specimens in Supabase Storage and obtain verified pathology reports.
          </p>
        </div>

        {/* View Switcher: New Scan vs Scan History */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => {
                soundEffects.click(isMuted);
                setActiveView('scan');
              }}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeView === 'scan' ? 'var(--emerald-main)' : 'transparent',
                color: activeView === 'scan' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Stethoscope size={14} />
              <span>Diagnostic Lab</span>
            </button>

            <button
              onClick={() => {
                soundEffects.click(isMuted);
                setActiveView('history');
                loadHistory();
              }}
              style={{
                padding: '5px 12px',
                fontSize: '0.78rem',
                fontWeight: '700',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeView === 'history' ? 'var(--emerald-main)' : 'transparent',
                color: activeView === 'history' ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <History size={14} />
              <span>Scan History ({history.length})</span>
            </button>
          </div>

          {diagnosis && (
            <button className="btn-outline" onClick={handlePrintReport}>
              <Printer size={15} />
              <span>Print Pathology Rx</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === 'history' ? (
        /* Detection History View */
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.18rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={20} style={{ color: 'var(--emerald-main)' }} />
              Saved Plant Disease Diagnostics
            </h2>

            <button
              onClick={loadHistory}
              className="btn-outline"
              style={{ padding: '4px 10px', fontSize: '0.76rem' }}
              disabled={loadingHistory}
            >
              <RefreshCw size={13} style={{ animation: loadingHistory ? 'spin 1s linear infinite' : 'none' }} />
              <span>Refresh Records</span>
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="auth-spinner" style={{ color: 'var(--emerald-main)', margin: '0 auto 0.8rem' }} />
              <p>Fetching real diagnostic history from Supabase PostgreSQL...</p>
            </div>
          ) : history.length === 0 ? (
            /* Meaningful Empty State */
            <div style={{
              textAlign: 'center',
              padding: '4rem 1.5rem',
              border: '2px dashed var(--border-subtle)',
              borderRadius: '16px',
              backgroundColor: 'var(--bg-subtle)'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--emerald-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald-main)',
                margin: '0 auto 1.25rem'
              }}>
                <Stethoscope size={30} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                No disease detection history yet
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto 1.5rem' }}>
                Upload a plant foliage image to get started. All specimens and diagnoses will be securely archived here with your Supabase account.
              </p>
              <button
                className="btn-emerald"
                style={{ padding: '0.65rem 1.4rem' }}
                onClick={() => {
                  soundEffects.click(isMuted);
                  setActiveView('scan');
                }}
              >
                <Camera size={16} />
                <span>Upload Plant Image</span>
              </button>
            </div>
          ) : (
            /* History Grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.2rem'
            }}>
              {history.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => handleSelectPastScan(scan)}
                  className="glass-panel-interactive"
                  style={{
                    padding: '1.1rem',
                    borderRadius: '14px',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative'
                  }}
                >
                  <div>
                    {/* Header: Date and Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {new Date(scan.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`badge ${scan.status === 'completed' ? 'badge-emerald' : scan.status === 'failed' ? 'badge-alert' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                          {scan.status.toUpperCase()}
                        </span>
                        <button
                          onClick={(e) => handleDeleteScan(e, scan)}
                          title="Delete Record"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-dim)',
                            cursor: 'pointer',
                            padding: '3px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Image Preview & Details */}
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '10px',
                        backgroundColor: '#0f172a',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {scan.signedUrl ? (
                          <img
                            src={scan.signedUrl}
                            alt={scan.original_filename}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                            <Leaf size={24} />
                          </div>
                        )}
                      </div>

                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--emerald-main)', fontWeight: '700' }}>
                          {scan.crop_type || 'Crop Specimen'}
                        </div>
                        <h4 style={{
                          fontSize: '0.94rem',
                          fontWeight: '800',
                          color: 'var(--text-main)',
                          margin: '2px 0 4px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {scan.detected_disease || 'Unspecified Disease'}
                        </h4>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          File: {scan.original_filename}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats & Open Action */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.65rem',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '0.76rem'
                  }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Confidence: <strong style={{ color: 'var(--emerald-main)' }}>{scan.confidence ? `${scan.confidence}%` : 'N/A'}</strong>
                    </span>

                    <span style={{ color: 'var(--emerald-main)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                      View Rx <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Active Scanner & Diagnosis View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Left Column: Foliage Scanner & Upload */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <UploadCloud style={{ color: 'var(--emerald-main)' }} size={20} /> Specimen Foliage Scanner
            </h2>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="auth-alert auth-alert-error" style={{ marginBottom: '1rem' }}>
                <AlertTriangle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp,image/jpg" 
              style={{ display: 'none' }} 
            />

            {/* Upload Dropzone */}
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
                minHeight: '210px',
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

                  <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    left: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}>
                    📸 {imageFileName || 'Leaf Specimen'}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    backgroundColor: 'var(--emerald-bg)',
                    color: 'var(--emerald-main)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '0.8rem'
                  }}>
                    <Camera size={26} />
                  </div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: '700', marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                    Upload Leaf Photo or Capture Specimen
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                    JPG, PNG, or WEBP (Max 10 MB). Stored securely in your private Supabase Storage bucket.
                  </p>
                  <div style={{ marginTop: '0.8rem' }}>
                    <span className="btn-outline" style={{ padding: '0.45rem 1rem', fontSize: '0.78rem' }}>
                      Select Photo File
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Crop Type & Optional Observed Symptoms Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Crop Category
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="auth-input"
                  style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  <option value="Tomatoes">Tomatoes (Solanaceous)</option>
                  <option value="Basmati Rice">Basmati Rice (Paddy)</option>
                  <option value="Sharbati Wheat">Sharbati Wheat (Cereal)</option>
                  <option value="BT Cotton">BT Cotton (Fiber)</option>
                  <option value="Sugarcane">Sugarcane (Cash Crop)</option>
                  <option value="Citrus / Orange">Citrus & Kinnow (Orchard)</option>
                  <option value="Yellow Mustard">Yellow Mustard (Oilseed)</option>
                  <option value="Green Vegetables">Vegetables / Chilli (Horticulture)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: '600' }}>
                  Observed Field Symptoms (Optional Notes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Yellow target rings on lower leaves, powdery mildew, curling"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  className="auth-input"
                  style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Scan Action Button */}
            <button 
              className="btn-emerald" 
              style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
              onClick={runAnalysis}
              disabled={scanning}
            >
              {scanning ? (
                <>
                  <RefreshCw className="spin" size={17} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>{scanStep || 'Processing Image & Diagnosing...'}</span>
                </>
              ) : (
                <>
                  <Stethoscope size={17} />
                  <span>Upload & Run Pathology Scan</span>
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
                      <span className={`badge ${diagnosis.severity === 'High' || diagnosis.severity === 'Critical' ? 'badge-alert' : 'badge-warning'}`}>
                        <AlertTriangle size={12} /> Severity: {diagnosis.severity || 'Moderate'}
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
                      <span>Pathogen: <strong style={{ color: 'var(--emerald-main)' }}>{diagnosis.pathogenType || 'Pathology Agent'}</strong></span>
                      <span>Incubation: <strong style={{ color: 'var(--text-main)' }}>{diagnosis.incubationPeriod || '3-7 Days'}</strong></span>
                    </div>
                  </div>

                  {/* Symptoms Identified */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem', letterSpacing: '0.04em' }}>
                      Observed Plant Symptoms:
                    </h4>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      {Array.isArray(diagnosis.symptoms) && diagnosis.symptoms.map((s, idx) => (
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
                /* Meaningful Empty Scan State */
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 1.5rem',
                  color: 'var(--text-muted)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '12px'
                }}>
                  <Stethoscope size={44} style={{ opacity: 0.35, marginBottom: '0.8rem', color: 'var(--emerald-main)' }} />
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    No Active Pathology Scan
                  </h4>
                  <p style={{ fontSize: '0.82rem', maxWidth: '320px', margin: '0 auto' }}>
                    Upload or capture a crop leaf photo to analyze symptoms with the neural agronomy vision model and store records in Supabase.
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
      )}
    </div>
  );
}
