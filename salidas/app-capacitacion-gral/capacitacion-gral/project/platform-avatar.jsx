// platform-avatar.jsx — Capi: AI avatar assistant

const { useState: useAvSt, useEffect: useAvEf, useRef: useAvRef } = React;

/* ── Animated face SVG ── */
function AvatarFace({ speaking, blinking, thinking, size = 100 }) {
  const [mouthOpen, setMouthOpen] = useAvSt(false);

  useAvEf(() => {
    if (!speaking) { setMouthOpen(false); return; }
    const iv = setInterval(() => setMouthOpen(m => !m), 180);
    return () => clearInterval(iv);
  }, [speaking]);

  const eyeRy = blinking ? 1 : 9;
  const irisX1 = thinking ? 32 : 36;
  const irisX2 = thinking ? 62 : 66;

  return (
    <svg viewBox="0 0 100 110" width={size} height={size} style={{ display: 'block' }}>
      <defs>
        <radialGradient id="capiBg" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#0369A1" />
        </radialGradient>
        <radialGradient id="capiChk" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow */}
      <ellipse cx="50" cy="108" rx="30" ry="4" fill="#00000018" />

      {/* Head */}
      <circle cx="50" cy="54" r="44" fill="url(#capiBg)" />

      {/* Graduation cap */}
      <rect x="22" y="14" width="56" height="7" rx="3" fill="#0F172A" />
      <polygon points="50,4 22,16 78,16" fill="#1E293B" />
      <line x1="72" y1="16" x2="76" y2="26" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="76" cy="27" r="3" fill="#FCD34D" />

      {/* Cheeks */}
      <ellipse cx="19" cy="63" rx="9" ry="6" fill="url(#capiChk)" />
      <ellipse cx="81" cy="63" rx="9" ry="6" fill="url(#capiChk)" />

      {/* Eyebrows */}
      <path d="M27 38 Q35 33 43 36" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M57 36 Q65 33 73 38" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Eye whites */}
      <ellipse cx="35" cy="48" rx="9" ry={eyeRy} fill="white" style={{ transition: 'ry 0.08s' }} />
      <ellipse cx="65" cy="48" rx="9" ry={eyeRy} fill="white" style={{ transition: 'ry 0.08s' }} />

      {/* Iris + pupils */}
      {!blinking && (
        <>
          <circle cx={irisX1} cy="49" r="6" fill="#1E3A5F" style={{ transition: 'cx 0.3s' }} />
          <circle cx={irisX2} cy="49" r="6" fill="#1E3A5F" style={{ transition: 'cx 0.3s' }} />
          <circle cx={irisX1 + 2} cy="48" r="3" fill="#0F172A" />
          <circle cx={irisX2 + 2} cy="48" r="3" fill="#0F172A" />
          <circle cx={irisX1 + 4} cy="46" r="1.5" fill="white" />
          <circle cx={irisX2 + 4} cy="46" r="1.5" fill="white" />
        </>
      )}

      {/* Mouth */}
      {mouthOpen ? (
        <>
          <ellipse cx="50" cy="70" rx="12" ry="7" fill="#1E293B" />
          <ellipse cx="50" cy="67" rx="12" ry="5" fill="#E57373" />
          <ellipse cx="50" cy="65" rx="9" ry="3" fill="#FFCDD2" />
        </>
      ) : (
        <path d="M37 68 Q50 78 63 68" stroke="#1E293B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Body / collar */}
      <path d="M18 98 L29 90 L50 96 L71 90 L82 98 L82 110 L18 110 Z" fill="#0F172A" />
      {/* Shirt */}
      <path d="M43 90 L50 96 L57 90 L55 110 L45 110 Z" fill="white" opacity="0.92" />
      {/* Tie */}
      <path d="M47 96 L50 104 L53 96 L50 92 Z" fill="#0284C7" />
    </svg>
  );
}

/* ── Main widget ── */
function AvatarWidget({ user, season, module: mod, block }) {
  const [open, setOpen] = useAvSt(false);
  const [messages, setMessages] = useAvSt([
    { role: 'assistant', text: '¡Hola! Soy Capi, tu asistente de capacitación 🎓 Preguntame lo que quieras sobre el contenido, protocolos o técnicas de venta.' }
  ]);
  const [input, setInput] = useAvSt('');
  const [loading, setLoading] = useAvSt(false);
  const [speaking, setSpeaking] = useAvSt(false);
  const [thinking, setThinking] = useAvSt(false);
  const [blinking, setBlinking] = useAvSt(false);
  const listRef = useAvRef(null);
  const inputRef = useAvRef(null);

  /* Blinking */
  useAvEf(() => {
    let t;
    function blink() {
      setBlinking(true);
      t = setTimeout(() => { setBlinking(false); t = setTimeout(blink, 2200 + Math.random() * 2800); }, 130);
    }
    t = setTimeout(blink, 1200);
    return () => clearTimeout(t);
  }, []);

  /* Auto scroll */
  useAvEf(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  /* Focus input on open */
  useAvEf(() => {
    if (open && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    setThinking(true);

    const ctx = [
      user && `Vendedor: ${user.name}.`,
      season && `Temporada activa: ${season === 'all_year' ? 'Todo el año' : 'Invierno'}.`,
      mod && `Módulo actual: ${mod.subtitle}.`,
      block && `Bloque: ${block.title}.`,
    ].filter(Boolean).join(' ');

    const systemPrompt = `Sos Capi, el asistente virtual de capacitación de una empresa de turismo y excursiones. Respondés en español argentino, con tono amigable, claro y profesional. ${ctx} Ayudás con dudas sobre protocolos de atención, productos (excursiones), técnicas de venta, sistemas internos y evaluaciones. Tus respuestas son concisas: máximo 3–4 oraciones. Si no sabés algo, decilo honestamente.`;

    try {
      const resp = await window.claude.complete({
        system: systemPrompt,
        messages: [
          ...messages.slice(-8).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text })),
          { role: 'user', content: userMsg }
        ]
      });
      setThinking(false);
      setSpeaking(true);
      const words = resp.split(' ');
      let cur = '';
      setMessages(m => [...m, { role: 'assistant', text: '' }]);
      for (const w of words) {
        cur += (cur ? ' ' : '') + w;
        setMessages(m => [...m.slice(0, -1), { role: 'assistant', text: cur }]);
        await new Promise(r => setTimeout(r, 52));
      }
      setSpeaking(false);
    } catch {
      setThinking(false);
      setSpeaking(false);
      setMessages(m => [...m, { role: 'assistant', text: 'Ups, tuve un problema de conexión. Intentá de nuevo en un momento.' }]);
    }
    setLoading(false);
  }

  const statusColor = speaking ? '#4ADE80' : thinking ? '#FCD34D' : '#22D3EE';
  const statusText = speaking ? '● Respondiendo...' : thinking ? '● Pensando...' : '● En línea';

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>

      {/* Chat panel */}
      {open && (
        <div style={{ width: 340, background: '#fff', borderRadius: 22, boxShadow: '0 24px 64px #0F172A28, 0 4px 12px #0F172A14', overflow: 'hidden', animation: 'capiSlideUp .22s ease' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0C3358 100%)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#38BDF8,#0284C7)', flexShrink: 0, border: '2px solid #ffffff30' }}>
              <AvatarFace speaking={speaking} blinking={blinking} thinking={thinking} size={56} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15 }}>Capi</div>
              <div style={{ color: statusColor, fontSize: 11, fontWeight: 600, transition: 'color .3s' }}>{statusText}</div>
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: '#64748B', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 4 }}>×</button>
          </div>

          {/* Messages */}
          <div ref={listRef} style={{ height: 290, overflowY: 'auto', padding: '14px 14px 6px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 7 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 30, height: 30, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,#38BDF8,#0284C7)', flexShrink: 0, border: '1.5px solid #E2E8F0' }}>
                    <AvatarFace speaking={speaking && i === messages.length - 1} blinking={blinking} thinking={false} size={30} />
                  </div>
                )}
                <div style={{
                  maxWidth: '76%', padding: '9px 13px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '4px 16px 16px 16px',
                  background: msg.role === 'user' ? '#0284C7' : '#F1F5F9',
                  color: msg.role === 'user' ? '#fff' : '#1E293B',
                  fontSize: 13, lineHeight: 1.55, wordBreak: 'break-word'
                }}>
                  {msg.text || (loading && i === messages.length - 1 ? (
                    <span style={{ display: 'flex', gap: 4 }}>
                      {[0, 1, 2].map(j => <span key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8', display: 'inline-block', animation: `capiDot .8s ${j * .15}s infinite` }} />)}
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div style={{ padding: '0 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['¿Cómo manejo una objeción?', '¿Cuáles son los KPIs?', '¿Cómo hago el cierre?'].map(s => (
                <button key={s} onClick={() => { setInput(s); setTimeout(send, 0); }}
                  style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 20, padding: '5px 11px', fontSize: 11, color: '#0284C7', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                  onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '8px 12px 14px', borderTop: '1px solid #F1F5F9', display: 'flex', gap: 8 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Preguntale a Capi..."
              disabled={loading}
              style={{ flex: 1, padding: '9px 14px', border: '1.5px solid #E2E8F0', borderRadius: 12, fontSize: 13, fontFamily: 'inherit', outline: 'none', background: loading ? '#F8FAFC' : '#fff', transition: 'border .15s' }}
              onFocus={e => e.target.style.borderColor = '#0284C7'}
              onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            <button onClick={send} disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? '#E2E8F0' : '#0284C7', border: 'none', borderRadius: 12, width: 38, height: 38, color: loading || !input.trim() ? '#94A3B8' : '#fff', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}>
              ↑
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ width: 62, height: 62, borderRadius: '50%', border: '3px solid #fff', background: 'linear-gradient(135deg, #0284C7, #38BDF8)', boxShadow: '0 6px 24px #0284C748', cursor: 'pointer', overflow: 'hidden', padding: 2, transition: 'transform .2s, box-shadow .2s', display: 'block' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 8px 32px #0284C760'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 6px 24px #0284C748'; }}
        title="Hablar con Capi">
        <AvatarFace speaking={speaking} blinking={blinking} thinking={thinking} size={58} />
      </button>

      <style>{`
        @keyframes capiSlideUp { from { opacity:0; transform:translateY(16px) scale(.96); } to { opacity:1; transform:none; } }
        @keyframes capiDot { 0%,80%,100% { transform:scale(0); opacity:.4; } 40% { transform:scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}

Object.assign(window, { AvatarWidget });
