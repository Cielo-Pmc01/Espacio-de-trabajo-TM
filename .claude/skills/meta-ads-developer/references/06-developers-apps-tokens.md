# 06 — Meta for Developers: Apps, tokens, App Review

## Distinciones críticas ✅
```
Acceso al Business  ≠  Acceso a la App  ≠  User Access Token  ≠  System User Access Token
```
Un token solo puede hacer lo que cumpla **a la vez**: (1) permisos (scopes) del token, (2) nivel de acceso de la app a esos permisos, (3) assets asignados al usuario/System User, (4) la app asignada como asset al System User.

## Tipos de token ✅
| Tipo | Uso | Duración |
|---|---|---|
| User | acciones de una persona logueada | short-lived ~1–2 h; long-lived ~60 días |
| App | server-to-server de configuración de la app | no vence mientras el secret sea válido |
| Page | leer/escribir una Página | se obtiene canjeando token de usuario |
| Client | apps nativas, `{app-id}|{client-token}` | — |
| **System User** | automatizaciones sin intervención humana | puede ser **no expirable** ("Nunca") o 60 días, según se elija al generarlo 🏢 |

## Niveles de acceso ✅
- **Standard Access:** aprobación automática para apps de negocio; sirve para flujos propios.
- **Advanced Access:** requiere **App Review**; necesario para datos sensibles o gestionar cuentas de **terceros**.
- **Marketing API Access Tier:** *Limited* (default, solo desarrollo, 1 System User) vs *Full* (tras review; requiere ≥ **500 llamadas exitosas en 15 días** y tasa de error < **15%**; 10 System Users) ✅.
- Límites de System Users por Business: Standard → 1 System User + 1 Admin System User; Advanced → 10 + 1 ✅.

## Nota de precisión (contradicción aparente) 🏢
La doc de System Users dice que para generar el token la app debe haber "pasado revisión y verificación del negocio". En la cuenta real de Cielo se generó un token con la app `Claude-AI` (caso de uso "Crear y administrar anuncios con la API de marketing") **sin App Review**, sobre cuentas propias (2026-09-24). Conclusión práctica: para **cuentas propias del mismo Business**, Standard Access alcanzó. Para cuentas de terceros/clientes: esperar App Review + Business Verification. ⚠️ [RE-VERIFICAR] si cambia el escenario.

## Crear System User + token (UI) — pasos ⚠️ [verificar contra pantalla actual]
1. Business Settings (del portafolio dueño de los assets) → Usuarios → **Usuarios del sistema** → Agregar → nombre + rol (**Admin** = acceso a todos los assets; **Employee** = asignar assets uno a uno).
2. **Asignar activos**: Apps (mínimo "Administrar app"), Cuentas publicitarias, Páginas, Instagram, WhatsApp, Datasets/Pixels, Catálogos, con el nivel de control necesario.
3. **Generar token** → elegir la App → expiración (**Nunca** para automatización) → permisos.
4. Guardar el token en la credencial de n8n/secret manager; no se vuelve a mostrar.
Permisos típicos de marketing: `ads_management`, `ads_read`, `business_management`, `pages_manage_ads`, `pages_read_engagement`, `pages_show_list`, `catalog_management`, `whatsapp_business_management`, `whatsapp_business_messaging` 🏢 (ver `feedback_permisos_api_escala_futura`: Cielo prefiere scope amplio por escala futura).

## Generar token de System User por API ✅ (doc oficial)
- Instalar la app al System User: `POST /{API_VERSION}/{SYSTEM_USER_ID}/applications` con `business_app={APP_ID}` y token de admin/System User.
- Generar token: `POST /{API_VERSION}/{SYSTEM_USER_ID}/access_tokens` con `business_app`, `appsecret_proof` (HMAC-SHA256 del token con el App Secret), `scope` (permisos separados por coma, ej. `ads_management,pages_read_engagement`) y `set_token_expires_in_60_days` (booleano).
- Duración: la documentación presenta como práctica **recomendada** el token de **60 días**; el token **sin vencimiento** figura como mayor riesgo/uso legado. 🏢 Cielo eligió "Nunca" por la UI; si un token "se vence" misteriosamente, revisar cuál se generó.
- Por UI: Business Settings → Usuarios del sistema → seleccionar usuario → **Generar token**; el token **no se vuelve a mostrar** ✅. Permisos mínimos citados por la doc: `ads_management`, `business_management`, `catalog_management`.
- ⚠️ Asignación de assets por API (`POST /{asset_id}/assigned_users` con `user` y `tasks`): no verificado.

## Webhooks y verificación de firma ✅
Ver `09-whatsapp-instagram-catalogos-leads.md` (verificación `hub.challenge`, `X-Hub-Signature-256`, reintentos 36 h, mTLS de WhatsApp).

## App Review ✅ (parcial)
Se necesita si la app será usada por personas **sin rol en la app** ni en un Business que la reclamó. Los permisos no aprobados solo pueden pedirse a usuarios con rol en la app. ⚠️ Requisitos detallados (screencast, instrucciones de prueba, privacidad, Business Verification), tiempos y motivos de rechazo: no verificados.

## Un System User NO se mueve entre portafolios 🏢
Pertenece al Business que lo creó. Si la cuenta publicitaria migra a otro portafolio, el System User viejo pierde el acceso → crear uno nuevo en el portafolio destino **y** una App del portafolio destino (el selector de apps al generar token solo muestra apps del portafolio donde estás parado).

## Inspeccionar un token: /debug_token ✅
`GET /debug_token?input_token={TOKEN_A_INSPECCIONAR}&access_token={APP_TOKEN_o_TOKEN_DEV}`
Campos: `app_id`, `application`, `type`, `is_valid`, `expires_at` (0 = no expira), `data_access_expires_at`, `user_id`, `profile_id`, `scopes`, `granular_scopes` (permisos con los IDs de assets concretos), `issued_at`, `error`.
Uso diagnóstico: `is_valid=false` → token muerto (error 190); faltan permisos en `scopes` → #200/#10; el asset objetivo no aparece en `granular_scopes` → asset no asignado.

## App modes ⚠️ [RE-VERIFICAR]
*Development*: solo usuarios con rol en la app (admins/developers/testers) pueden usar permisos avanzados y recibir datos reales. *Live*: la app sirve a cualquier usuario, sujeto a permisos aprobados. Webhooks de producción y OAuth con usuarios externos requieren *Live*.

## App Review / permisos rechazados ⚠️ [RE-VERIFICAR]
Se pide por permiso/feature en App Dashboard → App Review. Causas comunes de rechazo: casos de uso poco claros, screencast que no muestra el flujo completo, política de privacidad ausente, Business Verification pendiente. Siempre leer el motivo textual del rechazo antes de reenviar.

## Webhooks y OAuth ⚠️ [Tanda 3 — verificar]
Pendiente de documentar en profundidad (Webhooks de Pages/WhatsApp/Leadgen, verificación `hub.challenge`, firma `X-Hub-Signature-256`).
