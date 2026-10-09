# 13 — Restricciones, calidad de cuenta y seguridad

✅ UI real 2026-10-08 · ⚠️ re-verificar · 🏢 cuenta real. El Help Center oficial no es legible con WebFetch: usar la UI (navegador solo lectura) o capturas.

## Dónde mirar (UI real) ✅
**Inicio de ayuda para empresas** (`business.facebook.com/business-support-home/<BUSINESS_ID>/`, antes Account Quality). Secciones vistas para un portafolio: *Resumen de la cuenta* → **Restricciones publicitarias** ("Usa todas las funciones publicitarias" cuando no hay problemas), **Cuentas publicitarias** (estado por cuenta con filtro "Todos los estados"; ej. "Restringida · En los últimos 30 días", "Sin anuncios rechazados"), **Cuentas de comercio y catálogos**, **Páginas**, **Orígenes de datos** ("No hay problemas con los orígenes de datos"), **Cuentas de WhatsApp** ("No account issues").
🏢 Turismo Patagonia (2026-10-08): `946831613383716` y *Rafting Adventure* figuran **Restringida** (coincide con "Inhabilitada" + "Error en el pago" en Facturación → causa = **deuda/pago fallido**, no política); `2019411605622000` "Sin anuncios rechazados"; orígenes de datos sin problemas.
Otras pantallas útiles: **Centro de seguridad** (`/latest/settings/security_center`), **Autorizaciones y verificaciones**, **Solicitudes** (aprobaciones pendientes de segundo admin), **Facturación y pagos** (ver `02`).

## Clasificar la causa (primer paso)
| Señal | Causa probable | Qué hacer |
|---|---|---|
| Facturación: "Error en el pago" + `account_status=3` | **Deuda / cobro rechazado** | Pagar con el botón *Pagar*; luego revisar método; no pedir apelación |
| `disable_reason=3 RISK_PAYMENT` | Riesgo de pago | Revisar método, historial; apelar solo si persiste |
| `disable_reason=1/6/11` | Política/integridad | Leer motivo en Inicio de ayuda; solicitar revisión (solo admins) |
| `disable_reason=15 COMPROMISED_AD_ACCOUNT` | Cuenta comprometida | Seguridad: cambiar credenciales, revisar accesos |
| `account_status=7/8` | Revisión de riesgo / liquidación pendiente | Esperar/pagar según el caso |
| Anuncios rechazados con cuenta Activa | Política de contenido | Ver motivo por anuncio; corregir |
| Cuenta Activa sin método de pago | No puede gastar | Agregar método de pago |
Valores completos de `account_status`/`disable_reason`: `02-ad-accounts-billing.md` ✅.

## Apelaciones ⚠️
Fuentes no oficiales indican que solo admins pueden pedir revisión y que hay una ventana de ~180 días para presentar documentación; tiempos típicos 24–48 h (identidad) a semanas (políticas). **Verificar en la UI del caso concreto** antes de afirmarlo.

## Seguridad del portafolio ✅ 🏢
Alertas reales en Turismo Patagonia (2026-09): 2FA en "Nadie" (recomendado al menos Admins), 3 usuarios sin passkey, 2 usuarios con email público (gmail). Buenas prácticas: ≤10 usuarios con control total, ≥1 admin alternativo, passkey/2FA, System Users para automatizaciones, revocar tokens al rotar personal. Una **aprobación adicional de segundo admin** aparece al cambiar permisos/propiedad de una cuenta (Business Settings → Solicitudes) ✅ 🏢.

## Identidad y privacidad 🏢
Verificar identidad personal puede hacer **pública** esa información en la Biblioteca de Anuncios → confirmar con la persona. La verificación de organización no fue necesaria en Turismo Patagonia (Centro de seguridad) pero puede requerirse para Advanced Access/App Review con terceros.

## Servidor MCP para anuncios ✅
Integraciones → "Servidor MCP para anuncios" (`ads_mcp_server`): mecanismo de Meta para dar a agentes de IA acceso controlado a cuentas/catálogos. 🏢 estaba vacío; si se configura, empezar en **solo lectura** por cuenta.

## Prevención (recomendación)
Método de pago de respaldo; alertas de saldo (n8n); no concentrar activos limpios en un portafolio con historial de restricciones; no migrar activos con deuda; documentar quién es admin.
