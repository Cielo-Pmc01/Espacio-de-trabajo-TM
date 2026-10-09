# 15 — WhatsApp: plantillas, precios, webhooks, Embedded Signup · y mensajería de Instagram

✅ doc oficial leída el 2026-10-08 · ⚠️ re-verificar/no extraído · 🏢 cuenta real.
Índice oficial de WhatsApp (rutas bajo `developers.facebook.com/documentation/business-messaging/whatsapp/`): `templates/overview`, `templates/components`, `templates/template-categorization`, `templates/template-management`, `pricing`, `pricing/prepaid-billing`, `pricing/change-billing-currency`, `webhooks/overview`, `webhooks/override`, `webhooks/reference/<campo>`, `embedded-signup/overview`, `solution-providers/...`, `messages/send-messages`, `marketing-messages/...`, `calling/...`, `conversation-routing/...`, `catalogs/...`, `access-tokens`, `permissions`, `get-started`.

## Plantillas (message templates) ✅
- **Categorías:** `marketing`, `utility`, `authentication` (impactan el precio).
- **Estados:** `APPROVED`, `PENDING`, `REJECTED`, `PAUSED`, `DISABLED` (la UI también muestra "En revisión" y "Apelación solicitada").
- **Revisión:** automática al crear/editar; **hasta 24 h**.
- **Nombre:** solo **minúsculas, alfanuméricos y guiones bajos**, hasta 512 caracteres; se permiten nombres repetidos en otros idiomas.
- **Límites:** portafolio **no verificado → 250 plantillas por WABA**; verificado + display name aprobado → **6.000**; creación máx. **100 plantillas/hora**.
- **Crear:** `POST /{API_VERSION}/{WABA_ID}/message_templates` con `name`, `category`, `language`, `components`.
- **Enviar:** `POST /{API_VERSION}/{PHONE_NUMBER_ID}/messages` con `"type":"template"`.
- **Ventana de servicio:** los mensajes que **no** son plantilla solo pueden enviarse dentro de las 24 h desde el último mensaje del cliente (error `131047` si pasó); fuera de la ventana → plantilla aprobada. ⚠️ La página de plantillas no definió "24 h" explícitamente; está en la doc de errores y de precios.
- 🏢 Plantilla `saludo_inicial` (Utilidad, español) enviada a revisión para Rafting Patagonia.

## Precios ✅
- **Modelo vigente desde el 1-jul-2025: por mensaje de plantilla entregado** (reemplaza el modelo por conversación, ya deprecado). Se cobra solo cuando una plantilla se **entrega**, según categoría y país del destinatario.
- **Marketing:** siempre se cobra. **Utility y Authentication:** se cobran **fuera** de la ventana de servicio al cliente.
- **Gratis:** mensajes **no plantilla** dentro de la ventana de servicio de 24 h; plantillas *utility* dentro de esa ventana; y la **ventana de punto de entrada de 72 h** cuando el usuario inicia el chat desde un **anuncio Click-to-WhatsApp** (se puede enviar cualquier tipo de mensaje sin cargo).
- **Facturación:** se gestiona en Meta Business Suite (Facturación y pagos → *Cuentas de WhatsApp Business*). Hay páginas de **prepago** y de **cambio de moneda de facturación**. Monedas soportadas incluyen **ARS, BRL**, USD, EUR, etc.; desde 1-jul-2026 hay localización de facturación en BRL.
- ⚠️ Las **tarifas por país** (Argentina, Brasil) no figuran en la página leída: consultar la tabla de tarifas oficial antes de presupuestar.
- Error de pago al enviar: `131042` (revisar método de pago, línea de crédito, zona horaria, moneda).

## Webhooks de WhatsApp: campos a los que suscribirse ✅
Suscripción por **app** en App Dashboard → WhatsApp → Configuración (hay *override* de endpoint alternativo por WABA/número, sin procedimiento detallado en la página leída ⚠️).
| Campo | Notifica |
|---|---|
| `messages` | mensajes entrantes y **estados** de los enviados (sent/delivered/read/failed) |
| `account_alerts` | cambios de límite de mensajería, perfil y estado de Cuenta Oficial |
| `account_review_update` | revisión de la WABA contra políticas |
| `account_update` | cambios de la WABA (incl. verificación de negocio liderada por partner) |
| `business_capability_update` | cambios de capacidades de la WABA/portafolio (ej. de 2 a 20 números) |
| `message_template_status_update` | cambio de estado de una plantilla |
| `message_template_quality_update` | cambio de calidad de una plantilla |
| `message_template_components_update` | cambio de componentes |
| `template_category_update` | cambio de categoría |
| `phone_number_quality_update` | cambio del nivel de rendimiento (throughput) del número |
| `phone_number_name_update` | resultado de la verificación del nombre visible |
| `security` | cambios de seguridad del número |
| `user_preferences` | preferencias de marketing del usuario |
| `automatic_events` | compra o lead detectado en un chat |
| otros | `history`, `smb_app_state_sync`, `smb_message_echoes`, `partner_solutions`, `payment_configuration_update` |
**Recomendación 🧭:** además de `messages`, suscribirse a `phone_number_name_update`, `phone_number_quality_update`, `message_template_status_update`, `account_alerts` y `business_capability_update` para enterarse de nombres aprobados, caídas de calidad, plantillas rechazadas y cambios de límites **sin mirar la UI**. Reglas de verificación/firma/mTLS: ver `09`.

## Embedded Signup ✅ (parcial)
Interfaz de autenticación/autorización para que **clientes empresariales generen los activos** de WhatsApp (WABA, número verificado, plantillas/configuración, token intercambiable) dentro del sitio/portal de un **Tech Provider o Solution Partner**. Requiere App Review con acceso avanzado, permisos `whatsapp_business_management` y `whatsapp_business_messaging`, webhooks y método de pago según el tipo de partner. Límite: **10 clientes nuevos por 7 días (200 con verificación completa)**. ⚠️ La documentación se centra en proveedores que dan de alta a terceros; **no especifica el uso por un negocio propio**. 🏢 Para tus marcas el camino usado fue WhatsApp Manager + API (ver `14`), no Embedded Signup.

## Subir de nivel / escalar ✅
Límite de mensajería por **portafolio** (250 → 2.000 → 10.000 → 100.000 → ilimitado), compartido entre sus números; se sube con **Business Verification** o escalado con buena calidad. Números por WABA: 2 → 20 (verificación o 2.000). Detalle y UI en `14`.

---

## Instagram Messaging (API) ⚠️ (fuentes: resultados de búsqueda de la doc oficial; sin extracción completa)
Docs: `developers.facebook.com/documentation/business-messaging/instagram-messaging/...` (webhooks, features/private-replies) y `/docs/instagram-messaging/overview`.
- Disponible para cuentas **profesionales** (negocio o creador) conectadas a una **Página**.
- **Permisos:** `instagram_basic`, `instagram_manage_messages`, `pages_manage_metadata`.
- **Eventos de webhook:** `messages`, `message_reactions`, `messaging_postbacks`, `messaging_seen`, `messaging_referral`; para comentarios, `comments` y `live_comments`.
- **Ventana de respuesta:** 24 h desde el mensaje del usuario.
- **Private Replies:** responder por mensaje directo a quien **comentó** una publicación, usando el ID del comentario, **dentro de 7 días** del comentario (excepto Live).
- Aplica a tu proyecto "Automatizar Instagram DM" (🏢 memoria `project_automatizacion_instagram_dm`): diseñar con webhook→n8n→Chatwoot, respetando la ventana de 24 h y el límite de 7 días de Private Replies.
- ⚠️ Pendiente de verificar: App Review necesario por permiso, límites de envío, formato exacto de payloads, y si "Instagram API con Instagram Login" sustituye parte del flujo con Página.
