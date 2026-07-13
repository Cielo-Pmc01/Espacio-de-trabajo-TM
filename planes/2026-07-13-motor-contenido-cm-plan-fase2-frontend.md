# Motor de contenido CM — Fase 2: Frontend (crm-cm) Implementation Plan

> **Alcance de este plan:** Conectar `salidas/crm-cm/` a los datos reales que ya genera el workflow "CM - Generar Contenido" (Fase 1, ver `planes/2026-07-13-motor-contenido-cm-plan-fase1-backend.md`). Cubre Pipeline, Generador, Calendario por marca y el gate de aprobación (Aprobar / Editar a mano / Rechazar con motivo). **No cubre** la regeneración automática por IA cuando se rechaza con motivo — eso requiere un webhook nuevo en n8n que reaccione a cambios en `motivo_rechazo`, queda para un fast-follow (ver "Fuera de alcance").

**Goal:** Que Luciana entre a `crm-cm`, vea las 9 piezas reales generadas en la Fase 1 en el Pipeline (no el mock), pueda generar contenido nuevo desde el Generador (llamando al webhook real), navegue el Calendario por marca, y apruebe/edite/rechace cada pieza — todo contra Supabase real.

**Architecture:** `crm-cm` pasa de `data/mock.ts` a un cliente `@supabase/supabase-js` apuntando al schema `crm_cm` del proyecto "Plataforma ecosistema meta". Un hook (`usePipelineContent`) hace `fetch` al montar y expone `refetch`. El Generador hace `fetch` directo al webhook de n8n (`POST https://n8ntm.iadventurecentersx.com/webhook/cm-generar-contenido`) y al terminar llama `refetch`. Aprobar/Editar/Rechazar hacen `UPDATE` directo a `content_pipeline` vía Supabase.

**Tech Stack:** React 19 + TypeScript + Vite 6 (ya existente), `@supabase/supabase-js` (nuevo), fetch nativo para el webhook (sin dependencia nueva).

---

## Antes de empezar — estado verificado en esta sesión

- `salidas/crm-cm/package.json` **no tiene** `@supabase/supabase-js` todavía — hay que agregarlo.
- Proyecto Supabase: `jvudavpopxsguiemtrkk`, URL `https://jvudavpopxsguiemtrkk.supabase.co`. Publishable key (rol `anon`, ya con permisos otorgados sobre `crm_cm.content_pipeline` en la Fase 1): `sb_publishable_56Xmb3LNQXcqOfvkmUugWA_6N_ylZ2T`.
- `content_pipeline` tiene 9 filas reales cargadas en la Fase 1 (`origen='brief_manual'`, `estado='Idea'`) — sirven para probar sin generar contenido nuevo.
- `ContentItem` (`src/types/index.ts`) hoy tiene `day`/`time` como strings mock (`'Lun'`, `'10:00'`) — se reemplazan por `fecha_publicacion`/`hora` reales, pero se mantiene el nombre `status`/valores del enum sin cambios (Idea/Guion/Grabado/Editado/Aprobado/Programado) para no tocar `PipelineView.tsx`'s `STATUSES` ni `PostCard.tsx`.
- Webhook del Generador real: `POST https://n8ntm.iadventurecentersx.com/webhook/cm-generar-contenido` con body `{ brief: string, formato: 'Reel'|'Carrusel'|'Stories'|'Ad' }` — devuelve las filas insertadas (`return=representation` en el nodo de n8n).
- No hay sistema de modales en `style.css` — la UI de rechazo se resuelve inline dentro de `PostCard`, no con un modal nuevo.

---

## Task 1: Cliente Supabase

**Files:**
- Modify: `salidas/crm-cm/package.json`
- Create: `salidas/crm-cm/.env.example`
- Create: `salidas/crm-cm/.env.local` (gitignorado — confirmado en `.gitignore`: `.env.*`)
- Create: `salidas/crm-cm/src/lib/supabase.ts`

- [ ] **Step 1: Agregar la dependencia**

```bash
cd salidas/crm-cm && pnpm add @supabase/supabase-js
```

Verificar: `package.json` tiene `"@supabase/supabase-js"` en `dependencies`.

- [ ] **Step 2: Crear `.env.example`**

```
VITE_SUPABASE_URL=https://jvudavpopxsguiemtrkk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_CM_WEBHOOK_URL=https://n8ntm.iadventurecentersx.com/webhook/cm-generar-contenido
```

- [ ] **Step 3: Crear `.env.local` con los valores reales**

```
VITE_SUPABASE_URL=https://jvudavpopxsguiemtrkk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_56Xmb3LNQXcqOfvkmUugWA_6N_ylZ2T
VITE_CM_WEBHOOK_URL=https://n8ntm.iadventurecentersx.com/webhook/cm-generar-contenido
```

- [ ] **Step 4: Crear `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY en .env.local');
}

export const supabase = createClient(url, key, {
  db: { schema: 'crm_cm' },
});
```

- [ ] **Step 5: Verificar que compila**

```bash
cd salidas/crm-cm && npx tsc --noEmit
```

Esperado: sin errores relacionados a `src/lib/supabase.ts` (puede haber otros preexistentes — no es responsabilidad de este task arreglarlos, solo confirmar que este archivo no rompe nada).

---

## Task 2: Tipos reales de `content_pipeline`

**Files:**
- Modify: `salidas/crm-cm/src/types/index.ts`

- [ ] **Step 1: Reemplazar la interface `ContentItem` por la versión real, manteniendo compatibilidad con el mock**

```typescript
export interface ContentItem {
  id?:        number;
  marca:      MarcaKey;
  format:     'Reel' | 'Carrusel' | 'Stories' | 'Ad';
  status:     'Idea' | 'Guion' | 'Grabado' | 'Editado' | 'Aprobado' | 'Programado';
  aprobado?:  boolean;
  owner:      string;
  day:        string;
  time:       string;
  objective:  string;
  hook:       string;
  summary:    string;
  cta:        string;
  score:      number;
  copy?:          string | null;
  slides?:        string[];
  mediaCandidatos?: string[];
  fechaPublicacion?: string | null;
  origen?:        'catalogo' | 'brief_manual' | 'consulta_chatwoot' | 'tendencia';
  motivoRechazo?: string | null;
}
```

`day`/`time`/`owner`/`objective`/`score` quedan como antes (con default cuando el dato real no los tiene todavía — ver Task 3) para que `PipelineView`, `CalendarView` y `PostCard` seguir funcionando sin tocarlos en este task.

- [ ] **Step 2: Verificar que compila**

```bash
cd salidas/crm-cm && npx tsc --noEmit
```

Esperado: los errores que aparezcan van a estar en `data/mock.ts` (los objetos mock no tienen los campos nuevos opcionales — eso es válido, son opcionales) o en componentes que asuman campos exactos. Si aparece un error real, es porque un componente accede a un campo removido — no debería pasar, ya que no se removió ninguno.

---

## Task 3: Hook de datos reales

**Files:**
- Create: `salidas/crm-cm/src/hooks/usePipelineContent.ts`

- [ ] **Step 1: Crear el hook**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ContentItem } from '@/types';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'] as const;

interface ContentPipelineRow {
  id: number;
  marca: string;
  formato: string;
  estado: string;
  aprobado: boolean;
  owner: string | null;
  objective: string | null;
  hook: string;
  summary: string;
  cta: string | null;
  score: number | null;
  copy: string | null;
  slides: string[];
  media_candidatos: string[];
  fecha_publicacion: string | null;
  hora: string | null;
  origen: string;
  motivo_rechazo: string | null;
}

function toContentItem(row: ContentPipelineRow): ContentItem {
  const fecha = row.fecha_publicacion ? new Date(row.fecha_publicacion + 'T00:00:00') : null;
  return {
    id: row.id,
    marca: row.marca as ContentItem['marca'],
    format: row.formato as ContentItem['format'],
    status: row.estado as ContentItem['status'],
    aprobado: row.aprobado,
    owner: row.owner ?? 'Sin asignar',
    day: fecha ? DAY_NAMES[fecha.getDay()] : 'Sin fecha',
    time: row.hora ?? '--:--',
    objective: row.objective ?? '—',
    hook: row.hook,
    summary: row.summary,
    cta: row.cta ?? '',
    score: row.score ?? 0,
    copy: row.copy,
    slides: row.slides ?? [],
    mediaCandidatos: row.media_candidatos ?? [],
    fechaPublicacion: row.fecha_publicacion,
    origen: row.origen as ContentItem['origen'],
    motivoRechazo: row.motivo_rechazo,
  };
}

export function usePipelineContent() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('content_pipeline')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError(err.message);
      setItems([]);
    } else {
      setItems((data as ContentPipelineRow[]).map(toContentItem));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  return { items, loading, error, refetch };
}
```

- [ ] **Step 2: Verificar que compila**

```bash
cd salidas/crm-cm && npx tsc --noEmit
```

---

## Task 4: Pipeline con datos reales

**Files:**
- Modify: `salidas/crm-cm/src/components/views/PipelineView.tsx`

- [ ] **Step 1: Reemplazar el import de `mock` por el hook, agregar estados de carga/error**

```typescript
import { useState } from 'react';
import { usePipelineContent } from '@/hooks/usePipelineContent';
import { useCMStore } from '@/store';
import { filteredContent } from '@/utils/helpers';
import PostCard from '@/components/shared/PostCard';

const STATUSES = ['Idea', 'Guion', 'Grabado', 'Editado', 'Aprobado', 'Programado'] as const;

interface Props { active: boolean; }

export default function PipelineView({ active }: Props) {
  const { format, search, marca } = useCMStore();
  const [owner, setOwner] = useState('all');
  const { items: allContent, loading, error, refetch } = usePipelineContent();

  const owners = ['all', ...Array.from(new Set(allContent.map((c) => c.owner))).sort()];
  const items = filteredContent(allContent, format, owner, search, marca);

  return (
    <section className={`view${active ? ' active' : ''}`} id="pipeline">
      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Workflow editorial</p>
            <h2>Pipeline de producción</h2>
          </div>
          <select value={owner} onChange={(e) => setOwner(e.target.value)}>
            {owners.map((o) => (
              <option key={o} value={o}>{o === 'all' ? 'Todos' : o}</option>
            ))}
          </select>
        </div>
        {loading && <div className="no-results">Cargando contenido real…</div>}
        {error && <div className="no-results">Error cargando datos: {error} — <button className="button" onClick={refetch}>Reintentar</button></div>}
        {!loading && !error && (
          <div className="board">
            {STATUSES.map((status) => {
              const laneItems = items.filter((c) => c.status === status);
              return (
                <section key={status} className="lane">
                  <div className="lane-head">
                    <span>{status}</span>
                    <b>{laneItems.length}</b>
                  </div>
                  {laneItems.length > 0
                    ? laneItems.map((item) => <PostCard key={item.id} item={item} index={item.id ?? 0} onChanged={refetch} />)
                    : <div className="no-results">Vacío</div>
                  }
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verificar que compila** (va a fallar hasta que `PostCard` acepte `onChanged` — se agrega en Task 6, es esperado en este punto intermedio, no correr `tsc` recién acá, seguir a Task 5 primero y validar todo junto al final de Task 6).

---

## Task 5: Generador conectado al webhook real

**Files:**
- Modify: `salidas/crm-cm/src/components/views/GeneratorView.tsx`

- [ ] **Step 1: Reemplazar el generador local (hooks hardcodeados) por la llamada real al webhook**

```typescript
import { useState } from 'react';
import { MARCAS_ACTIVAS } from '@/data/brands';
import { usePipelineContent } from '@/hooks/usePipelineContent';

interface Props { active: boolean; }

export default function GeneratorView({ active }: Props) {
  const [brief,   setBrief]   = useState('');
  const [formato, setFormato] = useState<'Reel' | 'Carrusel' | 'Stories' | 'Ad'>('Reel');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const { refetch } = usePipelineContent();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!brief.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setResultCount(null);
    try {
      const res = await fetch(import.meta.env.VITE_CM_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, formato }),
      });
      if (!res.ok) throw new Error(`El generador respondió ${res.status}`);
      const data = await res.json();
      setResultCount(Array.isArray(data) ? data.length : null);
      await refetch();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error generando contenido');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`view${active ? ' active' : ''}`} id="generator">
      <div className="generator">
        <section className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Generador TM</p>
              <h2>Crear piezas para las {MARCAS_ACTIVAS.length} marcas</h2>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              Brief
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Ej: Promocionar la excursión a Piedras Blancas para la temporada de nieve"
                rows={4}
                required
              />
            </label>
            <label>
              Formato
              <select value={formato} onChange={(e) => setFormato(e.target.value as typeof formato)}>
                <option>Reel</option>
                <option>Carrusel</option>
                <option>Stories</option>
                <option>Ad</option>
              </select>
            </label>
            <button className="button primary" type="submit" disabled={loading}>
              {loading ? 'Generando para las 9 marcas…' : 'Generar contenido'}
            </button>
          </form>
        </section>

        <section className="panel output">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Resultado</p>
              <h2>Estado de la generación</h2>
            </div>
          </div>
          {errorMsg && <div className="no-results">{errorMsg}</div>}
          {resultCount !== null && !errorMsg && (
            <div className="no-results">
              Se generaron {resultCount} piezas — revisalas en la pestaña Pipeline, columna "Idea".
            </div>
          )}
          {!errorMsg && resultCount === null && !loading && (
            <div className="no-results">Completá el brief y hacé click en "Generar contenido".</div>
          )}
        </section>
      </div>
    </section>
  );
}
```

Nota: `OBJETIVOS`/`ANGULOS`/`TONOS`/`generarHook` del mock viejo se eliminan — el generador ya no simula, llama al modelo real. `sources` (de `data/mock.ts`) deja de usarse acá; sigue existiendo para `SourcesView.tsx`, que no toca este plan.

---

## Task 6: Aprobar / Editar a mano / Rechazar con motivo

**Files:**
- Modify: `salidas/crm-cm/src/components/shared/PostCard.tsx`
- Create: `salidas/crm-cm/src/lib/contentPipeline.ts`

- [ ] **Step 1: Crear los helpers de actualización**

```typescript
import { supabase } from '@/lib/supabase';

export async function approveItem(id: number) {
  const { error } = await supabase
    .from('content_pipeline')
    .update({ estado: 'Aprobado', aprobado: true, motivo_rechazo: null })
    .eq('id', id);
  if (error) throw error;
}

export async function editItem(id: number, fields: { hook?: string; summary?: string; copy?: string; cta?: string }) {
  const { error } = await supabase
    .from('content_pipeline')
    .update({ ...fields, estado: 'Guion' })
    .eq('id', id);
  if (error) throw error;
}

export async function rejectWithReason(id: number, motivo: string) {
  const { error } = await supabase
    .from('content_pipeline')
    .update({ estado: 'Idea', aprobado: false, motivo_rechazo: motivo })
    .eq('id', id);
  if (error) throw error;
}
```

`rejectWithReason` deja la fila marcada con `motivo_rechazo` y vuelve a `estado='Idea'` — **no dispara una regeneración automática todavía** (ver "Fuera de alcance"). Por ahora es una señal visible en el Pipeline de que esa pieza necesita reescribirse, a mano o volviendo a correr el Generador.

- [ ] **Step 2: Agregar las acciones a `PostCard`**

```typescript
import { useState } from 'react';
import { PALETTE } from '@/data/mock';
import { MARCA_MAP } from '@/data/brands';
import { approveItem, editItem, rejectWithReason } from '@/lib/contentPipeline';
import type { ContentItem } from '@/types';

function scoreColor(score: number): string {
  if (score >= 86) return 'linear-gradient(90deg, var(--green), var(--lime))';
  if (score >= 74) return 'linear-gradient(90deg, var(--amber), var(--green))';
  return 'linear-gradient(90deg, var(--coral), var(--amber))';
}

interface Props {
  item:  ContentItem;
  index: number;
  onChanged?: () => void;
}

export default function PostCard({ item, index, onChanged }: Props) {
  const colors = PALETTE[index % PALETTE.length];
  const slug   = item.format.toLowerCase();
  const marca  = MARCA_MAP[item.marca];
  const [mode, setMode] = useState<'view' | 'edit' | 'reject'>('view');
  const [editHook, setEditHook] = useState(item.hook);
  const [editSummary, setEditSummary] = useState(item.summary);
  const [motivo, setMotivo] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleApprove() {
    if (!item.id) return;
    setBusy(true);
    await approveItem(item.id);
    setBusy(false);
    onChanged?.();
  }

  async function handleSaveEdit() {
    if (!item.id) return;
    setBusy(true);
    await editItem(item.id, { hook: editHook, summary: editSummary });
    setBusy(false);
    setMode('view');
    onChanged?.();
  }

  async function handleReject() {
    if (!item.id || !motivo.trim()) return;
    setBusy(true);
    await rejectWithReason(item.id, motivo);
    setBusy(false);
    setMode('view');
    setMotivo('');
    onChanged?.();
  }

  return (
    <article className="post-card">
      <div className="thumb" style={{ '--a': colors[0], '--b': colors[1] } as React.CSSProperties} />
      <div className="card-body">
        <div className="card-top">
          <span className={`badge ${slug}`}>{item.format}</span>
          <span className="badge status">{item.status}</span>
          <span
            className="badge"
            style={{ background: marca.color + '22', color: marca.color, border: `1px solid ${marca.color}44` }}
          >
            {item.marca}
          </span>
        </div>

        {mode === 'edit' ? (
          <>
            <input value={editHook} onChange={(e) => setEditHook(e.target.value)} />
            <textarea value={editSummary} onChange={(e) => setEditSummary(e.target.value)} rows={3} />
          </>
        ) : (
          <>
            <h3>{item.hook}</h3>
            <p>{item.summary}</p>
          </>
        )}

        {item.motivoRechazo && mode === 'view' && (
          <p className="no-results">Rechazado: {item.motivoRechazo}</p>
        )}

        <div className="meta">
          <span>{item.owner}</span>
          <span>{item.day} {item.time}</span>
          <span>{item.objective}</span>
          <span>{item.cta}</span>
        </div>
        <div className="score-line">
          <div className="meter">
            <span style={{ '--score': `${item.score}%`, '--meter': scoreColor(item.score) } as React.CSSProperties} />
          </div>
          <div className="score">{item.score}</div>
        </div>

        {mode === 'reject' ? (
          <div className="form-grid">
            <input
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo (ej: cambiar el ángulo, muy largo)"
            />
            <div className="card-top">
              <button className="button" disabled={busy} onClick={() => setMode('view')}>Cancelar</button>
              <button className="button primary" disabled={busy || !motivo.trim()} onClick={handleReject}>Confirmar rechazo</button>
            </div>
          </div>
        ) : mode === 'edit' ? (
          <div className="card-top">
            <button className="button" disabled={busy} onClick={() => setMode('view')}>Cancelar</button>
            <button className="button primary" disabled={busy} onClick={handleSaveEdit}>Guardar</button>
          </div>
        ) : (
          <div className="card-top">
            <button className="button primary" disabled={busy || item.status === 'Aprobado'} onClick={handleApprove}>Aprobar</button>
            <button className="button" disabled={busy} onClick={() => setMode('edit')}>Editar a mano</button>
            <button className="button" disabled={busy} onClick={() => setMode('reject')}>Rechazar</button>
          </div>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 3: Verificar que compila (ahora sí, con Task 4 y 6 juntos)**

```bash
cd salidas/crm-cm && npx tsc --noEmit
```

Esperado: 0 errores.

---

## Task 7: Calendario por marca

**Files:**
- Modify: `salidas/crm-cm/src/components/views/CalendarView.tsx`

- [ ] **Step 1: Agregar selector de marca y usar datos reales**

```typescript
import { useState } from 'react';
import { usePipelineContent } from '@/hooks/usePipelineContent';
import { useCMStore } from '@/store';
import { filteredContent } from '@/utils/helpers';
import { MARCAS_ACTIVAS } from '@/data/brands';
import type { MarcaFilter } from '@/types';

const DAYS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] as const;

interface Props { active: boolean; }

export default function CalendarView({ active }: Props) {
  const { format, owner, search } = useCMStore();
  const { items: allContent, loading } = usePipelineContent();
  const [marcaCal, setMarcaCal] = useState<MarcaFilter>('all');

  const items = filteredContent(allContent, format, owner, search, marcaCal);

  return (
    <section className={`view${active ? ' active' : ''}`} id="calendar">
      <div className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Por marca — como el calendario de Notion</p>
            <h2>Calendario editorial</h2>
          </div>
          <select value={marcaCal} onChange={(e) => setMarcaCal(e.target.value as MarcaFilter)}>
            <option value="all">Todas las marcas</option>
            {MARCAS_ACTIVAS.map((m) => (
              <option key={m.key} value={m.key}>{m.nombre}</option>
            ))}
          </select>
        </div>
        {loading && <div className="no-results">Cargando…</div>}
        {!loading && (
          <div className="calendar">
            {DAYS.map((day) => {
              const dayItems = items.filter((c) => c.day === day);
              return (
                <section key={day} className="day">
                  <strong>{day}</strong>
                  {dayItems.length === 0 && <p className="no-results">Sin piezas</p>}
                  {dayItems.map((item) => (
                    <div key={item.id} className="calendar-item">
                      <span>{item.time} · {item.format} · {item.marca}</span>
                      <p>{item.hook}</p>
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
```

Nota: las 9 filas de prueba de la Fase 1 no tienen `fecha_publicacion` (quedó `null`) — van a caer todas en la columna "Sin fecha" del hook (`toContentItem`), que no es uno de los 7 `DAYS` de esta grilla, así que **no van a aparecer en el calendario hasta que se les asigne fecha** (sí van a seguir apareciendo en Pipeline). Esto es esperado: el calendario muestra piezas programadas, no ideas sin fecha — coherente con que recién pasan a "Programado" después de aprobarse.

- [ ] **Step 2: Verificar que compila**

```bash
cd salidas/crm-cm && npx tsc --noEmit
```

---

## Task 8: Probar todo junto con datos reales

**Files:** ninguno nuevo — solo verificación manual.

- [ ] **Step 1: Levantar el dev server**

```bash
cd salidas/crm-cm && pnpm dev
```

Esperado: arranca en `http://localhost:5173` (o el puerto que Vite asigne) sin errores en consola.

- [ ] **Step 2: Verificar Pipeline con las 9 filas reales de la Fase 1**

Abrir la pestaña Pipeline — deberían aparecer las 9 piezas de la prueba de Piedras Blancas en la columna "Idea", una por marca, con el copy/hook real (no mock).

- [ ] **Step 3: Probar Aprobar en una pieza**

Click en "Aprobar" en cualquier tarjeta — debe moverse a la columna "Aprobado" sin recargar la página (via `refetch`).

- [ ] **Step 4: Probar Rechazar con motivo**

Click en "Rechazar" → escribir un motivo → "Confirmar rechazo" — la tarjeta vuelve a "Idea" y muestra el motivo debajo del summary.

- [ ] **Step 5: Generar contenido nuevo desde el Generador**

Completar un brief real, click en "Generar contenido" — esperar la respuesta (puede tardar ~30-40s, son 9 marcas), confirmar que dice "Se generaron 9 piezas" y que aparecen en Pipeline sin recargar manualmente.

---

## Self-review de este plan

- **Cobertura del diseño:** cubre Pipeline/Generador/Calendario-por-marca/Aprobación de la spec de arquitectura. NO cubre selección de medios de Drive (`mediaCandidatos` queda en el tipo pero sin UI — no hay Task 3 del diseño original todavía) ni regeneración automática por IA al rechazar — ambos fuera de alcance explícito.
- **Sin placeholders:** todo el código de cada step está completo, no hay "TODO" ni fragmentos parciales.
- **Consistencia de tipos:** `ContentItem.status` se mantiene idéntico en todos los tasks (Task 2 lo define, Tasks 4/6/7 lo consumen sin redefinirlo). `usePipelineContent` (Task 3) es la única fuente de la conversión row→ContentItem, reusada en Tasks 4 y 7 — no hay lógica de mapeo duplicada.

---

## Fuera de alcance de este plan

- **Selección de medios de Drive** — `media_candidatos` existe en la tabla y en el tipo, pero no hay UI para mostrarlos ni backend que los llene todavía (eso es Plan 3, junto con las fuentes catálogo/Chatwoot/tendencias).
- **Regeneración automática al rechazar con motivo** — hoy `rejectWithReason` solo guarda el motivo en la fila. Para que dispare una regeneración real con IA hace falta un nuevo endpoint en n8n (ej. `POST /webhook/cm-regenerar-pieza` recibiendo `{ id, motivo }`) que lea la fila, arme un prompt con el motivo y actualice esa fila puntual — no construido en este plan.
- **Cron semanal automático** — la Fase 1 solo tiene el trigger por webhook (a demanda). El cron "todos los lunes" que también se decidió en el diseño no está armado — agregar un `scheduleTrigger` al workflow de n8n cuando se priorice.
