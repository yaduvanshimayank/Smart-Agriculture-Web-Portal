import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, Sparkles, Key, AlertCircle, RefreshCw, 
  HelpCircle, ShieldCheck, User, CheckCircle2, ShieldAlert
} from 'lucide-react';

export default function AgriGroqChat({ initialPrompt, onClearInitialPrompt }) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `👋 Hello! I am **AgriSmart AI**, your precision agricultural science assistant.

I am strictly constrained to answer **farming and agriculture questions only** (e.g. crop cultivation, soil health, pest control, NPK fertilization, irrigation scheduling, livestock, smart farm IoT, and market advice).

How can I assist your farm today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const suggestedPrompts = [
    "🌾 How to optimize NPK fertilizer ratio for winter wheat?",
    "🐛 Best organic treatments for tomato early blight?",
    "💧 What is the ideal drip irrigation schedule for sandy loam soil?",
    "🌽 How to prevent armyworm infestation in maize crops?",
    "🚜 What smart sensors are best for monitoring soil moisture?"
  ];

  const testGuardrailPrompts = [
    { label: "✅ Valid Farming Question", text: "How do I lower high soil pH naturally for blueberry farming?" },
    { label: "🛑 Non-Farming Question (Guardrail Test)", text: "Write a JavaScript function to sort an array of numbers." }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6) // keep context
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || 'Error communicating with AI Advisor.');

        const botErrorMsg = {
          id: 'bot-err-' + Date.now(),
          sender: 'bot',
          isError: true,
          text: `⚠️ **Notice**: ${data.message || 'Unable to connect to AI server.'}\n\nPlease check that your \`GROQ_API_KEY\` is configured in the server \`.env\` file.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botErrorMsg]);
        return;
      }

      const botReply = {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: data.reply,
        model: data.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMsg('Failed to reach backend server.');
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

  // Simple render helper for markdown bold and lists
  const formatText = (content) => {
    return content.split('\n').map((line, idx) => {
      let formattedLine = line;
      
      // Basic bold replace **text** -> <strong>text</strong>
      const boldParts = line.split(/\*\*(.*?)\*\*/g);
      const renderedParts = boldParts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} style={{ color: 'var(--emerald-light)' }}>{part}</strong> : part
      );

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.2rem', marginBottom: '0.3rem' }}>
            {renderedParts}
          </li>
        );
      }

      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }}></div>;
      }

      return <p key={idx} style={{ marginBottom: '0.4rem' }}>{renderedParts}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 170px)', minHeight: '520px' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{
        padding: '1.2rem 1.6rem',
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
            border: '1px solid var(--border-emerald-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--emerald-light)'
          }}>
            <Bot size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>AgriSmart AI Advisor</h2>
              <span className="badge badge-emerald">
                <ShieldCheck size={12} /> Farming Guardrail Active
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Precision Agronomy Intelligence Engine • Strict Agricultural Domain Guardrail
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="glass-panel" style={{
        flex: 1,
        padding: '1.5rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2rem',
        marginBottom: '1rem'
      }}>
        {messages.map((msg) => (
          <div 
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '12px'
            }}
          >
            {msg.sender === 'bot' && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--border-emerald)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--emerald-light)', flexShrink: 0, marginTop: '4px'
              }}>
                <Bot size={20} />
              </div>
            )}

            <div style={{
              maxWidth: '82%',
              padding: '1rem 1.4rem',
              borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: msg.sender === 'user' 
                ? 'rgba(16, 185, 129, 0.18)' 
                : msg.isError ? 'rgba(244, 63, 94, 0.12)' : 'rgba(8, 28, 20, 0.85)',
              border: msg.sender === 'user' 
                ? '1px solid var(--border-emerald-glow)' 
                : msg.isError ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-emerald)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)'
              }}>
                <span style={{ fontWeight: '700', color: msg.sender === 'user' ? 'var(--emerald-light)' : '#ffffff' }}>
                  {msg.sender === 'user' ? 'You (Farmer)' : 'AgriGroq AI'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <div className="markdown-body" style={{ color: 'var(--text-main)' }}>
                {formatText(msg.text)}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#60a5fa', flexShrink: 0, marginTop: '4px'
              }}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--emerald-light)', fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
            <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            <span>AgriGroq AI is analyzing agricultural telemetry & agronomy data...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompts & Guardrail Test Chips */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} style={{ color: 'var(--emerald-main)' }} /> Quick Agricultural Prompts & Guardrail Tests:
        </div>
        
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
          {suggestedPrompts.map((p, idx) => (
            <button 
              key={idx}
              onClick={() => sendMessage(p.replace(/^[^\s]+\s/, ''))}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid var(--border-emerald)',
                color: 'var(--text-main)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = 'var(--emerald-main)'}
              onMouseLeave={(e) => e.target.style.borderColor = 'var(--border-emerald)'}
            >
              {p}
            </button>
          ))}

          {testGuardrailPrompts.map((tp, idx) => (
            <button 
              key={'test-' + idx}
              onClick={() => sendMessage(tp.text)}
              style={{
                whiteSpace: 'nowrap',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: idx === 1 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                border: idx === 1 ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid var(--border-emerald-glow)',
                color: idx === 1 ? 'var(--rose-alert)' : 'var(--emerald-light)',
                fontSize: '0.8rem',
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
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AgriGroq AI any question about crops, soil, pests, irrigation, or farming..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '0.9rem 1.2rem',
            backgroundColor: 'rgba(5, 20, 14, 0.9)',
            border: '1px solid var(--border-emerald)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        />

        <button 
          className="btn-emerald" 
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          style={{ padding: '0 1.6rem', borderRadius: '12px' }}
        >
          <Send size={18} />
          <span>Ask AI</span>
        </button>
      </div>
    </div>
  );
}
