// platform-admin-ai.jsx — AI content organizer + evaluation generator with image vision

const { useState: useAISt, useRef: useAIRef, useEffect: useAIEf, useCallback: useAICb } = React;
const { Btn: AIBt, Card: AICd } = window;

/* ── Image attachments hook ── */
function useImages() {
  const [images, setImages] = useAISt([]);

  function addFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const full = e.target.result;
      const data = full.split(',')[1];
      setImages(imgs => [...imgs, { data, type: file.type, preview: full, name: file.name || 'imagen' }]);
    };
    reader.readAsDataURL(file);
  }

  function onPaste(e) {
    const items = e.clipboardData?.items || [];
    let handled = false;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        addFile(item.getAsFile());
        handled = true;
      }
    }
    if (handled) e.preventDefault();
  }

  function onDrop(e) {
    e.preventDefault();
    Array.from(e.dataTransfer.files).forEach(addFile);
  }

  function remove(i) { setImages(imgs => imgs.filter((_, j) => j !== i)); }
  function clear() { setImages([]); }

  return { images, addFile, onPaste, onDrop, remove, clear };
}

/* ── Image attachments UI ── */
function ImagePanel({ images, onPaste, onDrop, onAdd, onRemove }) {
  const fileRef = useAIRef();
  const [dragging, setDragging] = useAISt(false);

  return (
    <div onPaste={onPaste}>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { setDragging(false); onDrop(e); }}
        style={{ border: `2px dashed ${dragging ? '#54bbaa' : '#E2E8F0'}`, borderRadius: 12, padding: '14px 18px', background: dragging ? '#54bbaa08' : '#F8FAFC', transition: 'all .15s', marginBottom: images.length ? 12 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>🖼</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Adjuntar imágenes</div>
              <div style={{ fontSize: 11, color: '#94A3B8' }}>Pegá (Ctrl+V), arrastrá, o subí desde archivo</div>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => Array.from(e.target.files).forEach(onAdd)} />
            <button onClick={() => fileRef.current?.click()}
              style={{ background: '#fff', border: '1.5px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: '#475569', cursor: 'pointer', fontFamily: 'inherit' }}>
              📁 Subir archivo
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: '4px 0 12px' }}>
          {images.map((img, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '2px solid #E2E8F0', flexShrink: 0 }}>
              <img src={img.preview} alt="" style={{ width: 80, height: 60, objectFit: 'cover', display: 'block' }} />
              <button onClick={() => onRemove(i)}
                style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: '50%', background: '#0F172Aaa', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, fontWeight: 700, padding: 0 }}>
                ×
              </button>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#0F172A88', padding: '2px 4px', fontSize: 9, color: '#fff', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {img.name}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#94A3B8', alignSelf: 'center' }}>
            {images.length} imagen{images.length > 1 ? 'es' : ''} adjunta{images.length > 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Build multimodal message content ── */
function buildContent(images, text) {
  if (!images.length) return text;
  return [
    ...images.map(img => ({ type: 'image', source: { type: 'base64', media_type: img.type, data: img.data } })),
    { type: 'text', text }
  ];
}

/* ── Module/block selector ── */
function BlockSelector({ season, onSelect, selected }) {
  const content = getContent();
  const modules = content[season]?.modules || [];
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {modules.map(mod => (
        <div key={mod.id}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, padding: '0 4px' }}>{mod.title} — {mod.subtitle}</div>
          {mod.blocks.map(block => (
            <button key={block.id} onClick={() => onSelect({ season, moduleId: mod.id, blockId: block.id, blockTitle: block.title, modColor: mod.color })}
              style={{ width: '100%', textAlign: 'left', padding: '9px 14px', border: `1.5px solid ${selected?.blockId === block.id ? mod.color : '#E2E8F0'}`, borderRadius: 10, background: selected?.blockId === block.id ? mod.color + '12' : '#fff', color: selected?.blockId === block.id ? mod.color : '#475569', cursor: 'pointer', fontFamily: 'inherit', fontWeight: selected?.blockId === block.id ? 700 : 400, fontSize: 13, marginBottom: 6, transition: 'all .15s' }}>
              {block.title}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Tab: Organizar Contenido ── */
function AIContentOrganizer() {
  const [season, setSeason] = useAISt('all_year');
  const [target, setTarget] = useAISt(null);
  const [rawText, setRawText] = useAISt('');
  const [instructions, setInstructions] = useAISt('');
  const [loading, setLoading] = useAISt(false);
  const [result, setResult] = useAISt('');
  const [applied, setApplied] = useAISt(false);
  const [step, setStep] = useAISt(1);
  const { images, addFile, onPaste, onDrop, remove: removeImg, clear: clearImgs } = useImages();

  async function generate() {
    if (!rawText.trim() && !images.length) return;
    setLoading(true); setResult(''); setApplied(false);

    const hasImages = images.length > 0;
    const prompt = `Sos un organizador de contenido para una plataforma de capacitación de vendedores de turismo y excursiones en Argentina.
${hasImages ? 'El administrador te adjunta imágenes (capturas de manuales, documentos, fotos de pizarras, etc.) y/o texto.' : 'El administrador te da texto sin formato.'}

Transformá todo el contenido en HTML bien estructurado con:
- <h3> para títulos de sección
- <h4> para subtítulos
- <p> para párrafos
- <ul>/<ol> con <li> para listas
- <strong> para términos clave

${instructions.trim() ? `Instrucciones adicionales: ${instructions}` : ''}
${rawText.trim() ? `\nTexto adicional:\n${rawText}` : ''}

Devolvé SOLO el HTML resultante, sin markdown, sin código fences, sin explicaciones.`;

    try {
      const response = await window.claude.complete({
        messages: [{ role: 'user', content: buildContent(images, prompt) }]
      });
      setResult(response.trim());
      setStep(3);
    } catch (e) {
      setResult('<p style="color:#DC2626">Error al procesar. Intentá de nuevo.</p>');
      setStep(3);
    }
    setLoading(false);
  }

  function applyContent() {
    if (!target || !result) return;
    const content = getContent();
    const updated = JSON.parse(JSON.stringify(content));
    const mod = updated[target.season]?.modules?.find(m => m.id === target.moduleId);
    const block = mod?.blocks?.find(b => b.id === target.blockId);
    if (block) { block.content = result; saveContent(updated); setApplied(true); }
  }

  return (
    <div>
      <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 20px' }}>
        Pegá texto, subí fotos de manuales o capturas de pantalla — la IA lee todo y lo estructura en el bloque elegido.
      </p>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#F1F5F9', borderRadius: 12, padding: 4 }}>
        {[['1','Elegir bloque'],['2','Agregar contenido'],['3','Revisar y aplicar']].map(([n,lbl],i)=>(
          <button key={n} onClick={()=>setStep(i+1)} style={{ flex:1, padding:'8px 0', border:'none', background:step===i+1?'#fff':'none', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontWeight:step===i+1?700:500, fontSize:12, color:step===i+1?'#0F172A':'#94A3B8', boxShadow:step===i+1?'0 1px 4px #00000012':'none', transition:'all .15s' }}>
            <span style={{ display:'block', fontSize:16, fontWeight:800, color:step===i+1?'#54bbaa':'#CBD5E1' }}>{n}</span>{lbl}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:14 }}>
            {['all_year','winter'].map(s=>(
              <button key={s} onClick={()=>{setSeason(s);setTarget(null);}} style={{ flex:1, padding:'8px 0', border:`2px solid ${season===s?'#54bbaa':'#E2E8F0'}`, borderRadius:10, background:season===s?'#54bbaa12':'#fff', color:season===s?'#0F172A':'#64748B', cursor:'pointer', fontWeight:season===s?700:500, fontFamily:'inherit', fontSize:13, transition:'all .15s' }}>
                {s==='all_year'?'🌍 Todo el año':'❄️ Invierno'}
              </button>
            ))}
          </div>
          <BlockSelector season={season} selected={target} onSelect={setTarget} />
          {target && <AIBt style={{ marginTop:14, width:'100%', justifyContent:'center', background:'#54bbaa' }} onClick={()=>setStep(2)}>Continuar con: {target.blockTitle} →</AIBt>}
        </div>
      )}

      {step === 2 && (
        <div onPaste={onPaste}>
          {target && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'10px 14px', background:'#54bbaa12', borderRadius:10, border:'1px solid #54bbaa44' }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:target.modColor, flexShrink:0 }} />
              <span style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>Destino: {target.blockTitle}</span>
              <button onClick={()=>setStep(1)} style={{ marginLeft:'auto', background:'none', border:'none', color:'#64748B', cursor:'pointer', fontSize:12 }}>Cambiar</button>
            </div>
          )}

          {/* Image panel */}
          <div style={{ marginBottom: 14 }}>
            <ImagePanel images={images} onPaste={onPaste} onDrop={onDrop} onAdd={addFile} onRemove={removeImg} />
          </div>

          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>Texto adicional (opcional si adjuntás imágenes)</label>
          <textarea value={rawText} onChange={e=>setRawText(e.target.value)}
            placeholder="Pegá acá texto de un manual, Word, PDF, notas... También podés pegar imágenes directamente en este campo con Ctrl+V."
            style={{ width:'100%', minHeight:160, padding:14, border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', resize:'vertical', lineHeight:1.65, outline:'none' }}
            onFocus={e=>e.target.style.borderColor='#54bbaa'} onBlur={e=>e.target.style.borderColor='#E2E8F0'} />

          <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', margin:'12px 0 6px' }}>Instrucciones adicionales (opcional)</label>
          <input value={instructions} onChange={e=>setInstructions(e.target.value)}
            placeholder='Ej: "Organizalo como pasos numerados" · "Destacá los precios" · "Separalo en 4 secciones"'
            style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', outline:'none' }}
            onFocus={e=>e.target.style.borderColor='#54bbaa'} onBlur={e=>e.target.style.borderColor='#E2E8F0'} />

          {images.length > 0 && (
            <div style={{ padding:'8px 12px', background:'#ECFDF5', borderRadius:10, marginTop:10, fontSize:12, color:'#059669', fontWeight:600 }}>
              ✓ {images.length} imagen{images.length>1?'es':''} lista{images.length>1?'s':''} — Claude las va a leer para organizar el contenido
            </div>
          )}

          <AIBt style={{ marginTop:14, width:'100%', justifyContent:'center', background:'#54bbaa' }}
            disabled={loading || (!rawText.trim() && !images.length)} onClick={generate}>
            {loading ? '⏳ Procesando...' : `✨ Organizar con IA${images.length ? ` (${images.length} imagen${images.length>1?'es':''})` : ''} →`}
          </AIBt>

          {loading && (
            <div style={{ marginTop:14, padding:14, background:'#F8FAFC', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:18, height:18, borderRadius:'50%', border:'3px solid #54bbaa', borderTopColor:'transparent', animation:'spin .7s linear infinite', flexShrink:0 }} />
              <span style={{ fontSize:13, color:'#64748B' }}>{images.length > 0 ? 'Claude está leyendo las imágenes y organizando el contenido...' : 'Organizando el contenido...'}</span>
            </div>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Vista previa</h3>
            <div style={{ display:'flex', gap:8 }}>
              <AIBt variant="secondary" size="sm" onClick={()=>setStep(2)}>← Editar</AIBt>
              <AIBt size="sm" style={{ background:applied?'#059669':'#54bbaa' }} onClick={applyContent} disabled={applied}>
                {applied?'✓ Aplicado':'⚡ Aplicar al bloque'}
              </AIBt>
            </div>
          </div>
          {applied && <div style={{ padding:'10px 14px', background:'#D1FAE5', borderRadius:10, marginBottom:12, fontSize:13, color:'#059669', fontWeight:600 }}>✓ Aplicado en "{target?.blockTitle}"</div>}
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: result }}
            style={{ padding:'20px 24px', background:'#FAFBFC', border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:14 }} />
        </div>
      )}
    </div>
  );
}

/* ── Tab: Generar Evaluación ── */
function AIEvalGenerator() {
  const [season, setSeason] = useAISt('all_year');
  const [moduleId, setModuleId] = useAISt('');
  const [instructions, setInstructions] = useAISt('');
  const [refContent, setRefContent] = useAISt('');
  const [loading, setLoading] = useAISt(false);
  const [questions, setQuestions] = useAISt(null);
  const [error, setError] = useAISt('');
  const [applied, setApplied] = useAISt(false);
  const [editIdx, setEditIdx] = useAISt(null);
  const { images, addFile, onPaste, onDrop, remove: removeImg } = useImages();

  const content = getContent();
  const modules = content[season]?.modules || [];
  const selectedMod = modules.find(m => m.id === moduleId);

  function getModuleContent() {
    if (!selectedMod) return '';
    return selectedMod.blocks.map(b => {
      if (b.type==='reading') return `[${b.title}]\n${b.content?.replace(/<[^>]+>/g,'')||''}`;
      if (b.items) return `[${b.title}]\n${b.items.map(i=>`${i.title}: ${i.content?.replace(/<[^>]+>/g,'')||''}`).join('\n')}`;
      return '';
    }).join('\n\n');
  }

  async function generate() {
    if (!moduleId) return;
    setLoading(true); setQuestions(null); setError(''); setApplied(false);
    const modContent = refContent.trim() || getModuleContent();
    const hasImages = images.length > 0;

    const prompt = `Sos un creador de evaluaciones para una plataforma de capacitación de vendedores de turismo y excursiones en Argentina.

Módulo: "${selectedMod?.subtitle}"
${hasImages ? '\nEl administrador adjunta imágenes de referencia (manuales, fichas, capturas) — usalas como fuente principal.' : ''}
${modContent ? `\nContenido de referencia:\n${modContent.slice(0, 3000)}` : ''}

Instrucciones: ${instructions || 'Generá preguntas variadas que cubran todos los temas del módulo.'}

Generá EXACTAMENTE 20 preguntas de opción múltiple en español. Cada pregunta tiene 4 opciones y 1 correcta.

Devolvé ÚNICAMENTE este JSON válido (sin texto extra, sin markdown, sin código fences):
{"questions":[{"q":"pregunta","opts":["a","b","c","d"],"c":0}]}

"c" es el índice 0–3 de la respuesta correcta.`;

    try {
      const raw = await window.claude.complete({
        messages: [{ role: 'user', content: buildContent(images, prompt) }]
      });
      const clean = raw.replace(/```json?\n?/g,'').replace(/```/g,'').trim();
      const idx = clean.indexOf('{');
      const parsed = JSON.parse(idx >= 0 ? clean.slice(idx) : clean);
      if (parsed.questions?.length > 0) setQuestions(parsed.questions.slice(0,20));
      else setError('La IA no devolvió preguntas válidas. Intentá de nuevo.');
    } catch (e) {
      setError('Error al parsear la respuesta. Intentá con instrucciones más simples o sin imágenes muy grandes.');
    }
    setLoading(false);
  }

  function applyEval() {
    const evals = getEvals();
    const updated = { ...evals, [moduleId]: { title:`Evaluación — ${selectedMod?.subtitle}`, questions } };
    localStorage.setItem('cp_evals', JSON.stringify(updated));
    setApplied(true);
  }

  function editQuestion(qi, field, value) { setQuestions(qs=>qs.map((q,i)=>i===qi?{...q,[field]:value}:q)); }
  function editOption(qi, oi, value) { setQuestions(qs=>qs.map((q,i)=>i===qi?{...q,opts:q.opts.map((o,j)=>j===oi?value:o)}:q)); }

  return (
    <div onPaste={onPaste}>
      <p style={{ color:'#64748B', fontSize:14, margin:'0 0 20px' }}>
        Adjuntá imágenes de tu material de referencia y/o describí qué preguntas querés — la IA genera las 20 preguntas.
      </p>

      <div style={{ display:'flex', gap:10, marginBottom:14 }}>
        {['all_year','winter'].map(s=>(
          <button key={s} onClick={()=>{setSeason(s);setModuleId('');}} style={{ flex:1, padding:'8px 0', border:`2px solid ${season===s?'#54bbaa':'#E2E8F0'}`, borderRadius:10, background:season===s?'#54bbaa12':'#fff', color:season===s?'#0F172A':'#64748B', cursor:'pointer', fontWeight:season===s?700:500, fontFamily:'inherit', fontSize:13, transition:'all .15s' }}>
            {s==='all_year'?'🌍 Todo el año':'❄️ Invierno'}
          </button>
        ))}
      </div>

      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>Módulo <span style={{ color:'#DC2626' }}>*</span></label>
      <select value={moduleId} onChange={e=>{setModuleId(e.target.value);setQuestions(null);setApplied(false);}}
        style={{ width:'100%', padding:'10px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', outline:'none', marginBottom:16 }}>
        <option value="">— Elegí un módulo —</option>
        {modules.map(m=><option key={m.id} value={m.id}>{m.title} — {m.subtitle}</option>)}
      </select>

      {/* Image panel */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:8 }}>Imágenes de referencia (opcional pero acelera y mejora las preguntas)</label>
        <ImagePanel images={images} onPaste={onPaste} onDrop={onDrop} onAdd={addFile} onRemove={removeImg} />
      </div>

      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>Instrucciones <span style={{ color:'#DC2626' }}>*</span></label>
      <textarea value={instructions} onChange={e=>setInstructions(e.target.value)}
        placeholder={'Ejemplos:\n• "Incluí 5 preguntas que relacionen el Protocolo de Objeciones con las técnicas del Módulo 2"\n• "Que las preguntas unan conceptos del sistema TourManager con los protocolos de cobro"\n• "Priorizá preguntas sobre cancelaciones y políticas de reserva"'}
        style={{ width:'100%', minHeight:120, padding:14, border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', resize:'vertical', lineHeight:1.65, outline:'none' }}
        onFocus={e=>e.target.style.borderColor='#54bbaa'} onBlur={e=>e.target.style.borderColor='#E2E8F0'} />

      <details style={{ marginTop:12, marginBottom:14 }}>
        <summary style={{ fontSize:13, color:'#0284C7', cursor:'pointer', fontWeight:600 }}>+ Texto de referencia adicional (opcional)</summary>
        <textarea value={refContent} onChange={e=>setRefContent(e.target.value)}
          placeholder="Pegá material adicional para las preguntas..."
          style={{ width:'100%', minHeight:100, padding:14, border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontFamily:'inherit', boxSizing:'border-box', resize:'vertical', outline:'none', marginTop:8 }} />
      </details>

      {images.length > 0 && (
        <div style={{ padding:'8px 12px', background:'#ECFDF5', borderRadius:10, marginBottom:10, fontSize:12, color:'#059669', fontWeight:600 }}>
          ✓ {images.length} imagen{images.length>1?'es':''} adjunta{images.length>1?'s':''} — Claude las usará como fuente principal para las preguntas
        </div>
      )}

      <AIBt style={{ width:'100%', justifyContent:'center', background:'#54bbaa' }}
        disabled={loading || !moduleId || !instructions.trim()} onClick={generate}>
        {loading ? '⏳ Generando preguntas...' : `✨ Generar 20 preguntas${images.length ? ` (${images.length} imagen${images.length>1?'es':''})` : ''} →`}
      </AIBt>

      {loading && (
        <div style={{ marginTop:14, padding:14, background:'#F8FAFC', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:18, height:18, borderRadius:'50%', border:'3px solid #54bbaa', borderTopColor:'transparent', animation:'spin .7s linear infinite', flexShrink:0 }} />
          <span style={{ fontSize:13, color:'#64748B' }}>{images.length>0?'Claude está leyendo las imágenes y generando preguntas específicas...':'Generando preguntas basadas en el contenido del módulo...'}</span>
        </div>
      )}

      {error && <p style={{ color:'#DC2626', fontSize:13, marginTop:10, padding:'10px 14px', background:'#FEF2F2', borderRadius:10 }}>{error}</p>}

      {questions && (
        <div style={{ marginTop:22 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>{questions.length} preguntas generadas</h3>
            <div style={{ display:'flex', gap:8 }}>
              <AIBt variant="secondary" size="sm" onClick={()=>{setQuestions(null);setApplied(false);}}>Regenerar</AIBt>
              <AIBt size="sm" style={{ background:applied?'#059669':'#54bbaa' }} onClick={applyEval} disabled={applied}>
                {applied?'✓ Aplicado':'⚡ Aplicar evaluación'}
              </AIBt>
            </div>
          </div>
          {applied && <div style={{ padding:'10px 14px', background:'#D1FAE5', borderRadius:10, marginBottom:12, fontSize:13, color:'#059669', fontWeight:600 }}>✓ Evaluación aplicada al módulo "{selectedMod?.subtitle}"</div>}
          <div style={{ display:'grid', gap:10 }}>
            {questions.map((q,qi)=>(
              <div key={qi} style={{ background:'#fff', borderRadius:12, border:'1px solid #E2E8F0', overflow:'hidden' }}>
                <div style={{ padding:'11px 14px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'flex-start', gap:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:'#94A3B8', flexShrink:0, marginTop:2 }}>{qi+1}.</span>
                  {editIdx===qi
                    ? <input value={q.q} onChange={e=>editQuestion(qi,'q',e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:13, fontWeight:600, color:'#0F172A', fontFamily:'inherit', background:'transparent' }} />
                    : <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#0F172A', lineHeight:1.5 }}>{q.q}</span>
                  }
                  <button onClick={()=>setEditIdx(editIdx===qi?null:qi)} style={{ background:'#F1F5F9', border:'none', borderRadius:6, padding:'3px 8px', fontSize:11, color:'#64748B', cursor:'pointer', flexShrink:0 }}>{editIdx===qi?'OK':'Editar'}</button>
                </div>
                <div style={{ padding:'8px 14px', display:'grid', gap:5 }}>
                  {q.opts.map((opt,oi)=>(
                    <div key={oi} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 8px', borderRadius:8, background:q.c===oi?'#D1FAE5':'#F8FAFC', border:`1px solid ${q.c===oi?'#34D399':'#F1F5F9'}` }}>
                      <button onClick={()=>editQuestion(qi,'c',oi)} style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${q.c===oi?'#059669':'#CBD5E1'}`, background:q.c===oi?'#059669':'transparent', cursor:'pointer', flexShrink:0 }} />
                      {editIdx===qi
                        ? <input value={opt} onChange={e=>editOption(qi,oi,e.target.value)} style={{ flex:1, border:'none', outline:'none', fontSize:12, background:'transparent', fontFamily:'inherit', color:q.c===oi?'#059669':'#475569', fontWeight:q.c===oi?600:400 }} />
                        : <span style={{ fontSize:12, color:q.c===oi?'#059669':'#475569', fontWeight:q.c===oi?600:400 }}>{String.fromCharCode(65+oi)}. {opt}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main ── */
function AdminAI() {
  const [tab, setTab] = useAISt('content');
  return (
    <div style={{ padding:'32px 28px', maxWidth:860 }}>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#0F172A,#1E3A5F)', borderRadius:12, padding:'6px 14px', marginBottom:12 }}>
          <span style={{ fontSize:16 }}>✨</span>
          <span style={{ color:'#54bbaa', fontSize:12, fontWeight:700, letterSpacing:'0.05em' }}>GENERADOR IA</span>
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#0F172A', margin:'0 0 4px' }}>Asistente de Contenido</h1>
        <p style={{ color:'#64748B', margin:0, fontSize:14 }}>Subí imágenes, pegá texto o describí lo que necesitás — la IA hace el resto.</p>
      </div>
      <div style={{ display:'flex', background:'#F1F5F9', borderRadius:12, padding:4, marginBottom:24, gap:4 }}>
        {[['content','📄 Organizar contenido'],['eval','❓ Generar evaluación']].map(([k,lbl])=>(
          <button key={k} onClick={()=>setTab(k)} style={{ flex:1, padding:'10px 0', border:'none', background:tab===k?'#fff':'none', borderRadius:9, cursor:'pointer', fontFamily:'inherit', fontWeight:tab===k?700:500, fontSize:13, color:tab===k?'#0F172A':'#64748B', boxShadow:tab===k?'0 1px 6px #00000014':'none', transition:'all .15s' }}>{lbl}</button>
        ))}
      </div>
      <AICd style={{ padding:28 }}>
        {tab==='content' && <AIContentOrganizer />}
        {tab==='eval' && <AIEvalGenerator />}
      </AICd>
    </div>
  );
}

Object.assign(window, { AdminAI });
