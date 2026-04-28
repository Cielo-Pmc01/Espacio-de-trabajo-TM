# Capacitacion Invierno - Frontend

Guia de excursiones, traslados y protocolos de venta para temporada de invierno.

## Objetivo

Este proyecto usa Notion como CMS.
El contenido operativo se edita en Notion y la app lo renderiza en tiempo real (sin hardcodear texto en codigo para los modulos de contenido).

---

## Infraestructura

### Stack tecnologico

| Capa | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Lenguaje | TypeScript 5 |
| CMS | Notion API (`@notionhq/client`) |
| Base de datos | Supabase (evaluaciones) |
| Automatizacion | n8n (webhook de notificaciones) |
| Auth supervisor | Cookie HMAC-SHA256 (sin libreria externa) |

---

### Arquitectura general

```mermaid
flowchart TD
    subgraph Cliente["Navegador (cliente)"]
        A[Vendedor\n/] -->|carga contenido| B(TrainingApp)
        C[Supervisor\n/sp] --> D(SupervisorPanel)
        E[Login supervisor\n/sp/login] --> F(SupervisorLoginForm)
    end

    subgraph NextJS["Next.js Server (SSR / API Routes)"]
        B -->|Server Component| G[page.tsx\nroot]
        G -->|fetch paralelo| H[products-notion.ts]
        G -->|fetch paralelo| I[protocols-notion.ts]

        F -->|POST /api/sp/session| J[API: session]
        D -->|GET /api/sp/results| K[API: sp/results]

        L[POST /api/evaluations] --> M[evaluation-input.ts\nvalidacion]
        M --> N[evaluation.ts\ncorrección]
        N --> O[evaluations-store.ts\npersistencia]
    end

    subgraph Externos["Servicios externos"]
        H --> P[(Notion\nBase: Cursos\nModulo 1)]
        I --> Q[(Notion\nBase: Cursos\nModulo 2)]
        O --> R[(Supabase\ntabla: evaluaciones)]
        O -->|webhook| S[n8n\nnotificacion]
        J --> T{PIN env\nSP_PIN}
    end
```

---

### Rutas de la aplicacion

```mermaid
flowchart LR
    subgraph Pages["Pages (SSR)"]
        root["/\nApp principal"]
        sp["/sp\nPanel supervisor\n🔒 requiere sesion"]
        login["/sp/login\nLogin supervisor"]
    end

    subgraph API["API Routes"]
        a1["POST /api/auth/login\nlogin vendedores"]
        a2["POST /api/auth/logout\nlogout"]
        a3["POST /api/evaluations\nenvia evaluacion"]
        a4["GET  /api/evaluations\nhistorial (SP)"]
        a5["POST /api/sp/session\nlogin supervisor (PIN)"]
        a6["GET  /api/sp/results\nresultados"]
        a7["GET  /api/sp/results/[id]\nresultado individual"]
    end

    root -->|submits| a3
    login -->|POST| a5
    sp -->|reads| a6
    sp -->|reads| a7
```

---

### Estructura de carpetas

```mermaid
graph TD
    R[frontend/] --> APP[app/]
    R --> COMP[components/]
    R --> LIB[lib/]

    APP --> PAGE["page.tsx\nHome · SSC"]
    APP --> LAYOUT["layout.tsx\nLayout global"]
    APP --> API_DIR["api/"]
    APP --> SP_DIR["sp/"]
    APP --> CAP_DIR["capacitacion/"]

    API_DIR --> AUTH_DIR["auth/\nlogin · logout"]
    API_DIR --> EVAL_DIR["evaluations/\nPOST · GET"]
    API_DIR --> SP_API["sp/\nsession · results"]

    SP_DIR --> SP_PAGE["page.tsx\nSupervisorPanel 🔒"]
    SP_DIR --> SP_LOGIN["login/page.tsx"]

    COMP --> C1["training-app.tsx\nApp principal"]
    COMP --> C2["supervisor-panel.tsx"]
    COMP --> C3["supervisor-login-form.tsx"]

    LIB --> SRV["server/\n(server-only)"]
    LIB --> L1["evaluation.ts\ncorrector"]
    LIB --> L2["training-types.ts\ntipos TS"]
    LIB --> L3["notion-client.ts"]
    LIB --> L4["training-data.ts\npreguntas eval"]

    SRV --> S1["config.ts\nenv vars"]
    SRV --> S2["evaluations-store.ts\nSupabase"]
    SRV --> S3["supervisor-session.ts\ncookie HMAC"]
    SRV --> S4["products-notion.ts"]
    SRV --> S5["protocols-notion.ts"]
    SRV --> S6["notion-blocks.ts\nrenderer"]
    SRV --> S7["evaluation-input.ts\nvalidacion"]
```

---

### Flujo de una evaluacion

```mermaid
sequenceDiagram
    actor V as Vendedor
    participant UI as TrainingApp
    participant API as POST /api/evaluations
    participant EV as evaluation.ts
    participant SB as Supabase
    participant N8N as n8n webhook

    V->>UI: completa el formulario y envia
    UI->>API: POST { vendor, answers }
    API->>API: parseEvaluationSubmission() — valida input
    API->>EV: gradeEvaluation() — calcula puntaje
    EV-->>API: resultado con nota y respuestas
    API->>SB: saveEvaluationRecord()
    SB-->>API: OK / sin Supabase configurada
    API->>N8N: webhook de notificacion (si esta configurado)
    API-->>UI: { evaluation, saved, notificationSent }
    UI-->>V: muestra resultado
```

---

### Flujo de sesion supervisor

```mermaid
sequenceDiagram
    actor SP as Supervisor
    participant LOGIN as /sp/login
    participant SESSION as POST /api/sp/session
    participant PANEL as /sp (protegido)

    SP->>LOGIN: ingresa PIN
    LOGIN->>SESSION: POST { pin }
    SESSION->>SESSION: verifica contra SP_PIN (env)
    SESSION-->>LOGIN: Set-Cookie: capacitacion_sp_session (HMAC signed)
    LOGIN-->>SP: redirect /sp

    SP->>PANEL: GET /sp
    PANEL->>PANEL: requireSupervisorSession()\nvalida cookie + TTL (12h default)
    PANEL-->>SP: renderiza SupervisorPanel
```

---

## Contenido en Notion

Base de datos unica:

- `NOTION_DATABASE_ID`: base `Cursos`

Separacion por modulo:

- `Modulo = "Modulo 1"`: productos (excursiones, traslados, clases)
- `Modulo = "Modulo 2"`: protocolos (7 secciones)

### Modulo 1 (Productos)

Cada producto vive en una pagina de Notion.

Propiedades principales:

- `OrdenID`
- `Nombre`
- `Tipo`
- `Proveedor`
- `Descripcion`
- `Horario`
- `Temporada`
- `PuntoEncuentro`
- `Diferencial`

Body de pagina (editable por humanos):

- `## Precios` -> tabla (Metodo | Precio)
- `## Incluye` -> bullets
- `## No incluye` -> bullets
- `## Adicional` -> bullets (opcional)
- `## Itinerario` -> parrafo (opcional)

### Modulo 2 (Protocolos)

Hay 7 paginas (una por seccion), identificadas por propiedad `Seccion`:

- `salesPriority`
- `clothingNotes`
- `providerAvailability`
- `availabilityChecklist`
- `paymentWarnings`
- `paymentRules`
- `fullPaymentSteps`

El contenido de cada seccion se toma del body (tablas, callouts, bullets o lista numerada segun corresponda).

## Variables de entorno

Crear `.env` con:

```dotenv
NOTION_TOKEN=tu_token_de_notion
NOTION_DATABASE_ID=tu_database_id
SP_PIN=pin_supervisor
SUPABASE_URL=...
SUPABASE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
N8N_WEBHOOK_URL=...
```

## Desarrollo

```bash
npm install
npm run dev
```

App local:

- `http://localhost:3000`

## Comandos utiles

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

## Verificacion de sincronizacion Notion

Durante la migracion se uso un script de auditoria (`/tmp/deep-verify.mjs`) para comparar Notion vs datos originales campo por campo.
Resultado actual: contenido alineado 100%.

Si queres repetir la auditoria, se puede volver a ejecutar:

```bash
node /tmp/deep-verify.mjs
```

## Flujo recomendado de contenido

1. Editar contenido en Notion.
2. Guardar cambios en las paginas correspondientes.
3. Refrescar la app para validar render.
4. Ejecutar chequeo tecnico (`npx tsc --noEmit` y `npm run lint`) antes de desplegar.
