# 03 — Permisos, roles y System Users

## Dos capas de permiso (no confundir) ✅ lógica
1. **Rol en el Business:** Admin (control total) vs Empleado (acceso solo a lo asignado).
2. **Acceso por asset:** a cada persona/System User se le asigna cada asset con un nivel (ej. en cuentas publicitarias: Administrar cuenta / Anunciante / Analista; en Páginas: control total / tareas específicas) ⚠️ [RE-VERIFICAR nombres de roles actuales en la UI: Admin, Advertiser, Analyst, Finance Editor/Analyst].
Ser Admin del Business no siempre implica acceso operativo a todos los assets en la práctica de la UI; verificarlo asset por asset.

## System Users ✅ (doc oficial)
- **System Admin User:** puede crear otros System Users, ad accounts y asignar permisos. Protegerlo.
- **System User (regular):** solo accede a assets con permiso explícito. Recomendado para la mayoría de las automatizaciones.
- Límites por Business: Standard Access → 1 + 1 admin; Advanced → 10 + 1 admin.
- Para generar token: app con acceso estándar a Marketing API, System User con permisos sobre los assets y **la app asignada al System User** (mínimo "Administrar app").
- No se mueven entre portafolios 🏢 (ver `06`).

## Leer/asignar qué tareas tiene un usuario sobre una cuenta publicitaria ✅ (doc oficial, 2026-10-08)
- **Leer:** `GET /{API_VERSION}/act_{AD_ACCOUNT_ID}/assigned_users?business={BUSINESS_ID}&fields=tasks,permitted_tasks`. El parámetro **`business` es obligatorio**. La doc menciona los campos `tasks` ("todos los roles/tareas desempaquetados de ese usuario") y `permitted_tasks` ("tareas asignables"); **no documenta explícitamente `id`/`name`** → si `fields=id,name,tasks` da error `#100`, quitar el campo.
- **Asignar (escritura, solo con OK de Cielo):** `POST /act_{AD_ACCOUNT_ID}/assigned_users` con `user` (id de usuario de negocio **o de System User**) y `tasks` (array). Valores de `tasks` documentados: **`MANAGE`, `ADVERTISE`, `ANALYZE`, `DRAFT`, `AA_ANALYZE`**. Errores listados: 100, 200, 2620.
- **Interpretación para el error (#200):** crear/editar campañas requiere una tarea de escritura (típicamente `ADVERTISE` o `MANAGE`); `ANALYZE`/`AA_ANALYZE` solo lee → los GET andan y los POST dan #200.
- ⚠️ **No verificados** (la página dio 404 o no se leyó): `GET /{SYSTEM_USER_ID}/assigned_ad_accounts`, `GET /me/assigned_applications`, y edges equivalentes para Páginas. Alternativa verificada en la UI: Business Settings → Usuarios del sistema → (usuario) → *Activos asignados* / *Apps instaladas* (`/latest/settings/system_users`).

## Matriz "no tengo acceso" (3 variantes) — ver árbol F en `12`
| Dónde falla | Pregunta |
|---|---|
| Persona ↔ Business | ¿Estoy en Personas del portafolio? ¿Con qué rol? |
| Persona ↔ asset | ¿La cuenta/Página está asignada a mi usuario? |
| Token/System User ↔ asset | ¿Asset asignado al System User? ¿App asignada? ¿Scope del token incluye el permiso? |

## Permisos de API (scopes) ✅/🏢
`ads_management` (leer+gestionar anuncios) · `ads_read` (solo lectura de reportes) · `business_management` (APIs de Business Manager, usuarios, páginas) ✅. Otros usados 🏢: `pages_manage_ads`, `pages_read_engagement`, `pages_show_list`, `catalog_management`, `whatsapp_business_management`, `whatsapp_business_messaging`. Para CAPI WhatsApp ✅: `whatsapp_business_manage_events`.
**Principio de mínimo privilegio vs decisión de Cielo:** técnicamente se recomienda scope mínimo; Cielo eligió scope amplio por escala (50 marcas). Anotar el riesgo al recomendar, no imponer.

## Seguridad de tokens
No pedir ni mostrar tokens completos. Rotación: regenerar token del System User invalida el anterior → actualizar credenciales de n8n y `.env` en el mismo momento. Un token en `.env` o en n8n nunca va a git.

## Resolver sin romper nada
Antes de cambiar permisos en un portafolio de producción: confirmar con Cielo (autorización previa en producción — `feedback_autorizacion_cambios_produccion`), anotar estado actual (captura) para poder revertir.
