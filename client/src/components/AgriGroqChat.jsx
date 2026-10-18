import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Key, AlertCircle, RefreshCw, 
  HelpCircle, ShieldCheck, User, CheckCircle2, ShieldAlert,
  Copy, Check, Trash2, Download, Mic, MicOff, Volume2
} from 'lucide-react';
import ApiKeyModal from './ApiKeyModal.jsx';
import { soundEffects } from '../utils/audio.js';

export default function AgriGroqChat({ initialPrompt, onClearInitialPrompt, onShowToast, isMuted }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('agri_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `👋 Hello! I am **AgriSmart AI**, powered by Groq's high-speed agronomic inference engine.

I am strictly constrained to answer **farming, agronomy, crop pathology, and smart IoT agriculture questions only** (e.g. crop cultivation, soil health, pest control, NPK fertilization, irrigation scheduling, greenhouse climate, and agricultural commodity markets).

How can I assist your farm today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('groq_api_key') || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Save chat to localStorage
  useEffect(() => {
    localStorage.setItem('agri_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleSaveKey = (key) => {
    setUserApiKey(key);
    if (key) {
      localStorage.setItem('groq_api_key', key);
      if (onShowToast) onShowToast('Groq API Key securely stored for this session', 'success');
    } else {
      localStorage.removeItem('groq_api_key');
      if (onShowToast) onShowToast('Using system default Groq & Agronomy Engine', 'info');
    }
  };

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
      const inputEl = document.getElementById('agri-chat-input');
      inputEl?.focus();
    }
  }, [initialPrompt]);

  const suggestedPrompts = [
    { label: "🌾 Wheat NPK & Zinc", query: "How to optimize 4:2:1 NPK fertilizer and Zinc Sulfate for Sharbati Wheat?" },
    { label: "🐛 Cotton Pink Bollworm", query: "What is the ICAR-recommended integrated pest management for Pink Bollworm in BT Cotton?" },
    { label: "🌱 Jeevamrut & Neem Astra", query: "How to formulate indigenous Jeevamrut and Neem Astra for natural organic farming?" },
    { label: "🌾 Basmati Blast Control", query: "Best biological and chemical schedule to prevent Blast disease in Basmati 1121 paddy?" },
    { label: "💧 PMKSY Drip Schedule", query: "How to configure pulse drip irrigation for Sandy Loam and Black Cotton soil under PMKSY?" },
    { label: "🚜 Indian Soil Mesh", query: "What are optimal smart sensors and LoRaWAN frequency (865-867 MHz) for Indian farm soil?" }
  ];

  const testGuardrailPrompts = [
    { label: "✅ Valid Farming Question", text: "How do I lower high soil pH naturally for blueberry cultivation?" },
    { label: "🛑 Non-Farming Question (Guardrail Test)", text: "Write a JavaScript function to sort an array of numbers." }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech-to-Text Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
        if (onShowToast) onShowToast(`Voice captured: "${transcript}"`, 'info');
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    soundEffects.click(isMuted);
    if (!recognitionRef.current) {
      if (onShowToast) onShowToast('Voice dictation is not supported in this browser. Please type your query.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        if (onShowToast) onShowToast('Listening for farming question... Speak clearly into microphone.', 'info');
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  const clearChat = () => {
    soundEffects.click(isMuted);
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: `👋 Chat history cleared. How can I assist your crop management today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    if (onShowToast) onShowToast('Chat session reset', 'info');
  };

  const copyToClipboard = (text, id) => {
    soundEffects.click(isMuted);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    if (onShowToast) onShowToast('Agronomy advice copied to clipboard', 'success');
  };

  const exportChatReport = () => {
    soundEffects.click(isMuted);
    const content = messages.map(m => 
      `### [${m.timestamp}] ${m.sender === 'user' ? 'Farmer Query' : 'AgriSmart AI Advice'}\n\n${m.text}\n\n---\n`
    ).join('\n');

    const header = `# AgriSmart AI - Agronomic Consultation Transcript\nDate: ${new Date().toLocaleDateString()} | Operational Portal\n\n`;
    const blob = new Blob([header + content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agronomy_consultation_${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Consultation transcript exported as Markdown', 'success');
  };

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    soundEffects.click(isMuted);

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6),
          userApiKey: userApiKey || undefined
        })
      });

      const data = await res.json();
      soundEffects.scan(isMuted);

      const botReply = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.reply || data.message || 'No response generated.',
        model: data.model,
        isGuardrail: data.isGuardrail,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      soundEffects.alert(isMuted);
      const botErrReply = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        isError: true,
        text: '⚠️ Could not reach server. The backend fallback engine is activating...',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botErrReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Markdown rendering helper
  const formatText = (content) => {
    if (!content) return null;
    return content.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx}>{line.replace('#### ', '')}</h4>;
      }

      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      const renderedParts = boldParts.map((part, i) => 
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      );

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.2rem', marginBottom: '0.35rem' }}>
            {renderedParts}
          </li>
        );
      }

      if (/^\d+\.\s/.test(line)) {
        return (
          <li key={idx} style={{ marginLeft: '1.2rem', marginBottom: '0.35rem', listStyleType: 'decimal' }}>
            {renderedParts}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.35rem' }}></div>;
      }

      return <p key={idx} style={{ marginBottom: '0.4rem' }}>{renderedParts}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 145px)', minHeight: '520px' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{
        padding: '1rem 1.4rem',
        marginBottom: '0.9rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--emerald-main) 0%, var(--emerald-light) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ffffff', flexShrink: 0,
            boxShadow: '0 3px 10px rgba(5, 150, 105, 0.25)'
          }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>AgriSmart AI Advisor</h2>
              <span className="badge badge-emerald">
                <ShieldCheck size={12} /> Guardrail Active
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Precision Agronomy Intelligence Engine • Live Groq High-Speed LLM Inference
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Export Chat */}
          <button 
            className="btn-outline" 
            onClick={exportChatReport}
            title="Export Consultation Transcript"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Reset Chat */}
          <button 
            className="btn-outline" 
            onClick={clearChat}
            title="Clear Chat History"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Trash2 size={14} />
            <span>Reset</span>
          </button>

          {/* API Key Modal Button */}
          <button 
            className="btn-emerald" 
            onClick={() => {
              soundEffects.click(isMuted);
              setIsModalOpen(true);
            }}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
          >
            <Key size={14} />
            <span>Configure Key</span>
          </button>
        </div>
      </div>

      <ApiKeyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        apiKey={userApiKey}
        onSaveKey={handleSaveKey}
      />

      {/* Main Chat Conversation Container */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '1.4rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.1rem',
        marginBottom: '0.8rem'
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '10px'
            }}
          >
            {msg.sender === 'bot' && (
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                backgroundColor: 'var(--emerald-bg)',
                border: '1px solid var(--emerald-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--emerald-main)', flexShrink: 0, marginTop: '4px'
              }}>
                <Bot size={18} />
              </div>
            )}

            <div style={{
              maxWidth: '84%',
              padding: '0.95rem 1.3rem',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: msg.sender === 'user' 
                ? 'var(--blue-bg)' 
                : msg.isError ? 'var(--rose-bg)' : 'var(--bg-surface)',
              border: msg.sender === 'user' 
                ? '1px solid var(--blue-border)' 
                : msg.isError ? '1px solid var(--rose-border)' : '1px solid var(--border-subtle)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.4rem', fontSize: '0.74rem', color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: '700', color: msg.sender === 'user' ? 'var(--blue-main)' : 'var(--text-main)' }}>
                    {msg.sender === 'user' ? 'Farmer (Operator)' : 'AgriGroq AI'}
                  </span>
                  {msg.model && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.62rem', padding: '0.1rem 0.4rem' }}>
                      ⚡ {msg.model}
                    </span>
                  )}
                  {msg.isGuardrail && (
                    <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}>
                      Domain Guardrail
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <button
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      title="Copy response"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: copiedId === msg.id ? 'var(--emerald-main)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {copiedId === msg.id ? <Check size={14} /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
              </div>

              <div className="markdown-body">
                {formatText(msg.text)}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                backgroundColor: 'var(--blue-bg)',
                border: '1px solid var(--blue-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--blue-main)', flexShrink: 0, marginTop: '4px'
              }}>
                <User size={18} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--emerald-main)', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            <RefreshCw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: '600' }}>AgriGroq AI is streaming agronomic recommendations via high-speed Groq engine...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts & Guardrail Verification Chips */}
      <div style={{ marginBottom: '0.7rem' }}>
        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
          <Sparkles size={13} style={{ color: 'var(--emerald-main)' }} /> Quick Agricultural Prompts & Domain Tests:
        </div>
        
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {suggestedPrompts.map((p, idx) => (
            <button 
              key={idx}
              onClick={() => sendMessage(p.query)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--emerald-main)';
                e.currentTarget.style.color = 'var(--emerald-main)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {p.label}
            </button>
          ))}

          {testGuardrailPrompts.map((tp, idx) => (
            <button 
              key={'test-' + idx}
              onClick={() => sendMessage(tp.text)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                backgroundColor: idx === 1 ? 'var(--rose-bg)' : 'var(--emerald-bg)',
                border: idx === 1 ? '1px solid var(--rose-border)' : '1px solid var(--emerald-border)',
                color: idx === 1 ? 'var(--rose-alert)' : 'var(--emerald-main)',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {tp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Box */}
      <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
        <input 
          id="agri-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AgriGroq AI about crops, fertilizers, pests, soil chemistry, or irrigation..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.85rem 3.2rem 0.85rem 1.1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            fontSize: '0.92rem',
            outline: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}
        />

        {/* Speech-to-Text Microphone Button */}
        <button
          type="button"
          onClick={toggleVoiceInput}
          title={isListening ? 'Stop listening' : 'Speak your question'}
          style={{
            position: 'absolute',
            right: '125px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: isListening ? 'var(--rose-alert)' : 'var(--bg-subtle)',
            border: isListening ? 'none' : '1px solid var(--border-subtle)',
            color: isListening ? '#fff' : 'var(--emerald-main)',
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button 
          className="btn-emerald" 
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '0 1.5rem', borderRadius: '12px' }}
        >
          <Send size={16} />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
}
