# Plan: Sincronización automática de precios y horarios (Docs 3/4 → Capacitación TM)

**Fecha:** 2026-07-27
**Estado:** Pendiente
**Proyecto:** capacitacion-tm (`salidas/capacitacion-tm/`)

## Contexto y Justificación

Cielo mantiene dos Google Docs como fuente de verdad de precios/horarios de excursiones:
- **Doc 3** — "3-❄️🏔️ EXCURSIONES INVIERNO 08/07" (id `1XsOAYYxMOvnKSTfTUKBB23vFnccIf5cmfAIUNTXECHY`)
- **Doc 4** — "4- 🌄🏔️ EXCURSIONES TODO EL AÑO 08/07" (id `1oR2zsKXRS0Zzs6nXLEf86II2_2nTZWdsPjgr9ypTFs0`)

Hoy, cuando cambia un precio en esos docs, alguien tiene que actualizarlo a mano en la plataforma de capacitación (`capacitacion-tm`), donde el equipo de ventas lo consulta. Cielo pidió que la plataforma se actualice sola cada vez que ella edite un precio u horario ahí, que las excursiones que se pausan (marcadas en gris en el doc) dejen de aparecer, y que las excursiones nuevas se agreguen solas — todo sin intervención manual.

## Hallazgo de arquitectura (verificado en código y en la base real de Supabase)

Una primera hipótesis basada en memoria de sesiones de mayo 2026 (catálogo = texto libre parseado de Tiptap en cada render, `app/lib/parse-excursions.ts`) resultó **desactualizada**. La arquitectura real, confirmada consultando directamente `capacitacion_tm.lessons` en el proyecto Supabase `mrovdtkeckxgknkoeqva`, es otra y es mucho más favorable para este plan:

- `content_json.excursions` — **array JSON plano** de objetos `Excursion` (título, categoría, proveedor, `duration` = horario, `prices` = string[], incluye/no incluye, etc.). Esta es la fuente de verdad real, no texto rico.
- `content_json.tiptap` — vista derivada, regenerada automáticamente desde `.excursions` vía `buildTiptapFromExcursions()` (`app/lib/catalog-builder.ts`) cada vez que algo cambia. Nunca se edita el Tiptap a mano.
- Exactamente **2 lecciones** con `lesson_type = 'excursion'`, una por documento maestro:
  - `b2c9bdae-e2b2-48c8-b686-12f9fdc2c522` — "Excursiones de Invierno 2026" ↔ **Doc 3**
  - `0304006d-d656-459d-84e0-a651d619ad44` — "Catálogo de excursiones — Todo el año" ↔ **Doc 4**
- **Ya existe un mecanismo probado en producción** para crear/actualizar excursiones programáticamente: `app/routes/api.admin-chat.tsx` (herramientas `create_excursion` / `update_excursion` de un chat admin con IA) hace `buscar por título normalizado → mutar el objeto en el array → buildTiptapFromExcursions() → guardar content_json`. Este plan **reusa esa misma lógica**, extraída a una función compartida, en vez de escribir una nueva.
- Consecuencia práctica: **no hace falta ninguna tabla nueva en Supabase.** Actualizar precio/horario/estado es mutar campos de un objeto JSON plano ya existente — nada de generar o parsear rich text a mano, mucho menos riesgo que la idea original de este plan.
- Campo que sí falta y hay que agregar al tipo `Excursion`: `activo?: boolean` (default `true` si no está presente) — hoy no existe ningún concepto de "excursión pausada".
- Nota aparte: la ruta standalone `app/routes/catalogo.excursiones.tsx` todavía lee del `.tiptap` viejo vía `parseExcursionContent` — parece código legacy no migrado a `.excursions`. Se corrige de paso en la tarea 4 para que use la misma fuente que el resto de la plataforma.

## Alcance

**Incluye:**
- Agregar `activo?: boolean` al tipo `Excursion` y contemplarlo en `buildTiptapFromExcursions`/`newExcursion`.
- Extraer la lógica de `create_excursion`/`update_excursion` de `api.admin-chat.tsx` a `app/lib/excursion-catalog.server.ts` (funciones `findExcursionByTitle`, `upsertExcursion`), reusada por el chat admin (refactor sin cambiar su comportamiento) y por el nuevo endpoint de sync.
- Nuevo resource route interno `app/routes/api.sync-excursion.tsx`: recibe `{ lessonId, title, fields }` (update) o `{ lessonId, excursion }` (create), protegido con un secreto compartido simple (header `X-Sync-Secret` contra una env var), pensado para que lo llame n8n servidor-a-servidor, no un usuario.
- **Ocultamiento automático de excursiones pausadas** (requisito de negocio explícito de Cielo): el parser detecta el título en gris en el Doc 3/4 (= "se dejó de vender") → se setea `activo: false` en esa excursión vía el endpoint de sync → `ExcursionsViewer` y cualquier otro listado (agencia, buscador) filtra `activo !== false`, dejando de mostrarla hasta que vuelva a estar en negro/rojo.
- **Alta automática de excursiones nuevas, siempre en borrador** (agregado por pedido de Cielo, refinado el 2026-07-27): si el parser encuentra un título del doc que no matchea ninguna excursión existente, arma un objeto `Excursion` (título, categoría, `duration`, `prices`, incluye/no incluye si el doc los trae) y lo agrega vía el endpoint de sync (create) — **siempre con `activo: false`**, sin importar el color de fuente en el doc. Queda oculta de todos los listados hasta que alguien complete manualmente el resto del contenido (itinerario, incluye/no incluye, proveedor) y la reactive desde el editor admin. Solo las excursiones ya existentes (update) respetan el gris/negro del doc para pausar/reactivar.
- Workflow n8n de sync:
  1. Registra un canal de notificaciones push de Google Drive (`files.watch`) sobre Doc 3 y Doc 4.
  2. Recibe la notificación (solo un ping, sin contenido) y vuelve a pedir el doc completo vía Docs API (mismo mecanismo "Google APIs Proxy (OAuth)" ya construido y probado esta sesión).
  3. Parsea títulos en negrita + líneas de precio (💰Efectivo/💳Tarjeta) + horario + color de fuente (rojo/negro=activo, gris=inactivo) — mismo parser Python validado esta sesión, portado a un Code node de n8n.
  4. Para cada excursión parseada: llama a `api.sync-excursion` (update si matchea por título contra las excursiones ya cargadas, create si no matchea ninguna).
  5. Trigger adicional (Schedule cada 6 días) que renueva el canal antes de que expire (~7 días máx).
- Verificación de dominio en Google Search Console para el dominio del webhook de n8n (requisito de Google para `files.watch`).

**No incluye (fuera de alcance de este plan):**
- Cambiar contenido de una excursión YA EXISTENTE más allá de precio/horario/estado activo.
- Tocar el Google Sheet de auditoría ("Catálogo Real vs. Webs") — fuente distinta, ya resuelta en sesiones anteriores.
- UI de administración dedicada para ver el historial de syncs (se puede agregar después si hace falta).

## Arquitectura / Decisiones Técnicas

- **Detección de cambios:** Google Drive Push Notifications (`files.watch`), no polling — decisión explícita de Cielo. Requiere dominio verificado en Google Search Console, y un canal con expiración ~7 días que hay que renovar (workflow aparte). La notificación en sí no trae contenido, solo avisa que algo cambió.
- **Almacenamiento:** ninguna tabla nueva — se muta `content_json.excursions` de las 2 lecciones existentes, reusando el patrón ya probado de `api.admin-chat.tsx`.
- **Matching:** normalizar título (acentos/mayúsculas/símbolos, mismo criterio que `normalizeTitle()` en `api.admin-chat.tsx`) y comparar contra los títulos ya cargados en `content_json.excursions` de la lección correspondiente. Si no hay match exacto, intentar el matching por palabras significativas de `excursion-route-match.ts` (ya probado en producción para rutas) antes de concluir "es nueva".
- **Parser del doc:** portar la lógica Python ya validada esta sesión (títulos en negrita, color de fuente activo/inactivo, líneas de precio/horario) a JavaScript en un Code node de n8n.
- **Ocultamiento por estado:** `activo: false` es la señal para filtrar esa excursión de todo listado (`ExcursionsViewer`, `_agencia._index`, `_alumno-buscar`) — no se borra nada, solo se excluye de la vista mientras dure. Si vuelve a estar activa en el doc, `activo` vuelve a `true` y reaparece sola.
- **Alta de excursión nueva:** el endpoint de sync arma el objeto `Excursion` con los campos que el doc trae (varios ya coinciden 1:1 con las secciones que el doc suele tener: Recorrido→experience, Incluye→includes, No incluye→notIncludes) y usa `newExcursion()` como base para no olvidar ningún campo requerido por el tipo.
- **Seguridad del endpoint interno:** `api.sync-excursion` no es público — valida un secreto compartido en cada request, solo n8n lo conoce.

## Tareas

- [x] 1. Verificar el dominio de n8n en Google Search Console (Cielo, en paralelo — no bloquea las tareas 2 a 5).
- [x] 2. Agregar `activo?: boolean` a `Excursion` (`types-excursion.ts`), a `newExcursion()` (default `true`) y a `buildTiptapFromExcursions()` (si `activo === false`, no incluirla en el doc derivado tampoco).
- [x] 3. Crear `app/lib/excursion-catalog.server.ts` extrayendo `findExcursionByTitle`/`upsertExcursion`/`createExcursion` desde la lógica ya existente en `api.admin-chat.tsx`; refactorizar `api.admin-chat.tsx` para usarlas (sin cambiar su comportamiento observable).
- [x] 4. Crear `app/routes/api.sync-excursion.tsx` (valida `X-Sync-Secret`, llama a las funciones de la tarea 3) y migrar `catalogo.excursiones.tsx` para leer de `.excursions` en vez de `.tiptap`/`parseExcursionContent` (consistencia con el resto de la plataforma).
- [x] 5. Filtrar `activo !== false` en `ExcursionsViewer`/loaders que listan excursiones (lesson viewer, `_agencia._index`, `_alumno-buscar`, `catalogo.excursiones.tsx`).
- [ ] 6. Workflow n8n "Sync Precios Docs → Capacitación TM": `files.watch`, webhook receptor, Code node parser (portado del Python de esta sesión), llamadas a `api.sync-excursion` por cada excursión parseada.
- [ ] 7. Workflow n8n secundario (Schedule cada 6 días) que renueva el canal de `files.watch`.
- [ ] 8. Seed inicial: correr el parser una vez manualmente contra los Doc 3/4 actuales y llamar a `api.sync-excursion` para las 47 excursiones con SKU conocido, sin esperar al primer cambio real.
- [ ] 9. Prueba end-to-end: editar un precio real en el Doc 3, confirmar que llega la notificación, se re-parsea, y el precio nuevo aparece en la plataforma sin deploy ni intervención manual. Probar también el caso "excursión pausada" (desaparece) y "excursión nueva" (aparece).
- [ ] 10. Documentar en memoria el mecanismo final (`project_auditoria_catalogo_webs.md` o nueva memoria de capacitacion-tm) y sus gotchas.

## Criterio de Éxito

- Editar un precio o horario en el Doc 3 o Doc 4 se refleja en la plataforma sin ninguna acción manual, en un tiempo razonable (segundos a pocos minutos).
- Si el canal de Drive expira o falla, el workflow de renovación lo restaura solo antes de perder la detección.
- Ninguna excursión existente pierde su contenido de descripción/itinerario — el sync solo toca precio/horario/estado.
- Si una excursión no tiene match claro, no rompe nada — el endpoint decide create vs update de forma segura y explícita, nunca sobreescribe la excursión equivocada.
- Una excursión marcada en gris **desaparece** de todos los listados en el siguiente sync, y **reaparece sola** si vuelve a estar activa.
- Una excursión completamente nueva **aparece publicada** sin intervención manual.

## Notas / Riesgos

- **Verificación de dominio en Search Console** es un paso manual de Cielo — no lo puedo hacer yo, hay que coordinarlo (no bloquea el resto del código).
- **Vencimiento del canal (~7 días):** si la renovación falla silenciosamente, la sync se detiene sin aviso — conviene una alerta si el canal no se renovó en N días (a definir en la implementación).
- **Matching por nombre** puede fallar si Cielo renombra una excursión en el doc sin avisar — mismo riesgo ya aceptado hoy con `excursion_routes`, mismo mecanismo de overrides manuales como red de seguridad si hace falta.
- **No confundir "inactivo" con "sin referencia":** solo el gris confirmado (existe en el doc, marcado en gris) setea `activo: false`. Que una excursión ya cargada en la plataforma simplemente no aparezca mencionada en el doc NO debe tocar su estado — puede estar ahí por otro motivo.
- **Riesgo mitigado (2026-07-27):** originalmente el plan publicaba excursiones nuevas directo, sin revisión — Cielo pidió después que toda excursión nueva entre siempre en borrador (`activo: false`, oculta de todos los listados) hasta que alguien la complete a mano desde el editor admin y la reactive. Un parseo imperfecto ya no puede exponer una excursión a medio terminar al equipo de ventas. El endpoint sigue usando `newExcursion()` como base para que ningún campo requerido quede sin default.
- Este plan asume que la lista de ~50 excursiones conocidas (documentada en `project_auditoria_catalogo_webs.md`) sigue siendo el universo de referencia para el matching inicial.
