# Proyectos

> Lista de proyectos pendientes o en desarrollo para Claude Code. Cada ítem es algo a construir, automatizar o sistematizar dentro del workspace.

---

## En desarrollo

| Proyecto | Descripción | Prioridad |
|----------|-------------|-----------|
| Meta Ads — Campañas Invierno 2026 | Limpieza de cuentas publicitarias + reemplazo de anuncios preventa → venta. Videos listos: TP, CDR, PB inglés, Passeios, TB, TB BR, ADV C. MCP de Meta Ads conectado. | ALTA |
| Motor de Copys — Meta Ads | ✅ Completo (7/7): "Meta Ads - Generar Copy" lee precios EN VIVO de los Docs 3/4 (no de tabla stale), + "Meta Ads - Aprobar Copy" (webhook). Probado con datos reales. Plan: `planes/2026-07-30-motor-copys-meta-ads.md`. | ALTA |
| Meta Ads — Automatizar carga de anuncios (video+copy) | Workflow n8n que arma campaña+conjunto+anuncio en PAUSED por marca, tomando video de Drive y copy del Motor de Copys — Meta Ads (arriba). Cielo revisa y publica manual. Bloqueante real: falta organizar una carpeta de Drive por marca para videos (no existe hoy, a diferencia de fotos). Plan: `planes/2026-07-30-automatizar-anuncios-meta-ads-video-copy.md`. | ALTA |
| Pb2 — Patagonia Booking v2 | ERP completo de la empresa (reservas, vouchers, logística, contabilidad). Stack: Strapi 5 + Next.js 16 + PostgreSQL + Redis. Archivos en `salidas/Pb2/`. `.env` locales ya configurados, pendiente levantar con Docker. Luciano (TX) lleva el desarrollo principal pero el equipo está bloqueado esperando sus aprobaciones. Cielo quiere levantarlo localmente y avanzar con datos propios. | ALTA |
| Bloque 3 - Meta y Prioridades | Armado y grabación de contenido de pauta en Meta Ads, prioridades de marcas, conexión de clientes y flujo hacia WhatsApp. Plan guardado en `planes/2026-05-07-sistema-meta-y-prioridades.md`. | MEDIA |
| CRM Meta Ads | Dashboard de análisis de campañas (React+TS+Zustand). Migrando de fetch directo del navegador a backend seguro en n8n + Supabase, para habilitar acceso multi-usuario (equipo TM + SP) sin exponer tokens. Plan: `planes/2026-07-07-crm-meta-ads-arquitectura-n8n.md`. | ALTA |
| CRM Equipo TM | Panel centralizado para gestión del equipo TM. Funcionalidad pendiente de documentar. | ALTA |
| Automatizaciones n8n | Flujos para revisar tareas del equipo, reportes de campañas y redes, auditoría de videos con IA | MEDIA |
| IArturo (Sofía IA) en n8n | Workflow n8n en paralelo (instancia nueva, separada de Magda) para IArturo: suma Notion como fuente de datos + permite ajustar prompt sin deploy. Plan: `planes/2026-07-02-iarturo-n8n-workflow-paralelo.md`. PR creado, pendiente de merge. | ALTA |
| Sync Precios/Horarios Docs → Capacitación TM | Los Docs maestros 3 (Invierno) y 4 (Todo el Año) actualizan solos el catálogo de excursiones en `capacitacion-tm` (precio y horario) vía notificación push de Google Drive + workflow n8n, sin edición manual. Requiere tabla nueva `excursion_precios` (desacoplada del Tiptap de la lección) y verificación de dominio en Google Search Console. Plan: `planes/2026-07-27-sync-precios-horarios-docs-capacitacion-tm.md`. | ALTA |
| Dashboard de Ventas — Equipo Comercial | Ranking de vendedores, objetivos vs. realizado, ticket promedio (AOV), ventas por programa/servicio, con datos de Chatwoot. Primera etapa de la iniciativa de 2 dashboards (Ventas + RRHH). Plan: `planes/2026-07-06-dashboard-ventas-equipo.md`. | ALTA |

## Completados

| Proyecto | Descripción | URL / Ubicación |
|----------|-------------|-----------------|
| App Capacitación Invierno | App web para vendedores — Módulo 1 (excursiones), Módulo 2 (protocolos), Módulo 3 (evaluación 20 preguntas). Contenido y protocolos cargados. Backend: Supabase. | https://c1.iadventurecenter.com/ |

---

## Backlog

| Proyecto | Descripción |
|----------|-------------|
| Rediseño del Editor del Admin | Hacer que el panel de administración sea sumamente intuitivo, visual, profesional y fácil de rellenar para el usuario (reemplazar la edición manual de HTML por campos específicos para links, textos y videos). |
| Videos avatar Sofía | Crear videos con HeyGen u otra IA para el avatar de la app |
| Agente auditor de videos | Flujo n8n que revisa y reporta videos del equipo automáticamente |
| Reporte automático de campañas | Dashboard o reporte semanal de Meta Ads generado por n8n |
| Dashboard de RRHH — Equipo | Headcount por área, rendimiento, ausentismo, rotación, costo de contratación, evolución mensual. Segunda etapa de la iniciativa de dashboards — requiere definir primero de dónde salen los datos (hoy no existe ninguna fuente armada). |

---

_Cuando un proyecto se complete, moverlo a la sección "Completados" con su ubicación._
