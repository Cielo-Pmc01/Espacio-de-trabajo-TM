# Plan: Anuncios (con estado) dentro de cada campaña — tm-platform / Meta Ads

**Fecha:** 2026-07-29
**Estado:** Completado
**Proyecto:** tm-platform (Meta Ads) — pieza del pendiente #6 ya documentado en memoria (`tm-platform-unificada`)

## Contexto y Justificación

Cielo pidió que la pestaña Campañas muestre, dentro de cada campaña, los anuncios individuales con su estado (activo/pausado) — hoy solo se ve el desglose por cuenta publicitaria. Es el pendiente grande ya mapeado desde el 20/07 ("conjuntos de anuncios + anuncios individuales... no empezado").

**Se intentó armar hoy (29/07) y causó un incidente real:** al insertar un nodo nuevo en el medio de la cadena del workflow n8n "MetaAds - Consolidado" (que sirve el webhook que usa `tm-platform`), se rompió una referencia implícita (`$input`) de la que dependía el cálculo del histórico anual. Esto dejó la API de producción sin responder durante ~20 minutos (ejecuciones colgadas, sin error visible, "Cargando..." infinito para cualquiera mirando la plataforma) justo antes de una presentación. Se revirtió todo a la última versión funcional y hoy la plataforma quedó operativa de nuevo, pero **sin el feature construido**.

Este plan documenta qué salió mal (post-mortem) y cómo construirlo de forma segura la próxima vez.

## Post-mortem — qué salió mal

1. **Causa raíz real:** el código del nodo agregador (`Agregar por marca-cuenta-campana`) usaba `$input.all()` (predecesor inmediato implícito) para leer el histórico anual, en vez de `$('Supabase - Traer historico anual').all()` (referencia explícita por nombre). Insertar cualquier nodo nuevo entre "Traer historico anual" y el agregador rompe esa lectura sin avisar — el código sigue corriendo, pero con datos equivocados o directamente sin datos.
2. **Segundo intento (nodo en paralelo, no en la cadena) también falló**, con un error distinto: `Node 'Supabase - Leer metadata cache (API)' hasn't been executed`. Al conectarlo como rama paralela suelta (sin nodo Merge), n8n no garantiza que esa rama termine antes de que el nodo dependiente la lea — es una condición de carrera, no un bug puntual.
   - Dato clave encontrado durante la investigación: la rama de sync existente (cron "Cada 30 minutos") **ya usa exactamente este patrón** (`Supabase - Leer metadata cache` en paralelo, referenciado por nombre desde `Adjuntar cuenta (Ale+Sergio)`) y funciona hace semanas sin problema — pero "funciona" ahí por timing incidental (las llamadas a Meta Insights tardan más que la lectura a Supabase, así que la rama paralela casi siempre termina antes por pura casualidad), no por garantía real de n8n. Es una fragilidad latente ya existente en el workflow, no algo que yo introduje.
3. **Efecto cascada:** esta instancia de n8n no corre en modo cola/Redis (confirmado en incidentes previos, ver `feedback-n8n-saturacion-cola`). Cuando una ejecución del webhook queda colgada, las siguientes llamadas al mismo webhook parecen encolarse detrás de la primera en vez de correr independientes — cada una tardó ~5 minutos en expirar sola. Al probar varias veces seguidas contra el webhook real de producción mientras depuraba, fui apilando ejecuciones colgadas en vez de dejar que la cola se vaciara, alargando la caída.
4. **No hay forma de cancelar una ejecución colgada** vía las herramientas de n8n disponibles — solo esperar a que expire sola (~5 min) o despublicar/republicar el workflow (no cancela ejecuciones ya en curso, solo evita que se acepten nuevas mientras está despublicado).

## Alcance

**Incluye:**
- Traer de Meta el status por anuncio (`effective_status`) anidado dentro de cada campaña, vía el fetch de metadata que ya existe (cron cada 4hs).
- Exponer `byCampaigns[campaña].ads = { [nombreAnuncio]: { msgs, spend, status } }` en la respuesta de la API de n8n.
- UI: dentro de "Detalle de campañas" / `CampaignsSection`, un nivel de expansión más (Campaña → Anuncios) con badge de estado, mismo patrón visual que ya existe para Activa/Pausada/Sin datos.

**NO incluye (fuera de alcance de este plan):**
- Conjuntos de anuncios (Ad Sets) — Cielo no los pidió esta vez, solo "los anuncios de las campañas". Si se necesitan después, es una extensión menor sobre esta misma base.
- Cambiar el mecanismo de sync existente (cron cada 30 min / cada 4hs) — se reutiliza tal cual.
- Arreglar la fragilidad latente de la rama de sync (`Adjuntar cuenta`) que también depende de timing incidental — se señala como riesgo conocido, no se toca en este plan.

## Arquitectura / Decisión Técnica

**Regla de oro para este workflow (n8n "MetaAds - Consolidado"):** cualquier nodo nuevo que dependa del resultado de otro nodo **debe leerlo por nombre** (`$('Nombre del Nodo').all()` o `.item.json`), nunca por `$json`/`$input` implícito — así la posición en el grafo deja de importar y insertar/mover nodos no puede romper nada en silencio. Antes de tocar el workflow, auditar todo el código del nodo agregador y confirmar que no queden usos de `$json`/`$input` implícitos sin nombrar (hoy solo queda uno: el `yearRows` — corregirlo es el paso 0, incluso antes de construir el feature nuevo).

**Para combinar dos ramas sin condición de carrera:** usar un nodo **Merge** (modo `append`, ver patrón `parallel_execution` del SDK de n8n) entre la rama principal y la rama nueva, en vez de conectar la rama nueva "suelta" y confiar en timing. El Merge garantiza que n8n espera ambas ramas antes de seguir — elimina la clase entera de bug que causó el incidente de hoy.

**Fetch de Meta:** extender el campo `fields` de los 3 nodos `Meta - Cuenta+Campañas <Portfolio>` (ya usados por el cron de 4hs) para anidar ads dentro de cada campaña:
`campaigns.limit(500){name,effective_status,objective,ads.limit(500){name,effective_status}}`
Esto ya se probó hoy de forma aislada (ejecución manual forzando solo la rama de metadata) y funcionó — los anuncios con su estado real llegaron correctamente anidados. Es la única parte del intento de hoy que quedó validada como segura.

## Tareas

- [x] 0. **Fix previo, independiente del feature:** cambiar `$input.all()` por `$('Supabase - Traer historico anual').all()` en el nodo `Agregar por marca-cuenta-campana`. Probar que la API sigue devolviendo exactamente lo mismo que antes (mismo `byBrandYear`) — esto no cambia comportamiento, solo lo hace seguro para futuros cambios. Publicar este fix solo, aislado, y confirmar 2-3 llamadas reales OK antes de seguir. **Confirmado:** respuesta idéntica en tamaño (9460 bytes), 0 ejecuciones colgadas.
- [x] 1. Extender los 3 nodos `Meta - Cuenta+Campañas <Portfolio>` con `ads.limit(500){name,effective_status}` anidado. **Confirmado:** 4 cuentas, 253+39+11+9 campañas con ads reales anidados, upsert a Supabase exitoso.
- [x] 2. **Adaptación práctica:** en vez de duplicar el workflow completo, se validó agregando el Merge directamente en el DRAFT (sin publicar) del workflow real, y ejecutando en modo `manual` con `inputs.type: "webhook"` (token real, headers reales) — esto NO pasa por el endpoint público, es una invocación interna sobre el draft. Mismo nivel de seguridad que duplicar el workflow, con menos pasos. **Confirmado:** `ok:true`, 12/12 campañas con `ads` reales (nombre + msgs + spend + status real como `CAMPAIGN_PAUSED`/`PAUSED`), `byBrandYear` con 3 marcas (correcto para el período probado).
- [x] 3. Portar el cambio validado: `Supabase - Leer metadata cache (API)` en paralelo desde `Verificar token`, nodo **Merge** (`append`, 2 inputs) combinando el final de la cadena principal (`Traer historico anual`) con la rama nueva, saliendo hacia `Agregar por marca-cuenta-campana`. Código del agregador actualizado con `byCampaigns[camp].ads`. Ya aplicado y validado en el paso 2 (mismo cambio, probado antes de publicar).
- [x] 4. Publicado UNA sola vez. Probado con 1 sola llamada real al webhook: `HTTP 200 en 4.9s, size=17919 bytes` (antes 9460 bytes sin ads — el aumento de tamaño confirma que los anuncios están en la respuesta real).
- [x] 5. `search_executions` con `status:["running"]` → 0 resultados, antes y después de la prueba real.
- [x] 6. Frontend: agregado `AdDetail` (`msgs`, `spend`, `status`) y `ads?: Record<string, AdDetail>` a `CampaignData` en `lib/meta-ads/types.ts`.
- [x] 7. Frontend: `CampaignsSection.tsx` — sección "Anuncios" dentro del panel expandido de cada campaña, con badge de estado (se agregó `CAMPAIGN_PAUSED` y `UNKNOWN` al mapa de estados existente), nombre, mensajes e inversión, ordenados por inversión descendente.
- [x] 8. Probado en local (`npm run dev` + Playwright) con cuenta admin real (`patagoniamediacenter01@gmail.com`). **Confirmado:** campaña "PB Arg - Interaccion Wsp" expandida muestra 17 anuncios reales con estado real (Activa/Pausada/Sin datos), nombre, mensajes y gasto — 0 errores/warnings en consola.
- [x] 9. Commit en rama `feat/anuncios-por-campana`, pusheada. Falta que Cielo abra el PR, mergee y redeploye en Dokploy (el backend de n8n ya está en producción — el único paso pendiente es el frontend).

## Criterio de Éxito

- La API de n8n responde `byCampaigns[campaña].ads` con nombre + msgs + spend + status real por anuncio, sin cambiar ningún otro campo de la respuesta.
- Cero ejecuciones "colgadas" (`status: running` por más de 30s) durante todo el proceso de construcción y prueba.
- La pestaña Campañas muestra los anuncios expandibles con estado real, verificado con datos reales de al menos 2 campañas distintas.
- Ninguna prueba se hizo repetidamente contra el webhook de producción sin antes confirmar que la cola estaba vacía.

## Notas / Riesgos

- La fragilidad de `Adjuntar cuenta (Ale+Sergio/Brasil/Rafting)` (rama de sync, depende de timing incidental igual que el bug de hoy) queda como riesgo conocido sin resolver — podría fallar algún día si Meta responde más rápido que Supabase. No es parte de este plan, pero vale la pena una sesión aparte para blindarlo con un Merge también.
- No existe forma de cancelar una ejecución de n8n colgada vía las herramientas disponibles — si algo se traba de nuevo, la única salida es esperar (~5 min) o despublicar el workflow.
- Idealmente construir esto en un horario donde Cielo no esté mostrando la plataforma a nadie en simultáneo.
