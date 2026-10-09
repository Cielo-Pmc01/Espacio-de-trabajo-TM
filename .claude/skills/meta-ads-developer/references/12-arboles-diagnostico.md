# 12 — Árboles de diagnóstico

Formato: cada nodo = pregunta → cómo verificar → resultado esperado → si no, siguiente rama. Nunca saltar a "reinstalá el plugin".

## A. "Las compras aparecen en WooCommerce pero no en Meta"
0. **Antes de culpar al tracking: ¿hay compras reales en el período?** Comparar la fecha de la última orden en WooCommerce (`wp_<blog>_posts`/HPOS por SSH, o el panel) con la fecha de la última recepción de `Purchase` en Events Manager y con el gasto/clics por día (Windsor). Si las tres series se cortan el mismo día mientras los anuncios siguen gastando, el problema es **aguas arriba** (sitio/checkout/pasarela/píxel que no carga), no "Purchase no llega". 🏢 Caso TB 2026-10-08: ver `99-contexto-adventure-center.md`.
0b. **¿Quién sirve HOY el sitio?** No asumir WordPress. `curl -sI -L -A "<UA móvil>" https://<dominio>/` y mirar `X-Powered-By`/`Server`/`Via`; buscar en el HTML `wp-content`/`wp-includes` (WordPress) o `/_next/static` (Next.js). Si el front cambió (migración, rediseño, headless), **los plugins de tracking de WordPress ya no corren**: el Pixel/CAPI hay que reinstalarlo en el nuevo front. Luego listar qué carga el HTML (`fbq`, `fbevents.js`, GTM id) y qué eventos empuja al `dataLayer`. 🏢 Caso TB 2026-10-08: el sitio pasó a Next.js ~14/9 y el Pixel desapareció de todo el embudo.
1. **¿Existe el Pixel/Dataset correcto?** Events Manager → Orígenes de datos. ¿ID coincide con el de la web? (puede haber varios por marca/portafolio).
2. **¿Pertenece al Business correcto y está conectado al Ad Account** que optimiza? (Events Manager → dataset → Configuración → Cuentas publicitarias).
3. **¿Se dispara Purchase en el navegador?** Meta Pixel Helper / Test Events con la URL de la web; completar una compra de prueba. Esperado: `Purchase` en Test Events.
4. **¿Llega a Events Manager?** Pestaña Resumen/Diagnóstico (demora hasta ~20 min).
5. **¿Por browser, servidor o ambos?** Columna "Fuente/Método" en Events Manager.
6. **¿Tiene `event_id`?** En detalle del evento. Sin ID en ambos lados → duplicados o sin dedup.
7. **¿Hay deduplicación?** Mismo `event_id` + mismo `event_name` en ambos canales, dentro de 48 h.
8. **¿Llega `value`?** Detalle del evento; `value` numérico distinto de 0.
9. **¿Llega `currency=ARS`** (o BRL en Brasil)? Moneda incorrecta o ausente rompe valor/ROAS.
10. **¿Errores de matching / EMQ bajo?** Faltan `em`, `ph`, `fbp`, `fbc`, `client_ip_address`, `client_user_agent`.
11. **¿Dominio verificado y AEM configurado?** Business Settings → Seguridad de la marca → Dominios. Sin dominio verificado ciertos eventos se limitan ⚠️ [RE-VERIFICAR].
12. **¿La campaña optimiza para ese evento?** Ad set → Ubicación de conversión + Evento de conversión = Purchase y el pixel correcto.
Aislar causa: ¿no se dispara (frontend/plugin)? ¿se dispara pero no llega (consentimiento/bloqueadores/CAPI)? ¿llega pero sin valor (datos)? ¿llega pero no se atribuye (configuración de campaña)?
🏢 Caso real TB: evento purchase **sí** manda valor correcto (confirmado 09-14); falta confirmar duplicación GTM vs Site Kit; Mercado Pago como referral se excluyó. Ver `project_ga4_valor_compra_tb`.

## B. "Eventos duplicados"
1. Events Manager: ¿mismo evento ×2 desde "Browser" y "Server"? → falta/inconsistencia de `event_id` o `event_name`.
2. ¿Dos implementaciones de browser (GTM + Site Kit + plugin)? Pixel Helper muestra el Pixel ID repetido.
3. ¿Se envía CAPI y además un plugin lo envía también? Un solo emisor por evento.
4. ¿`event_id` generado distinto en browser y servidor? Usar el `order_id`.
5. Reenvío por reintentos de n8n: dedupe por `event_id` también ayuda dentro de 48 h.

## C. Error 190 / "Invalid OAuth access token"
1. Subcódigo (463/467/460…). 2. `/debug_token`: `is_valid`, `expires_at`. 3. ¿Token de usuario (60 días) en una automatización? → migrar a System User. 4. ¿El usuario cambió contraseña/checkpoint? 5. ¿Alguien regeneró/revocó el token del System User? 6. ¿La credencial de n8n tiene el valor viejo? 🏢 Ver `reference_n8n_credenciales_oauth_vencen`.

## D. "(#200) Permissions error" / "(#100) Unsupported post request"
1. ¿El **ID** es el correcto (act_ vs número, Page vs Page-Token)?
2. `/debug_token` → `scopes` y `granular_scopes`: ¿está el permiso? ¿está **ese asset** listado?
3. Business Settings → Usuario del sistema → Activos: ¿el Ad Account/Page/Dataset está asignado con control suficiente?
4. ¿La **App** está asignada al System User como asset?
5. ¿El asset pertenece al mismo Business que el System User? (los System Users no cruzan portafolios).
6. ¿Falta Advanced Access / App Review para ese permiso?
7. Probar GET simple del mismo ID: si GET falla → visibilidad; si GET ok y POST falla → control/permiso de escritura.

## E. "Funciona para mí pero no desde n8n"
Comparar: token usado (¿es el mismo?), usuario vs System User, asset assignment, permisos del token, App, Business, Ad Account, endpoint, **versión de API**, IP/credencial equivocada en el nodo (n8n comparte credenciales entre cuentas 🏢: Sergio ADC y Ale Sopran comparten una).

## F. Tres variantes de "no tengo acceso" ✅ lógica
| Síntoma | Nivel | Qué verificar |
|---|---|---|
| No veo el portafolio | usuario ↔ Business | invitación/rol en Business Settings → Personas |
| Veo el portafolio pero no la cuenta publicitaria | usuario ↔ asset | asignación de la cuenta a mi usuario (Personas → Activos) |
| Yo sí, pero la App/System User no | token ↔ asset | asset asignado al System User + app asignada + permisos del token |
Una pregunta clave por nivel; no avanzar al siguiente sin confirmar el anterior.

## G. "No puedo agregar tarjeta / pago rechazado" (esqueleto — se completa en Tanda 2)
No asumir tarjeta mala. Revisar: estado del Ad Account (`account_status`), país/moneda de la cuenta, permisos (¿tengo rol financiero?), deuda pendiente, restricción activa, método de pago en el portafolio vs cuenta. ⚠️ Pasos exactos de UI pendientes de verificar con captura/navegador.

## H. Conversión WhatsApp → Meta (esqueleto — Tanda 3)
Anuncio CTWA → webhook WABA trae `referral.ctwa_clid` → guardar en Supabase/Chatwoot → venta/reserva → n8n arma CAPI `business_messaging` con `ctwa_clid` + WABA ID → Test Events. Puntos de falla: referral no persistido en Chatwoot 🏢, WABA no conectada al dataset, permisos `whatsapp_business_manage_events`.
