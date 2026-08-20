# TB — Estructura de Campañas Ventas Web, Invierno 2026

> Plan de diagnóstico + reconstrucción para las campañas de Turismo Bariloche (TB) orientadas a venta online por sitio web. Pedido por Cielo el 2026-08-11. Objetivo del jefe (ver [[project-direccion-jefe-embudo-ventas-meta-ads]]): embudo de ventas real, no solo interacción.

---

## 1. Diagnóstico (datos reales, verificados vía Meta Graph API el 2026-08-11)

### 1.1 🚨 Bloqueante de cuenta — límite de gasto casi agotado

La cuenta publicitaria **585100972496931 ("Sergio ADC")** — que aloja campañas de **TB, TC, TP, BE y CDR**, no solo TB — tiene un límite de gasto configurado:

- Límite: **$323.454.462 ARS**
- Gastado: **$322.843.997 ARS**
- Margen restante: **~$610.465 ARS**

**Acción obligatoria antes de lanzar cualquier campaña nueva:** Cielo debe subir o quitar el límite en Business Settings → esa cuenta → Configuración → "Límite de gasto de la cuenta". Si no se resuelve, cualquier campaña nueva se corta sola en días, y de paso corta TC/TP/BE/CDR también.

### 1.2 Las 2 campañas pedidas están apagadas hace 11 meses

| Campaña | ID | Objetivo | Estado campaña | Estado del único conjunto |
|---|---|---|---|---|
| 🟣TB / JUNIO - INVIERNO - TRAFICO WEB | 120228197089320734 | Tráfico → Landing Page Views | "ACTIVE" (engañoso) | **PAUSADO desde 18/09/2025** |
| 🟣TB / JUNIO - INVIERNO - VENTAS WEB | 120228099268290734 | Ventas → Purchase (pixel) | "ACTIVE" (engañoso) | **PAUSADO desde 18/09/2025** |

0 impresiones y 0 gasto confirmado en los últimos 30 días (insights vacíos). La campaña "figura activa" en el listado pero no entrega nada — el conjunto de adentro está apagado desde el cierre de la temporada de invierno pasada.

**Patrón repetido:** la campaña "🟣TB WEB VENTAS 15%" (120223194403280734) tiene el conjunto "15 dto" ACTIVO y bien configurado (pixel + evento Purchase), pero **los 2 anuncios de adentro están pausados** → también 0 entrega hace 30 días. Mismo síntoma: contenedor "verde" sin nada corriendo adentro.

La única campaña de TB con entrega real hoy es "🟣TB / WSP" (mensajes, no venta web — $40.175 ARS gastados en 30 días, actividad modesta).

### 1.3 ✅ Causa raíz CONFIRMADA (vía SSH + WP-CLI, lectura directa de la base de datos del sitio)

turismobariloche.ar vive en el multisitio de Hostinger (blog_id 13, ver `reference_hostinger_ssh_acceso`). Se entró por SSH (solo lectura) y se inspeccionó la config real:

- Hay **2 plugins** capaces de disparar un píxel de Meta instalados y activos:
  1. **"Facebook for WooCommerce"** (plugin oficial de Meta) — instalado pero **inerte**: `wp_option facebook_config` = `{"pixel_id":"0","access_token":""}`. No hace nada.
  2. **"Pixel Manager for WooCommerce"** (de SweetCode, slug `woocommerce-google-adwords-conversion-tracking-tag`) — este es el que **sí dispara de verdad**. Su config (`wp_option wgact_plugin_options`, sección `facebook`) tiene `"pixel_id":"1101029451234929"` y `"capi":{"token":""}` (Conversions API sin configurar).
- Ese `1101029451234929` **no es** el píxel `658224566922787` ("turismo bariloche pixel") que la cuenta de ads de TM tiene conectado y contra el que optimiza el conjunto de "VENTAS WEB" — confirmado que ningún token del ecosistema TM tiene permiso sobre `1101029451234929` (probablemente quedó de una configuración anterior, agencia previa o prueba).

**Conclusión:** no es una sospecha, es el motivo confirmado por el que la campaña optimizaba a ciegas — el evento Purchase real del sitio nunca llegó al píxel que la cuenta de ads podía ver. Esto explica mejor el CPA alto/inestable que un problema de creatividad o audiencia. El fix es puntual: 1 campo a cambiar en 1 plugin, en 1 solo sitio (el resto de las marcas del multisitio tienen su propia config independiente por sitio — no se tocan).

**Fix exacto (Fase 0, antes de cualquier otra cosa):**
1. Entrar a `turismobariloche.ar/wp-admin` → menú **WooCommerce → Pixel Manager** (slug de la página: `pmw`).
2. En la sección Facebook/Meta: cambiar **Pixel ID** de `1101029451234929` a **`658224566922787`**.
3. Generar un token de Conversions API para el píxel `658224566922787` en Events Manager (Meta) → Configuración → Conversions API → "Generar token de acceso", y pegarlo en el campo **Access Token** del plugin (hoy vacío).
4. Guardar.
5. Verificar en Events Manager → **Test Events**, con el sitio abierto en otra pestaña: navegar, agregar algo al carrito, iniciar checkout — deberían aparecer eventos en vivo sobre el píxel `658224566922787`.

**Pendiente de decidir con Cielo:** si lo hace ella misma en wp-admin, o si Claude lo aplica directo por WP-CLI (ya tiene el valor viejo respaldado acá por si hay que revertir) — cualquiera de las 2 vías requiere confirmación explícita antes de tocar producción.

### 1.4 Rendimiento histórico (única ventana con datos reales: 01/06/2025 – 18/09/2025)

| Métrica | TRAFICO WEB | VENTAS WEB |
|---|---|---|
| Gasto | $694.401 ARS | $2.147.971 ARS |
| CTR | 7,91% | 4,11% |
| CPC | $19,54 | $93,09 |
| Landing Page Views | 16.394 | 8.438 |
| Add to Cart | 18 | 438 |
| Initiate Checkout | 2 | 189 |
| Add Payment Info | — | 67 |
| **Purchase** | **0** | **26** |
| **Costo por compra** | — | **$82.614 ARS** |

### 1.4b Evolución mes a mes (desde el inicio real de cada campaña hasta la pausa del 18/09/2025)

**TRAFICO WEB** (arrancó 16/06/2025):

| Período | Gasto | Impresiones | CTR | CPC | LPV | Add to Cart | Purchase |
|---|---|---|---|---|---|---|---|
| 16-30 jun | $105.429 | 101.918 | 9,41% | $10,99 | 2.387 | 3 | 0 |
| Julio | $240.746 | 164.355 | 8,45% | $17,33 | 6.527 | 13 | 0 |
| Agosto | $235.214 | 118.321 | 7,66% | $25,94 | 5.681 | 2 | 0 |
| 1-18 sep | $113.012 | 64.572 | 4,63% | $37,80 | 1.799 | 0 | 0 |

CTR cayendo a la mitad y CPC casi 4x más caro entre junio y septiembre — fatiga de creatividad/audiencia clásica, sin haber generado nunca una sola venta en los 3,5 meses.

**VENTAS WEB** (arrancó 16/06/2025):

| Período | Gasto | Impresiones | CTR | CPC | Add to Cart | Initiate Checkout | **Purchase** | **CPA** |
|---|---|---|---|---|---|---|---|---|
| 16-30 jun | $440.840 | 129.816 | 4,10% | $82,82 | 100 | 30 | 2 | $220.420 |
| **Julio** | $843.095 | 230.067 | 2,90% | $126,17 | 182 | 122 | **23** | **$36.656** |
| Agosto | $598.583 | 137.804 | 6,10% | $71,24 | 96 | 19 | 1 | $598.583 |
| 1-18 sep | $265.453 | 63.281 | 4,21% | $99,53 | 60 | 18 | 0 | — |

**Julio fue, por lejos, el mejor mes** (23 de las 26 compras totales, CPA razonable de $36.656). Después colapsó: en agosto, con Add to Cart e Initiate Checkout todavía activos (96 y 19 respectivamente, similar a julio), las compras se derrumbaron a **1 sola**, y en septiembre a **0** antes de que se pausara. La gente seguía agregando al carrito e iniciando el checkout casi igual que en julio, pero dejó de completar la compra — el patrón es exactamente el que generaría un problema de tracking/checkout roto a mitad de campaña (coincide en el tiempo con la ventana en la que, hoy sabemos, el sitio ya estaba disparando al píxel equivocado — no se puede confirmar con certeza que empezó justo ahí, pero el síntoma encaja).

Lectura general: optimizar a Tráfico/LPV no generó ni una sola venta en 3,5 meses pese a tráfico barato y masivo. Optimizar directo a Purchase sí generó compras, con un embudo mucho más sano (5,2% LPV→ATC vs 0,11%). **26 compras en ~14 semanas (~1,9/semana) está muy por debajo de las ~50 conversiones/semana que Meta necesita para salir del período de aprendizaje** — con la señal fragmentada entre 5 campañas distintas de TB, ninguna llegaba a ese volumen. Concentrar todo el presupuesto de venta web de TB en una sola estructura es clave para arreglar esto.

---

## 2. Estructura propuesta — "TB - Ventas Web - Invierno 2026"

### Fase 0 — Desbloqueos (condición para todo lo demás)
- [ ] Subir/quitar límite de gasto de la cuenta 585100972496931 (Cielo).
- [ ] Resolver el desacople de píxel (Cielo + quien mantenga el sitio) — ver 1.3.
- [ ] Decidir qué pasa con las campañas viejas fragmentadas de TB (TRAFICO WEB, VENTAS WEB, WEB VENTAS 15%, tradicionales, tradicionales-copia): archivar todas y arrancar una estructura limpia, para no repartir la señal de compra en 5 lugares distintos otra vez.

### Fase 1 — Campaña nueva
- **Nombre:** TB - Ventas Web - Invierno 2026
- **Objetivo:** Ventas | **Ubicación de conversión:** Sitio web
- **Presupuesto:** CBO a nivel campaña (que Meta reparta solo al conjunto que mejor convierte)
- **Evento de optimización:** Purchase si el píxel corregido ya manda `value` limpio de forma estable; si el volumen sigue bajo las primeras 1-2 semanas, arrancar en Initiate Checkout y subir a Purchase cuando junte señal.

**Conjuntos (2-3, no más — para no volver a fragmentar):**
1. **Audiencia amplia / Advantage+** — dejar que el algoritmo encuentre compradores (es lo que mejor funcionó en el histórico).
2. **Retargeting** — visitantes del sitio 30 días, +75% de video visto, interacción IG/FB, gente con Add to Cart sin comprar. Acá está la fuga más grande del embudo viejo (438 ATC → 26 compras) — es el conjunto con más potencial de mejora inmediata.
3. *(Opcional, si hay presupuesto)* Interés cualificado — viajeros/familias, para complementar mientras el conjunto amplio junta datos.

**Cada anuncio:**
- Link directo a la excursión específica (no a la home) + UTMs para que se vea en el CRM Meta Ads (Supabase).
- Video real (ya disponibles ✅) + copy adaptado (ver Fase 2).

### Fase 2 — Copy (productos priorizados por Cielo: Circuito Chico/clásicos + paquete multi-día de 3 excursiones)

Ya existe un motor para esto — no escribir precios a mano en este plan (regla del proyecto: **los precios SIEMPRE salen en vivo de los Docs 3/4**, nunca de un archivo estático, ver `feedback_docs_3_4_fuente_precios`). Camino recomendado:

1. Correr el workflow **"Meta Ads - Generar Copy"** (ya en producción) para marca **TB**, buscando explícitamente "Circuito Chico" y el paquete de 3 excursiones correspondiente en el Doc 3 (Invierno) — trae precio real del día y genera las 4 variantes con la estructura obligatoria de `copy_protocol.md`.
2. Adaptar el tono resultante al de TB (**cercano, familiar, claro, acogedor** — marca madre, público nacional/familias/grupos grandes, según `brand_profiles.md`), ya que el motor genera copy genérico "agencia de turismo" que hay que ajustar por marca antes de publicar (mismo pendiente que quedó abierto en el deck de venta directa del 07/08).
3. Como referencia de punto de partida (no usar el precio literal, refrescarlo vía el motor antes de publicar): el deck de venta directa del 2026-08-07 ya tiene Circuito Chico + Cerro Campanario trabajado con gatillo de prueba social — se puede adaptar el ángulo, cambiando el tono al de TB (más familiar que el genérico) y refrescando el precio.

### Fase 3 — Lanzamiento
- Crear todo en **PAUSED** primero — Cielo revisa en Ads Manager antes de publicar.
- Presupuesto inicial conservador (~$15.000-20.000 ARS/día) concentrado en esta única campaña.
- Monitoreo a los 3-4 días: si Initiate Checkout no se mueve pese a haber tráfico, el problema está en el sitio/checkout (no en la campaña) — coordinar con quien mantiene el sitio.

---

## 3. Qué falta confirmar con Cielo antes de crear algo en Meta

- [ ] Resultado de la Fase 0 (límite de gasto + píxel) — sin esto, no tiene sentido lanzar.
- [ ] Confirmar si "paquete 3 excursiones" tiene un producto exacto vigente en el Doc 3, o si hay que armar uno nuevo.
- [ ] Aprobación del jefe sobre esta estructura (o ajustes que pida).
- [ ] Luz verde para crear en Meta (modo PAUSED) una vez resuelta la Fase 0.
