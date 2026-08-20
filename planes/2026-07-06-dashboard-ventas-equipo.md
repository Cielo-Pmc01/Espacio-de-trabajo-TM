# Plan: Dashboard de Ventas — Equipo Comercial

**Fecha:** 2026-07-06
**Estado:** Pendiente
**Proyecto:** Dashboard Ventas (nuevo — primera etapa de la iniciativa "Dashboards RRHH y Ventas")

## Contexto y Justificación

Cielo quiere que el equipo de ventas compita por el primer puesto y sepa en todo momento cómo va, exigiendo más pero con datos reales en vez de presión sin sustento. Hoy no existe ninguna vista consolidada de rendimiento comercial por vendedor — la información vive dispersa en las conversaciones de Chatwoot (165 agentes, 38 bandejas).

Esta es la primera etapa de una iniciativa de 2 dashboards (ver memoria `project_dashboards_rrhh_ventas`); se arranca por Ventas porque ya existe una fuente de datos real (Chatwoot), a diferencia de RRHH donde no hay ninguna fuente armada todavía.

Referencia visual aportada por Cielo (producto "Sell Your Knowledge"): sidebar de navegación, tarjetas KPI con variación % y sparkline, gráficos de línea/barra por mes, tabla de ranking de vendedores con barra de progreso semaforizada (verde=cumplió, rojo=no cumplió).

## Alcance

**Incluye:**
- Ranking de vendedores por ventas cerradas (Meta vs. Realizado)
- Ticket promedio (AOV)
- Ventas totales por programa/servicio (excursión/producto)
- Semáforo verde/rojo según % de cumplimiento de meta
- Filtro por rango de fechas
- Panel de configuración simple para cargar/editar objetivos (metas) por vendedor y por mes

**NO incluye (fuera de este plan):**
- Dashboard de RRHH (segunda etapa, requiere definir fuente de datos antes)
- Automatización de carga de metas vía IA — se cargan manualmente por ahora
- Integración con Pb2 (ERP) — si en el futuro se necesita el monto exacto de cada reserva desde ahí, es una extensión posterior
- Clima/nieve en tiempo real para IArturo (nota aparte, no relacionada)

## Arquitectura / Decisiones Técnicas

**Fuente de datos — Chatwoot:**
- Conversaciones etiquetadas por agente y por estado de venta (`venta-cerrada`, `venta-perdida`, `por-reservar`, `pendiente-de-pago`, `venta-web`) — ya existen estas etiquetas.
- Etiquetas de mes (`enero-2026` … `diciembre-2026`) para el corte temporal — ya existen.
- **Riesgo crítico a resolver primero:** el monto de cada venta y el programa/servicio vendido NO son campos nativos de Chatwoot. La documentación de Chatwoot (`contexto/chatwoot/chatwoot-arquitectura.md`) señala como pendiente: *"Verificar atributos personalizados de contacto y conversación (no accesibles con token actual)"*. Antes de construir nada, hay que confirmar si:
  - (a) ya existen custom attributes de conversación para monto/programa y solo falta un token con permisos, o
  - (b) hay que crearlos y pedirle al equipo que los completen al cerrar cada venta (junto con la etiqueta `venta-cerrada`).

**Objetivos/metas por vendedor:** no existen en Chatwoot — se necesita una tabla simple y editable (mes, vendedor, monto objetivo). Propuesta: nuevo schema en un proyecto Supabase (puede ser uno nuevo y liviano, o un schema adicional en el Supabase ya usado por capacitacion-tm — a confirmar con Cielo).

**Stack propuesto (a confirmar):**
- Frontend: React + Vite + TypeScript + Tailwind (mismo patrón que `crm-equipo-tm`/CRM de CM Luciana)
- Gráficos: Recharts o Tremor
- Backend liviano: funciones serverless o un pequeño servidor Node que consulta la API de Chatwoot (con el token correcto) + Supabase (metas)
- Deploy: a definir (Vercel o Dokploy, según se decida junto con Cielo)

## Tareas

- [ ] 1. Verificar en Chatwoot si existen custom attributes de conversación para monto de venta y programa/servicio; si no, definir su estructura y crearlos
- [ ] 2. Generar/confirmar un token de API de Chatwoot con permisos para leer conversaciones, etiquetas, custom attributes y agente asignado
- [ ] 3. Mapear agentes de Chatwoot → "vendedores" visibles en el ranking (excluir administradores, bots como Magda, y agentes OFF/inactivos)
- [ ] 4. Diseñar y crear la tabla de objetivos/metas (mes, vendedor, monto objetivo) — decidir dónde vive (Supabase nuevo vs. existente)
- [ ] 5. Construir el panel de carga/edición de metas (simple, para que Cielo o un líder cargue el objetivo mensual por vendedor)
- [ ] 6. Construir el servicio que consulta Chatwoot (conversaciones con etiqueta de venta + custom attributes) y calcula: ventas totales, ticket promedio, ranking, ventas por programa/servicio
- [ ] 7. Bootstrap del proyecto frontend (React + Vite + TS + Tailwind) en `salidas/dashboard-ventas/`
- [ ] 8. Construir las tarjetas KPI (facturación, pedidos, ticket medio, ítems vendidos) con variación % vs período anterior
- [ ] 9. Construir la tabla de ranking de vendedores con barra de progreso semaforizada (verde/amarillo/rojo)
- [ ] 10. Construir gráficos de evolución mensual (ticket medio en el tiempo, ventas por programa/producto)
- [ ] 11. Agregar filtro de rango de fechas
- [ ] 12. Autenticación simple (acceso restringido al equipo/dirección, no público)
- [ ] 13. Probar con datos reales de al menos 1 mes completo
- [ ] 14. Definir y ejecutar el deploy

## Criterio de Éxito

Cielo puede abrir el dashboard y, sin pedirle nada a nadie, ver quién está primero en el ranking, cuánto le falta a cada vendedor para llegar a su objetivo del mes, el ticket promedio del equipo y qué programas/servicios se venden más — todo actualizado con datos reales de Chatwoot, sin cargar nada a mano salvo los objetivos mensuales.

## Notas / Riesgos

- El riesgo más grande del plan es la Tarea 1 — si Chatwoot no tiene (ni puede tener fácilmente) el monto y programa como dato estructurado por conversación, todo el dashboard de "ventas totales" y "ticket promedio" se cae y hay que buscar otra fuente (ej. Pb2) o cambiar el enfoque a solo conteo de ventas cerradas sin monto.
- Requiere que el equipo de ventas adopte la disciplina de completar el custom attribute de monto al cerrar cada venta — sin eso, el dato no existe, sin importar cuán bueno sea el dashboard.
- Decisión pendiente con Cielo: ¿nuevo proyecto Supabase liviano solo para esto, o reutilizar el de `capacitacion-tm` con un schema nuevo?
- Decisión pendiente: dónde hacer deploy (Vercel vs Dokploy, mismo criterio que otros proyectos del ecosistema).
