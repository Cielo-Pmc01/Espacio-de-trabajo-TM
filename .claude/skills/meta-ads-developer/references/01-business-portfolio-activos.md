# 01 — Business Portfolio y activos

> Estado: base conceptual + hallazgos 🏢 de cuentas reales. Pasos de UI marcados ⚠️ requieren verificación contra pantalla actual (Help Center no es legible por WebFetch; usar navegador solo-lectura o capturas).

## Mapa real de Business Settings (verificado en la UI en español, 2026-10-08, solo lectura) ✅
URL base: `https://business.facebook.com/latest/settings/<seccion>?business_id=<ID>` (la lista de portafolios está en `business.facebook.com/settings` → "Seleccionar negocio").
- **Usuarios:** Personas (`business_users`) · Socios (`partners`) · Usuarios del sistema (`system_users`; cada uno tiene pestañas "Activos asignados" y "Apps instaladas" y botones Generar token / Revocar tokens).
- **Cuentas:** Páginas (`pages`) · Cuentas publicitarias (`ad_accounts`) · Grupos de activos comerciales · Apps · Cuentas de comercio · Cuentas de Instagram · Cuentas de WhatsApp (`whatsapp_account`) · Cuentas de Threads.
- **Orígenes de datos:** Catálogos · **Conjuntos de datos y píxeles** (`events_dataset_and_pixel`) · Conjuntos de eventos offline · Conversiones personalizadas · Públicos compartidos · Carpetas de contenido.
- **Solicitudes** (`requests`) — acá llegan las solicitudes de acceso/transferencia pendientes.
- **Seguridad e idoneidad de la marca:** Dominios (`domains`) · Listas de editores bloqueados.
- **Integraciones:** Apps conectadas · Acceso a clientes potenciales (`leads_access`) · Enrutamiento de conversaciones · **Servidor MCP para anuncios** (`ads_mcp_server`).
- **Otros:** Facturación y pagos (`billing_hub`) · Centro de seguridad · Autorizaciones y verificaciones · Activos comerciales · Información del negocio · Notificaciones · Guía de configuración · "Inicio de ayuda para empresas" (`business-support-home/<ID>`, el ex Account Quality).
- Niveles de acceso vistos en los activos asignados a un System User: "Acceso total" y "Acceso parcial (Desarrollar app, Ver estadísticas y Probar app)".
- Antes de mostrar datos, Meta puede lanzar un cuadro "Verificación de autenticidad" (passkey): lo resuelve la persona, nunca el agente.

## Jerarquía
```
Business Portfolio (Business Settings / business.facebook.com)
├── Personas (admin / empleado) · Socios (partners) · Usuarios del sistema
├── Cuentas publicitarias → Campañas → Conjuntos → Anuncios
├── Páginas de Facebook · Cuentas de Instagram · WABA (WhatsApp Business Account)
├── Datasets / Pixels · Catálogos · Dominios · Apps · Cuentas de pago
```
Un asset tiene **un propietario** (un Business) y puede **compartirse** con otros (Socios) con distintos niveles. Primera pregunta ante cualquier problema: *¿de qué Business es este asset y a qué nivel está el fallo?*

## Propiedad vs acceso 🏢
- **Dueño:** el Business que "posee" el asset. Cambiarlo = transferir.
- **Socio (partner):** otro Business al que se le da acceso. Mecanismo real usado en la migración de Ale Sopran: desde el portafolio **destino** → Business Settings → Usuarios → **Socios** → Agregar → "Dar acceso a un socio a tus activos" con el ID del portafolio origen (2026-09-24).
- La lista de portafolios de un perfil no distingue "creado por mí" de "compartido conmigo": ver rol real en cada portafolio → Configuración → Personas.
- "Acceso total" a un portafolio **no equivale** a migración; falta iniciar la transferencia del asset.

## Qué se puede / no se puede mover 🏢
| Asset | ¿Se transfiere entre portafolios? |
|---|---|
| Páginas | Sí (solicitud + aprobación) |
| Instagram | Sí |
| Cuenta publicitaria | Con condiciones (ver abajo) |
| **WABA** | **No** — hay que crear una nueva en el portafolio destino (número: decidir si reusar; si el número está marcado, puede arrastrar el problema) |
| **System User** | **No** — pertenece al Business que lo creó |

Cuenta publicitaria entre portafolios — requisitos citados por Cielo ⚠️ [RE-VERIFICAR]: sin saldo pendiente, desactivada, sin restricciones previas, ojo con límites de transferencia si ya pertenece a un portafolio comercial. Las cuentas **individuales** (la que viene con el perfil personal) no pertenecen a ningún portafolio.

## Verificación y calidad ⚠️ [RE-VERIFICAR]
- Business Verification (verificación de organización): puede no ser necesaria; en Turismo Patagonia el Centro de seguridad dijo "No es necesario verificar tu organización" 🏢. Se vuelve necesaria para Advanced Access/App Review con terceros y algunas funciones de WhatsApp.
- Verificación de **identidad** de una persona: puede hacerse pública en la Biblioteca de Anuncios si se asocia a un anuncio → confirmar con la persona.
- Centro de seguridad: 2FA obligatoria "al menos Admins", passkeys, evitar emails públicos (gmail) en el portafolio, ≤10 usuarios con control total, ≥1 admin alternativo 🏢.
- Calidad de cuenta / restricciones: "Business Help Center" (antes Account Quality) en Business Suite → Todas las herramientas; solo admins pueden pedir revisión; ventana de documentos ~180 días ⚠️ (fuente no oficial; verificar).

## Estrategia de portafolios (Modo Ads/Business)
Recomendación (no es hecho de Meta): separar riesgo — un portafolio "limpio" por línea comercial; no mezclar activos restringidos con nuevos; mantener al menos 2 admins reales; dominio verificado por portafolio que lo use; Pixel/Dataset en el portafolio que posee el dominio y la cuenta publicitaria.

## Preguntas de diagnóstico estándar
1. ¿En qué Business estás parado (selector arriba a la izquierda)? 2. ¿Qué rol tenés ahí? 3. ¿De quién es el asset? 4. ¿Está compartido con tu Business o solo con tu usuario? 5. ¿Hay una solicitud pendiente de aprobar (y dónde se muestra)? Pedir captura de Business Settings → (Personas | Cuentas | Socios) según el caso.
