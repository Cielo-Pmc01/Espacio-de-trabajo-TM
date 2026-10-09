# Pixel de Meta en Tag Manager para turismobariloche.ar — paso a paso (camino rápido)

**Para:** Cielo (tiene acceso de edición al contenedor `GTM-KZJCV9BK`). **Fecha:** 2026-10-08. **Complementa:** `planes/2026-10-08-especificacion-pixel-capi-pb2.md` (el envío desde el servidor sigue siendo necesario).
Marcas: ✅ verificado en el código público del sitio o en la documentación · 🧭 recomendación · ⚠️ a verificar al probar.

## Qué se va a lograr
Que Meta vuelva a ver, desde el navegador: **vistas de página, vistas de ficha, agregar al carrito, inicio del pago, datos de pago y compra confirmada**. El sitio **ya emite** esos eventos al `dataLayer` (✅ leído en su código): `spa_page_view`, `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, `whatsapp_click`. Solo falta crear las etiquetas de Meta que los escuchen. **No se toca el código del sitio.**

**Límite importante:** la compra del navegador **solo se registra si el comprador deja abierta la pestaña original** (Mercado Pago se abre en otra pestaña). Las ventas de quien cierra la pestaña o cambia de dispositivo las recupera únicamente el **envío desde el servidor** que implementa Luciano.

## Antes de empezar (5 minutos, no te saltees esto)
1. **Dataset correcto.** Esta guía usa **`1101029451234929`** ("Turismo Bariloche"). Confirmá que es el que usa tu campaña: *Ads Manager → el conjunto de anuncios de "TB - Ventas Web" → Conversión → Píxel/Conjunto de datos*. Si dice otro ID, cambialo en el paso 2. (Ojo con el dataset parecido "turismo bariloche pixel", que no recibe datos.)
2. **Que no haya otro Pixel en el sitio.** Hoy no hay (✅ el HTML no carga ninguno). Si Luciano ya está instalando uno en el código, **no hagas esto**: se duplicarían los eventos.
3. **Consentimiento — el sitio YA tiene aviso de cookies y Consent Mode de Google** ✅ (cookies de publicidad en `denied` hasta que el visitante acepta). Pero las etiquetas de HTML personalizado **no lo respetan solas**. **En CADA etiqueta de Meta** (pasos 2, 3 y 4): *Configuración avanzada → Configuración del consentimiento → "Requerir consentimiento adicional para que se active la etiqueta" → agregá `ad_storage`.* Así las etiquetas de Meta solo se disparan si el visitante aceptó. **Consecuencia esperada:** verás **menos eventos** que antes del cambio (solo los de quienes aceptan). ⚠️ El texto del aviso y la política **mencionan Google Analytics, Google Ads y Microsoft Clarity pero no a Meta**: conviene sumarlo (decisión tuya y de quien corresponda). Esta guía no es asesoramiento legal.
4. **No uses datos personales todavía.** Esta primera versión **no envía email ni teléfono** a Meta desde el navegador (eso lo hace el servidor, ya hasheado). Menos riesgo y menos para auditar.

## Paso 1 — Entrar y preparar
1. Entrá a **tagmanager.google.com** → elegí el contenedor **`GTM-KZJCV9BK`**.
2. Arriba aparece **"Espacio de trabajo" (Workspace)**: es un borrador, **nada se publica hasta que apretás Enviar**.
3. 🧭 Creá una **carpeta** llamada `Meta Pixel` (Etiquetas → Nueva carpeta) para tener todo junto y poder borrarlo fácil.

## Paso 2 — Etiqueta base del Pixel
*Etiquetas → Nueva → Configuración: **HTML personalizado***. Nombre: `Meta - Base (PageView)`.
Pegá este código (el ID ya está puesto):
```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1101029451234929');
fbq('track', 'PageView');
</script>
```
**Activador:** *Initialization – All Pages* (así carga antes que todo lo demás).

## Paso 3 — PageView en cada cambio de pantalla (el sitio es una SPA)
El sitio no recarga la página al navegar; emite `spa_page_view` en cada cambio de ruta (✅ no emite en la primera carga, así que **no duplica** al paso 2).
*Etiqueta nueva → HTML personalizado.* Nombre: `Meta - PageView SPA`.
```html
<script>
if (window.fbq) { fbq('track', 'PageView'); }
</script>
```
**Activador nuevo:** tipo *Evento personalizado* → nombre del evento: `spa_page_view`.

## Paso 4 — Una etiqueta por evento
Para cada una: *Etiqueta nueva → HTML personalizado* con el código de abajo y un **activador de tipo "Evento personalizado"** con el nombre indicado. (No hace falta crear variables: cada código lee el último mensaje del `dataLayer`.)

### 4.1 `Meta - ViewContent` — activador: evento `view_item`
```html
<script>
(function(){
  var dl = window.dataLayer || [], m;
  for (var k = dl.length - 1; k >= 0; k--) { if (dl[k] && dl[k].event === 'view_item') { m = dl[k]; break; } }
  if (!m || !m.ecommerce || !window.fbq) return;
  var e = m.ecommerce, items = e.items || [];
  var value = items.reduce(function(s,i){ return s + (Number(i.price)||0) * (Number(i.quantity)||1); }, 0);
  fbq('track', 'ViewContent', {
    content_ids: items.map(function(i){ return String(i.item_id); }),
    content_type: 'product',
    content_name: items[0] ? items[0].item_name : undefined,
    value: Math.round(value * 100) / 100,
    currency: e.currency || 'ARS'
  });
})();
</script>
```

### 4.2 `Meta - AddToCart` — activador: evento `add_to_cart`
Mismo código que 4.1 cambiando **dos cosas**: `'view_item'` → `'add_to_cart'` y `'ViewContent'` → `'AddToCart'`.

### 4.3 `Meta - InitiateCheckout` — activador: evento `begin_checkout`
```html
<script>
(function(){
  var dl = window.dataLayer || [], m;
  for (var k = dl.length - 1; k >= 0; k--) { if (dl[k] && dl[k].event === 'begin_checkout') { m = dl[k]; break; } }
  if (!m || !m.ecommerce || !window.fbq) return;
  var e = m.ecommerce, items = e.items || [];
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map(function(i){ return String(i.item_id); }),
    content_type: 'product',
    num_items: items.reduce(function(s,i){ return s + (Number(i.quantity)||1); }, 0),
    value: Number(e.value) || 0,
    currency: e.currency || 'ARS'
  });
})();
</script>
```

### 4.4 `Meta - AddPaymentInfo` — activador: evento `add_payment_info`
Igual que 4.3 cambiando `'begin_checkout'` → `'add_payment_info'` y `'InitiateCheckout'` → `'AddPaymentInfo'`.

### 4.5 `Meta - Purchase` — activador: evento `purchase` ⭐ el más importante
```html
<script>
(function(){
  var dl = window.dataLayer || [], m;
  for (var k = dl.length - 1; k >= 0; k--) { if (dl[k] && dl[k].event === 'purchase') { m = dl[k]; break; } }
  if (!m || !m.ecommerce || !window.fbq) return;
  var e = m.ecommerce, items = e.items || [];
  var txid = String(e.transaction_id || '');
  if (!txid) return;                       // sin ID de pedido no se envía
  fbq('track', 'Purchase', {
    value: Number(e.value) || 0,
    currency: e.currency || 'ARS',
    content_ids: items.map(function(i){ return String(i.item_id); }),
    content_type: 'product',
    num_items: items.reduce(function(s,i){ return s + (Number(i.quantity)||1); }, 0),
    order_id: txid
  }, { eventID: txid });                   // MISMO valor que enviará el servidor como event_id
})();
</script>
```
**Por qué `eventID`:** cuando Luciano agregue el aviso desde el servidor usará **el mismo ID de pedido** como `event_id`; Meta contará la venta **una sola vez** (✅ deduplicación por `event_id` + nombre de evento, ventana de 48 h).

### 4.6 `Meta - Contact (WhatsApp)` — activador: evento `whatsapp_click`
```html
<script>
if (window.fbq) { fbq('track', 'Contact'); }
</script>
```
🧭 Si preferís contarlo como `Lead`, cambiá `'Contact'` por `'Lead'` (decisión de negocio: no mezclar con compras).

## Paso 5 — Probar SIN publicar (Vista previa)
1. Arriba a la derecha: **Vista previa (Preview)** → escribí `https://turismobariloche.ar` → se abre el sitio con el panel de **Tag Assistant**.
2. Navegá como un cliente: home → una excursión → agregar al carrito → ir al checkout. En el panel, cada evento (`view_item`, `add_to_cart`, `begin_checkout`…) debe mostrar la etiqueta de Meta correspondiente en **"Tags Fired"** (disparada).
3. Instalá la extensión **Meta Pixel Helper** (Chrome): debe mostrar **un solo píxel** con ID `1101029451234929`, sin errores y sin duplicados.
4. ⚠️ **No simules un `Purchase` falso en el sitio real**: aunque sea de prueba, **el navegador lo envía de verdad al dataset de producción** y contamina los datos. Para la compra, esperá una venta real (o probá con Luciano en un entorno de pruebas). Mientras probás, **podés pausar la etiqueta 4.5** y activarla en la versión final.
5. Si algo no dispara: abrí el evento en el panel → pestaña **"Tags"** → mirá si el activador coincide con el nombre del evento (distingue mayúsculas, minúsculas y espacios).

## Paso 6 — Publicar
1. **Enviar (Submit)** → *Nombre de la versión:* `Meta Pixel TB 2026-10-08` → *Descripción:* "Agrega Pixel de Meta (dataset 1101029451234929): PageView, SPA PageView, ViewContent, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Contact" → **Publicar**.
2. **Cómo volver atrás si algo sale mal:** *Versiones → elegí la versión anterior → Acciones → Publicar.* (Queda todo como estaba.)

## Paso 7 — Verificar en Meta (espera de 20–30 minutos)
- *Events Manager → dataset "Turismo Bariloche" → Resumen:* deben volver a aparecer `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`, `AddPaymentInfo` con estado **Activo** y "Última recepción: hace minutos". (Hoy dicen "hace 5 a 25 días".)
- Esperá una **compra real**: tiene que aparecer `Purchase` con **valor** y **moneda**.
- Seguimiento diario durante una semana: ¿cuántos `Purchase` hay vs. cuántas ventas confirmadas en Pb2?

## Qué NO resuelve (y por eso hay que seguir con Luciano)
- Compradores que cierran la pestaña original o pagan desde otro dispositivo → **solo el servidor** los reporta.
- La calidad de coincidencia (EMQ) será baja sin email/teléfono hasheados → también lo aporta el servidor.
- No hay deduplicación contra el servidor hasta que Luciano envíe el mismo `event_id`.

## Riesgos a tener presentes
- **Un cambio en el contenedor afecta al sitio en producción** (por eso: Vista previa, versión con nombre y la ruta de vuelta atrás).
- Si algún día el desarrollador agrega el Pixel **en el código**, hay que **desactivar estas etiquetas** (un solo emisor por evento).
- El código lee el `dataLayer`; si el desarrollador **cambia los nombres de los eventos o su estructura**, las etiquetas dejan de disparar sin avisar. Avisarle a Luciano que estas etiquetas dependen de esos nombres.
- No se agregó ningún dato personal al navegador en esta versión.

## Si querés que lo revise antes de publicar
Antes de apretar **Enviar**: *Administrador → Exportar contenedor* (te baja un archivo `.json` del borrador). Pasame ese archivo y reviso las etiquetas y activadores **sin tocar nada** (el archivo no incluye contraseñas).
