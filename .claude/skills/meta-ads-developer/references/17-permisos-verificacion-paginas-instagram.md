# 17 — Permisos, Business Verification, Pages API e Instagram Platform

✅ doc oficial leída el 2026-10-08 · ⚠️ no extraído/re-verificar · 🏢 cuenta real. Las páginas de referencia resumidas por WebFetch pueden omitir datos: lo que diga "no documentado" significa **no verificado**, no inexistente.

## 1. Catálogo de permisos ✅ (`developers.facebook.com/docs/permissions`)
La columna "App Review" indica si el permiso **necesita App Review para Advanced Access** (uso con personas sin rol en la app). Con Standard Access y **solo usuarios con rol / cuentas propias** suele alcanzar sin review 🏢 (ver `06`).
| Permiso | Para qué | App Review |
|---|---|---|
| `ads_management` | crear campañas, gestionar anuncios y leer métricas por API | Sí |
| `ads_read` | Insights API y eventos web server-side | Sí |
| `business_management` | gestionar activos del negocio (ej. cuentas publicitarias) | Sí |
| `pages_show_list` | listar las Páginas que la persona administra | No |
| `pages_read_engagement` | leer contenido, seguidores y metadatos de Páginas | No |
| `pages_manage_ads` | crear anuncios para la Página | No |
| `pages_manage_metadata` | suscribirse a webhooks de la Página | No |
| `pages_manage_posts` | publicar post, foto o video en la Página | No |
| `pages_messaging` | confirmar interacciones con clientes (mensajería de Página) | Sí |
| `leads_retrieval` | leer todo lo capturado en formularios de Lead Ads | Sí |
| `instagram_basic` | metadatos básicos de la cuenta de Instagram Business | No |
| `instagram_content_publish` | crear y publicar posts en Instagram | Sí |
| `instagram_manage_comments` | leer, actualizar y borrar comentarios | No |
| `instagram_manage_insights` | metadatos, insights y insights de stories | No |
| `instagram_manage_messages` | mensajes directos de Instagram | Sí |
| `catalog_management` | soluciones de comercio / catálogos | Sí |
| `read_insights` | insights de la app y de Páginas de Facebook | No |
⚠️ **No aparecen en esa referencia** (están en la doc de WhatsApp): `whatsapp_business_management`, `whatsapp_business_messaging`, `whatsapp_business_manage_events` (este último exigido para CAPI de mensajería, ver `05`/`15`). Para Instagram con "Instagram Login" los nombres cambian a `instagram_business_*` (ver §4).
**Regla práctica 🧭:** pedir solo los permisos del flujo, pero Cielo decidió scope amplio por escala (`feedback_permisos_api_escala_futura`); documentar siempre cuáles se pidieron y por qué.

## 2. Business Verification (desarrolladores) ✅ parcial (`docs/development/release/business-verification`)
- **Necesaria** para apps que piden **acceso avanzado** a permisos y para apps que permiten **a otros negocios** acceder a sus propios datos. **Obligatoria desde el 1-feb-2023.**
- **Cómo iniciar (doc):** App Dashboard → **Configuración → Básica → Verificación**. (Otra vía, UI de portafolio 🏢: Centro de seguridad → "Verificación del negocio"; Turismo Patagonia mostró "No es necesario verificar tu organización", Rafting Adventure figura **Verificado** para TOUR CENTRAL S.A.S. desde 2026-10-07.)
- ⚠️ **No extraído:** documentos aceptados (la página remite al Centro de ayuda "About Business Verification"), estados intermedios (en revisión/rechazado), tiempos, y la relación con App Review/Access Verification. Verificar en la UI del caso antes de prometer plazos.
- Efecto observado 🏢: verificar el negocio de Rafting Adventure habilitó hasta 20 números por app y compartir WABAs con socios (ver `14`).

### 2b. Access Verification (verificación de acceso) ✅ (`docs/development/release/access-verification`)
- **Cuándo se exige:** cuando un negocio crea o reclama una app **que será usada por otros negocios** y solicita permisos como `ads_management`, `business_management`, `instagram_business_basic`, etc. (la página lista **34 permisos**).
- **Quién:** los **administradores del negocio** (si no está verificado) que reclamaron la app; reciben un correo cuando un admin de la app pide acceso avanzado.
- **Qué se evalúa:** cómo el negocio **usa los datos de otros negocios** para prestar servicios (si opera como **Tech Provider**).
- **Relación:** es **independiente de App Review**, pero **requiere Business Verification previa**.
- **Plazos:** decisión en ~**5 días**; negocios existentes tienen **60 días** antes de restricciones graduales.
- 🏢 Para apps que solo operan **cuentas propias** (como `Claude-AI`/`Rafting Mensajeria`) no aplica; sí aplicaría si algún día se ofrece la herramienta a clientes (escala a ~50 marcas de terceros).

### 2c. App Review — guía de envío ✅ (`docs/resp-plat-initiatives/individual-processes/app-review/submission-guide`)
- **Preparar:** (a) **descripción de uso por permiso** (qué hace, por qué se necesita, cómo se usan los datos, qué pasa sin él); (b) **screencast por cada permiso**: 1080p+, **en inglés**, cursor visible, sin audio, mostrando la concesión del permiso y el uso real; (c) **instrucciones/credenciales de prueba** sin datos personales (no usar tu cuenta personal); (d) **URL de política de privacidad**; (e) **ícono 1024×1024** sin marcas de Meta; (f) **categoría** de la app.
- **Pasos:** App Dashboard → **App Review → Permissions and Features** → cuestionarios de manejo de datos → ícono/privacidad/propósito/categoría/contacto → verificación de app → descripciones + screencast → **Submit for Review**.
- **Tiempo:** decisión **dentro de una semana**.
- **Requisitos previos:** **Business Verification** (tras elegir permisos); **Data Use Checkup** (hasta ~30 s); **llamadas API exitosas con cada permiso en los últimos 30 días**; app pública o con instrucciones; desarrollo terminado. Cambios de configuración tras enviar pueden forzar re-revisión.
- ⚠️ La página **no detalla** motivos de rechazo ni el reenvío: leer el motivo textual del rechazo en el Dashboard antes de reenviar.

## 3. Pages API ✅ parcial (`docs/pages-api`)
Permite **publicar** contenido, **leer** posts e insights, **moderar** comentarios, **recibir actualizaciones en tiempo real** (webhooks) y gestionar **mensajes**. Auth: **Page Access Token** (flujo OAuth: pedir permisos → código → token de usuario → token de Página).
| Acción | Permiso |
|---|---|
| Publicar | `pages_manage_posts` |
| Leer posts/insights | `pages_read_engagement` |
| Moderar comentarios | `pages_manage_engagement` |
| Enviar mensajes | `pages_messaging` |
| Configuración/webhooks | `pages_manage_metadata` |
| Crear anuncios | `pages_manage_ads` |
Endpoints base: `GET /{page-id}`, `POST /{page-id}/feed`, `GET /{page-id}/insights`, `GET /{page-id}/comments`, `GET /{page-id}/tagged`.
⚠️ **No verificado** en esa página: `GET /me/accounts` (clásico para obtener el token de cada Página), las **tareas de Página** (MANAGE, CREATE_CONTENT, MODERATE, ADVERTISE, ANALYZE) y el "nuevo modelo de Páginas". 🏢 El bloqueo de Rafting ("Anunciar" en 5 Páginas para el System User) es un problema de **tarea ADVERTISE sobre la Página**, no de permiso de API.

## 4. Instagram Platform ✅ parcial (`docs/instagram-platform`)
Dos caminos:
- **Instagram API con Instagram Login:** cuentas **Business o Creator**, **sin necesidad de Página de Facebook**; incluye mensajería (enviar/recibir DM entre negocios/creadores y usuarios).
- **Instagram API con Facebook Login:** la cuenta profesional debe estar **vinculada a una Página**; suma búsqueda de hashtags y métricas de otras cuentas.
Tipos de cuenta: Business y Creator (las personales no sirven). Otras capacidades: mensajería, compartir a Stories/Feed, *embed* de publicaciones.
⚠️ **No extraído:** nombres exactos de permisos de Instagram Login (`instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_messages` ⚠️ de memoria), endpoints de publicación (`POST /{ig-id}/media` → `/media_publish` ⚠️), **límites de publicación diarios**, requisitos de App Review e insights. Mensajería de Instagram: ver `15`.
**Aplicación 🧭 (Luciana/redes y "Automatizar Instagram DM"):** antes de diseñar publicación o DM automatizados, decidir **Instagram Login vs Facebook Login** (el segundo exige Página vinculada, que ya tenés en las marcas) y verificar permisos/límites en la doc de Instagram.

## 5. Business Management APIs ✅ parcial (`docs/business-management-apis`)
Cubren: **Business Manager** (permisos, campañas, cuentas), **System Users** (servidores que llaman a la API), **Business Asset Management** (relaciones negocio↔activos) y **Creative Asset Management** (carpetas de creatividades). ⚠️ **La página no lista** los endpoints de `owned_ad_accounts`/`client_ad_accounts`, `owned_pages`/`client_pages`, `owned_whatsapp_business_accounts`/`client_whatsapp_business_accounts`, partners/agencias, business users ni el permiso exigido (`business_management` en la referencia de permisos). **No inventar esos paths**: buscarlos en la referencia de cada objeto (`/docs/marketing-api/reference/business/...`) antes de usarlos. Lo verificado: `act_{ID}/assigned_users` (`03`) y generación de tokens de System User (`06`).

### 5b. Edges de Business Management verificados ✅
- `GET /{business_id}/owned_ad_accounts` → **no se puede leer** ("no puedes realizar esta operación en este extremo"); `POST` con `adaccount_id` **reclama/crea** la cuenta en el Business Manager (devuelve `access_status`).
- `GET /{business_id}/owned_whatsapp_business_accounts` ✅ → campos `id`, `name`, `timezone_id`, `message_template_namespace`; permisos `whatsapp_business_management`, `business_management`, `whatsapp_business_messaging`, `public_profile`. **Útil para inventariar las WABA propias de un portafolio** (listar sus IDs sin abrir la UI).
- ⚠️ `client_ad_accounts` (404 en esta pasada) y `client_whatsapp_business_accounts`/`owned_pages`/`client_pages`: **no verificados**; para "qué WABA/cuentas me compartieron" usar la UI (Business Settings → Cuentas de WhatsApp / Cuentas publicitarias) hasta confirmar el edge.

## 5c. Normas de publicidad (Ad Standards) ⚠️ parcial (`transparency.meta.com/policies/ad-standards/`)
Para turismo/excursiones aplican sobre todo: **relevancia** (todos los componentes del anuncio deben ser relevantes al producto) y **coincidencia con la landing page** (lo anunciado debe coincidir con lo que muestra la página de destino); contenido **sensacionalista o excesivamente violento** (cuidado con experiencias "extremas"); **privacidad** (no pedir información privada); **prácticas comerciales prohibidas** y **desinformación**; salud/bienestar y productos peligrosos como categorías restringidas. **Apelación:** pedir revisión de la decisión en **Calidad de la cuenta / Inicio de ayuda para empresas** (ver `13`). ⚠️ No se leyó nada específico sobre texto en imagen, antes/después, atributos personales ni parámetros de URL: **verificar la norma exacta** antes de afirmar por qué se rechazó un anuncio.

## 6. Ad Library API — ⚠️
`docs/ad-library-api/` devolvió 404 en esta pasada. No documentado todavía; la Biblioteca de Anuncios en la UI sí existe (🏢 la verificación de identidad puede hacer pública la información del anunciante, ver `13`).

## Pendiente de leer (siguiente tanda)
Referencia completa de Insights (`date_preset`, `time_increment`, ventanas de atribución), referencia de `business`/partners, App Review (guía operativa), Access Verification, CAPI offline, AEM/dominio, Commerce Platform, políticas de publicidad (contenido rechazado).
