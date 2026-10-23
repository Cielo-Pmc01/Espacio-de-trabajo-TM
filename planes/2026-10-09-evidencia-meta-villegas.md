# Evidencia técnica para Meta Support — Rafting Villegas (error 131031)

Caso de soporte: 2217675602178917. Fecha: 2026-10-09.
Se omite el token de acceso. Reemplazar `<TOKEN>` por un token de usuario del sistema con `whatsapp_business_management` y `whatsapp_business_messaging`.

## Datos del activo
- Cuenta comercial: 686033378455069 (rafting adventure)
- WABA: 1070498235787577 (Rafting Villegas)
- Número: +54 9 294 424-4428, Phone Number ID 1384563681400446
- App: 1662215895304167 (Rafting Mensajeria)

## 1. Estado del número (GET)
`GET https://graph.facebook.com/v26.0/1384563681400446?fields=display_phone_number,status,name_status,code_verification_status,quality_rating,platform_type,is_pin_enabled,account_mode`
Resultado: `status CONNECTED`, `platform_type CLOUD_API`, `code_verification_status VERIFIED`, `quality_rating GREEN`, `is_pin_enabled true`, `account_mode LIVE`, `name_status PENDING_REVIEW`.

## 2. Estado de salud (GET)
`GET https://graph.facebook.com/v26.0/1384563681400446?fields=health_status{can_send_message,entities}`
Resultado: entidades WABA, BUSINESS y APP en `AVAILABLE`; PHONE_NUMBER en `LIMITED` solo por "display name not approved yet". No hay error de pago ni restricción. (Los errores 138024/138025 son de llamadas SIP y no aplican a mensajes.)

## 3. App suscripta a la WABA (GET)
`GET https://graph.facebook.com/v26.0/1070498235787577/subscribed_apps` → la app 1662215895304167 (Rafting Mensajeria) figura suscripta.

## 4. Envío directo, sin intermediarios (POST)
```
POST https://graph.facebook.com/v26.0/1384563681400446/messages
Authorization: Bearer <TOKEN>
{"messaging_product":"whatsapp","to":"5492944995727","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}}
```
Respuesta: HTTP 200, `message_status: accepted`, id `wamid.HBgNNTQ5Mjk0NDk5NTcyNxUCABEYEkI1RTdBNjAyNjVGNUQ2NDNBQwA=`, x-fb-trace-id `E3Gm4c9tmRD`, enviado 2026-10-09 17:47:28 UTC.
El mensaje no se entrega y el webhook recibe luego el error 131031.

## 5. Error recibido por webhook (registro del servidor)
Código 131031. Título "Business Account locked". Mensaje "Business Account locked". Detalle "Business account has been locked."
Ejemplos (2026-10-09, UTC):
- 16:14:07 — wamid.HBgNNTQ5Mjk0NDk5NTcyNxUCABEYEkQwQzUzODE1MTc4Mjc3RjIyNgA=
- 16:15:18 — wamid.HBgNNTQ5Mjk0NDU2ODUzMRUCABEYEkEzMDAyNUZBNzZCRDMxQjlFOAA=
Fallos a 3 destinos distintos (dos de nuestras pruebas y uno ajeno).

## 6. Control: otros números del mismo portafolio y app entregan bien
Misma app, mismo token, mismo envío (plantilla hello_world al mismo destino), todos entregados:
- Valle del Manso: Phone ID 1430390733483510
- Rafting Patagonia: Phone ID 1365963843268824
- Tur Central: Phone ID 1311323242072461

## 7. Recepción
El número Villegas sí recibe mensajes entrantes con normalidad. Solo falla el envío.

## Pedido
Revisar el estado interno de este número y esta WABA: el envío figura bloqueado ("locked") aunque las consultas de salud lo muestran disponible.
