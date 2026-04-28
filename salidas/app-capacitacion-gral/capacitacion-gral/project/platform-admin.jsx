// platform-admin.jsx — Admin with dark sidebar, dashboard, analytics

const { useState: useAdSt, useEffect: useAdEf } = React;
const { Btn: ABt, Card: ACd, Badge: ABg } = window;

/* ── SVG Bar Chart ── */
function BarChart({ data, height = 160, accent = '#54bbaa' }) {
  if (!data?.length) return <p style={{ color:'#94A3B8', textAlign:'center', padding:24 }}>Sin datos aún.</p>;
  const max = Math.max(...data.map(d => d.value), 1);
  const bw = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ width:'100%', height, overflow:'visible' }}>
      {data.map((d, i) => {
        const bh = Math.max((d.value / max) * (height - 36), d.value > 0 ? 4 : 0);
        const x = i * bw + bw * 0.15;
        const w = bw * 0.7;
        const y = height - 28 - bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={bh} rx="2" fill={d.color || accent} opacity="0.85" />
            <text x={x + w/2} y={height - 12} textAnchor="middle" fontSize="5.5" fill="#94A3B8" fontFamily="sans-serif">{d.label}</text>
            {d.value > 0 && <text x={x + w/2} y={y - 3} textAnchor="middle" fontSize="6" fontWeight="bold" fill="#475569" fontFamily="sans-serif">{d.value}</text>}
          </g>
        );
      })}
    </svg>
  );
}

/* ── Role helpers ── */
const ROLE_LABELS = { admin: 'Administrador', supervisor: 'Supervisor', editor: 'Editor', vendedor: 'Vendedor' };
const ROLE_COLORS = { admin: '#7C3AED', supervisor: '#0284C7', editor: '#059669', vendedor: '#F59E0B' };
const ROLE_PERMISSIONS = {
  admin:      ['dashboard', 'content', 'users', 'results', 'ai'],
  supervisor: ['dashboard', 'users', 'results'],
  editor:     ['content', 'ai'],
};

/* ── Sidebar ── */
function AdminSidebar({ section, onSelect, user, onLogout }) {
  const perms = ROLE_PERMISSIONS[user.role] || [];
  const allItems = [
    { key:'dashboard', icon:'⊞', label:'Dashboard' },
    { key:'content',   icon:'📚', label:'Contenido' },
    { key:'users',     icon:'👥', label:'Usuarios' },
    { key:'results',   icon:'📊', label:'Analíticas' },
    { key:'ai',        icon:'✨', label:'Generador IA' },
  ];
  const items = allItems.filter(i => perms.includes(i.key));
  return (
    <div style={{ width:230, background:'#0F172A', display:'flex', flexDirection:'column', flexShrink:0, minHeight:'100vh', position:'sticky', top:0, height:'100vh', overflow:'hidden' }}>
      {/* Logo */}
      <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid #1E293B' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#54bbaa,#0284C7)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:13, lineHeight:1.2 }}>Academia</div>
            <div style={{ color:'#54bbaa', fontWeight:600, fontSize:11 }}>Patagonia Booking</div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex:1, padding:'16px 10px', overflowY:'auto' }}>
        {items.map(item => {
          const active = section === item.key;
          return (
            <button key={item.key} onClick={() => onSelect(item.key)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', border:'none', borderRadius:10, background:active?'#54bbaa18':'transparent', color:active?'#54bbaa':'#64748B', cursor:'pointer', fontFamily:'inherit', fontWeight:active?700:500, fontSize:13, marginBottom:4, transition:'all .15s', textAlign:'left' }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background='#1E293B'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background='transparent'; }}>
              <span style={{ fontSize:16, width:20, textAlign:'center', flexShrink:0 }}>{item.icon}</span>
              {item.label}
              {active && <div style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#54bbaa' }} />}
            </button>
          );
        })}
      </nav>

      {/* User at bottom */}
      <div style={{ padding:'14px 16px', borderTop:'1px solid #1E293B' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#54bbaa,#0284C7)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:13, flexShrink:0 }}>{user?.name?.[0]}</div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ color:'#E2E8F0', fontSize:12, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize:10, color: ROLE_COLORS[user?.role] || '#475569', fontWeight:600 }}>{ROLE_LABELS[user?.role] || user?.role}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width:'100%', background:'#1E293B', border:'none', borderRadius:8, padding:'7px 0', color:'#64748B', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'all .15s' }}
          onMouseEnter={e => e.currentTarget.style.background='#DC262622'}
          onMouseLeave={e => e.currentTarget.style.background='#1E293B'}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard ── */
function AdminDashboard({ onNavigate }) {
  const users = getUsers().filter(u => u.role !== 'admin');
  const results = getResults();
  const content = getContent();
  const progress = getProgress();
  const allMods = content.all_year?.modules || [];

  let totalDone = 0;
  users.forEach(u => {
    ['all_year','winter'].forEach(s => {
      (content[s]?.modules || []).forEach(m => {
        if (progress[`${u.id}_${s}_${m.id}`]?.evalDone) totalDone++;
      });
    });
  });

  const avg = results.length ? (results.reduce((a,r) => a+r.score, 0) / results.length).toFixed(1) : '—';
  const passRate = results.length ? Math.round(results.filter(r => r.score >= 14).length / results.length * 100) : 0;

  const stats = [
    { label:'Módulos', val: allMods.length, icon:'📚', color:'#0284C7' },
    { label:'Vendedores', val: users.length, icon:'👥', color:'#7C3AED' },
    { label:'Evaluaciones', val: results.length, icon:'📝', color:'#F59E0B' },
    { label:'Promedio general', val: avg + '/20', icon:'⭐', color:'#059669' },
  ];

  const recent = [...results].sort((a,b) => b.id - a.id).slice(0, 6);

  return (
    <div style={{ padding:'32px 28px', maxWidth:980 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#0F172A', margin:0 }}>Dashboard</h1>
        <p style={{ color:'#64748B', marginTop:4 }}>Resumen de la plataforma de capacitación</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16, marginBottom:32 }}>
        {stats.map(s => (
          <ACd key={s.label} style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:s.color+'18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:11, color:'#94A3B8', fontWeight:600 }}>{s.label.toUpperCase()}</div>
              </div>
            </div>
          </ACd>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:28 }}>
        {/* Recent evaluations */}
        <ACd style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#0F172A' }}>Evaluaciones recientes</h3>
            <button onClick={() => onNavigate('results')} style={{ background:'none', border:'none', color:'#0284C7', fontSize:12, cursor:'pointer', fontWeight:600 }}>Ver todo →</button>
          </div>
          <div style={{ padding:'8px 0' }}>
            {recent.length === 0 ? (
              <p style={{ color:'#94A3B8', textAlign:'center', padding:20 }}>Sin evaluaciones aún</p>
            ) : recent.map((r, i) => {
              const u = users.find(x => x.id === r.userId);
              const m = allMods.find(x => x.id === r.moduleId);
              const ok = r.score >= 14;
              return (
                <div key={i} style={{ padding:'10px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:i<recent.length-1?'1px solid #F8FAFC':'none' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#54bbaa,#0284C7)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{u?.name?.[0]||'?'}</div>
                  <div style={{ flex:1, overflow:'hidden' }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{u?.name || '—'}</div>
                    <div style={{ fontSize:11, color:'#94A3B8' }}>{m?.subtitle || r.moduleId}</div>
                  </div>
                  <ABg color={ok?'#059669':'#DC2626'}>{r.score}/20</ABg>
                </div>
              );
            })}
          </div>
        </ACd>

        {/* Vendedores */}
        <ACd style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:'#0F172A' }}>Vendedores</h3>
            <button onClick={() => onNavigate('users')} style={{ background:'none', border:'none', color:'#0284C7', fontSize:12, cursor:'pointer', fontWeight:600 }}>Gestionar →</button>
          </div>
          <div style={{ padding:'8px 0' }}>
            {users.length === 0 ? (
              <p style={{ color:'#94A3B8', textAlign:'center', padding:20 }}>Sin vendedores registrados</p>
            ) : users.map((u, i) => {
              const done = ['all_year','winter'].reduce((acc, s) => acc + (content[s]?.modules||[]).filter(m => progress[`${u.id}_${s}_${m.id}`]?.evalDone).length, 0);
              const total = ['all_year','winter'].reduce((acc, s) => acc + (content[s]?.modules||[]).length, 0);
              const pct = total ? Math.round(done/total*100) : 0;
              return (
                <div key={u.id} style={{ padding:'10px 20px', display:'flex', alignItems:'center', gap:12, borderBottom:i<users.length-1?'1px solid #F8FAFC':'none' }}>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#7C3AED,#9333EA)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13, flexShrink:0 }}>{u.name[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'#0F172A' }}>{u.name}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                      <div style={{ flex:1, background:'#E2E8F0', borderRadius:99, height:4, overflow:'hidden' }}>
                        <div style={{ width:pct+'%', height:'100%', background:'#54bbaa', borderRadius:99 }} />
                      </div>
                      <span style={{ fontSize:10, color:'#94A3B8', fontWeight:600, flexShrink:0 }}>{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ACd>
      </div>

      {/* Pass rate */}
      {results.length > 0 && (
        <ACd style={{ padding:'20px 24px', background:'linear-gradient(135deg,#0F172A,#0C3358)', border:'none' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
            <div>
              <h3 style={{ color:'#fff', margin:'0 0 4px', fontSize:16, fontWeight:700 }}>Tasa de aprobación</h3>
              <p style={{ color:'#64748B', margin:0, fontSize:13 }}>{results.filter(r=>r.score>=14).length} de {results.length} evaluaciones aprobadas</p>
            </div>
            <div style={{ fontSize:36, fontWeight:800, color: passRate>=70?'#34D399':'#FCA5A5' }}>{passRate}%</div>
          </div>
          <div style={{ marginTop:14, background:'#1E293B', borderRadius:99, height:8, overflow:'hidden' }}>
            <div style={{ width:passRate+'%', height:'100%', background: passRate>=70?'#34D399':'#FCA5A5', borderRadius:99, transition:'width .8s ease' }} />
          </div>
        </ACd>
      )}
    </div>
  );
}

/* ── Analytics ── */
function AdminAnalytics() {
  const results = getResults();
  const users = getUsers().filter(u => u.role !== 'admin');
  const content = getContent();
  const allMods = content.all_year?.modules || [];

  // Score per module
  const scoreByMod = allMods.map(m => {
    const modResults = results.filter(r => r.moduleId === m.id);
    const avg = modResults.length ? Math.round(modResults.reduce((a,r)=>a+r.score,0)/modResults.length) : 0;
    return { label: m.title, value: avg, color: m.color };
  });

  // Completion per user
  const progress = getProgress();
  const completionByUser = users.map(u => {
    const total = ['all_year','winter'].reduce((a,s)=>a+(content[s]?.modules||[]).length,0);
    const done = ['all_year','winter'].reduce((a,s)=>a+(content[s]?.modules||[]).filter(m=>progress[`${u.id}_${s}_${m.id}`]?.evalDone).length,0);
    return { label: u.name.split(' ')[0], value: total ? Math.round(done/total*100) : 0, color:'#7C3AED' };
  });

  // Score distribution
  const dist = [
    { label:'0-7', value: results.filter(r=>r.score<=7).length, color:'#DC2626' },
    { label:'8-11', value: results.filter(r=>r.score>=8&&r.score<=11).length, color:'#F59E0B' },
    { label:'12-13', value: results.filter(r=>r.score>=12&&r.score<=13).length, color:'#3B82F6' },
    { label:'14-17', value: results.filter(r=>r.score>=14&&r.score<=17).length, color:'#54bbaa' },
    { label:'18-20', value: results.filter(r=>r.score>=18).length, color:'#059669' },
  ];

  const stats = [
    { label:'Total evaluaciones', val:results.length, color:'#0284C7' },
    { label:'Aprobadas', val:results.filter(r=>r.score>=14).length, color:'#059669' },
    { label:'Desaprobadas', val:results.filter(r=>r.score<14).length, color:'#DC2626' },
    { label:'Promedio global', val:results.length?(results.reduce((a,r)=>a+r.score,0)/results.length).toFixed(1):'—', color:'#7C3AED' },
  ];

  return (
    <div style={{ padding:'32px 28px', maxWidth:980 }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#0F172A', margin:0 }}>Analíticas</h1>
        <p style={{ color:'#64748B', marginTop:4 }}>Rendimiento y progreso del equipo</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:16, marginBottom:32 }}>
        {stats.map(s=>(
          <ACd key={s.label} style={{ padding:20, textAlign:'center' }}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:10, color:'#94A3B8', fontWeight:700, marginTop:4 }}>{s.label.toUpperCase()}</div>
          </ACd>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:24 }}>
        <ACd style={{ padding:22 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#0F172A' }}>Puntaje promedio por módulo</h3>
          <BarChart data={scoreByMod} height={140} />
          <p style={{ fontSize:11, color:'#94A3B8', marginTop:8, textAlign:'center' }}>Promedio de puntaje obtenido en cada módulo</p>
        </ACd>
        <ACd style={{ padding:22 }}>
          <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#0F172A' }}>Completado por vendedor (%)</h3>
          <BarChart data={completionByUser} height={140} accent='#7C3AED' />
          <p style={{ fontSize:11, color:'#94A3B8', marginTop:8, textAlign:'center' }}>Porcentaje de módulos completados por vendedor</p>
        </ACd>
      </div>

      <ACd style={{ padding:22, marginBottom:24 }}>
        <h3 style={{ margin:'0 0 16px', fontSize:14, fontWeight:700, color:'#0F172A' }}>Distribución de puntajes</h3>
        <BarChart data={dist} height={120} />
        <div style={{ display:'flex', gap:12, justifyContent:'center', marginTop:12, flexWrap:'wrap' }}>
          {dist.map(d=>(
            <div key={d.label} style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:d.color }} />
              <span style={{ fontSize:11, color:'#64748B' }}>{d.label} pts: <strong>{d.value}</strong></span>
            </div>
          ))}
        </div>
      </ACd>

      {/* Table */}
      <ACd style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #F1F5F9' }}>
          <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:'#0F172A' }}>Detalle de evaluaciones</h3>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'#F8FAFC' }}>
                {['Vendedor','Módulo','Temporada','Puntaje','Estado','Fecha'].map(h=>(
                  <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontWeight:700, color:'#64748B', fontSize:11, borderBottom:'1px solid #E2E8F0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.length===0
                ? <tr><td colSpan={6} style={{ padding:32, textAlign:'center', color:'#94A3B8' }}>Sin resultados</td></tr>
                : results.map((r,i)=>{
                  const u=users.find(x=>x.id===r.userId); const m=allMods.find(x=>x.id===r.moduleId); const ok=r.score>=14;
                  return (
                    <tr key={i} style={{ borderBottom:'1px solid #F1F5F9' }}>
                      <td style={{ padding:'10px 16px', fontWeight:600 }}>{u?.name||'—'}</td>
                      <td style={{ padding:'10px 16px', color:'#475569' }}>{m?.subtitle||r.moduleId}</td>
                      <td style={{ padding:'10px 16px' }}><ABg color="#0284C7">{r.season==='all_year'?'Todo el año':'Invierno'}</ABg></td>
                      <td style={{ padding:'10px 16px', fontWeight:700, color:ok?'#059669':'#DC2626' }}>{r.score}/20</td>
                      <td style={{ padding:'10px 16px' }}><ABg color={ok?'#059669':'#DC2626'}>{ok?'✓ Aprobado':'✗ Desaprobado'}</ABg></td>
                      <td style={{ padding:'10px 16px', color:'#94A3B8' }}>{r.date}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </ACd>
    </div>
  );
}

/* ── Users ── */
function AdminUsers({ currentUserRole = 'admin' }) {
  // Roles this user can create (admin can create all; supervisor can create all except admin)
  const creatableRoles = currentUserRole === 'admin'
    ? ['vendedor', 'editor', 'supervisor', 'admin']
    : ['vendedor', 'editor', 'supervisor'];
  const [users, setUsers] = useAdSt([]);
  const [modal, setModal] = useAdSt(null);
  const [form, setForm] = useAdSt({ username:'', password:'', name:'', role:'vendedor' });
  const [error, setError] = useAdSt('');
  useAdEf(()=>setUsers(getUsers().filter(u=>u.role!=='admin')),[]);
  function refresh(){setUsers(getUsers().filter(u=>u.role!=='admin'));}
  function openNew(){setForm({username:'',password:'',name:'',role:'vendedor'});setError('');setModal('new');}
  function openEdit(u){setForm({...u});setError('');setModal(u);}
  function handleSave(){
    if(!form.username||!form.password||!form.name){setError('Completá todos los campos.');return;}
    const all=getUsers();
    if(modal==='new'){
      if(all.find(u=>u.username===form.username)){setError('Ese usuario ya existe.');return;}
      saveUsers([...all,{id:Date.now(),...form}]);
    } else { saveUsers(all.map(u=>u.id===modal.id?{...u,...form}:u)); }
    refresh(); setModal(null);
  }
  function handleDelete(u){if(!confirm(`¿Eliminar a ${u.name}?`))return;saveUsers(getUsers().filter(x=>x.id!==u.id));refresh();}

  return (
    <div style={{ padding:'32px 28px', maxWidth:900 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div><h1 style={{ margin:0, fontSize:26, fontWeight:800, color:'#0F172A' }}>Usuarios</h1><p style={{ color:'#64748B', margin:'4px 0 0' }}>Gestión de vendedores</p></div>
        <ABt onClick={openNew}>+ Nuevo vendedor</ABt>
      </div>
      <div style={{ display:'grid', gap:12 }}>
        {users.map(u=>{
          const res=getResults().filter(r=>r.userId===u.id);
          const p=getProgress();const c=getContent();let done=0,total=0;
          ['all_year','winter'].forEach(s=>(c[s]?.modules||[]).forEach(m=>{total++;if(p[`${u.id}_${s}_${m.id}`]?.evalDone)done++;}));
          return (
            <ACd key={u.id} style={{ padding:'18px 24px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#0284C7,#38BDF8)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:16 }}>{u.name[0]}</div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontWeight:700, color:'#0F172A', fontSize:15 }}>{u.name}</span>
                      <span style={{ fontSize:10, fontWeight:700, color: ROLE_COLORS[u.role]||'#94A3B8', background:(ROLE_COLORS[u.role]||'#94A3B8')+'18', borderRadius:20, padding:'2px 8px' }}>{ROLE_LABELS[u.role]||u.role}</span>
                    </div>
                    <div style={{ color:'#94A3B8', fontSize:12 }}>@{u.username}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                  <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'#0284C7', fontSize:18 }}>{done}</div><div style={{ color:'#94A3B8', fontSize:11 }}>módulos OK</div></div>
                  <div style={{ textAlign:'center' }}><div style={{ fontWeight:700, color:'#0284C7', fontSize:18 }}>{res.length}</div><div style={{ color:'#94A3B8', fontSize:11 }}>evaluaciones</div></div>
                  <div style={{ display:'flex', gap:8 }}>
                    <ABt variant="secondary" size="sm" onClick={()=>openEdit(u)}>Editar</ABt>
                    <ABt variant="danger" size="sm" onClick={()=>handleDelete(u)}>Eliminar</ABt>
                  </div>
                </div>
              </div>
            </ACd>
          );
        })}
        {users.length===0&&<p style={{ color:'#94A3B8', textAlign:'center', padding:40 }}>No hay vendedores.</p>}
      </div>
      {modal&&(
        <div style={{ position:'fixed', inset:0, background:'#0F172A88', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:24 }}>
          <ACd style={{ width:'100%', maxWidth:440, padding:32 }}>
            <h3 style={{ margin:'0 0 24px', fontSize:18, fontWeight:700 }}>{modal==='new'?'Nuevo vendedor':'Editar vendedor'}</h3>
            {[['Nombre completo','name','text'],['Usuario','username','text'],['Contraseña','password','password']].map(([label,key,type])=>(
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>{label}</label>
                <input type={type} value={form[key]||''} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  style={{ width:'100%', padding:'9px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'inherit', boxSizing:'border-box', outline:'none' }} />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#475569', marginBottom:6 }}>Rol</label>
              <select value={form.role||'vendedor'} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{ width:'100%', padding:'9px 14px', border:'1.5px solid #E2E8F0', borderRadius:10, fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}>
                {creatableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            {error&&<p style={{ color:'#DC2626', fontSize:13, marginBottom:12 }}>{error}</p>}
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <ABt variant="secondary" onClick={()=>setModal(null)}>Cancelar</ABt>
              <ABt onClick={handleSave}>Guardar</ABt>
            </div>
          </ACd>
        </div>
      )}
    </div>
  );
}

/* ── Admin View with sidebar ── */
function AdminView({ user, onLogout }) {
  const perms = ROLE_PERMISSIONS[user.role] || ['dashboard'];
  const [section, setSection] = useAdSt(perms[0] || 'dashboard');
  const { AdminContent } = window;
  const { AdminAI } = window;

  // Guard: only show allowed sections
  const safeSection = perms.includes(section) ? section : perms[0];
  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <AdminSidebar section={section} onSelect={setSection} user={user} onLogout={onLogout} />
      <main style={{ flex:1, background:'#F1F5F9', overflowY:'auto', minHeight:'100vh' }}>
        {safeSection==='dashboard' && <AdminDashboard onNavigate={setSection} />}
        {safeSection==='content' && (AdminContent ? <AdminContent /> : <p style={{ padding:32, color:'#94A3B8' }}>Cargando...</p>)}
        {safeSection==='users' && <AdminUsers currentUserRole={user.role} />}
        {safeSection==='results' && <AdminAnalytics />}
        {safeSection==='ai' && (AdminAI ? <AdminAI /> : <p style={{ padding:32, color:'#94A3B8' }}>Cargando...</p>)}
      </main>
    </div>
  );
}

Object.assign(window, { AdminView });
