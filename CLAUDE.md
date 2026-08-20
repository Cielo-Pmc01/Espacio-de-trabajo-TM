# CLAUDE.md — Ecosistema Adventure Center

Este archivo es la base del workspace. Se carga automáticamente al inicio de cada sesión. Refleja el estado actual del ecosistema y cómo navegarlo.

---

## ⚠️ REGLA CRÍTICA: SIEMPRE EN ESPAÑOL

**Claude debe responder SIEMPRE en español.** Cielo solo entiende español. Esto NO es negociable.
- Todas las respuestas, explicaciones, documentos y mensajes → español
- Comentarios de código pueden estar en inglés (si es estándar), pero todo lo que se comunique con Cielo → español
- Si algo está en inglés en una librería/documentación, traducir lo relevante para el usuario

---

## Qué Es Este Workspace

Un ecosistema estructurado para gestionar el trabajo de Cielo en **Adventure Center** (Bariloche, Patagonia Argentina), que abarca dos áreas distintas de la empresa:

- **Área TM (Telemarketing & Marketing)** — el área que Cielo lidera formalmente. Desarrollo de productos digitales, estrategia de redes sociales, gestión de campañas publicitarias (Meta Ads), motor de contenido y automatizaciones de marketing. Es el foco histórico y más desarrollado de este workspace.
- **Área SX** — división interna de operaciones/infraestructura: Pb2 (ERP, Strapi), Magda (agente IA de WhatsApp), Chatwoot (CRM de mensajería), Evolution API, y los sitios web WordPress de las marcas. Cielo también trabaja en temas de esta área aunque no sea su rol principal — el workspace recién empezó a documentarla en profundidad (2026-07-21).

**Operadora:** Cielo — Líder del Área TM, también interviene en temas de SX. Detalles en `contexto/info-personal.md`.

**Regla al agregar contexto nuevo:** todo lo que sea específico de un área va en `contexto/tm/` o `contexto/sx/` según corresponda — no en la raíz de `contexto/` (que queda solo para lo que aplica a ambas áreas, como `info-personal.md`). Ver "Cómo Agregar Contexto a un Área Nueva" más abajo.

---

## Regla de Oro de Comandos

Cualquier texto que comience con `/` es un comando definido en `.claude/commands/`. **Buscar siempre el archivo `.md` correspondiente y seguirlo al pie de la letra.**

---

## Comandos Disponibles

| Comando | Propósito |
|---------|-----------|
| `/iniciar` | Inicializar sesión — carga contexto y reporta estado actual (incluye chequeo de memorias viejas) |
| `/crear-plan [pedido]` | Crear plan de implementación detallado en `planes/` |
| `/implementar [ruta]` | Ejecutar un plan paso a paso |
| `/cerrar` | Cerrar sesión actualizando la memoria persistente con lo trabajado |

---

## Estructura del Ecosistema

```
.
├── CLAUDE.md                          # Este archivo — mapa del ecosistema
│
├── contexto/                          # Todo el contexto del negocio y trabajo
│   ├── info-personal.md               # Rol, equipo y responsabilidades de Cielo (aplica a ambas áreas)
│   │
│   ├── tm/                            # ÁREA TM — Telemarketing & Marketing
│   │   ├── estrategia.md              # Prioridades estratégicas actuales
│   │   ├── negocio/                   # Contexto del negocio y marcas
│   │   │   ├── info-negocio.md        # Descripción de la empresa y área TM
│   │   │   ├── brand_profiles.md      # Perfiles, tonos y públicos de las 14 marcas
│   │   │   ├── copy_protocol.md       # Protocolo de copy y lenguaje por marca
│   │   │   ├── catalog_*.md           # Catálogos de excursiones (invierno, verano, año)
│   │   │   ├── Excursiones todo el año.md # Lista completa de excursiones
│   │   │   └── logos_marcas/          # Logos de las marcas
│   │   ├── proyectos/                 # Estado actual de proyectos TM
│   │   │   ├── datos-actuales.md      # Estado de cada proyecto activo
│   │   │   └── proyectos.md           # Lista y backlog de proyectos
│   │   └── meta-ads/                  # Contexto de campañas Meta Ads
│   │
│   ├── sx/                            # ÁREA SX — operaciones/infraestructura (en construcción, 2026-07-21)
│   │   ├── chatwoot/                  # Arquitectura de Chatwoot (CRM de mensajería)
│   │   ├── n8n-magda/                 # Arquitectura y workflows del agente Magda (WhatsApp IA)
│   │   ├── wordpress-webs/            # Multisitio Hostinger + Adventure Center — accesos y automatización de precios/disponibilidad
│   │   └── proyectos/
│   │       └── migracion-sx-errores.md # Errores/soluciones de la migración iadventurecenter.com → iadventurecentersx.com
│   │
│   └── redes-sociales/                # (en construcción) Contexto de RRSS — TM
│
├── .claude/
│   ├── commands/                      # Comandos de sesión
│   │   ├── iniciar.md
│   │   ├── crear-plan.md
│   │   └── implementar.md
│   └── skills/                        # Skills activas (1 nivel — limitación del harness)
│       ├── turismo-design-expert/     # [TM] Diseño premium para las 14 marcas
│       ├── senior-architect-tm-protocol/ # [TM] Arquitectura 6 fases para proyectos TM
│       ├── context7/                  # [Docs] Buscar docs de librerías en tiempo real
│       ├── brainstorming/             # [Dev] Explorar diseño antes de implementar
│       ├── writing-plans/             # [Dev] Crear planes de implementación detallados
│       ├── executing-plans/           # [Dev] Ejecutar planes en sesión separada
│       ├── systematic-debugging/      # [Dev] Debugging metódico antes de proponer fixes
│       ├── test-driven-development/   # [Dev] TDD — test antes de código
│       ├── verification-before-completion/ # [Dev] Verificar antes de declarar listo
│       ├── subagent-driven-development/    # [Dev] Planes con tareas independientes
│       ├── dispatching-parallel-agents/    # [Dev] Tareas paralelas independientes
│       ├── using-git-worktrees/       # [Dev] Aislamiento de workspace para features
│       ├── finishing-a-development-branch/ # [Dev] Cerrar rama de desarrollo
│       ├── requesting-code-review/    # [Dev] Solicitar code review antes de merge
│       ├── receiving-code-review/     # [Dev] Procesar feedback de code review
│       ├── writing-skills/            # [Meta] Crear/editar skills
│       ├── using-superpowers/         # [Meta] Protocolo de uso de skills
│       ├── n8n-code-javascript/       # [n8n] Pendiente contenido
│       ├── n8n-code-python/           # [n8n] Pendiente contenido
│       ├── n8n-expression-syntax/     # [n8n] Pendiente contenido
│       ├── n8n-mcp-tools-expert/      # [n8n] Pendiente contenido
│       ├── n8n-node-configuration/    # [n8n] Pendiente contenido
│       ├── n8n-validation-expert/     # [n8n] Pendiente contenido
│       ├── n8n-workflow-patterns/     # [n8n] Pendiente contenido
│       ├── mcp-integration/           # [MCP] Pendiente contenido
│       ├── pdf/                       # [Dev] Procesamiento de archivos PDF
│       ├── xlsx/                      # [Dev] Crear/editar/analizar archivos Excel y CSV
│       ├── canvas-design/             # [Dev] Arte visual — posters, diseño, PDF/PNG con filosofía estética
│       ├── docx/                      # [Dev] Procesamiento de archivos DOCX (Word)
│       ├── web-artifacts-builder/      # [Dev] Creación de artifacts HTML complejos con React y shadcn/ui
│       ├── brand-guidelines/          # [Dev] Aplica colores, tipografía y estilo de marca a cualquier artifact
│       ├── deep-research/             # [Dev] Investigación profunda con citas, evidencia y reportes PDF/HTML
│       ├── promptfoo-evals/           # [QA] Evaluaciones y testing de prompts/modelos con PromptFoo
│       ├── redteam-plugin-development/ # [QA] Desarrollo de plugins de red team para PromptFoo
│       ├── search-params/             # [QA] Manejo de search params en evaluaciones PromptFoo
│       ├── meta-ads/                  # [Área] En construcción
│       ├── redes-sociales/            # [Área] En construcción
│       │
│       │   # Skills de Marketing (from coreyhaines31/marketingskills)
│       ├── ab-test-setup/             # [Mkt] Diseño y ejecución de A/B tests
│       ├── ad-creative/               # [Mkt] Generación de copy para ads (Facebook, Google, LinkedIn)
│       ├── ai-seo/                    # [Mkt] Optimización para búsquedas con IA (AEO/GEO)
│       ├── analytics-tracking/        # [Mkt] Configuración de tracking y analytics (GA4, GTM)
│       ├── aso-audit/                 # [Mkt] Auditoría de App Store / Google Play
│       ├── churn-prevention/          # [Mkt] Estrategias de retención y reducción de churn
│       ├── co-marketing/              # [Mkt] Campañas conjuntas y partnerships
│       ├── cold-email/                # [Mkt] Secuencias de email frío y outreach
│       ├── community-marketing/       # [Mkt] Construcción y activación de comunidades
│       ├── competitor-alternatives/   # [Mkt] Páginas "alternativas a X" y SEO competitivo
│       ├── competitor-profiling/      # [Mkt] Análisis y perfiles de competidores
│       ├── content-strategy/          # [Mkt] Estrategia de contenidos y calendario editorial
│       ├── copy-editing/              # [Mkt] Edición y mejora de copy existente
│       ├── copywriting/               # [Mkt] Copy de conversión para páginas web
│       ├── customer-research/         # [Mkt] Investigación de usuarios y Jobs-to-be-Done
│       ├── directory-submissions/     # [Mkt] Listados en directorios y backlinks
│       ├── email-sequence/            # [Mkt] Secuencias de email automatizadas
│       ├── form-cro/                  # [Mkt] Optimización de formularios
│       ├── free-tool-strategy/        # [Mkt] Herramientas gratuitas como canal de adquisición
│       ├── image/                     # [Mkt] Estrategia visual y assets de marketing
│       ├── launch-strategy/           # [Mkt] Estrategia de lanzamiento de productos
│       ├── lead-magnets/              # [Mkt] Creación de lead magnets y recursos gratuitos
│       ├── marketing-ideas/           # [Mkt] Generación de ideas de marketing
│       ├── marketing-psychology/      # [Mkt] Psicología del consumidor aplicada al marketing
│       ├── onboarding-cro/            # [Mkt] Optimización del flujo de onboarding
│       ├── page-cro/                  # [Mkt] Optimización de conversión de páginas
│       ├── paid-ads/                  # [Mkt] Estrategia y gestión de publicidad paga
│       ├── paywall-upgrade-cro/       # [Mkt] CRO para upgrades y paywall
│       ├── popup-cro/                 # [Mkt] Optimización de popups y overlays
│       ├── pricing-strategy/          # [Mkt] Estrategia de precios
│       ├── product-marketing-context/ # [Mkt] Contexto base para todas las skills de marketing
│       ├── programmatic-seo/          # [Mkt] SEO programático a escala
│       ├── referral-program/          # [Mkt] Programas de referidos
│       ├── revops/                    # [Mkt] Revenue Operations y alineación ventas-marketing
│       ├── sales-enablement/          # [Mkt] Materiales y herramientas para el equipo de ventas
│       ├── schema-markup/             # [Mkt] Implementación de datos estructurados
│       ├── seo-audit/                 # [Mkt] Auditoría técnica y on-page de SEO
│       ├── signup-flow-cro/           # [Mkt] Optimización del flujo de registro
│       ├── site-architecture/         # [Mkt] Arquitectura de sitio web para SEO y UX
│       ├── social-content/            # [Mkt] Contenido para redes sociales (LinkedIn, IG, TikTok)
│       └── video/                     # [Mkt] Estrategia y producción de video marketing
│
├── agentes/                           # Prompts de agentes listos para usar
│   └── agente-copy-tm.md             # Generador de copies para las 14 marcas
│
├── planes/                            # Planes de implementación con fecha
├── salidas/                           # Proyectos activos (cada uno con repo propio)
│   ├── app-invierno/                  # [TM] ✅ Completada — https://c1.iadventurecenter.com/
│   ├── capacitacion-tm/               # [TM] 🔄 En desarrollo — reemplaza a app-capacitacion-gral
│   ├── crm-cm/                        # [TM] 🔄 Content Command Center (dashboard mock para CM Luciana)
│   ├── crm-equipo-tm/                 # [TM] 🔄 En desarrollo
│   ├── crm-meta-ads/                  # [TM] 🔄 En desarrollo
│   ├── tm-platform/                   # [TM] 🔄 Fusión de crm-cm + crm-meta-ads en una sola app
│   ├── Pb2/                           # [SX] ⛔ ERP (Strapi) — se trabaja en instancia separada, NO tocar desde acá
│   ├── Chatwoot#3/                    # [SX] docker-compose de una instancia local de Chatwoot
│   └── N8N ORIGINAL/                  # [SX] Exports JSON de workflows de Magda (backup)
├── referencia/                        # Plantillas, flujos n8n, materiales de apoyo
└── scripts/                           # Scripts de automatización auxiliares
```

Cada carpeta de `salidas/` es un repo independiente con su propio stack, `package.json`/README y ciclo de vida — no hay comandos de build/lint/test centralizados a nivel workspace. Para trabajar en uno, entrar a esa carpeta y revisar su `package.json`. La mayoría (`app-invierno`, `crm-cm`, `crm-equipo-tm`, `crm-meta-ads`) solo tiene `dev`/`build`/`lint`, sin tests. `capacitacion-tm` usa **pnpm** y agrega `pnpm typecheck` (react-router typegen + tsc) y `pnpm lint --max-warnings 0`.

---

## Las 14 Marcas

Siempre leer `contexto/tm/negocio/brand_profiles.md` antes de trabajar con cualquier marca. Existe brandbook con paletas de colores definidas.

**Activas (9):** Adventure Center, Bariloche Excursiones, Turismo Bariloche, Centro de Reservas, Turismo Patagonia, Tur Central, Patagonia Booking, TB Brasil, Passeios Bariloche.
**Rafting (5 — inactivas en invierno):** Rafting Adventure, Rafting Bariloche, Rafting Villegas, Rafting Patagonia, Rafting Valle del Manso.

**CM Luciana gestiona:** TB, Passeios Bariloche, TP, Adventure Center, Bariloche Excursiones, Centro de Reservas, Tur Central, Patagonia Booking.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + React 19 (App Router, TypeScript) |
| Estilos | Tailwind CSS v4 (CSS-first, sin config.js) |
| Animaciones | Framer Motion v12 (instalado) |
| Iconos | Lucide React (instalado) |
| Backend/DB | Supabase (Auth + PostgreSQL) |
| Deploy | Vercel vía GitHub |
| Datos/Reportes | Notion API |
| Automatizaciones | n8n |
| Comunicación | WhatsApp + Chatwoot |

---

## Protocolo Obligatorio de Git

**NUNCA** hacer push directo a `main` en ningún proyecto de `salidas/`. Crear siempre rama descriptiva → push → reportar link para que Cielo apruebe el merge.

---

## Cómo Agregar Contexto a un Área Nueva

Cuando se empieza a trabajar en profundidad en un tema:
1. Ubicar primero de qué **área** es (TM o SX) — crear archivos `.md` en `contexto/tm/[subcarpeta]/` o `contexto/sx/[subcarpeta]/` según corresponda (ej: `contexto/tm/meta-ads/campanas-activas.md`, `contexto/sx/pb2/notas.md`). No crear subcarpetas nuevas directo en la raíz de `contexto/`.
2. Crear la skill en `.claude/skills/[nombre]/SKILL.md` — siempre 1 nivel de profundidad
3. Actualizar este CLAUDE.md con la nueva estructura y documentar el área (usar la etiqueta `[TM]` o `[SX]` según corresponda)

---

## Flujo de Sesión

1. `/iniciar` — cargar contexto y ver estado actual
2. Trabajar con comandos o instrucciones directas
3. `/crear-plan` — antes de cambios significativos
4. `/implementar` — ejecutar planes
5. Claude actualiza CLAUDE.md y `contexto/tm/proyectos/datos-actuales.md` al finalizar

---

## Nota Técnica sobre Skills

El harness de Claude Code lee skills **solo 1 nivel de profundidad** dentro de `.claude/skills/`. Todas las skills deben estar en `.claude/skills/[nombre]/SKILL.md` directamente. La organización por área se documenta aquí en CLAUDE.md mediante la etiqueta `[área]` en cada skill, no en la estructura de carpetas.
