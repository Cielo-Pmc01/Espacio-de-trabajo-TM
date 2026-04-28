// platform-views.jsx — Login, Season, Modules, Blocks, Content, Evaluation views

const { useState, useEffect, useRef, useMemo } = React;

/* ── Shared helpers ── */
function ProgressBar({ value, max, color = '#0284C7' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ background: '#E2E8F0', borderRadius: 99, height: 6, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 99, transition: 'width .4s ease' }} />
    </div>
  );
}

function Badge({ children, color = '#0284C7' }) {
  return <span style={{ display: 'inline-block', background: color + '18', color, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{children}</span>;
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: s }) {
  const base = { fontFamily: 'inherit', fontWeight: 600, borderRadius: 10, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const variants = {
    primary: { background: '#0284C7', color: '#fff', boxShadow: '0 1px 3px #0284C722' },
    secondary: { background: '#F1F5F9', color: '#1E293B' },
    ghost: { background: 'transparent', color: '#64748B' },
    danger: { background: '#FEE2E2', color: '#DC2626' },
    success: { background: '#D1FAE5', color: '#059669' },
  };
  const sizes = { sm: { padding: '6px 14px', fontSize: 13 }, md: { padding: '9px 20px', fontSize: 14 }, lg: { padding: '12px 28px', fontSize: 15 } };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant], ...sizes[size], opacity: disabled ? .5 : 1, ...s }}>
      {children}
    </button>
  );
}

function Card({ children, style: s, onClick }) {
  return (
    <div onClick={onClick} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 3px #0F172A0D, 0 4px 16px #0F172A08', padding: 24, cursor: onClick ? 'pointer' : 'default', transition: 'box-shadow .2s, transform .2s', ...s }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 4px 12px #0F172A18, 0 8px 24px #0F172A10'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.boxShadow = '0 1px 3px #0F172A0D, 0 4px 16px #0F172A08'; e.currentTarget.style.transform = 'translateY(0)'; } }}>
      {children}
    </div>
  );
}

/* ── Top Nav ── */
function TopNav({ user, season, onBack, backLabel, onLogout, title }) {
  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && <Btn variant="ghost" size="sm" onClick={onBack}>← {backLabel || 'Volver'}</Btn>}
        {title && <span style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{title}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {season && <Badge color="#0284C7">{season === 'all_year' ? 'Todo el año' : 'Invierno'}</Badge>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
            {user?.name?.[0] || 'U'}
          </div>
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>{user?.name}</span>
        </div>
        <Btn variant="ghost" size="sm" onClick={onLogout}>Salir</Btn>
      </div>
    </div>
  );
}

/* ── LOGIN VIEW ── */
function LoginView({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.username === form.username && u.password === form.password);
      if (user) { onLogin(user); }
      else { setError('Usuario o contraseña incorrectos.'); setLoading(false); }
    }, 400);
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 16, background: 'linear-gradient(135deg, #0284C7, #0EA5E9)', marginBottom: 16, boxShadow: '0 8px 24px #0284C740' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: 0 }}>CapacitaciónPro</h1>
          <p style={{ color: '#94A3B8', marginTop: 6, fontSize: 14 }}>Plataforma de formación para vendedores</p>
        </div>

        <Card style={{ padding: 32 }}>
          <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Iniciar sesión</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Usuario</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Tu usuario" autoComplete="username"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#0284C7'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Contraseña</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Tu contraseña" autoComplete="current-password"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E2E8F0', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border .15s' }}
                onFocus={e => e.target.style.borderColor = '#0284C7'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 12 }}>{error}</p>}
            <Btn size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Btn>
          </form>
          <div style={{ marginTop: 20, padding: 12, background: '#F8FAFC', borderRadius: 10, fontSize: 12, color: '#64748B' }}>
            <strong>Demo:</strong> admin/admin123 · vendedor1/1234
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── SEASON VIEW ── */
function SeasonView({ user, onSelect, onLogout }) {
  const progress = getProgress();
  const results = getResults().filter(r => r.userId === user.id);
  const content = getContent();

  function getModuleProgress(seasonKey) {
    const mods = content[seasonKey]?.modules || [];
    const completed = mods.filter(m => {
      const key = `${user.id}_${seasonKey}_${m.id}`;
      return progress[key]?.evalDone;
    }).length;
    return { completed, total: mods.length };
  }

  const seasons = [
    { key: 'all_year', label: 'Todo el año', desc: 'Capacitación general y protocolos base', icon: '🌍', color: '#0284C7' },
    { key: 'winter', label: 'Invierno', desc: 'Productos y estrategias de temporada', icon: '❄️', color: '#7C3AED' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <TopNav user={user} onLogout={onLogout} title="CapacitaciónPro" />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', margin: 0 }}>Hola, {user.name.split(' ')[0]} 👋</h1>
          <p style={{ color: '#64748B', marginTop: 8, fontSize: 15 }}>Seleccioná la temporada para comenzar tu capacitación.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {seasons.map(s => {
            const prog = getModuleProgress(s.key);
            return (
              <Card key={s.key} onClick={() => onSelect(s.key)} style={{ padding: 32, borderTop: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{s.icon}</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>{s.label}</h2>
                <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 20px' }}>{s.desc}</p>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>PROGRESO</span>
                    <span style={{ fontSize: 12, color: s.color, fontWeight: 700 }}>{prog.completed}/{prog.total} módulos</span>
                  </div>
                  <ProgressBar value={prog.completed} max={prog.total} color={s.color} />
                </div>
                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
                  <Btn style={{ background: s.color }}>Ingresar →</Btn>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── MODULES VIEW — cards with cover images ── */
function ModulesView({ user, season, onSelectModule, onSelectAdditional, onBack, onLogout }) {
  const content = getContent();
  const seasonData = content[season] || {};
  const modules = seasonData.modules || [];
  const progress = getProgress();
  const results = getResults().filter(r => r.userId === user.id && r.season === season);

  function getModProgress(moduleId) {
    const key = `${user.id}_${season}_${moduleId}`;
    const p = progress[key] || {};
    const mod = modules.find(m => m.id === moduleId);
    const totalBlocks = mod?.blocks?.length || 1;
    const viewed = (p.viewed || []).length;
    return { pct: Math.round((viewed / totalBlocks) * 100), evalDone: p.evalDone, viewed, total: totalBlocks };
  }

  const totalModules = modules.length;
  const completedModules = modules.filter(m => getModProgress(m.id).evalDone).length;
  const overallPct = totalModules ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <TopNav user={user} season={season} onBack={onBack} backLabel="Temporadas" onLogout={onLogout} title="Módulos" />
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '36px 24px' }}>

        {/* Progress banner */}
        <Card style={{ marginBottom: 32, padding: '20px 28px', background: 'linear-gradient(135deg, #0F172A, #0C3358)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 600 }}>PROGRESO GENERAL</span>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 20 }}>{overallPct}%</span>
          </div>
          <ProgressBar value={completedModules} max={totalModules} color="#54bbaa" />
          <p style={{ color: '#475569', fontSize: 13, margin: '8px 0 0' }}>{completedModules} de {totalModules} módulos completados</p>
        </Card>

        {/* Module grid — cards with cover */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 20 }}>
          {modules.map(mod => {
            const p = getModProgress(mod.id);
            const res = results.find(r => r.moduleId === mod.id);
            const coverStyle = mod.coverUrl
              ? { backgroundImage: `url(${mod.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: `linear-gradient(135deg, ${mod.color} 0%, ${mod.color}99 100%)` };

            return (
              <div key={mod.id} onClick={() => onSelectModule(mod)}
                style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px #0F172A0E', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px #0F172A18'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px #0F172A0E'; }}>

                {/* Cover image */}
                <div style={{ height: 130, ...coverStyle, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, #00000055)' }} />
                  <div style={{ position: 'absolute', top: 12, left: 12 }}>
                    <Badge color={mod.color}>{mod.title}</Badge>
                  </div>
                  {p.evalDone && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: '#059669', borderRadius: 20, padding: '3px 10px', fontSize: 11, color: '#fff', fontWeight: 700 }}>✓ Completado</div>
                  )}
                  <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                    <ProgressBar value={p.viewed} max={p.total} color={p.evalDone ? '#34D399' : '#fff'} />
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '16px 18px' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '0 0 4px', lineHeight: 1.3 }}>{mod.subtitle}</h3>
                  <p style={{ color: '#64748B', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>{mod.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#94A3B8' }}>{p.viewed}/{p.total} bloques</span>
                    {res ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: res.score >= 14 ? '#059669' : '#DC2626' }}>{res.score}/20</span>
                    ) : (
                      <span style={{ fontSize: 11, color: '#CBD5E1' }}>Sin evaluar</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        {seasonData.additionalInfo && (
          <Card onClick={onSelectAdditional} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ width: 6, background: '#F59E0B', flexShrink: 0 }} />
              <div style={{ flex: 1, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <Badge color="#F59E0B">Extra</Badge>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', margin: '6px 0 2px' }}>{seasonData.additionalInfo.title}</h3>
                  <p style={{ color: '#64748B', fontSize: 13, margin: 0 }}>Recursos, contactos y preguntas frecuentes</p>
                </div>
                <span style={{ fontSize: 20, color: '#F59E0B' }}>→</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ── BLOCKS VIEW ── */
function BlocksView({ user, season, module: mod, onSelectBlock, onStartEval, onBack, onLogout }) {
  const progress = getProgress();
  const results = getResults();
  const key = `${user.id}_${season}_${mod.id}`;
  const p = progress[key] || {};
  const viewed = p.viewed || [];
  const res = results.find(r => r.userId === user.id && r.season === season && r.moduleId === mod.id);
  const allViewed = mod.blocks.every(b => viewed.includes(b.id));

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <TopNav user={user} season={season} onBack={onBack} backLabel="Módulos" onLogout={onLogout} title={mod.subtitle} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 8 }}>
          <Badge color={mod.color}>{mod.title}</Badge>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}>{mod.subtitle}</h1>
        <p style={{ color: '#64748B', marginBottom: 32 }}>{mod.description}</p>

        <div style={{ display: 'grid', gap: 16, marginBottom: 32 }}>
          {mod.blocks.map((block, i) => {
            const done = viewed.includes(block.id);
            return (
              <Card key={block.id} onClick={() => onSelectBlock(block)} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <div style={{ width: 6, background: done ? '#059669' : '#E2E8F0', flexShrink: 0, transition: 'background .3s' }} />
                  <div style={{ flex: 1, padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#94A3B8' }}>Bloque {i + 1}</span>
                        {done && <Badge color="#059669">✓ Visto</Badge>}
                      </div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{block.title}</h3>
                      {block.subtitle && <p style={{ margin: '2px 0 0', color: '#64748B', fontSize: 13 }}>{block.subtitle}</p>}
                    </div>
                    <span style={{ color: '#CBD5E1', fontSize: 20, flexShrink: 0 }}>→</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Evaluation card */}
        <Card style={{ background: allViewed ? 'linear-gradient(135deg, #0F172A, #1E3A5F)' : '#F8FAFC', padding: 24, border: allViewed ? 'none' : '2px dashed #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: allViewed ? '#fff' : '#94A3B8' }}>
                {allViewed ? 'Evaluación disponible' : '🔒 Evaluación bloqueada'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: allViewed ? '#94A3B8' : '#CBD5E1' }}>
                {allViewed ? '20 preguntas de opción múltiple' : 'Revisá todos los bloques para desbloquear'}
              </p>
              {res && <p style={{ margin: '6px 0 0', fontSize: 14, fontWeight: 700, color: res.score >= 14 ? '#34D399' : '#FCA5A5' }}>
                Último resultado: {res.score}/20 — {res.score >= 14 ? '✓ Aprobado' : '✗ Desaprobado'}
              </p>}
            </div>
            <Btn disabled={!allViewed} onClick={onStartEval} style={allViewed ? { background: '#0EA5E9' } : {}}>
              {res ? 'Repetir evaluación' : 'Iniciar evaluación'}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ── YouTube embed helper ── */
function getYTId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/|\/user\/\S+\/|\/ytscreeningroom\?v=))([\w\-]{11})/);
  return m ? m[1] : null;
}

/* ── Rich content renderer (HTML or Markdown) ── */
function RichContent({ html }) {
  const rendered = useMemo(() => {
    if (!html) return '';
    // If it doesn't start with an HTML tag, treat as markdown
    if (window.marked && !html.trimStart().startsWith('<')) return window.marked.parse(html);
    return html;
  }, [html]);
  return <div className="rich-content" dangerouslySetInnerHTML={{ __html: rendered }} />;
}

/* ── Embedded YouTube videos ── */
function VideoBlock({ videos }) {
  if (!videos || videos.length === 0) return null;
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 18 }}>🎬</span>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Videos</h3>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {videos.map((url, i) => {
          const id = getYTId(url);
          if (!id) return null;
          return (
            <div key={i} style={{ borderRadius: 14, overflow: 'hidden', position: 'relative', paddingTop: '56.25%', background: '#0F172A' }}>
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Video ${i + 1}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── CONTENT VIEW ── */
function ContentView({ user, season, module: mod, block, onBack, onLogout }) {
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const progress = getProgress();
    const key = `${user.id}_${season}_${mod.id}`;
    const p = progress[key] || {};
    const viewed = p.viewed || [];
    if (!viewed.includes(block.id)) {
      saveProgress({ ...progress, [key]: { ...p, viewed: [...viewed, block.id] } });
    }
  }, [block.id]);

  const toggle = id => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <TopNav user={user} season={season} onBack={onBack} backLabel={mod.subtitle} onLogout={onLogout} title={block.title} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <Badge color={mod.color}>{mod.title}</Badge>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}>{block.title}</h1>
          {block.subtitle && <p style={{ color: '#64748B', margin: 0 }}>{block.subtitle}</p>}
        </div>

        {block.type === 'reading' && (
          <Card>
            <RichContent html={block.content} />
            <VideoBlock videos={block.videos} />
          </Card>
        )}

        {block.type === 'protocols' && (
          <div style={{ display: 'grid', gap: 12 }}>
            {block.items.map(item => (
              <div key={item.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px #0F172A0D', overflow: 'hidden' }}>
                <button onClick={() => toggle(item.id)}
                  style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{item.title}</span>
                  <span style={{ color: '#0284C7', fontWeight: 700, fontSize: 18, transition: 'transform .2s', transform: expanded[item.id] ? 'rotate(180deg)' : 'none' }}>⌄</span>
                </button>
                {expanded[item.id] && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #F1F5F9' }}>
                    <RichContent html={item.content} />
                    <VideoBlock videos={item.videos} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {block.type === 'cards' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {block.items.map(item => (
              <Card key={item.id} style={{ borderTop: `3px solid ${mod.color}` }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{item.title}</h3>
                <RichContent html={item.content} />
                <VideoBlock videos={item.videos} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ADDITIONAL INFO VIEW ── */
function AdditionalInfoView({ user, season, info, onBack, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <TopNav user={user} season={season} onBack={onBack} backLabel="Módulos" onLogout={onLogout} title={info.title} />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        <Badge color="#F59E0B">Extra</Badge>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '8px 0 24px' }}>{info.title}</h1>
        <Card>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: info.content }} />
        </Card>
      </div>
    </div>
  );
}

/* ── CERTIFICATE MODAL ── */
function CertificateModal({ user, mod, score, season, onClose }) {
  const date = new Date().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
  const pct = Math.round((score / 20) * 100);

  function handlePrint() {
    const el = document.getElementById('cert-print');
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Certificado</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><style>body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;}</style></head><body>${el.outerHTML}</body></html>`);
    w.document.close(); w.print();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0F172Acc', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, maxWidth: 580, width: '100%', overflow: 'hidden', boxShadow: '0 32px 80px #0F172A40', animation: 'fadeIn .3s ease' }}>
        {/* Top accent */}
        <div style={{ height: 6, background: `linear-gradient(90deg, ${mod.color}, #54bbaa)` }} />

        <div id="cert-print" style={{ padding: '36px 44px', textAlign: 'center', background: '#fff' }}>
          {/* Seal */}
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${mod.color}, #54bbaa)`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px ${mod.color}44` }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>

          <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.15em', margin: '0 0 8px' }}>ACADEMIA PATAGONIA BOOKING</p>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>Certificado de Aprobación</h1>
          <div style={{ width: 48, height: 3, background: `linear-gradient(90deg, ${mod.color}, #54bbaa)`, borderRadius: 99, margin: '14px auto' }} />

          <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 6px' }}>Este certificado acredita que</p>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: mod.color, margin: '0 0 6px' }}>{user.name}</h2>
          <p style={{ color: '#64748B', fontSize: 14, margin: '0 0 4px' }}>completó exitosamente</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>{mod.subtitle}</h3>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '0 0 24px', padding: '16px 0', borderTop: '1px dashed #E2E8F0', borderBottom: '1px dashed #E2E8F0' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: mod.color }}>{score}/20</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>PUNTAJE</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#059669' }}>{pct}%</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>RESULTADO</div>
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>{season === 'all_year' ? 'Anual' : 'Invierno'}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>TEMPORADA</div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: '#94A3B8', margin: 0 }}>{date}</p>
        </div>

        <div style={{ padding: '0 32px 28px', display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Btn variant="secondary" onClick={handlePrint}>🖨 Imprimir</Btn>
          <Btn onClick={onClose}>Continuar →</Btn>
        </div>
      </div>
    </div>
  );
}

/* ── EVALUATION VIEW ── */
function EvaluationView({ user, season, module: mod, onBack, onFinish, onLogout }) {
  const evals = getEvals();
  const evalData = evals[mod.id];
  const questions = evalData?.questions || [];
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showCert, setShowCert] = useState(false);

  function handleAnswer(qi, oi) {
    if (!submitted) setAnswers(a => ({ ...a, [qi]: oi }));
  }

  function handleSubmit() {
    const sc = questions.reduce((acc, q, i) => acc + (answers[i] === q.c ? 1 : 0), 0);
    setScore(sc);
    setSubmitted(true);
    const results = getResults();
    const existing = results.findIndex(r => r.userId === user.id && r.season === season && r.moduleId === mod.id);
    const entry = { userId: user.id, season, moduleId: mod.id, score: sc, date: new Date().toLocaleDateString('es-AR'), total: questions.length };
    if (existing >= 0) results[existing] = entry; else results.push(entry);
    saveResults(results);
    const progress = getProgress();
    const key = `${user.id}_${season}_${mod.id}`;
    const p = progress[key] || {};
    saveProgress({ ...progress, [key]: { ...p, evalDone: true } });
    if (sc >= 14) setTimeout(() => setShowCert(true), 800);
  }

  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const passed = score >= 14;

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      {showCert && <CertificateModal user={user} mod={mod} score={score} season={season} onClose={() => { setShowCert(false); onFinish(); }} />}
      <TopNav user={user} season={season} onBack={submitted ? onFinish : onBack} backLabel={submitted ? 'Ver resultados' : 'Cancelar'} onLogout={onLogout} title={evalData?.title || 'Evaluación'} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

        {!submitted ? (
          <>
            <div style={{ marginBottom: 28 }}>
              <Badge color={mod.color}>{mod.title}</Badge>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', margin: '8px 0 4px' }}>{evalData?.title}</h1>
              <p style={{ color: '#64748B', fontSize: 14 }}>Respondé las {questions.length} preguntas. Necesitás 14/20 para aprobar.</p>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={Object.keys(answers).length} max={questions.length} color={mod.color} />
                <p style={{ color: '#94A3B8', fontSize: 12, marginTop: 4 }}>{Object.keys(answers).length}/{questions.length} respondidas</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16, marginBottom: 28 }}>
              {questions.map((q, qi) => (
                <Card key={qi} style={{ padding: 20 }}>
                  <p style={{ fontWeight: 700, color: '#0F172A', margin: '0 0 14px', lineHeight: 1.5 }}>
                    <span style={{ color: '#94A3B8', marginRight: 6 }}>{qi + 1}.</span>{q.q}
                  </p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {q.opts.map((opt, oi) => {
                      const selected = answers[qi] === oi;
                      return (
                        <div key={oi} onClick={() => handleAnswer(qi, oi)}
                          style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${selected ? mod.color : '#E2E8F0'}`, background: selected ? mod.color + '10' : '#fff', cursor: 'pointer', fontSize: 14, color: selected ? mod.color : '#475569', fontWeight: selected ? 600 : 400, transition: 'all .15s' }}>
                          <span style={{ marginRight: 8, fontWeight: 700 }}>{String.fromCharCode(65 + oi)}.</span>{opt}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>

            <Btn size="lg" disabled={!allAnswered} onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center' }}>
              Enviar respuestas
            </Btn>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>{passed ? '🎉' : '📚'}</div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: passed ? '#059669' : '#DC2626', margin: '0 0 8px' }}>{score}/20</h1>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{passed ? '¡Aprobaste!' : 'No aprobaste esta vez'}</p>
            <p style={{ color: '#64748B', marginBottom: 32 }}>{passed ? 'Excelente trabajo. Completaste este módulo.' : 'Revisá el contenido y volvé a intentarlo.'}</p>

            <div style={{ display: 'grid', gap: 12, textAlign: 'left', marginBottom: 32 }}>
              {questions.map((q, qi) => {
                const correct = answers[qi] === q.c;
                return (
                  <div key={qi} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', borderLeft: `4px solid ${correct ? '#059669' : '#DC2626'}` }}>
                    <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
                      {qi + 1}. {q.q}
                    </p>
                    {!correct && <p style={{ margin: '0 0 4px', fontSize: 13, color: '#DC2626' }}>Tu respuesta: {q.opts[answers[qi]]}</p>}
                    <p style={{ margin: 0, fontSize: 13, color: '#059669', fontWeight: 600 }}>✓ Correcta: {q.opts[q.c]}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Btn variant="secondary" onClick={onBack}>Volver al módulo</Btn>
              <Btn onClick={onFinish}>Ver todos los módulos</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LoginView, SeasonView, ModulesView, BlocksView, ContentView, AdditionalInfoView, EvaluationView, ProgressBar, Badge, Btn, Card, TopNav });
