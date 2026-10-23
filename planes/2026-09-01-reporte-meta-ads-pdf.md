# Plan: Reporte Meta Ads como PDF prolijo (en vez de texto plano)

**Fecha:** 2026-09-01
**Estado:** Completado (2026-09-03)
**Proyecto:** MetaAds - Reporte Bajo Demanda (Área TM — Meta Ads)

## Contexto y Justificación

El workflow n8n **"MetaAds - Reporte Bajo Demanda"** (ID `Uo9iqt70pkvs9NOc`, activo en `n8n.iadventurecentersx.online`) ya funciona de punta a punta: un formulario web (`Formulario - Reporte`) pide un rango de fechas, trae métricas de Supabase (`metrics_daily`), cruza presupuestos en vivo de 4 cuentas de Meta Ads, y arma un reporte de texto con:
- Ranking de excursiones más consultadas (por mensajes)
- Ranking de campañas con mejor respuesta
- Detección automática de presupuesto mal aprovechado (dilución entre muchos anuncios)

Se arregló el 2026-08-31/09-01 (los nodos que consultaban campañas de Meta fallaban por ETIMEDOUT / `error_subcode:99` al pedir `campaigns.limit(500){...}` anidado sobre cuentas con muchas campañas viejas — se cambió a pedir el edge `/campaigns` directo filtrando `ACTIVE` server-side, más liviano y confiable).

El problema ahora es de **presentación**: el resultado se entrega como texto plano en la página de finalización del formulario (pensado originalmente como mensaje de WhatsApp). Como el reporte cruza datos de 8 marcas distintas (TP, BE, Adventure Center, CDR, PB, RV, TB, TB Brasil) y está pensado para compartirse con el equipo (Sergio, Alejandro), un bloque de texto con emojis no es lo suficientemente prolijo. Cielo pidió que se entregue como **PDF con tablas, colores y una identidad visual prolija**.

## Alcance

**Incluye:**
- Generar el mismo contenido (excursiones, campañas, presupuesto mal aprovechado) como HTML con diseño propio (identidad neutra del área TM, no atada a ninguna de las 14 marcas) y convertirlo a PDF.
- Levantar **Gotenberg** (motor de conversión HTML→PDF, self-hosteado, gratis) como servicio Docker nuevo en el mismo VPS donde corre n8n (vía Dokploy).
- Modificar el workflow para que la finalización del formulario entregue el PDF como descarga en vez de mostrar texto.

**NO incluye:**
- Datos de ventas/rentabilidad real (sigue bloqueado — la API pública de Pb2 no expone lectura de ventas, solo creación; el PDF va a mostrar la misma nota de "no disponible todavía" que hoy).
- Envío automático del PDF por WhatsApp/Chatwoot (por ahora sigue siendo on-demand vía formulario web; se puede evaluar como fase futura).
- Programar el reporte en un cron/horario fijo (sigue siendo bajo demanda).
- Cambios a la lógica de agregación de Supabase ni al matching de excursiones (ya funciona bien, no se toca).

## Arquitectura / Decisiones Técnicas

- **Motor HTML→PDF:** Gotenberg (imagen Docker oficial `gotenberg/gotenberg:8`), self-hosteado — sin costo, sin límite de uso, mismo VPS (`187.127.39.222`, gestionado por Dokploy) donde ya corren n8n y capacitacion-tm.
  - ⚠️ **Dependencia externa:** no tengo acceso SSH/API documentado a ese VPS/Dokploy (el acceso SSH que sí tengo guardado es al hosting Hostinger de los sitios WordPress, que es un servidor distinto). Levantar el servicio en Dokploy va a requerir que Cielo lo haga desde el dashboard (`dokploy.iadventurecentersx.online`) siguiendo los pasos que le voy a dar, o que me dé acceso equivalente.
  - Gotenberg no necesita dominio público — alcanza con que sea alcanzable desde el contenedor de n8n por red interna de Docker (mismo patrón que ya usan para otros servicios internos del stack).
- **Identidad visual:** diseño propio del área TM (no ligado a ninguna de las 14 marcas) — paleta simple de 1-2 colores + tipografía limpia, con tablas para los rankings y un bloque destacado (color de alerta) para "presupuesto mal aprovechado" cuando hay hallazgos.
- **Cambios en el workflow n8n:**
  1. Nodo `Armar Reporte` (Code): en vez de devolver `{ mensaje: texto }`, genera un string HTML completo (con `<style>` inline) usando los mismos datos ya calculados (excursiones, campañas, diluidas).
  2. Nodo nuevo `Generar PDF (Gotenberg)` (HTTP Request): `POST` a Gotenberg (`/forms/chromium/convert/html`) con el HTML como `multipart/form-data` (Gotenberg exige que el archivo se llame `index.html`), `response.format: file` para recibir el binario del PDF.
  3. Nodo `Completar - Reporte` (Form, completion): cambiar `respondWith` de `"text"` a `"returnBinary"`, apuntando al campo binario donde quedó el PDF (confirmado vía `get_node_types` que el nodo Form v2.5 soporta esta opción nativamente — no hace falta cambiar de nodo trigger).

## Tareas

- [x] 1. Cielo levantó el servicio Gotenberg en Dokploy — app "Gotenberg" en proyecto "Capacitacion" / entorno "production" (mismo que n8n), imagen `gotenberg/gotenberg:8`, sin dominio público. Corriendo (2026-09-01).
- [x] 2. Nombre del servicio interno confirmado: **`capacitacion-gotenberg-xkmoeg`**, puerto **3000**. URL usada desde n8n: `http://capacitacion-gotenberg-xkmoeg:3000`.
  - ⚠️ **Bloqueante real encontrado:** el contenedor de n8n (`n8n-tm-n8n-wqtcml-n8n-1`) NO estaba conectado a `dokploy-network` a nivel Docker, pese a que el toggle de la UI de Dokploy lo mostraba activado — ese cambio de red "toma efecto en el próximo deploy" y n8n nunca se había redesplegado desde que se agregó la opción. Diagnosticado con acceso SSH directo al VPS (`docker network inspect`/`docker inspect`) que Cielo dio expresamente para esto. Solucionado con `docker network connect dokploy-network n8n-tm-n8n-wqtcml-n8n-1` (conexión en caliente, sin reiniciar el contenedor, cero downtime). Confirmado con `dns.lookup` desde dentro del contenedor de n8n.
- [x] 3. Plantilla HTML/CSS diseñada — identidad neutra TM (paleta verde bosque/papel gris-verdoso, Fraunces + IBM Plex), aprobada por Cielo vía mockup en Artifact antes de implementar.
- [x] 4. Nodo `Armar Reporte` reescrito: genera el HTML completo con datos reales y lo devuelve como binario (`fileName: index.html`) en vez de `{ mensaje: texto }`.
- [x] 5. Nodo `Generar PDF (Gotenberg)` agregado (HTTP Request, multipart-form-data con `formBinaryData`, `responseFormat: file`) entre `Armar Reporte` y `Completar - Reporte`.
- [x] 6. `Completar - Reporte` cambiado a `respondWith: returnBinary` apuntando al binario del PDF.
- [x] 7. Probado con `execute_workflow` (form data real, 30/08/2026) — PDF generado correctamente, 107 kB, `mimeType: application/pdf`, ejecución en estado `waiting` (éxito para este patrón de formulario).
- [x] 8. PDF final (no el mockup) entregado a Cielo dos veces — sin objeción, sin aprobación textual explícita tampoco. Se lo considera aceptado en la práctica.
- [x] 9. `contexto/tm/proyectos/proyectos.md` actualizado.
- [x] 10. (agregado sobre la marcha) Filtro por marca en el formulario — dropdown con las 15 marcas reales de `metrics_daily`, probado con Turismo Bariloche / 2 semanas real.

## Criterio de Éxito

- Al completar el formulario con un rango de fechas real, se descarga un PDF (no se muestra texto plano) con: header, tabla de excursiones, tabla de campañas, bloque de presupuesto mal aprovechado (o mensaje de "ninguna detectada"), y nota de ventas pendientes — con diseño prolijo y datos correctos (verificados contra la versión de texto ya probada).
- Cielo aprueba el diseño visual.

## Notas / Riesgos

- **Bloqueante principal:** acceso a Dokploy para crear el servicio Gotenberg. Sin esto no se puede avanzar con las tareas 2 en adelante.
- Este es un cambio a un workflow que, si bien hoy es on-demand (no corre desatendido), sigue siendo producción real — aplica [[feedback-autorizacion-cambios-produccion]]: antes de publicar los cambios finales sobre el workflow activo, voy a confirmar con Cielo qué se va a cambiar antes de aplicarlo (ya se hizo para el fix de conectividad; se repite el mismo criterio acá).
- Si en algún momento el volumen de reportes creciera mucho o se quisiera generar PDFs desde otros workflows también, Gotenberg self-hosteado escala bien sin costo adicional (a diferencia de un servicio externo con límite gratis).
