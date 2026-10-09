# Especificación técnica — Meta Pixel + Conversions API en el checkout de Pb2 (Turismo Bariloche)

**Fecha:** 2026-10-08 · **Estado:** borrador para revisión del equipo de desarrollo de Pb2 · **Autoría:** Claude (skill `meta-ads-developer`) con datos leídos en solo lectura de las cuentas de Cielo.
**Importante:** Pb2 se desarrolla en una instancia separada; este documento **no modifica nada**, solo especifica. Todo dato marcado ⚠️ debe confirmarse antes de implementar.

Convenciones: ✅ verificado en la documentación oficial de Meta (2026-10-08) · 🏢 observado en las cuentas reales (puede haber cambiado) · ⚠️ sin verificar / a confirmar · 🧭 recomendación (no es una regla de Meta).

---

## 1. Problema y objetivo

**Problema.** Desde ~14/9/2026 las ventas web de Turismo Bariloche (TB) se cierran en **Pb2** y ya no en WooCommerce. Meta no recibe esas compras, aunque los anuncios siguen gastando.

**Evidencia 🏢 (lecturas del 2026-10-08):**
- Dataset de TB `1101029451234929`: pasó de ~1.800 eventos/día (10/9) a 2–20/día desde el 14/9; último `Purchase` hace ~23 días.
- Anuncios "TB - Ventas Web - Invierno 2026": gasto de ~$29k a ~$149k ARS por día y hasta ~20.000 clics/día el 7/10, con **0 compras atribuidas desde el 12/9**; el CPC bajó de ~$65 a ~$7 (compatible con pérdida de señal de conversión).
- WooCommerce de TB: última orden el 14/9 a las 12:31; no hay órdenes posteriores.

**🔴 Hallazgo clave (verificado el 2026-10-08 con lecturas públicas del sitio):** **`turismobariloche.ar` ya no se sirve desde WordPress: toda la web (home, fichas `/product/...`, `/carrito/`, `/checkout/`) es hoy una aplicación Next.js** (cabeceras `X-Powered-By: Next.js` y `X-Nextjs-Postponed`, recursos `/_next/static/...`, **cero** referencias a `wp-content`/`wp-includes`). Eso explica el corte del 14/9: el Pixel de Meta vivía en el plugin de WordPress, y al cambiar el front **desapareció de todo el embudo**, no solo del pago. Las páginas ya **no cargan el Pixel** (0 referencias a `fbq`/`fbevents`/`connect.facebook.net`); solo cargan **Google Tag Manager `GTM-KZJCV9BK`**. Consecuencia: **hoy Meta no ve ni `PageView`, ni `ViewContent`, ni `AddToCart`, ni `InitiateCheckout`, ni `Purchase`** del tráfico de los anuncios (que aterriza en `turismobariloche.ar` → ficha de la excursión). La especificación abarca por eso **todo el embudo**, no solo la compra.
**Lo que ya existe en el sitio 🏢 (contenedor GTM leído):** tags de **GA4** y **Google Ads**, y el sitio ya empuja al `dataLayer` eventos estilo GA4: `view_item_list`, `select_item`, `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`, `search`, `generate_lead` y `whatsapp_click`, con `items`, `value`, `currency`, `transaction_id`, `event_id` y `user_data`. **No hay ningún tag de Meta** (0 referencias a Meta/Facebook/`fbq` en el contenedor, 0 tags de HTML personalizado).

**Objetivo.** Que **cada venta pagada en Pb2** llegue a Meta **una sola vez**, con valor, moneda e identificadores de coincidencia de buena calidad, para que las campañas vuelvan a optimizar por compras.

**Criterio de éxito.** (a) `Purchase` visible en Events Manager del dataset de TB como "Navegador y servidor", **deduplicado**, con `value` y `currency` correctos; (b) la cantidad diaria de `Purchase` ≈ reservas pagadas de TB en Pb2; (c) el ad set vuelve a atribuir compras.

## 2. Decisiones y datos que hay que cerrar ANTES de implementar

| # | Pregunta | Quién | Por qué importa |
|---|---|---|---|
| 1 | ✅ **RESUELTA (Cielo, 2026-10-08):** los anuncios llevan a **`https://turismobariloche.ar/`** (en general) y luego **a la ficha de cada excursión** (ej. un anuncio de Circuito Chico redirige a la URL de Circuito Chico). | Cielo | El `fbclid` nace en el **mismo dominio** donde corre el checkout (ver §6.4: el riesgo de salto entre dominios **desaparece**, salvo que el pago redirija a un subdominio/dominio externo ⚠️). |
| 2 | ✅ **Parcialmente resuelta (lectura pública):** el embudo completo vive en **`turismobariloche.ar`** (Next.js): `/product/<slug>/`, `/carrito/`, `/checkout/`. ⚠️ Falta confirmar la **ruta exacta de la página de confirmación** y si el pago de Mercado Pago redirige a un dominio externo. | Dev Pb2 | `event_source_url` y dónde disparar `Purchase` del navegador. |
| 3 | ✅ **Parcialmente resuelta:** hay **GTM (`GTM-KZJCV9BK`)** con GA4 y Google Ads y `dataLayer` con eventos de comercio; **no hay Pixel de Meta**. ⚠️ Falta confirmar si hay **CAPI** de algún tipo en el backend. | Dev Pb2 | Regla: **un solo emisor por evento** (evitar duplicados). |
| 4 | **Moneda real del cobro en Pb2** (ARS/USD/BRL) y cómo se calcula el `value` (con/sin impuestos, con/sin recargos). | Dev Pb2 | `value` y `currency` correctos; en WooCommerce la moneda base era USD con precios en ARS 🏢. |
| 5 | **Dataset/Pixel a usar.** Recomendado: **"Turismo Bariloche" `1101029451234929`** (portafolio `turcentralpatagonia`) 🏢. Ojo con el dataset homónimo **"turismo bariloche pixel"**, que no recibe datos. | Cielo | Que sea el dataset que elige el ad set de la campaña. |
| 6 | **¿Hay entorno de staging** para probar con `test_event_code`? | Dev Pb2 | Probar sin ensuciar producción. |
| 7 | **¿Quién emite el CAPI?** (A) backend de Pb2 al aprobarse el pago, o (B) n8n recibiendo un webhook de "pago aprobado" de Pb2. | Dev Pb2 + Cielo | Cambia dónde vive el token. **Actualización 2026-10-08:** Cielo propone el camino **B (n8n)**: Pb2 (Strapi ⚠️ a confirmar) manda un **webhook** a n8n cuando el pedido pasa a *confirmado* con `pedido`, `importe`, `moneda`, email, teléfono, nombre y, si se puede, `_fbp`/`_fbc`/IP/user-agent y la decisión de cookies; n8n hashea, usa `event_id = String(pedido)` y envía el CAPI (token en credencial de n8n). Pide mucho menos al dev (activar un webhook, p. ej. los de Strapi) y reutiliza el stack de Cielo. Limitaciones: sin `fbp`/`fbc`/IP/UA la atribución es peor; hay que registrar el consentimiento; idempotencia y reintentos obligatorios (Data Table/Supabase por `pedido`); depende de que el webhook llegue. A (backend de Pb2) sigue siendo la opción de mayor calidad si el dev prefiere programarlo. |
| 8 | **Consentimiento/privacidad.** ✅ **Parcialmente resuelta por lectura del sitio (2026-10-08):** el sitio **sí implementa Consent Mode de Google** con un aviso de cookies propio (ver §8b). ⚠️ **Falta** que el consentimiento cubra a **Meta**: el texto del aviso y la política **no mencionan a Meta** y el servidor aún **no** registra ni respeta la decisión del visitante. | Dev Pb2 + Cielo / legal | Esta especificación no define el cumplimiento legal; hay que confirmar con quien corresponda antes de enviar datos personales a Meta. |

## 2b. Lo que ya se sabe por leer el código público del front (JavaScript que el sitio sirve a cualquier visitante, 2026-10-08)
Se leyeron los *bundles* de `turismobariloche.ar` (sin acceso a Pb2 ni al backend). Esto responde varias preguntas de la §2:

**Flujo de compra observado ✅**
1. **Ficha / carrito:** el sitio empuja al `dataLayer` los eventos `view_item`, `add_to_cart`, `view_cart`, `begin_checkout`; **`begin_checkout`** se emite al montar la página `/checkout/` con `currency`, `value` e `items` (cada ítem: `item_id`=SKU, `item_name`, `price`, `quantity`, `item_category:"Excursión"`, `item_variant`=fecha y horario). Un componente de seguimiento emite además **`spa_page_view`** en cada cambio de ruta y **`whatsapp_click`** al tocar enlaces a WhatsApp (con `origen` y `sku`).
2. **Confirmar el pedido:** al tocar el botón de pago se guarda el comprador en `sessionStorage` (clave `tb-medicion-comprador`), se empuja **`add_payment_info`** con `payment_type:"Mercado Pago"` y `user_data` (email, teléfono, nombre, apellido y país **en claro**; el hash lo hace GTM para Google), se **abre Mercado Pago en una pestaña nueva** (`window.open(irA, "_blank")`) y la pestaña original navega a **`/pago/volver/`** (si el navegador bloquea la ventana, redirige en la misma pestaña).
3. **`/pago/volver/` (confirmación) — emite la compra ✅:** consulta cada pocos segundos a **`/api/checkout/estado/`** (mismo dominio). **Solo cuando el backend responde `confirmado`** empuja **`purchase`** con **`transaction_id` = ID de pedido**, `currency` = moneda del pedido, `value` = importe del pedido, `items` desde el carrito y, si existe, `voucher` y `user_data`; lo hace **una sola vez por sesión** (clave `tb-purchase-<pedido>` en `sessionStorage`) y después vacía el carrito.

**Respuestas que salen de ahí**
| Pregunta | Respuesta |
|---|---|
| ¿Cuándo se emite `purchase`? | ✅ Solo con **pago confirmado** por el backend (no al crear el pedido). |
| ¿Cómo se identifica la venta? | ✅ `transaction_id` = **ID de pedido** (estable). **No hay `event_id` explícito** en los *pushes* leídos. |
| ¿Dominio de la confirmación? | ✅ Mismo dominio: **`/pago/volver/`**; el pago de Mercado Pago ocurre en **otra pestaña**, pero la pestaña original (donde viven las cookies) sigue en `turismobariloche.ar`. |
| ¿Dónde se conoce la confirmación? | ✅ En el **backend** (`/api/checkout/estado/` devuelve `confirmado`, `pedido`, `moneda`, `importe`, `vouchers`, `estadoPedido`): ahí se puede disparar el **CAPI**. |
| ¿Quién ve la compra si el comprador cierra la pestaña o cambia de dispositivo? | ❌ **Nadie en el navegador**: el `purchase` solo se emite mientras la pestaña original sigue abierta consultando el estado. → **CAPI del servidor es obligatorio**, no opcional. |
| ¿`user_data`? | Se empuja **sin hashear**; en el navegador solo existe si se completó el flujo en esa misma sesión (`tomarComprador`). |

**Regla de identidad resultante 🧭:** usar **`event_id` = `String(pedido)`** (el mismo valor que `transaction_id`) en el navegador y en el servidor. Si en GTM se arma el tag de Meta con `eventID = {{ecommerce.transaction_id}}`, el servidor debe enviar exactamente ese valor en `event_id`.

**Mapeo para el camino B (GTM) 🧭 ⚠️ a validar en Vista previa de GTM antes de publicar:**
| `dataLayer` | Evento de Meta | Notas |
|---|---|---|
| carga inicial | `PageView` (base) | el Pixel lo dispara al inicializar |
| `spa_page_view` | `PageView` | **La app es una SPA**: sin esto solo se cuenta la primera página de cada visita |
| `view_item` | `ViewContent` | `content_ids` = `item_id` (SKU), `content_type:"product"`, `value`, `currency` |
| `add_to_cart` | `AddToCart` | idem |
| `begin_checkout` | `InitiateCheckout` | `value`, `currency`, `num_items` |
| `add_payment_info` | `AddPaymentInfo` | **no** incluir datos personales en parámetros (van como coincidencia avanzada) |
| `purchase` | `Purchase` | `value`, `currency`, `content_ids`, `order_id` = `transaction_id`, **`eventID` = `transaction_id`** |
| `whatsapp_click` | `Contact` | (o `Lead`; decisión de negocio) |
| `search` | `Search` | opcional |
⚠️ **Coincidencia avanzada:** el `user_data` del `dataLayer` está en claro; el Pixel puede recibirlo en la inicialización (`fbq('init', id, {em, ph, fn, ln, country})`) y hashearlo él mismo (comportamiento a **verificar** en la documentación del Pixel antes de depender de él). El **CAPI del servidor** debe enviar siempre los datos ya **hasheados** por su cuenta (§5.2).

**Cómo captura el servidor `fbp`/`fbc`/IP/navegador 🧭:** como el front y la API comparten dominio, la **petición que crea el pedido** llega con las cookies `_fbp`/`_fbc` y las cabeceras (IP real, `User-Agent`); basta **leerlas en esa petición y guardarlas en el pedido** (§5.1). No hace falta tocar nada en el navegador para eso.

## 3. Arquitectura propuesta 🧭

```
Navegador (Pb2)                         Backend de Pb2                    Meta
──────────────                          ──────────────                    ────
Pixel base + PageView/ViewContent
InitiateCheckout  ──► guarda en la reserva: fbp, fbc, fbclid, utm, UA, IP, event_source_url
Pago en Mercado Pago ───────────────────► webhook MP "approved"
Página de confirmación                       │
 └─ fbq('track','Purchase',…,{eventID}) ──┐  └─ POST /{dataset}/events  Purchase (mismo event_id) ──► CAPI
                                          └────────────── Meta deduplica por event_id + event_name ✅
```
- **Navegador + servidor a la vez.** El del navegador mejora la señal si el usuario vuelve a la página; el del **servidor garantiza** el evento aunque el comprador **nunca regrese** de Mercado Pago o bloquee scripts.
- **Misma identidad del evento** en ambos canales (§5.3).

## 4. Eventos a implementar

Nombres estándar, **sensibles a mayúsculas** ✅ (`Purchase`, no `purchase`).

| Evento | Dónde | Canal | Obligatorio |
|---|---|---|---|
| `PageView` | todas las páginas de Pb2 que reciben tráfico de TB | Navegador | Sí |
| `ViewContent` | ficha de la excursión | Navegador | Recomendado |
| `InitiateCheckout` | al iniciar la reserva/pago | Navegador (+ servidor opcional) | Recomendado |
| `Purchase` | **pago aprobado** | **Navegador + Servidor** | **Sí (crítico)** |
| `Lead` / `Contact` | clic en WhatsApp o formulario | Navegador | Opcional |

**Regla de oro 🧭:** el `Purchase` del **servidor** se dispara **solo con pago aprobado** (nunca con reserva pendiente, rechazada o cancelada). Para 🏢 TB, 39% de las órdenes de WooCommerce estaban canceladas: contar reservas **pagadas**, no creadas.

## 5. Contratos de datos

### 5.1 Qué guardar en la reserva al iniciar el checkout (campos nuevos, ej. un JSON `metaTracking`)
| Campo | Origen | Nota |
|---|---|---|
| `fbp` | cookie `_fbp` | ✅ la genera el Pixel |
| `fbc` | cookie `_fbc`; si no existe y la URL trae `fbclid`: `fb.1.<timestamp_ms>.<fbclid>` | ✅ formato `fb.<subdomainIndex>.<creationTime>.<value>`; en servidor sin cookie `subdomainIndex=1`; **`fbclid` sensible a mayúsculas: no modificarlo** |
| `fbclid` | parámetro de la URL de entrada | guardar **crudo** |
| `utm_source/medium/campaign/content` | URL de entrada | para atribuir fuera de Meta |
| `client_user_agent` | cabecera `User-Agent` del comprador | **no hashear** ✅ |
| `client_ip_address` | IP del comprador (IPv6 preferible si existe) | **no hashear** ✅; detrás de proxy usar la IP real (`X-Forwarded-For`) |
| `event_source_url` | URL de la página de checkout/confirmación | obligatoria en eventos web ✅ |

### 5.2 Normalización y hash de datos del cliente ✅ (`conversions-api/parameters/customer-information-parameters`)
Hash **SHA-256** (hex) **después** de normalizar. Todos admiten **arrays**.
| Parámetro | Normalización | Hash |
|---|---|---|
| `em` | quitar espacios al inicio/fin y pasar **todo a minúsculas** | Sí |
| `ph` | **quitar símbolos, letras y ceros iniciales; incluir siempre el código de país** (ej. `16505551212`) | Sí |
| `fn`, `ln` | minúsculas, **sin puntuación**, UTF-8 | Sí |
| `ct` | minúsculas, sin puntuación, sin caracteres especiales ni espacios | Sí |
| `st` | abreviatura de 2 caracteres, minúsculas | Sí |
| `zp` | minúsculas, sin espacios ni guiones | Sí |
| `country` | ISO 3166-1 alpha-2 en minúsculas (`ar`, `br`) | Sí |
| `external_id` | ID único de Pb2 del cliente (el hash es **recomendado**) | Sí (recomendado) |
| `client_ip_address`, `client_user_agent`, `fbc`, `fbp` | tal cual | **No** |
⚠️ **Teléfonos argentinos:** tras limpiar, incluir el código de país (`54`). Los móviles suelen escribirse con `9` (`549294…`) o sin él (`54294…`); la doc no aclara cuál empareja mejor. 🧭 **Probar enviar ambas variantes hasheadas en el array `ph`** y medir el EMQ.

### 5.3 Identidad del evento y deduplicación ✅ (`deduplicate-pixel-and-server-events`)
- `event_id` **idéntico** en el navegador (`eventID`) y el servidor, y mismo `event_name`. 🧭 Usar un ID **estable de negocio**: el **ID de pedido** (`transaction_id` que ya empuja el front en `purchase`), como `String(pedido)`. (Si más adelante se prefiere un prefijo, aplicarlo **igual** en navegador y servidor.)
- Meta conserva el primero recibido y descarta repetidos dentro de **48 horas**.
- Sin `event_id`, la alternativa (`event_name` + `fbp`/`external_id`) es limitada ✅.
- El `event_id` **debe ser el mismo en los reintentos** (idempotencia).

### 5.4 `custom_data` del `Purchase` ✅ (`conversions-api/parameters/custom-data`)
| Campo | Regla |
|---|---|
| `value` | **obligatorio** en `Purchase`; **numérico** (sin símbolo ni texto), con decimales como número |
| `currency` | **obligatorio**; código **ISO 4217** de 3 letras (`ARS`, `USD`, `BRL`) |
| `content_ids` | SKUs/IDs de la(s) excursión(es) |
| `content_type` | `product` o `product_group` |
| `contents[]` | `id`, `quantity`, `item_price` |
| `num_items` | cantidad de ítems |
| `order_id` | ID de la reserva como string |

## 6. Implementación

### 6.1 Navegador — Pixel base y eventos (ejemplo; adaptar a Next.js con `next/script`)
```html
<script>
  !function(f,b,e,v,n,t,s){/* código base oficial del Pixel de Meta */}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1101029451234929');   // ⚠️ confirmar dataset (decisión #5)
  fbq('track', 'PageView');
</script>
```
En la página de confirmación (solo si el pago está aprobado):
```js
fbq('track', 'Purchase',
  { value: 185000, currency: 'ARS', content_ids: ['<id-excursion>'], content_type: 'product', order_id: '<id-reserva>' },
  { eventID: '<ID_PEDIDO>' }
);
```
🧭 Evitar disparar `Purchase` en cada recarga de la página de confirmación (marcar la reserva como "ya notificada al navegador"); la deduplicación lo cubre igual, pero conviene no depender de ella.

### 6.2 Servidor — Conversions API ✅ (`conversions-api/using-the-api`)
`POST https://graph.facebook.com/{API_VERSION}/{DATASET_ID}/events?access_token={TOKEN}`
- **Versión:** fijarla en **una variable** de configuración. La más reciente al 2026-10-08 es **v26.0** (v25.0 sigue disponible); confirmar en `developers.facebook.com/docs/graph-api/changelog/`.
- **Límites ✅:** hasta **1.000 eventos** por request; `event_time` en **segundos** (UNIX) hasta **7 días** atrás; si un evento supera el límite se rechaza **toda** la solicitud.
- **Timeout sugerido ✅:** ~**1.500 ms** (la mayoría responde < 600 ms). Reintentar **solo** ante timeouts/errores no del cliente (5xx); **no reintentar 4xx**.
- **Obligatorios en web ✅:** `client_user_agent`, `action_source:"website"`, `event_source_url`.

Payload de ejemplo (todo son **marcadores**; ningún dato ni token es real):
```json
{
  "data": [{
    "event_name": "Purchase",
    "event_time": 1760000000,
    "event_id": "<ID_PEDIDO>",
    "action_source": "website",
    "event_source_url": "https://<dominio-pb2>/<ruta-confirmacion>",
    "user_data": {
      "em": ["<sha256(email normalizado)>"],
      "ph": ["<sha256(telefono normalizado)>"],
      "fn": ["<sha256(nombre)>"],
      "ln": ["<sha256(apellido)>"],
      "country": ["<sha256('ar')>"],
      "external_id": ["<sha256(id cliente pb2)>"],
      "client_ip_address": "<IP guardada en la reserva>",
      "client_user_agent": "<UA guardado en la reserva>",
      "fbp": "<cookie _fbp guardada>",
      "fbc": "<cookie _fbc o fb.1.<ts_ms>.<fbclid>>"
    },
    "custom_data": {
      "value": 185000,
      "currency": "ARS",
      "content_ids": ["<id-excursion>"],
      "content_type": "product",
      "order_id": "<id-reserva>"
    }
  }]
}
```
**Solo en staging**, agregar al nivel raíz `"test_event_code": "<código de Events Manager → Probar eventos>"`; **quitarlo en producción** ✅ (con el código puesto, los eventos van a "Probar eventos" y no cuentan como reales).

Ejemplo de utilidades (TypeScript/Node, **ilustrativo**):
```ts
import { createHash } from 'node:crypto';

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const normEmail = (e: string) => e.trim().toLowerCase();
const normPhone = (p: string) => p.replace(/\D/g, '').replace(/^0+/, ''); // ⚠️ debe incluir código de país (54…)
const normName  = (n: string) => n.trim().toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

export async function sendPurchase(ev: PurchaseInput) {
  const body = { data: [buildEvent(ev)] };            // ver payload arriba
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 1500);      // timeout ~1500 ms
  try {
    const r = await fetch(
      `https://graph.facebook.com/${process.env.META_API_VERSION}/${process.env.META_DATASET_ID}/events` +
      `?access_token=${process.env.META_CAPI_TOKEN}`,
      { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal }
    );
    // Registrar solo status y fbtrace_id; NUNCA el token ni datos personales en claro.
    if (!r.ok) { /* 4xx: no reintentar; 5xx/timeout: reintentar con backoff y MISMO event_id */ }
  } finally { clearTimeout(t); }
}
```
🧭 **Idempotencia:** guardar en la reserva `capi_sent_at` y `capi_event_id`; no reenviar si ya existe (Redis o columna en PostgreSQL). Los reintentos reutilizan el mismo `event_id`.

### 6.3 Token de acceso
- **Opción A:** generarlo en **Events Manager → dataset → Configuración → "Generate access token"** (requiere privilegios de desarrollador en el negocio; no requiere App Review) ✅.
- **Opción B:** usar el System User **"Conversions API System User"**, que ya tiene acceso parcial al dataset ("Usar conjunto de datos de eventos") 🏢. ⚠️ El permiso exacto necesario no está verificado.
- **Guardarlo como secreto del backend** (variable de entorno / gestor de secretos). **Nunca** en el repositorio, el front-end, logs ni documentos.

### 6.0 Dos caminos para el Pixel del navegador (decisión de Cielo + dev) 🧭
**Camino A — Pixel en el código de la app Next.js (recomendado a mediano plazo).** Instalar el Pixel base en el layout raíz (`next/script`) y disparar los eventos de §4 desde el código, con el `eventID` de §5.3. Más robusto frente a bloqueadores y cambios del contenedor, y permite controlar consentimiento.
**Camino B — Pixel vía el GTM que ya existe (`GTM-KZJCV9BK`) como puente rápido.** Como el sitio **ya emite al `dataLayer`** `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, etc. (con `items`, `value`, `currency`, `transaction_id`, `event_id`, `user_data`), se podría crear en GTM un **tag de Meta Pixel** por evento (mapeo: `view_item`→`ViewContent`, `add_to_cart`→`AddToCart`, `begin_checkout`→`InitiateCheckout`, `purchase`→`Purchase`, `generate_lead`/`whatsapp_click`→`Lead`/`Contact`) usando `event_id`/`transaction_id` como `eventID`. Ventaja: **sin desplegar código**. Riesgos: es un **cambio en el contenedor de producción** (requiere autorización de Cielo y revisión en Vista previa de GTM), ⚠️ hay que **verificar que `event_id` del dataLayer sea el mismo que usará el servidor** y que el `purchase` del dataLayer **solo se emita con pago aprobado** (si hoy se emite al crear la reserva, el Pixel contaría ventas no pagadas).
**En ambos casos el `Purchase` del servidor (CAPI) sigue siendo imprescindible** (§6.2) y debe usar el **mismo `event_id`**. 🧭 Antes de elegir, **leer cómo se genera hoy `event_id` y cuándo se emite `purchase`** en el código de Pb2.

### 6.4 Salto entre dominios — estado ✅ mayormente resuelto
Con la información de Cielo, el anuncio aterriza en `turismobariloche.ar` y el embudo completo (ficha → carrito → checkout) está en **el mismo dominio**, por lo que las cookies de primera parte `_fbp`/`_fbc` **sí** estarán disponibles en el checkout. ⚠️ Solo queda abierto si el **pago en Mercado Pago** o la **confirmación** usan otro dominio/subdominio: en ese caso aplicar lo previsto antes (propagar `fbclid`/`fbp` por URL y reconstruir `fbc` en servidor), pero lo normal es que el servidor lea `fbp`/`fbc` **de la reserva** guardada en §5.1, no de la página de confirmación.

### 6.5 Convivencia con el WordPress anterior 🏢
El **WordPress de TB** (en el mismo servidor Hostinger, multisitio) tiene **Pixel Manager** configurado con el **mismo dataset**, CAPI con token y un **`test_event_code` (`TEST21943`) cargado**, además de otras capas (GTM4WP, Site Kit, Facebook for WooCommerce con el píxel apagado, 3 plugins propios). **Ese WordPress ya no sirve el front de `turismobariloche.ar`** (lo sirve Next.js), por lo que **su Pixel de navegador no se ejecuta**; pero su **CAPI de servidor podría seguir enviando** si WooCommerce registrara órdenes (hoy 0 desde el 14/9). Decisión de Cielo/administrador de WordPress: (1) **definir que solo la nueva app emite eventos** para TB (evitar un segundo emisor si el WordPress se reactiva o recibe órdenes); (2) **retirar el `test_event_code` de producción** o desactivar el CAPI de ese plugin. Son **cambios en producción**: no se hacen sin autorización. ✅ **Confirmado por Cielo (2026-10-08): el WordPress "se dejó de usar" y no tiene relación con la app Next.js.** Por lo tanto no hay riesgo de un segundo emisor desde el front; solo queda por decidir si se desactiva el CAPI/`test_event_code` del plugin viejo por higiene (podría seguir enviando si WooCommerce recibiera una orden) o se deja el WordPress apagado.

## 7. Plan de pruebas y aceptación

**Staging (con `test_event_code`):**
1. Crear una reserva de prueba, pagar y confirmar. En **Events Manager → Probar eventos** deben verse **dos** `Purchase` (navegador y servidor) con el **mismo `event_id`** (tardan hasta ~20 min ✅).
2. **Meta Pixel Helper** en la confirmación: **un solo** Pixel (el ID correcto), sin duplicado.
3. Abrir el detalle del `Purchase`: `event_id` = `<ID_PEDIDO>`, `value` ≠ 0, `currency` correcta, método "Navegador y servidor", figura **deduplicado**.
4. **Caso sin retorno:** pagar en Mercado Pago y **cerrar la pestaña antes de volver**. El `Purchase` del servidor debe llegar igual.
5. **Reintento:** forzar un timeout y verificar que el reenvío usa el **mismo `event_id`** y no genera duplicado.
6. **Pago rechazado/pendiente:** verificar que **no** se envía `Purchase`.

**Producción:**
7. **Quitar `test_event_code`** ✅ y repetir una compra real controlada.
8. Durante **3–7 días**, conciliar a diario: reservas **pagadas** de TB en Pb2 vs `Purchase` en Events Manager vs compras atribuidas (Windsor). Diferencias esperables por bloqueadores y por la ventana de atribución: **documentar la ventana usada** (`use_unified_attribution_setting`).
9. **Calidad:** consultar el **Dataset Quality API** (`GET /{API_VERSION}/dataset_quality?dataset_id=1101029451234929`) ✅ para ver `event_match_quality` (0–10), qué identificadores faltan, `dedup_key_feedback` y `acr`. 🧭 Objetivo razonable: EMQ de `Purchase` ≥ 6 (**no es un umbral de Meta**); si es menor, revisar `em`/`ph`/`fbp`/`fbc`/IP/UA.
10. **Campaña:** confirmar que el ad set optimiza hacia `Purchase` usando ese dataset (ubicación de conversión Sitio web, evento Compra) y dar tiempo de aprendizaje (⚠️ los plazos exactos de aprendizaje no se verificaron).

**Criterios de aceptación:** pasos 1–6 verdes en staging; 7–9 verdes en producción; sin duplicados; `value`/`currency` correctos; 0 tokens o datos personales en logs.

## 8. Seguridad y privacidad
- Hashear **siempre** antes de enviar; nunca enviar email/teléfono en claro.
- Token **solo** en el backend; rotación documentada; si se regenera el token, actualizar la configuración en el mismo momento (el anterior deja de servir).
- No registrar PII ni el token en logs; registrar `status`, `fbtrace_id` y el `event_id`.
- Consentimiento: ver §8b. Nada de lo que sigue es asesoramiento legal.

## 8b. Consentimiento — lo que ya hace el sitio y lo que falta ✅/⚠️ (lectura del código público, 2026-10-08)
**Lo que ya existe ✅**
- **Consent Mode de Google** inicializado en el HTML (`consent-default`): `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` y `personalization_storage` en **`denied` por defecto**; `functionality_storage` y `security_storage` en `granted`; `wait_for_update: 500`.
- **Aviso de cookies propio** (componente "Consentimiento") con **dos botones: "Rechazar" y "Aceptar"**. Al aceptar, actualiza todas las señales a `granted`; al rechazar, a `denied`. Guarda la decisión en una **cookie propia** (formato `todas.<VERSION>` o `necesarias.<VERSION>`, duración ~182 días) ⚠️ nombre exacto de la cookie: pedirlo al dev.
- **Texto del aviso:** "Usamos cookies propias para que el sitio funcione… Si aceptás, sumamos las de **Google Analytics, Google Ads y Microsoft Clarity**… Si decís que no, ninguna de ellas…". **Política de privacidad** en `/privacy-policy/` (texto genérico; habla de cookies, terceros y no venta de datos).

**Lo que falta para Meta ⚠️**
1. **El aviso y la política no nombran a Meta/Facebook Pixel** como tercero que recibe datos (solo Google y Clarity). Si se agrega Meta, 🧭 **actualizar el texto del aviso y la política** (decisión de Cielo/legal + dev).
2. **Etiquetas de Meta en GTM:** al ser HTML personalizado, **no respetan el Consent Mode automáticamente**: hay que configurar en **cada etiqueta** *Configuración avanzada → Configuración del consentimiento → "Requerir consentimiento adicional" → `ad_storage`* (🧭 y `ad_user_data` para las que lleven datos de usuario). Con el estado por defecto `denied`, **las etiquetas de Meta solo se dispararán para quien acepte** → esperá **menos eventos** que antes del cambio (es lo esperado).
3. **CAPI del servidor:** hoy el servidor **no sabe** si el comprador aceptó. 🧭 Propuesta para decidir con Cielo/legal: **leer la cookie de consentimiento en la petición que crea el pedido y guardar `consentimiento_publicidad = true/false` en el pedido**; enviar el `Purchase` con datos personales hasheados **solo si es `true`**. Qué enviar (o no) cuando el visitante rechazó es una **decisión legal**, no técnica. ⚠️ Esto también afecta cuántas ventas verá Meta.
4. **Datos en claro en el `dataLayer`:** el sitio empuja `user_data` (email, teléfono, nombre) **sin hashear** en `add_payment_info`/`purchase`; está bien mientras Consent Mode los controle, pero **no deben llegar a Meta desde el navegador sin consentimiento** (por eso la primera versión de las etiquetas de GTM no los usa).
- Nada de este documento autoriza cambios en Pb2, WordPress ni Meta: cada cambio requiere autorización explícita de Cielo.

## 9. Lo que NO está verificado (resumen)
~~Destino real de los anuncios~~ (✅ resuelto: `turismobariloche.ar` → ficha de excursión) · ~~si hay Pixel~~ (✅ no hay Pixel de Meta; sí GTM con GA4/Ads) · si hay **CAPI** en el backend · **ruta de confirmación** y si el pago redirige a otro dominio · **cuándo** se emite `purchase` en el `dataLayer` (¿solo con pago aprobado?) y cómo se genera `event_id` · moneda y cálculo del `value` · variante correcta del teléfono argentino (con/sin `9`) · permiso exacto del System User sobre el dataset · plazos de aprendizaje de la campaña · requisitos legales de consentimiento · relación actual entre el WordPress y la app Next.js.

## 10. Entregables esperados del equipo de Pb2
1. Respuestas a las preguntas de la §2. 2. Pixel instalado (staging) con eventos de §4. 3. Captura y persistencia de §5.1. 4. Envío CAPI de `Purchase` con idempotencia (§6.2). 5. Evidencia de las pruebas de §7 (capturas de Probar eventos y detalle del evento). 6. Variables de entorno documentadas (sin valores): `META_API_VERSION`, `META_DATASET_ID`, `META_CAPI_TOKEN`.
