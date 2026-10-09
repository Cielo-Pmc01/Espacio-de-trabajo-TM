# 11 — Catálogo de errores de Graph / Marketing API

## Estructura del error ✅
```json
{ "error": { "message": "...", "type": "OAuthException", "code": 190, "error_subcode": 460,
  "error_user_title": "...", "error_user_msg": "...", "fbtrace_id": "EJplcsCHuLu" } }
```
Registrar siempre `code`, `error_subcode`, `message` y `fbtrace_id` (este último caduca rápido).

## Códigos principales ✅ (doc oficial 2026-10-08)
| Código | Significado | Acción |
|---|---|---|
| 1 | Error desconocido / API desconocida | verificar que el endpoint existe; reintentar tras demora |
| 2 | Servicio no disponible | reintentar con espera |
| 3 | Función/permiso | la app debe tener la capacidad/permiso |
| 4 | Límite de la app | esperar; bajar volumen |
| 10 | Permiso denegado | falta permiso aprobado para la app |
| 17 | Límite a nivel usuario/cuenta | ajustar frecuencia |
| 100 | Parámetro inválido ⚠️ | leer `message`: suele nombrar el campo |
| 102 / 190 | Token inválido o vencido | renovar token (ver subcódigos) |
| 200–299 | Errores de permisos específicos (ej. **(#200) Permissions error**) | falta permiso concreto o asset |
| 368 | Bloqueo por política | esperar / revisar política |
| 613 | Rate limit de Ads (subcódigos 2446079, 1487742; 5044001 = QPS) | esperar; repartir llamadas |
| 80000-serie | BUC rate limit | ver headers `X-Business-Use-Case-Usage` |
| 506 | Publicación duplicada | cambiar contenido |

### Subcódigos de 190 ✅
458 app no instalada · 459 usuario no verificado · 460 contraseña cambiada · 463 token vencido/revocado · 464 cuenta no confirmada · 467 token inválido.

## Mensajes frecuentes (qué suelen significar) ⚠️ [RE-VERIFICAR]
| Mensaje | Lectura probable | Primer chequeo |
|---|---|---|
| `Invalid OAuth access token` / `Session has expired` | token vencido o revocado (🏢 pasó el 23-jun con crmmetaads) | `/debug_token`; regenerar con expiración "Nunca" |
| `(#200) Permissions error` | permiso no concedido o asset no asignado | `granular_scopes` en debug_token; asset del System User |
| `(#100) Unsupported post request. Object with ID '…' does not exist, cannot be loaded due to missing permissions, or does not support this operation` | **ID incorrecto, o el token no ve ese objeto** (muy común: falta asignar el asset) | probar GET del mismo ID; `act_` correcto; asset asignado |
| `(#10) Application does not have permission for this action` | falta Advanced Access / App Review | nivel de acceso del permiso |
| `Ad account disabled / restricted` | estado de cuenta, no de API | `account_status`, `disable_reason` (GET mínimo) |
| `Error validating access token: The user is enrolled in a blocking, logged-in checkpoint` | el usuario dueño del token tiene checkpoint | resolver login del usuario; migrar a System User |

## `account_status` (Ad Account) 🏢 observado
1 ACTIVE · 2 DISABLED · 3 **UNSETTLED** (pausada por falta de pago real; ≠ período de gracia) · 7 PENDING_RISK_REVIEW · 8 PENDING_SETTLEMENT · 9 IN_GRACE_PERIOD · 100 PENDING_CLOSURE · 101 CLOSED · 201 ANY_ACTIVE · 202 ANY_CLOSED ⚠️ [RE-VERIFICAR lista completa]. Bug real corregido 2026-09-17: status 3 se confundía con gracia (9). 🏢 Ver `project_automatizacion_alertas_saldo_meta_ads`.

## Qué hacer en cualquier error
1. No reintentar en loop. 2. Clasificar: token / permiso / asset / rate-limit / parámetro / política. 3. Seguir árbol en `12-arboles-diagnostico.md`.
