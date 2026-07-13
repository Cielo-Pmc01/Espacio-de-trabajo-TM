# Motor de contenido CM — Fase 1: Backend (Supabase + n8n) Implementation Plan

> **Alcance de este plan:** Solo la base de datos y el flujo de n8n que genera contenido a partir de un brief manual. **No toca `salidas/crm-cm/` todavía** — ese es el Plan 2 (frontend), que se escribe después de que este quede probado y funcionando, porque necesita que `content_pipeline` ya tenga datos reales para diseñarse sobre la forma real (no supuesta) del dato. Las fuentes catálogo/Chatwoot/tendencias y la búsqueda de Drive quedan para un Plan 3 — requieren decisiones de acceso a datos (ver "Fuera de alcance" al final) que no estaban cerradas al escribir este plan.
>
> Ver diseño completo en [`planes/2026-07-13-motor-contenido-cm-arquitectura.md`](2026-07-13-motor-contenido-cm-arquitectura.md).

**Goal:** Tener una tabla `crm_cm.content_pipeline` real en Supabase y un workflow de n8n que, a partir de un brief de texto libre, genera copy + concepto para las 9 marcas activas vía GPT y lo guarda en esa tabla — verificable con una consulta SQL, sin depender de ningún frontend.

**Architecture:** Webhook de n8n recibe `{ brief, formato }` → AI Agent (GPT-5-mini vía `lmChatOpenAi`) con salida estructurada genera un objeto por marca (copy + hook + concepto) usando el tono de cada marca ya cargado en el prompt del sistema → un nodo Code aplana el resultado en filas → se insertan en `crm_cm.content_pipeline` vía la API REST de Supabase (mismo patrón que ya usan los workflows de MetaAds — credencial `Supabase Plataforma Meta`, project `jvudavpopxsguiemtrkk`, solo cambia el schema).

**Tech Stack:** n8n (`n8ntm.iadventurecentersx.com`, gestionado vía MCP `mcp__claude_ai_n8n__*`), Supabase Postgres (proyecto "Plataforma ecosistema meta", `jvudavpopxsguiemtrkk`, gestionado vía MCP `mcp__claude_ai_Supabase__*`), OpenAI (`gpt-5-mini` vía credencial n8n existente `OpenAI IADVC01`).

---

## Antes de empezar — estado verificado en esta sesión

- Proyecto Supabase: `jvudavpopxsguiemtrkk` ("Plataforma ecosistema meta"). Ya tiene schemas `meta_ads` y `platform`. `platform.users.role` es un enum que **ya incluye `'cm'`** (`admin | viewer | cm`) — no hace falta migrarlo.
- Credenciales n8n ya existentes y reutilizables (no crear nuevas):
  - `Supabase Plataforma Meta` (`SvxC7pspaU7YWcmn`, tipo `supabaseApi`)
  - `OpenAI IADVC01` (`oYGqiyQvHtrnWvDu`, tipo `openAiApi`)
- **Gotcha confirmado esta sesión:** las tablas nuevas creadas con `apply_migration` en este proyecto **no heredan grants** de `anon`/`authenticated`/`service_role` — solo quedan con permisos para `postgres`. Sin el GRANT explícito, cualquier llamada desde n8n falla con `permission denied for table X`. Este plan incluye el GRANT como parte de la migración, no como paso separado.
- Marcas activas reales (de `salidas/crm-cm/src/data/brands.ts`, no de memoria — son 9, no 8): `TB, BE, ADVC, CDR, TP, TC, PB, TBBR, PBRS`.
- `ContentItem` en `salidas/crm-cm/src/types/index.ts` ya define `status: 'Idea' | 'Guion' | 'Grabado' | 'Editado' | 'Aprobado' | 'Programado'`. `content_pipeline.estado` reusa exactamente estos 6 valores (no la lista distinta que proponía el documento de arquitectura) para que el Plan 2 no tenga que rediseñar el Kanban ya construido en `PipelineView.tsx`.

---

## Task 1: Schema y tabla en Supabase

**Herramientas:** `mcp__claude_ai_Supabase__apply_migration`, `mcp__claude_ai_Supabase__execute_sql` (ambas contra `project_id: jvudavpopxsguiemtrkk`)

- [ ] **Step 1: Crear el schema `crm_cm` y la tabla `content_pipeline`**

Ejecutar con `apply_migration`, `name: "create_crm_cm_content_pipeline"`:

```sql
create schema if not exists crm_cm;

create table crm_cm.content_pipeline (
  id bigint generated always as identity primary key,
  marca text not null check (marca in ('TB','BE','ADVC','CDR','TP','TC','PB','TBBR','PBRS')),
  formato text not null check (formato in ('Reel','Carrusel','Stories','Ad')),
  estado text not null default 'Idea' check (estado in ('Idea','Guion','Grabado','Editado','Aprobado','Programado')),
  aprobado boolean not null default false,
  owner text,
  objective text,
  hook text not null,
  summary text not null,
  cta text,
  score integer,
  copy text,
  slides jsonb not null default '[]'::jsonb,
  media_candidatos jsonb not null default '[]'::jsonb,
  fecha_publicacion date,
  hora text,
  origen text not null check (origen in ('catalogo','brief_manual','consulta_chatwoot','tendencia')),
  motivo_rechazo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table crm_cm.content_pipeline enable row level security;

comment on table crm_cm.content_pipeline is
  'Pipeline de contenido real de la CM (Luciana) — reemplaza el mock de salidas/crm-cm/src/data/mock.ts. Poblada por el workflow n8n "CM - Generar Contenido". Ver planes/2026-07-13-motor-contenido-cm-plan-fase1-backend.md';
```

- [ ] **Step 2: Otorgar permisos (el gotcha confirmado esta sesión)**

Ejecutar con `apply_migration`, `name: "grant_content_pipeline_privileges"`:

```sql
grant usage on schema crm_cm to anon, authenticated, service_role;
grant select, insert, update, delete on crm_cm.content_pipeline to anon, authenticated, service_role;
```

- [ ] **Step 3: Verificar que el schema quedó expuesto en la API REST**

Ejecutar con `execute_sql`:

```sql
select nspname from pg_namespace where nspname = 'crm_cm';
```

Esperado: una fila con `crm_cm`. Si además `insert`/`select` vía REST fallan más adelante con `PGRST106` ("schema must be one of the exposed schemas"), el schema existe pero no está en `pgrst.db_schemas` — mismo síntoma que ya se documentó y resolvió para este mismo proyecto en `reference_supabase_plataforma_meta_ads.md`. Fix si pasa: `alter role authenticator set pgrst.db_schemas = 'public, meta_ads, platform, crm_cm'; notify pgrst, 'reload schema';` vía `execute_sql`.

- [ ] **Step 4: Confirmar los grants con una consulta de control**

Ejecutar con `execute_sql`:

```sql
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'crm_cm' and table_name = 'content_pipeline'
order by grantee, privilege_type;
```

Esperado: filas para `anon`, `authenticated`, `service_role` (además de `postgres`), cada una con `SELECT`, `INSERT`, `UPDATE`, `DELETE`.

---

## Task 2: Workflow n8n "CM - Generar Contenido"

**Herramientas:** `mcp__claude_ai_n8n__get_sdk_reference` (ya consultado en esta sesión), `mcp__claude_ai_n8n__validate_workflow`, `mcp__claude_ai_n8n__create_workflow_from_code`, `mcp__claude_ai_n8n__update_workflow` (para `setNodeCredential`), `mcp__claude_ai_n8n__execute_workflow`, `mcp__claude_ai_n8n__get_execution`, `mcp__claude_ai_n8n__publish_workflow`.

- [ ] **Step 1: Validar el código del workflow con el SDK**

Ejecutar con `validate_workflow` el siguiente código (ya usa los node types confirmados en esta sesión: `n8n-nodes-base.webhook` v2.1, `@n8n/n8n-nodes-langchain.agent` v3.1, `@n8n/n8n-nodes-langchain.lmChatOpenAi` v1.3, `@n8n/n8n-nodes-langchain.outputParserStructured` v1.3):

```javascript
import { workflow, node, trigger, languageModel, outputParser, newCredential, expr, sticky } from '@n8n/workflow-sdk';

const webhookTrigger = trigger({
  type: 'n8n-nodes-base.webhook',
  version: 2.1,
  config: {
    name: 'Recibir brief',
    parameters: {
      httpMethod: 'POST',
      path: 'cm-generar-contenido',
      authentication: 'none',
      responseMode: 'lastNode',
      options: {}
    },
    position: [0, 192]
  },
  output: [{ body: { brief: 'Promocionar la excursión a Piedras Blancas para la temporada de nieve', formato: 'Carrusel' } }]
});

const normalizarInput = node({
  type: 'n8n-nodes-base.set',
  version: 3.4,
  config: {
    name: 'Normalizar input',
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'brief', name: 'brief', value: expr('{{ $json.body?.brief ?? $json.brief ?? "" }}'), type: 'string' },
          { id: 'formato', name: 'formato', value: expr('{{ $json.body?.formato ?? $json.formato ?? "Reel" }}'), type: 'string' }
        ]
      }
    },
    position: [224, 192]
  },
  output: [{ brief: 'Promocionar la excursión a Piedras Blancas para la temporada de nieve', formato: 'Carrusel' }]
});

const openAiModel = languageModel({
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  version: 1.3,
  config: {
    name: 'GPT-5 mini',
    parameters: { model: { __rl: true, mode: 'list', value: 'gpt-5-mini' }, options: { temperature: 0.7 } },
    credentials: { openAiApi: newCredential('OpenAI IADVC01') },
    position: [448, 400]
  }
});

const parserSchema = outputParser({
  type: '@n8n/n8n-nodes-langchain.outputParserStructured',
  version: 1.3,
  config: {
    name: 'Formato de salida',
    parameters: {
      schemaType: 'fromJson',
      jsonSchemaExample: JSON.stringify({
        piezas: [
          { marca: 'TB', hook: 'string corto, el gancho inicial', summary: 'resumen del concepto en 1-2 frases', copy: 'caption completa lista para publicar', cta: 'string corto, la llamada a la accion', slides: ['idea de la diapositiva 1', 'idea de la diapositiva 2'] }
        ]
      })
    },
    position: [448, 560]
  }
});

const agenteGenerador = node({
  type: '@n8n/n8n-nodes-langchain.agent',
  version: 3.1,
  config: {
    name: 'Generar copy por marca',
    parameters: {
      promptType: 'define',
      text: expr('Brief: {{ $json.brief }}\nFormato: {{ $json.formato }}\n\nGenerá una pieza de contenido para CADA UNA de las 9 marcas listadas en tus instrucciones, adaptando el brief al tono y público de cada una. Si el formato es "Carrusel", "slides" debe tener entre 3 y 6 ideas de diapositiva; para cualquier otro formato, "slides" debe ser un array vacío. El contenido es sobre excursiones reales (paisajes, actividades) — nunca escribas un guion para una persona hablando a cámara.'),
      hasOutputParser: true,
      options: {
        systemMessage: 'Sos el redactor de contenido de Adventure Center, una empresa de turismo en Bariloche, Patagonia. Escribís para 9 marcas, cada una con tono distinto:\n- TB (Turismo Bariloche): marca madre, familiar, cercana, confiable.\n- BE (Bariloche Excursiones): premium, organizada, foco en calidad.\n- ADVC (Adventure Center): aventura pura, adrenalina, energía.\n- CDR (Centro de Reservas): clara, multilingüe, guiada, foco en facilitar la reserva.\n- TP (Turismo Patagonia): económica, directa, accesible.\n- TC (Tur Central): joven, divertida, viral.\n- PB (Patagonia Booking): internacional, profesional, tipo booking.\n- TBBR (Turismo Bariloche BR): versión en portugués de TB, cálida y explicativa para brasileños en su primer viaje.\n- PBRS (Passeios Bariloche): en portugués, cercana, amigable, con tips prácticos para brasileños.\nRespondé siempre en el idioma de la marca (portugués para TBBR y PBRS, español para el resto). Nunca inventes datos de precios o disponibilidad.'
      }
    },
    subnodes: { model: openAiModel, outputParser: parserSchema },
    position: [672, 192]
  },
  output: [{ output: { piezas: [{ marca: 'TB', hook: 'Ejemplo', summary: 'Ejemplo', copy: 'Ejemplo', cta: 'Ejemplo', slides: [] }] } }]
});

const armarFilas = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Armar filas content_pipeline',
    parameters: {
      mode: 'runOnceForAllItems',
      jsCode: "const input = $('Normalizar input').first().json;\nconst salida = $json.output;\nconst piezas = (salida && salida.piezas) || [];\nconst rows = piezas.map(function(p){\n  return {\n    marca: p.marca,\n    formato: input.formato,\n    estado: 'Idea',\n    aprobado: false,\n    hook: p.hook,\n    summary: p.summary,\n    copy: p.copy,\n    cta: p.cta || null,\n    slides: p.slides || [],\n    origen: 'brief_manual',\n  };\n});\nreturn [{ json: { rows: rows } }];"
    },
    position: [896, 192]
  },
  output: [{ rows: [{ marca: 'TB', formato: 'Carrusel', estado: 'Idea', aprobado: false, hook: 'Ejemplo', summary: 'Ejemplo', copy: 'Ejemplo', cta: 'Ejemplo', slides: [], origen: 'brief_manual' }] }]
});

const guardarSupabase = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Supabase - Insertar content_pipeline',
    parameters: {
      method: 'POST',
      url: 'https://jvudavpopxsguiemtrkk.supabase.co/rest/v1/content_pipeline',
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'supabaseApi',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Content-Profile', value: 'crm_cm' }, { name: 'Prefer', value: 'return=representation' }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: expr('{{ JSON.stringify($json.rows) }}'),
      options: {}
    },
    credentials: { supabaseApi: newCredential('Supabase Plataforma Meta') },
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: 2000,
    position: [1120, 192]
  },
  output: [{ id: 1, marca: 'TB' }]
});

const notaProposito = sticky('## 🤖 CM - Generar Contenido\nRecibe un brief manual por webhook, genera copy+concepto para las 9 marcas con GPT-5-mini, y lo guarda en crm_cm.content_pipeline con estado=Idea. Ver planes/2026-07-13-motor-contenido-cm-plan-fase1-backend.md', [webhookTrigger, normalizarInput], { color: 4 });

export default workflow('cm-generar-contenido', 'CM - Generar Contenido')
  .add(webhookTrigger)
  .to(normalizarInput)
  .to(agenteGenerador)
  .to(armarFilas)
  .to(guardarSupabase)
  .add(notaProposito);
```

- [ ] **Step 2: Confirmar que `validate_workflow` devuelve `"valid": true` sin warnings.** Si hay warnings, corregirlos antes de seguir — no crear el workflow con warnings pendientes.

- [ ] **Step 3: Crear el workflow con `create_workflow_from_code`**

Usar el mismo código validado en el Step 1. Pasar `name: "CM - Generar Contenido"` y `description: "Genera copy+concepto para las 9 marcas a partir de un brief manual (webhook) y lo guarda en crm_cm.content_pipeline. Fase 1 del motor de contenido CM — ver planes/2026-07-13-motor-contenido-cm-plan-fase1-backend.md"`.

Guardar el `workflowId` devuelto — se usa en todos los pasos siguientes.

- [ ] **Step 4: Conectar las credenciales existentes explícitamente**

La creación normalmente deja las credenciales de los nodos `httpRequest`/`lmChatOpenAi` sin asignar (mismo comportamiento visto con los workflows de MetaAds esta sesión). Ejecutar `update_workflow` con:

```json
{
  "workflowId": "<el workflowId del Step 3>",
  "operations": [
    { "type": "setNodeCredential", "nodeName": "GPT-5 mini", "credentialKey": "openAiApi", "credentialId": "oYGqiyQvHtrnWvDu", "credentialName": "OpenAI IADVC01" },
    { "type": "setNodeCredential", "nodeName": "Supabase - Insertar content_pipeline", "credentialKey": "supabaseApi", "credentialId": "SvxC7pspaU7YWcmn", "credentialName": "Supabase Plataforma Meta" }
  ]
}
```

- [ ] **Step 5: Probar con una ejecución manual real (sin publicar todavía)**

Ejecutar `execute_workflow` con `executionMode: "manual"`, `workflowId` del Step 3, e `inputs`:

```json
{ "type": "webhook", "webhookData": { "method": "POST", "body": { "brief": "Promocionar la excursión a Piedras Blancas para la temporada de nieve", "formato": "Carrusel" } } }
```

Guardar el `executionId` devuelto.

- [ ] **Step 6: Verificar que la ejecución terminó en éxito**

Ejecutar `get_execution` con ese `workflowId`/`executionId` (sin `includeData`, para chequear solo `status`). Si `status` es `"error"`: pedir `includeData: true` filtrando `nodeNames` al nodo que falló (para no traer toda la transcripción) y leer `resultData.error` — los errores más probables son `permission denied` (Task 1 Step 2 no se aplicó bien) o un error de schema de OpenAI en el output parser (revisar que `jsonSchemaExample` sea JSON válido).

Esperado: `"status": "success"`.

- [ ] **Step 7: Verificar los datos reales en Supabase**

Ejecutar con `execute_sql` contra `jvudavpopxsguiemtrkk`:

```sql
select marca, formato, estado, aprobado, hook, cta, jsonb_array_length(slides) as n_slides, origen
from crm_cm.content_pipeline
order by created_at desc
limit 9;
```

Esperado: 9 filas (una por marca), `formato = 'Carrusel'`, `estado = 'Idea'`, `aprobado = false`, `origen = 'brief_manual'`, `n_slides` entre 3 y 6, `hook`/`cta` en portugués para las filas `TBBR`/`PBRS` y en español para el resto.

- [ ] **Step 8: Publicar el workflow**

Ejecutar `publish_workflow` con el `workflowId`. Esto lo activa — el webhook queda accesible en `https://n8ntm.iadventurecentersx.com/webhook/cm-generar-contenido` para cuando el Plan 2 conecte el botón del Generador en `crm-cm`.

---

## Self-review de este plan

- **Cobertura del diseño:** este plan cubre la tabla `content_pipeline` (sección "Modelo de datos" del documento de arquitectura) y la fuente "briefs manuales" + generación GPT (sección "Flujo n8n"). NO cubre: catálogo/Chatwoot/tendencias como fuentes, búsqueda multi-cuenta de Drive, ni ningún cambio en `salidas/crm-cm/` — deliberadamente diferido, ver nota de alcance al inicio.
- **Sin placeholders:** todos los pasos tienen SQL/código completo, no hay "TBD" ni "agregar validación" genérico.
- **Consistencia de nombres:** `content_pipeline.estado` usa los mismos 6 valores que `ContentItem.status` en `types/index.ts` (Idea/Guion/Grabado/Editado/Aprobado/Programado) — confirmado contra el código real, no supuesto. `marca` usa las claves reales de `brands.ts` (9 marcas, no 8).

---

## Fuera de alcance de este plan (Plan 2 y Plan 3)

- **Plan 2 (frontend):** conectar `salidas/crm-cm/` — reemplazar `data/mock.ts` por un cliente Supabase real, agregar `@supabase/supabase-js` a `package.json` (hoy no está en las dependencias), botón en `GeneratorView.tsx` que llama al webhook de este plan, Kanban de `PipelineView.tsx` leyendo `content_pipeline`, Calendario por marca, botones Aprobar/Editar/Rechazar-con-motivo.
- **Plan 3 (fuentes adicionales):** catálogo de excursiones, consultas de Chatwoot, tendencias de temporada, búsqueda multi-cuenta de Drive. **Bloqueado en una decisión pendiente:** el catálogo de excursiones vive hoy como markdown en el repo local (`contexto/negocio/catalog_*.md`) y como datos reales en el Supabase de `capacitacion-tm` (proyecto `mrovdtkeckxgknkoeqva`, schema distinto) — n8n no tiene acceso directo a ninguno de los dos. Hay que decidir con Cielo si el catálogo se duplica en el Supabase "TM Platform" o si n8n se conecta al proyecto de `capacitacion-tm` con una credencial nueva, antes de escribir ese plan.
