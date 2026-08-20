# Datos Actuales

> Este archivo contiene métricas, datos y estado actual relevantes para tu rol y estrategia. Le provee a Claude contexto concreto para análisis y toma de decisiones.

---

## Cómo Se Conecta

- **info-negocio.md** provee el contexto organizacional
- **info-personal.md** define de qué sos responsable
- **estrategia.md** describe hacia dónde se está optimizando
- **Este archivo** le da a Claude los números detrás de la narrativa

---

## App Capacitación Invierno — COMPLETADA

✅ Desplegada en servidor propio: https://c1.iadventurecenter.com/
Contenido e información de protocolos cargados. Backend: Supabase.

## Estado de la App de Capacitación General — Fase 5 (Pulido y Optimización)

> **Última actualización:** 21 de Mayo de 2026
> **Rama activa:** `feature/editor-blocknote-drag-drop` · PR creado, pendiente de merge
> **Commit:** `2add9e5`

| Ítem | Estado |
|------|--------|
| **Fase:** Segmentación por Sector (B1, VR, VP) | ✅ **100% Completa en Local** |
| Segmentación de usuarios por sector | ✅ Badges visuales, filtros inteligentes, asesores demo configurados |
| Re-numeración consecutiva de módulos | ✅ Sin huecos numéricos, UI limpia |
| Títulos dinámicos por sector | ✅ Mismo contenido, nombres personalizados por B1/VR/VP |
| Panel de administración | ✅ Asignación de sectores a usuarios y módulos, editor de títulos alternativos |
| Juego drag & drop (Módulo 2) | ✅ Funcional |
| Videos embebidos YouTube | ✅ Habilitado en Módulo 2, Bloque 2 (avatar Sofía) |
| Subtítulo de bloque editable | ✅ Corregido 13/05 — antes era fijo tras la creación |
| Editor de bloques tipo 'cards' | ✅ Implementado 13/05 — crear, editar, reordenar, eliminar tarjetas |
| Archivos descargables en protocolos | ✅ Ya existía — verificado 13/05 |
| Editor BlockNote drag-and-drop | ✅ Integrado 21/05 — tipos reading, protocols y cards usan BlockNote v0.51.2 |
| Compatibilidad contenido HTML legacy | ✅ Detección automática JSON/HTML — nada se rompe |
| Contenido sector B1 | ✅ Cargado (mismo contenido que app-invierno) |
| Contenido sector VR | 🔴 **Próximo paso** — cargar contenido específico de VR |
| Contenido sector VP | ⏳ Pendiente |
| Avatar Sofía con voz | ⏳ Demo configurado — reemplazar con videos reales |
| Rediseño completo desde cero | ⏳ Pendiente |
| Deploy en servidor | ⏳ Pendiente (vendedores usan app-invierno mientras tanto) |

## Capacitación TM (nuevo proyecto, reemplazo de App Capacitación General)

> **Última actualización:** 27 de Mayo de 2026
> **Repo:** https://github.com/Cielo-Pmc01/Capacitacion-TM
> **Rama activa:** `Actualizacion-mayo` (sin push aún) — último commit `c51c747`
> **Local:** `salidas/capacitacion-tm/`
> **Stack:** React Router 7 + TypeScript + Tailwind v4 + Supabase + PWA + Leaflet
> **PRD:** [`planes/2026-05-14-prd-plataforma-capacitacion.md`](../../planes/2026-05-14-prd-plataforma-capacitacion.md)
> **Último plan ejecutado:** [`planes/2026-05-27-mapa-recorrido-react-nativo.md`](../../planes/2026-05-27-mapa-recorrido-react-nativo.md) ✅

### Recorridos de Excursiones (Mayo 2026) ✅
- Componente React nativo `<ExcursionRouteMap>` con Leaflet + OSRM + animación
- 27 rutas en Supabase (tablas `excursion_routes` + `excursion_route_paradas`)
- Integrado dentro de cada excursión del catálogo (alumno + agencia, hereda automático)
- Admin UI `/admin/recorridos` para CRUD de rutas y paradas
- App HTML standalone (Recorrido.html) movida a `_deprecated/`

### Mapa de Pick Ups (28 de Mayo 2026) ✅ mergeado a main
- Plan: [`planes/2026-05-28-mapa-pickups-react-supabase.md`](../../planes/2026-05-28-mapa-pickups-react-supabase.md)
- PR `feature/mapa-pickups` mergeado · migración 016 aplicada · seeds corridos (109 pickups + 1743 horarios)
- Componente React nativo `<PickupsViewer>` + `<PickupsMapLeaflet>` (Leaflet imperativo, SSR-safe)
- Datos en Supabase: tablas `pickups` + `pickup_horarios`
- Embebido en la lección "Protocolo de Pick Ups" (bloque `pickups_map`, reemplazó el iframe viejo)
- Editor admin `/admin/pickups` con drag + guardado de offsets visuales
- Acordeón "Mapa de Pick Ups" en Vista Agencias (read-only)

| Tarea Fase 1 | Estado |
|---|---|
| T1 Bootstrap RR7 + Vite + TS strict | ✅ |
| T2 Deps base (Supabase, Zod, Tailwind v4, i18next) | ✅ |
| T3 shadcn/ui (utils, Button con CVA) | ✅ |
| T4 Sistema de temas (3 paletas × claro/oscuro) | ✅ |
| T5 i18n (es/pt/en con keys base) | ✅ |
| T6 Schema Supabase `capacitacion_tm` | ✅ 001 aplicada · falta 002 (grants) + exponer en API |
| T7 Auth (login + sesión + roles) | ✅ |
| T8 Roles y layouts (alumno + admin con sidebars + Sofía flotante) | ✅ |
| T9 Seeds de prueba (script `pnpm seed`) | ✅ código listo · falta correrlo |
| T10 PWA manifest | ✅ (sin iconos PNG aún) |
| T11 Linter + Prettier | ✅ |
| T12 README + .env.example | ✅ |
| T13 Push a GitHub | ✅ |
| Lib clients Supabase (env + server + browser) | ✅ |

### Pendientes inmediatos antes de Fase 2
- Cielo aplica `supabase/migrations/001_init_capacitacion_tm.sql` desde el SQL Editor.
- Cielo agrega `capacitacion_tm` a Exposed schemas en Settings → API.
- Terminar T7/T8/T9 (auth real, layouts por rol, seeds de usuarios prueba).

---

## Estado CRM Meta Ads

| Ítem | Estado |
|------|--------|
| En desarrollo | ⏳ Funcionalidad pendiente de documentar con Cielo |

## Estado CRM Equipo TM

| Ítem | Estado |
|------|--------|
| En desarrollo | ⏳ Funcionalidad pendiente de documentar con Cielo |

---

## Estado del Área TM

| Ítem | Estado |
|------|--------|
| Equipo completo (4 personas) | ✅ |
| 14 marcas activas en Meta Ads | ✅ |
| Procesos documentados | ❌ Pendiente |
| Métricas definidas y visibles | ❌ Pendiente |
| Automatizaciones n8n | ⏳ En aprendizaje |

---

## Fuentes de Datos

- Notion — resultados de evaluaciones de la app
- Meta Ads Manager — métricas de campañas
- Google Ads — gestionado por proveedor externo

---

_Mactualizá regularmente — los datos desactualizados limitan la utilidad de Claude como socio analítico._
