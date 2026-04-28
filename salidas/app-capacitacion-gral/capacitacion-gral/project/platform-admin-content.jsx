// platform-admin-content.jsx — Content CRUD editor (markdown + video support)

const { useState: useACState, useEffect: useACEffect, useMemo: useACMemo } = React;
const { Btn: CBt, Card: CCd, Badge: CBg } = window;

const MODULE_COLORS = ['#0284C7','#7C3AED','#059669','#DC2626','#EA580C','#0891B2','#9333EA','#16A34A'];
const inputSt2 = { width:'100%', padding:'9px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', outline:'none' };

function Field2({ label, required, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>
        {label}{required && <span style={{ color:'#DC2626', marginLeft:3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function MarkdownEditorC({ initialHtml, onChange }) {
  const [tab, setTab] = useACState('edit');
  const initialMd = useACMemo(() => {
    if (!initialHtml) return '';
    if (window.TurndownService) {
      try { return new window.TurndownService({ headingStyle:'atx', bulletListMarker:'-' }).turndown(initialHtml); }
      catch { return initialHtml; }
    }
    return initialHtml;
  }, []);
  const [md, setMd] = useACState(initialMd);
  useACEffect(() => { onChange(window.marked ? window.marked.parse(md) : md); }, [md]);
  const preview = useACMemo(() => window.marked ? window.marked.parse(md) : `<p>${md}</p>`, [md]);
  return (
    <div>
      <div style={{ display:'flex', background:'#F1F5F9', borderRadius:10, padding:4, marginBottom:12, gap:4 }}>
        {[['edit','✏️ Markdown'],['preview','👁 Preview']].map(([k,lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'7px 0', border:'none', background:tab===k?'#fff':'none', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:700, color:tab===k?'#0284C7':'#64748B', fontFamily:'inherit', transition:'all .15s' }}>{lbl}</button>
        ))}
      </div>
      {tab === 'edit' ? (
        <>
          <textarea value={md} onChange={e => setMd(e.target.value)}
            style={{ width:'100%', minHeight:260, padding:16, border:'1.5px solid #E2E8F0', borderRadius:12, fontSize:13, fontFamily:'"Fira Code","Consolas",monospace', boxSizing:'border-box', resize:'vertical', lineHeight:1.65, outline:'none' }}
            onFocus={e => e.target.style.borderColor='#0284C7'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
          <p style={{ fontSize:11, color:'#94A3B8', marginTop:6 }}>Usá <code># Título</code> · <code>## Sección</code> · <code>**negrita**</code> · <code>- lista</code></p>
        </>
      ) : (
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: preview }}
          style={{ minHeight:260, padding:'16px 20px', border:'1.5px solid #E2E8F0', borderRadius:12, background:'#FAFBFC', fontSize:14 }} />
      )}
    </div>
  );
}

function VideoEditorC({ videos = [], onChange }) {
  const [newUrl, setNewUrl] = useACState('');
  const [err, setErr] = useACState('');
  function getYTId(url) {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([\w\-]{11})/);
    return m ? m[1] : null;
  }
  function add() {
    const url = newUrl.trim();
    if (!getYTId(url)) { setErr('URL inválida'); return; }
    onChange([...videos, url]); setNewUrl(''); setErr('');
  }
  return (
    <div>
      <div style={{ display:'flex', gap:10, marginBottom:8 }}>
        <input value={newUrl} onChange={e => { setNewUrl(e.target.value); setErr(''); }} onKeyDown={e => e.key==='Enter' && add()}
          placeholder="https://www.youtube.com/watch?v=..." style={{ flex:1, padding:'9px 14px', border:`1.5px solid ${err?'#FCA5A5':'#E2E8F0'}`, borderRadius:10, fontSize:13, fontFamily:'inherit', outline:'none' }} />
        <CBt size="sm" onClick={add}>+ Agregar</CBt>
      </div>
      {err && <p style={{ color:'#DC2626', fontSize:12, marginBottom:8 }}>{err}</p>}
      {videos.length === 0
        ? <p style={{ color:'#CBD5E1', fontSize:13, textAlign:'center', padding:'16px 0' }}>Sin videos.</p>
        : videos.map((url, i) => {
          const id = getYTId(url);
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, background:'#F8FAFC', borderRadius:10, padding:'10px 14px', marginBottom:8, border:'1px solid #E2E8F0' }}>
              {id && <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" style={{ width:80, height:45, borderRadius:6, objectFit:'cover', flexShrink:0 }} />}
              <span style={{ flex:1, fontSize:12, color:'#475569', wordBreak:'break-all' }}>{url}</span>
              <button onClick={() => onChange(videos.filter((_,j) => j!==i))} style={{ background:'#FEE2E2', border:'none', borderRadius:6, padding:'4px 10px', color:'#DC2626', cursor:'pointer', fontSize:12, fontWeight:700 }}>✕</button>
            </div>
          );
        })
      }
    </div>
  );
}

function AdminContent() {
  const [season, setSeason] = useACState('all_year');
  const [content, setCS] = useACState(() => getContent());
  const [saved, setSaved] = useACState(false);
  const [editModal, setEditModal] = useACState(null);
  const [editTab, setEditTab] = useACState('content');
  const [editContent, setEditContent] = useACState('');
  const [editVideos, setEditVideos] = useACState([]);
  const [addModal, setAddModal] = useACState(null);
  const [addForm, setAddForm] = useACState({});

  const sd = content[season] || {};
  const modules = sd.modules || [];

  function persist(u) { setCS(u); saveContent(u); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  function clone() { return JSON.parse(JSON.stringify(content)); }

  function openEdit(cPath, vPath, cVal, vVal) {
    setEditContent(cVal||''); setEditVideos(vVal||[]); setEditModal({ cPath, vPath }); setEditTab('content');
  }
  function saveEdit() {
    const u = clone();
    let r = u; editModal.cPath.slice(0,-1).forEach(k => r=r[k]); r[editModal.cPath[editModal.cPath.length-1]] = editContent;
    if (editModal.vPath) { let v=u; editModal.vPath.slice(0,-1).forEach(k=>v=v[k]); v[editModal.vPath[editModal.vPath.length-1]] = editVideos; }
    persist(u); setEditModal(null);
  }
  function saveInline(path, value) {
    const u = clone(); let r=u; path.slice(0,-1).forEach(k=>r=r[k]); r[path[path.length-1]]=value; persist(u);
  }

  function delModule(mi) { if (!confirm('¿Eliminar módulo?')) return; const u=clone(); u[season].modules.splice(mi,1); persist(u); }
  function delBlock(mi,bi) { if (!confirm('¿Eliminar bloque?')) return; const u=clone(); u[season].modules[mi].blocks.splice(bi,1); persist(u); }
  function delItem(mi,bi,ii) { if (!confirm('¿Eliminar ítem?')) return; const u=clone(); u[season].modules[mi].blocks[bi].items.splice(ii,1); persist(u); }

  function openAddModule() { setAddForm({ subtitle:'', description:'', color:'#0284C7', coverUrl:'' }); setAddModal({ type:'module' }); }
  function openAddBlock(mi) { setAddForm({ title:'', subtitle:'', type:'reading' }); setAddModal({ type:'block', mi }); }
  function openAddItem(mi,bi) { setAddForm({ title:'' }); setAddModal({ type:'item', mi, bi }); }

  function confirmAdd() {
    const u = clone();
    if (addModal.type==='module') {
      if (!addForm.subtitle?.trim()) return;
      u[season].modules.push({ id:'m'+Date.now(), title:`Módulo ${u[season].modules.length}`, subtitle:addForm.subtitle.trim(), description:addForm.description?.trim()||'', color:addForm.color||'#0284C7', coverUrl:addForm.coverUrl||'', blocks:[] });
    }
    if (addModal.type==='block') {
      if (!addForm.title?.trim()) return;
      const b = { id:'b'+Date.now(), title:addForm.title.trim(), subtitle:addForm.subtitle?.trim()||'', type:addForm.type||'reading' };
      if (b.type==='reading') b.content=''; else b.items=[];
      u[season].modules[addModal.mi].blocks.push(b);
    }
    if (addModal.type==='item') {
      if (!addForm.title?.trim()) return;
      u[season].modules[addModal.mi].blocks[addModal.bi].items.push({ id:'i'+Date.now(), title:addForm.title.trim(), content:'' });
    }
    persist(u); setAddModal(null);
  }

  function InlineEdit({ path, value, style: s }) {
    const [editing, setEditing] = useACState(false);
    const [val, setVal] = useACState(value);
    if (editing) return (
      <div style={{ display:'flex', gap:6, flex:1 }}>
        <input value={val} onChange={e=>setVal(e.target.value)} autoFocus
          onKeyDown={e=>{ if(e.key==='Enter'){saveInline(path,val);setEditing(false);} if(e.key==='Escape'){setVal(value);setEditing(false);} }}
          style={{ flex:1, padding:'4px 10px', border:'1.5px solid #0284C7', borderRadius:7, fontSize:s?.fontSize||14, fontFamily:'inherit', fontWeight:s?.fontWeight||400, outline:'none' }} />
        <button onClick={()=>{saveInline(path,val);setEditing(false);}} style={{ background:'#0284C7', border:'none', borderRadius:6, padding:'4px 10px', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>OK</button>
        <button onClick={()=>{setVal(value);setEditing(false);}} style={{ background:'#F1F5F9', border:'none', borderRadius:6, padding:'4px 10px', color:'#64748B', cursor:'pointer', fontSize:12 }}>✕</button>
      </div>
    );
    return (
      <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
        <span style={{ flex:1, ...s }}>{value}</span>
        <button onClick={()=>setEditing(true)} style={{ background:'#EFF6FF', border:'none', borderRadius:6, padding:'3px 10px', fontSize:11, color:'#0284C7', cursor:'pointer', fontWeight:700, flexShrink:0 }}>Editar</button>
      </div>
    );
  }

  return (
    <div style={{ padding:'32px 28px', maxWidth:980 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0, fontSize:20, fontWeight:700, color:'#0F172A' }}>Contenido</h2>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {saved && <span style={{ color:'#059669', fontSize:13, fontWeight:700 }}>✓ Guardado</span>}
          <select value={season} onChange={e=>setSeason(e.target.value)} style={{ padding:'8px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:13, fontFamily:'inherit' }}>
            <option value="all_year">Todo el año</option>
            <option value="winter">Invierno</option>
          </select>
          <CBt onClick={openAddModule}>+ Nuevo módulo</CBt>
        </div>
      </div>

      <div style={{ display:'grid', gap:20 }}>
        {modules.length===0 && (
          <div style={{ textAlign:'center', padding:48, color:'#94A3B8', background:'#fff', borderRadius:16, border:'2px dashed #E2E8F0' }}>
            <div style={{ fontSize:32, marginBottom:12 }}>📭</div>
            <p style={{ fontWeight:600 }}>Sin módulos en esta temporada.</p>
            <CBt style={{ marginTop:12 }} onClick={openAddModule}>+ Primer módulo</CBt>
          </div>
        )}

        {modules.map((mod, mi) => (
          <CCd key={mod.id} style={{ padding:0, overflow:'hidden' }}>
            {/* Cover image */}
            <div style={{ height:80, background: mod.coverUrl ? `url(${mod.coverUrl}) center/cover` : `linear-gradient(135deg, ${mod.color}, ${mod.color}99)`, position:'relative' }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 40%, #00000044)' }} />
              <div style={{ position:'absolute', bottom:8, right:12, display:'flex', gap:8 }}>
                <button onClick={() => { const url = prompt('URL de imagen de portada:', mod.coverUrl||''); if (url !== null) { const u=clone(); u[season].modules[mi].coverUrl=url; persist(u); } }}
                  style={{ background:'#ffffff22', backdropFilter:'blur(4px)', border:'1px solid #ffffff44', borderRadius:6, padding:'4px 10px', color:'#fff', cursor:'pointer', fontSize:11, fontWeight:600 }}>🖼 Imagen</button>
                <button onClick={() => delModule(mi)} style={{ background:'#DC262644', border:'1px solid #DC262666', borderRadius:6, padding:'4px 10px', color:'#fff', cursor:'pointer', fontSize:11, fontWeight:600 }}>🗑 Eliminar</button>
              </div>
            </div>

            <div style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:mod.color }} />
                <span style={{ fontSize:11, fontWeight:700, color:'#94A3B8' }}>{mod.title}</span>
              </div>
              <InlineEdit path={[season,'modules',mi,'subtitle']} value={mod.subtitle} style={{ fontWeight:700, fontSize:15, color:'#0F172A' }} />
              <div style={{ marginTop:6 }}>
                <InlineEdit path={[season,'modules',mi,'description']} value={mod.description} style={{ fontSize:13, color:'#64748B' }} />
              </div>

              <div style={{ marginTop:16 }}>
                {mod.blocks.length===0 && <p style={{ color:'#CBD5E1', fontSize:13, marginBottom:10 }}>Sin bloques aún.</p>}
                {mod.blocks.map((block, bi) => (
                  <div key={block.id} style={{ borderRadius:10, border:'1px solid #E2E8F0', marginBottom:10, overflow:'hidden' }}>
                    <div style={{ background:'#F8FAFC', padding:'10px 14px', display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #E2E8F0', flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#94A3B8' }}>B{bi+1}</span>
                      <CBg color={block.type==='reading'?'#0284C7':block.type==='protocols'?'#7C3AED':'#059669'}>
                        {block.type==='reading'?'Lectura':block.type==='protocols'?'Protocolos':'Tarjetas'}
                      </CBg>
                      <div style={{ flex:1 }}>
                        <InlineEdit path={[season,'modules',mi,'blocks',bi,'title']} value={block.title} style={{ fontSize:13, fontWeight:700, color:'#334155' }} />
                      </div>
                      <button onClick={()=>delBlock(mi,bi)} style={{ background:'#FEE2E2', border:'none', borderRadius:6, padding:'3px 8px', color:'#DC2626', cursor:'pointer', fontSize:11, fontWeight:700, flexShrink:0 }}>🗑</button>
                    </div>
                    <div style={{ padding:'10px 14px' }}>
                      {block.type==='reading' && (
                        <CBt size="sm" onClick={() => openEdit([season,'modules',mi,'blocks',bi,'content'],[season,'modules',mi,'blocks',bi,'videos'],block.content,block.videos||[])}>
                          ✏️ Editar contenido + videos
                        </CBt>
                      )}
                      {(block.type==='protocols'||block.type==='cards') && (
                        <div>
                          {block.items?.length===0 && <p style={{ color:'#CBD5E1', fontSize:12, marginBottom:8 }}>Sin ítems.</p>}
                          {block.items?.map((item,ii) => (
                            <div key={item.id} style={{ display:'flex', alignItems:'center', gap:8, background:'#F8FAFC', borderRadius:8, padding:'8px 12px', marginBottom:6, border:'1px solid #F1F5F9' }}>
                              <span style={{ fontSize:11, color:'#94A3B8', fontWeight:700, flexShrink:0 }}>{ii+1}.</span>
                              <div style={{ flex:1 }}>
                                <InlineEdit path={[season,'modules',mi,'blocks',bi,'items',ii,'title']} value={item.title} style={{ fontSize:13, color:'#475569' }} />
                              </div>
                              <CBt size="sm" variant="secondary" onClick={() => openEdit([season,'modules',mi,'blocks',bi,'items',ii,'content'],[season,'modules',mi,'blocks',bi,'items',ii,'videos'],item.content,item.videos||[])}>Contenido</CBt>
                              <button onClick={()=>delItem(mi,bi,ii)} style={{ background:'#FEE2E2', border:'none', borderRadius:6, padding:'4px 8px', color:'#DC2626', cursor:'pointer', fontSize:12, fontWeight:700 }}>🗑</button>
                            </div>
                          ))}
                          <CBt size="sm" variant="secondary" onClick={()=>openAddItem(mi,bi)}>+ Nuevo ítem</CBt>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <CBt size="sm" variant="secondary" onClick={()=>openAddBlock(mi)}>+ Nuevo bloque</CBt>
              </div>
            </div>
          </CCd>
        ))}

        {sd.additionalInfo && (
          <CCd style={{ padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:700, color:'#0F172A' }}>{sd.additionalInfo.title}</div>
              <div style={{ fontSize:13, color:'#94A3B8' }}>Información adicional</div>
            </div>
            <CBt size="sm" onClick={()=>openEdit([season,'additionalInfo','content'],[season,'additionalInfo','videos'],sd.additionalInfo.content,sd.additionalInfo.videos||[])}>✏️ Editar</CBt>
          </CCd>
        )}
      </div>

      {/* Edit modal */}
      {editModal && (
        <div style={{ position:'fixed', inset:0, background:'#0F172A88', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:700, maxHeight:'92vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px #0F172A28' }}>
            <div style={{ padding:'18px 24px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <h3 style={{ margin:0, fontSize:16, fontWeight:700 }}>Editar contenido</h3>
              <button onClick={()=>setEditModal(null)} style={{ background:'none', border:'none', fontSize:22, color:'#94A3B8', cursor:'pointer' }}>×</button>
            </div>
            <div style={{ display:'flex', borderBottom:'1px solid #E2E8F0', background:'#F8FAFC' }}>
              {[['content','📝 Contenido'],['videos','🎬 Videos']].map(([k,lbl])=>(
                <button key={k} onClick={()=>setEditTab(k)} style={{ flex:1, padding:'12px 0', border:'none', background:'none', fontFamily:'inherit', fontWeight:editTab===k?700:500, fontSize:13, color:editTab===k?'#0284C7':'#64748B', borderBottom:`3px solid ${editTab===k?'#0284C7':'transparent'}`, cursor:'pointer' }}>{lbl}</button>
              ))}
            </div>
            <div style={{ flex:1, overflow:'auto', padding:24 }}>
              {editTab==='content' && <MarkdownEditorC key={editModal.cPath?.join('.')} initialHtml={editContent} onChange={setEditContent} />}
              {editTab==='videos' && <VideoEditorC videos={editVideos} onChange={setEditVideos} />}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #E2E8F0', display:'flex', gap:10, justifyContent:'flex-end', background:'#FAFAFA' }}>
              <CBt variant="secondary" onClick={()=>setEditModal(null)}>Cancelar</CBt>
              <CBt onClick={saveEdit}>Guardar cambios</CBt>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {addModal && (
        <div style={{ position:'fixed', inset:0, background:'#0F172A88', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}
          onClick={e=>e.target===e.currentTarget&&setAddModal(null)}>
          <CCd style={{ width:'100%', maxWidth:480, padding:32 }}>
            <h3 style={{ margin:'0 0 24px', fontSize:17, fontWeight:700 }}>
              {addModal.type==='module'?'+ Nuevo módulo':addModal.type==='block'?'+ Nuevo bloque':'+ Nuevo ítem'}
            </h3>
            {addModal.type==='module' && (<>
              <Field2 label="Nombre" required><input value={addForm.subtitle||''} onChange={e=>setAddForm(f=>({...f,subtitle:e.target.value}))} placeholder="Ej: Atención al cliente" style={inputSt2} /></Field2>
              <Field2 label="Descripción"><input value={addForm.description||''} onChange={e=>setAddForm(f=>({...f,description:e.target.value}))} placeholder="Breve descripción" style={inputSt2} /></Field2>
              <Field2 label="URL de imagen de portada"><input value={addForm.coverUrl||''} onChange={e=>setAddForm(f=>({...f,coverUrl:e.target.value}))} placeholder="https://..." style={inputSt2} /></Field2>
              <Field2 label="Color">
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:4 }}>
                  {MODULE_COLORS.map(c=>(
                    <button key={c} onClick={()=>setAddForm(f=>({...f,color:c}))} style={{ width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${addForm.color===c?'#0F172A':'transparent'}`, cursor:'pointer' }} />
                  ))}
                </div>
              </Field2>
            </>)}
            {addModal.type==='block' && (<>
              <Field2 label="Título" required><input value={addForm.title||''} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} placeholder="Ej: Bloque 1 — Protocolos" style={inputSt2} /></Field2>
              <Field2 label="Subtítulo"><input value={addForm.subtitle||''} onChange={e=>setAddForm(f=>({...f,subtitle:e.target.value}))} placeholder="Descripción breve" style={inputSt2} /></Field2>
              <Field2 label="Tipo">
                <select value={addForm.type||'reading'} onChange={e=>setAddForm(f=>({...f,type:e.target.value}))} style={{ ...inputSt2, background:'#fff' }}>
                  <option value="reading">📖 Lectura</option>
                  <option value="protocols">📋 Protocolos expandibles</option>
                  <option value="cards">🃏 Tarjetas en grilla</option>
                </select>
              </Field2>
            </>)}
            {addModal.type==='item' && (
              <Field2 label="Título" required><input value={addForm.title||''} onChange={e=>setAddForm(f=>({...f,title:e.target.value}))} placeholder="Ej: 1. Nombre del protocolo" style={inputSt2} autoFocus onKeyDown={e=>e.key==='Enter'&&confirmAdd()} /></Field2>
            )}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
              <CBt variant="secondary" onClick={()=>setAddModal(null)}>Cancelar</CBt>
              <CBt onClick={confirmAdd}>Crear</CBt>
            </div>
          </CCd>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { AdminContent });
