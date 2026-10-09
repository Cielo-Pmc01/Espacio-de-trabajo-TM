# Contrato del webhook Pb2 → n8n → Meta (compras confirmadas de Turismo Bariloche)

**Para:** Luciano / equipo de Pb2. **Fecha:** 2026-10-08. **Estado (actualizado 2026-10-08):** flujo de n8n **publicado en modo simulación** (arma el evento pero **no lo envía a Meta**; seguro para probar). El secreto `X-TB-Secret` se lo pasa Cielo por un canal seguro. Falta el token de Meta y la decisión de consentimiento para activar el envío real. Documento relacionado: `planes/2026-10-08-especificacion-pixel-capi-pb2.md`.

## Qué tiene que hacer Pb2
**Cada vez que un pedido pasa a "confirmado" (pago aprobado), enviar un `POST` con un JSON** a la URL de abajo. n8n se encarga de proteger los datos del comprador, armar el evento de compra y avisarle a Meta. Pb2 **no** necesita hablar con Meta ni guardar ningún token de Meta.

## Dirección y seguridad
- **URL de producción (después de que Cielo publique el flujo):** `https://n8n.iadventurecentersx.online/webhook/tb-compra-confirmada`
- **Método:** `POST` · **Content-Type:** `application/json`
- **Encabezado secreto obligatorio:** `X-TB-Secret: <valor que te pasa Cielo por un canal seguro>`. Sin ese encabezado, n8n rechaza la llamada. **No guardes el secreto en el repositorio.**
- Hasta que Cielo avise que está publicado, la URL de producción no responde.

## Cuerpo (JSON)
**Obligatorios**
| Campo | Tipo | Ejemplo | Nota |
|---|---|---|---|
| `pedido` | string | `"12345"` | ID de pedido **único y estable**. Es el mismo valor que hoy se empuja como `transaction_id` en el `dataLayer`. Meta lo usa para no contar dos veces la venta. |
| `importe` | número | `185000.5` | Lo realmente cobrado (aclarar si incluye recargos/impuestos). |
| `moneda` | string (3 letras) | `"ARS"` | ISO 4217. |

**Recomendados (cuantos más, mejor se asocia la venta al anuncio)**
| Campo | Tipo | Ejemplo | Para qué |
|---|---|---|---|
| `email` | string | `"cliente@mail.com"` | Coincidencia (n8n lo normaliza y lo protege). Enviar **en claro**. |
| `telefono` | string | `"+54 9 294 495-7959"` | Coincidencia. En claro, con código de país. |
| `nombre`, `apellido` | string | `"María"`, `"Gómez"` | Coincidencia. |
| `pais` | string | `"AR"` | ISO-2. Si falta, se asume `ar`. |
| `cliente_id` | string | `"c-987"` | ID interno del cliente (se protege). |
| `confirmado_en` | string ISO-8601 | `"2026-10-08T15:00:00Z"` | Momento de la confirmación. Si falta, se usa la hora de recepción. **Máximo 7 días de antigüedad** (límite de Meta). |
| `items` | lista | `[{"sku":"CIRCUITO-CHICO","cantidad":2,"precio":92500.25}]` | Detalle de lo comprado. |
| `fbp` | string | `"fb.1.1760000000000.123456789"` | Cookie `_fbp` guardada al crear el pedido. |
| `fbc` | string | `"fb.1.1760000000000.IwAR..."` | Cookie `_fbc` (o `fb.1.<ms>.<fbclid>` construido; **no modificar mayúsculas del `fbclid`**). |
| `ip` | string | `"190.1.2.3"` | IP real del comprador al crear el pedido. |
| `user_agent` | string | `"Mozilla/5.0 ..."` | Navegador del comprador al crear el pedido. **Si falta, el evento se envía como `action_source: other`.** |
| `event_source_url` | string | `"https://turismobariloche.ar/pago/volver/"` | Si falta, se usa esa URL. |
| `consentimiento_publicidad` | booleano | `true` / `false` | Si el comprador aceptó las cookies de **publicidad** en el aviso del sitio. **Por defecto el flujo solo envía a Meta si es `true`.** |

> Cómo obtener `fbp`, `fbc`, `ip`, `user_agent` y el consentimiento: leerlos **de la petición que crea el pedido** (el front y la API comparten dominio) y **guardarlos junto al pedido**; enviarlos recién cuando el pedido se confirme. La decisión de cookies del visitante está en una cookie propia del sitio (formato `todas.<VERSION>` o `necesarias.<VERSION>`): `todas` ⇒ `true`.

## Ejemplo
```bash
curl -X POST "https://n8n.iadventurecentersx.online/webhook/tb-compra-confirmada" \
  -H "Content-Type: application/json" \
  -H "X-TB-Secret: $TB_SECRET" \
  -d '{
    "pedido": "12345",
    "importe": 185000.5,
    "moneda": "ARS",
    "email": "cliente@example.com",
    "telefono": "+54 9 294 495-7959",
    "nombre": "María",
    "apellido": "Gómez",
    "pais": "AR",
    "confirmado_en": "2026-10-08T15:00:00Z",
    "items": [{"sku":"CIRCUITO-CHICO","cantidad":2,"precio":92500.25}],
    "fbp": "fb.1.1760000000000.123456789",
    "fbc": "fb.1.1760000000000.IwAR_abc",
    "ip": "190.1.2.3",
    "user_agent": "Mozilla/5.0",
    "consentimiento_publicidad": true
  }'
```

## Respuestas
| Código | Cuerpo | Significado |
|---|---|---|
| `200` | `{"ok":true,"estado":"recibido","pedido":"12345"}` | Recibido y válido; n8n lo procesa. |
| `200` | `{"ok":true,"estado":"omitido_sin_consentimiento",...}` | Válido pero **no se envía a Meta** (el comprador no aceptó publicidad). **No es un error ni hay que reintentar.** |
| `200` | `{"ok":true,"estado":"omitido_muy_antiguo",...}` | La confirmación tiene más de ~6 días; Meta la rechazaría. |
| `400` | `{"ok":false,"estado":"rechazado","motivo":"Faltan o son inválidos: ..."}` | Falta `pedido`/`importe`/`moneda` o son inválidos. Corregir y reenviar. |
| `401`/`403` | — | Falta o es incorrecto el encabezado `X-TB-Secret`. |

## Reglas de uso
- **Reenviar el mismo `pedido` es seguro:** n8n registra los pedidos ya enviados y **no los duplica** (y Meta también deduplica por `event_id = pedido`). Si no recibís `200`, reintentá con espera (ej. 1 min, 5 min, 30 min).
- Enviar **solo con pago confirmado**, nunca con pedidos pendientes, rechazados o cancelados.
- No incluir en el JSON contraseñas, tokens ni datos de tarjeta.
- **Datos personales:** viajan por HTTPS a n8n y ahí se cifran antes de llegar a Meta. Cualquier cambio sobre qué se envía de quien no aceptó cookies es una **decisión legal** que define Cielo con quien corresponda.

## Cómo se prueba (sin afectar datos reales)
1. Cielo deja el flujo en **modo simulación** (`DRY_RUN=true`): n8n arma el evento y lo muestra **sin enviarlo a Meta**.
2. Pb2 envía pedidos de prueba con `curl` o desde su entorno de pruebas; se ve la respuesta `200 recibido`.
3. Cielo activa el envío real con un **código de prueba de Meta** (*Events Manager → Probar eventos*) y se verifica que aparezca el `Purchase` con valor, moneda y `event_id = pedido`.
4. Se quita el código de prueba y se pasa a producción.
