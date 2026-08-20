# Brief — Ecosistema de Automatización y Auditoría de Webs (Adventure Center / TM)

> Documento de contexto autocontenido para dar de alta a una IA que va a manejar automatización de contenido/precios en las webs y auditoría de catálogo. Pensado para pegarse completo (no requiere acceso al filesystem del workspace). Fuente: `contexto/tm/negocio/` (catálogo y marcas) + `contexto/sx/` y memoria de proyecto (arquitectura web y reglas de auditoría). Última consolidación: 2026-07-30.

---

## 1. Qué es la empresa y qué hace esta IA

Adventure Center es una empresa de turismo en Bariloche, Patagonia Argentina. Vende excursiones y experiencias a través de 14 marcas distintas (mismo catálogo real, distinto branding/tono por marca/público). Opera todo el año con temporada alta de invierno.

Dos áreas relevantes:
- **TM (Telemarketing & Marketing)**: dueña del catálogo de productos, precios, tono de marca y contenido. Cielo lidera esta área.
- **SX (operaciones/infraestructura)**: dueña de los sitios web, hosting, WooCommerce, y la infraestructura técnica donde vive el catálogo online.

Esta IA va a operar en la intersección de ambas: **mantener las 13-14 webs sincronizadas con el catálogo real** (precios, horarios, estado activo/inactivo) y **auditar** que lo publicado coincida con la fuente de verdad.

---

## 2. Las 14 marcas

| Marca | Código | Dominio | Tono | Público |
|---|---|---|---|---|
| Adventure Center | ADVC | adventurecenter.com.ar (hosting separado, NO multisitio) | Dinámico, enérgico, aventurero | Jóvenes/adultos activos, aventureros |
| Bariloche Excursiones | BE | barilocheexcursiones.com.ar | Profesional, informativo, persuasivo | Turista exigente, calidad |
| Turismo Bariloche | TB | turismobariloche.ar | Cercano, familiar, acogedor (marca madre) | Familias, grupos grandes, nacional |
| Turismo Bariloche BR | TB BR | turismobariloche.ar (mismo sitio, contenido en portugués) | Cercano, familiar, primer viaje | Brasileños |
| Centro de Reservas | CDR | centroreservasbariloche.com | Informativo, multilingüe | Extranjeros, grupos |
| Turismo Patagonia | TP | turismopatagonia.ar | Claro, directo, accesible (low cost) | Presupuesto limitado |
| Tur Central | TC | turcentral.com.ar | Divertido, humor local | Jóvenes, mochileros |
| Patagonia Booking | PB | patagoniabooking.com | Profesional, tipo Booking.com | Internacional (ES) / agencias |
| Passeios Bariloche | PBRS | passeiosbariloche.com | Cálido, en portugués | Brasileños |
| Rafting Adventure | RA | raftingadventure.com | Enérgico, inclusivo (marca madre rafting) | Amplio |
| Rafting Bariloche | RB | raftingbariloche.ar | Claro, amable, para primerizos | Familias |
| Rafting Villegas | RV | raftingvillegas.com | Energético, divertido, grupal | Grupos de amigos |
| Rafting Patagonia | RP | raftingpatagonia.com | Sobrio, potente, profesional | Expertos, internacional |
| Rafting Valle del Manso | R VDM | raftingvalledelmanso.com | Cálido, contemplativo | Parejas, naturaleza |

**Las 5 marcas de rafting están inactivas de venta en temporada invierno** (reactivan en septiembre — ver sección 7). El resto (9 marcas) operan todo el año.

Protocolo de copy obligatorio para cualquier contenido de campaña (Meta Ads/RRSS): comunicación siempre positiva (nunca "no es peligroso", "sin riesgos" — usar "con todo resuelto para vos"), primera persona de marca, y una de **4 estructuras fijas** (Valor/Precio, Simplicidad/Directo, Urgencia Real solo con restricción genuina, Bullet-list con emojis). Nunca inventar precios/cupos/urgencia.

---

## 3. Arquitectura técnica de los sitios web

**12 de las 13 marcas viven en un WordPress Multisite único** (hosting Hostinger), con tema WoodMart + WooCommerce + WooCommerce Bookings. La 13ª (Adventure Center) está en **hosting separado**, detrás de Cloudflare, con su propia instalación WordPress/WooCommerce.

Mapeo dominio → marca (multisitio):
turcentral.com.ar (TC) · patagoniabooking.com (PB) · turismopatagonia.ar (TP) · turismobariloche.ar (TB / TB BR) · barilocheexcursiones.com.ar (BE) · passeiosbariloche.com (PBRS) · centroreservasbariloche.com (CDR) · raftingadventure.com (RA) · raftingbariloche.ar (RB) · raftingvillegas.com (RV) · raftingvalledelmanso.com (R VDM) · raftingpatagonia.com (RP).

> El multisitio tiene además otros dominios (navegacion.ar, skibariloche.ar, catedralskicenter.com, navegacionpatagonia.com.ar, cabalgatasbariloche.com.ar, navegacionislavictoria.com, barilochewelcomecard.com) que **no son de las 14 marcas activas de TM** — no tocar salvo pedido explícito.

**Acceso técnico** (credenciales reales NO incluidas en este documento por seguridad — provisionar directo en el gestor de credenciales de la herramienta de automatización, ej. n8n, no pegarlas en texto plano/Slack):
- Multisitio: SSH + WP-CLI (`wp eval`, `wp wc product list`, etc. con `--url=<dominio>`).
- Adventure Center: API REST de WooCommerce (`wc/v3/products`) + WooCommerce Bookings (`wc-bookings/v1/products/{id}`). Requiere User-Agent de navegador real (bloquea libs por defecto → 403) y pasar `consumer_key`/`consumer_secret` como query params (Basic Auth header da 401 por config del servidor).

**Gotchas técnicos clave que la IA debe conocer:**
1. **El precio "de vidriera" no siempre vive en `regular_price`.** En varios productos del catálogo (confirmado no solo en rafting, sino en sitios del multisitio en general) el precio real vive en **Product Add-Ons**, no en el precio regular de WooCommerce — hay que verificar `get_price()` / `display_price` real, no asumir por `regular_price`.
2. **Adventure Center:** el precio "de vidriera" (`price` en `wc/v3`) no se actualiza escribiendo `meta_data._price` (protegido por REST) — hay que usar `wc-bookings/v1/products/{id}` con `{"display_cost": "<precio>"}` (string). Los horarios de booking van por el mismo endpoint (`availability`, array de bloques), y actualizar `availability` **no sincroniza `first_block_time`** — requiere un segundo PUT explícito.
3. **Multisitio:** disponibilidad/horarios viven en el postmeta `_wc_booking_availability` (array serializado PHP) — reescribir con un array PHP real vía `wp eval`, nunca un string ya serializado a mano (se corrompe si se serializa dos veces). El horario "de vidriera" (`_wc_booking_first_block_time`) es un campo separado que no se sincroniza solo.
4. Los 7-12 sitios del multisitio casi siempre duplican el mismo catálogo de productos con **títulos de marketing distintos por marca** (mismo producto real, nombre distinto) — para relevar en bulk, agrupar por SKU o por similitud de orden/precio entre "sitios hermanos", nunca asumir 1:1 por nombre.

**⚠️ Hallazgo de seguridad activo, sin resolver:** hay un backdoor conocido (`wp-upgrad.php`) en la raíz del WordPress que sirve el multisitio — hoy inactivo (payload renombrado) pero explotable si alguien lo reactiva. Cielo lo está manejando con el programador/hosting. **No modificar nada de esto sin autorización explícita de Cielo.**

---

## 4. Catálogo maestro — fuente de verdad y estado de datos

**Fuente de verdad real:** dos Google Docs que Cielo mantiene manualmente — *"3-❄️🏔️ EXCURSIONES INVIERNO"* y *"1-🏔️🏔️ EXCURSIONES TODO EL AÑO"*. En esos docs, **el texto en gris (no negro/rojo) significa que la excursión está inactiva/descontinuada** — es una señal visual, no textual, hay que leerla vía Google Docs API con `simple:false` (el modo simple no trae color de fuente). Este repo tiene una copia parseada en `contexto/tm/negocio/catalog_invierno.md` / `catalog_verano.md` / `Excursiones todo el año.md`, actualizada al 21/07/2026.

**Regla de oro de matching:** ante nombres de excursión parecidos o ambiguos (ej. "Piedras Blancas Solo Traslado" vs "Traslado a Piedras Blancas"), **nunca resolver la ambigüedad por criterio propio** (ni por SKU ni por precio, aunque parezca inequívoco) — consultarlo siempre con Cielo antes de tocar cualquier dato.

**Conflictos de datos conocidos, sin resolver — no asumir cuál vale sin confirmar con Cielo:**
- Rafting Limay: `catalog_verano.md` dice $79.500/$95.400 (lun-mié-vie 13:00); `Excursiones todo el año.md` dice $110.000/$137.000 (mar-vie 13:00). Mismo producto, dos fuentes internas del repo en conflicto — verificar contra el Doc de Cielo antes de usar cualquiera de los dos en producción.
- Buceo Certificado ($135.000/$162.000): no aparece en la versión actualizada de julio del doc fuente — precio heredado sin confirmar.
- Cabalgatas por la Estepa día completo: precio no cargado en el doc original.

### 4.1 Temporada Invierno (jun-sep)

| Excursión | Efectivo | Tarjeta | Notas |
|---|---|---|---|
| Bautismo Ski (EPIC) con equipo | $149.500 | $179.500 | |
| Bautismo Ski menores (Mountain) | $345.000 | $414.800 | |
| Bautismo Cerro Bayo SKI | $449.500 | $539.000 | Producto separado de Snow (2 SKUs distintos) |
| Bautismo Cerro Bayo SNOW | $499.500 | $599.000 | |
| Noche Encantada | $239.500 | $287.400 | ⚪ marcada inactiva en doc maestro (precio en blanco/gris) |
| Noche Encantada menores | $179.500 | $215.400 | ⚪ inactiva |
| Nieve Encantada | $239.500 | $287.400 | |
| Nieve Encantada menores | $179.500 | $215.400 | |
| Culipatín Cerro López (trineos) | $139.500 | $167.400 | ⚪ marcada inactiva por Cielo (29/07) |
| Culipatín Cerro López menores | $119.500 | $143.400 | ⚪ inactiva |
| La Cueva — After Ski | $400.000 | $480.000 | 14:30-18:30, base Cerro Catedral |
| La Cueva — After menores | $360.000 | $432.000 | |
| La Cueva — Paseo Nocturno y Cena | $450.000 | $528.000 o $540.000 (⚠️ ver nota) | 17:30-22:00 / 20:30-00:30, edad mín. 6, incluye cena+traslado+45min cuatriciclo/moto nieve |
| La Cueva — Cena menores 6-12 | $400.000 | $474.000 | |
| La Cueva — Travesía Diurna Cuatriciclos | $270.000 | $324.000 | Sin traslado, horarios 9:30/11:00/12:30/14:00 |
| Alquiler de ropa de nieve | $36.000 | $43.200 | |
| Laguna Congelada (caminata+almuerzo+culipatín, Refugio Neumeyer) | $250.000 | $262.750 | |
| Laguna Congelada menores | $230.000 | $266.400 | |
| Caminata con raquetas (Vivencias) | $250.000 | $300.000 | |
| Caminata con raquetas menores | $230.000 | $266.400 | |
| Cena Nórdica adultos +13 | USD 300 | +20% | |
| Cena Nórdica menores 6-12 | USD 260 | +20% | |
| Villa La Angostura y Cerro Bayo | $77.500 | $93.000 | Todos los días 08:30-18:00 — **usar este precio, no el de "todo el año"** |
| Traslado Cerro Catedral | $35.000 | $42.000 | 8-16/10-14/13-18hs — **usar este precio, no el de "todo el año" ($17.500, tachado/no vigente)** |

⚠️ Piedras Blancas Trineos/Culipatín + Traslado ($159.500) también marcada **inactiva** (título en rojo pero bloque de precio en gris/blanco — regla: cuando el precio está gris aunque el título esté en rojo, también es inactiva).

### 4.2 Todo el año

| Excursión | Efectivo | Tarjeta | Notas |
|---|---|---|---|
| Isla Victoria y Bosque de Arrayanes (adultos) | $136.000 | $136.000 (1 pago) | 10:30-18:30/12:30-18:30 |
| Isla Victoria menores 5-12/jubilados | $70.000 | $70.000 | |
| Puerto Blest y Cascada Los Cántaros (adultos) | $136.000 | $136.000 | |
| Puerto Blest menores/jubilados | $70.000 | $70.000 | |
| Puerto Blest + Lago Frías (adultos) | $190.000 | $190.000 | |
| Puerto Blest + Lago Frías menores/jub | $97.000 | $97.000 | |
| Traslado a Puerto Pañuelo (opcional) | $22.000 | $22.000 | |
| Cerro Tronador y Ventisquero Negro | $69.500 | $83.400 | 9:00-18:30 |
| San Martín de los Andes por 7 Lagos | $77.500 | $93.000 | 8:00-18:30 |
| Circuito Chico y Cerro Campanario | $29.500 | $35.400 | 08:30-12:30 / 14:30-19:00 |
| Circuito Grande | $77.500 | $93.000 | Lun/Mié/Vie 08:30-18:00 |
| Bolsón y Lago Puelo | $69.500 | $81.000 | Mar/Jue/Sáb 8:30-18:30 |
| Cruce de Lagos Andinos (AR/CL) | USD 253 | — | Solo efectivo. Extranjeros USD 325 |
| Velero El Orgulloso (adultos) | $66.850 | $80.200 (1 pago) | 12-15 / 14-17hs |
| Velero El Fantasma (adultos) | $66.850 | $80.200 | 10-15 / 14-19hs, incluye traslado |
| Navegación Brazo Tristeza (adultos) | $67.500 | $81.000 | |
| Rafting Limay (⚠️ ver conflicto arriba) | $110.000 | $137.000 | Mar/Vie 13:00, edad mín. 3 |
| Rafting Light — con traslado | $75.000 | $90.000 | Edad mín. 5 |
| Rafting Light — sin traslado | $60.000 | $75.000 | |
| Rafting al Límite — con traslado | $129.500 | $155.400 | Edad mín. 14 |
| Rafting al Límite — sin traslado | $114.500 | $140.400 | |
| Traslado a Colonia Suiza | $35.000 | $42.000 | Todos los días |
| Traslado a Cervecería Patagonia | $35.000 | $42.000 | Todos los días |
| Cabalgata Cerro López | $110.000 | $132.000 | 90 min, edad mín. 5 |
| Cabalgata Estepa medio día (San Ramón) | $98.450 | $118.150 (1 pago) | |
| Cabalgata Bosque de Coihues | $89.500 | $107.400 | Edad mín. 6 |
| Cabalgatas por el Bosque medio día | $120.000 | $144.000 | ⚪ marcada inactiva |
| Cabalgata Express por el Bosque | $35.950 | $43.150 (1 pago) | |
| Cabalgatas por el Bosque día completo | $71.900 | $82.650 (1 pago) | |
| Kayak Travesía Lago Gutiérrez (con traslado) | $89.500 | $107.400 | ⚪ marcada inactiva (sin traslado) |
| Kayak Lago Moreno | $89.500 | $107.400 | Todos los días |
| Buceo Bautismo | $110.000 | $132.000 | Edad mín. 8 |
| Buceo Certificado | $135.000 | $162.000 | ⚠️ precio sin confirmar (no en doc actualizado) |
| **Canopy en Bariloche** | $110.000 | $137.000 | 11-15/13-17hs, edad mín. 5, menores 4-12 $99.500/$124.375 |
| Zipline (Piedras Blancas) | $11.000 | $12.650 (1 pago) | Sin traslado |
| Beer Experience Bariloche (+18) | $185.000 | $222.000 | Mié/Vie 15:00-21:00 |
| Alquiler de auto por día | $32.950 | $37.850 (1 pago) | |
| Seguro de Cancelación | $15.000 | $18.000 | Reintegro 80% si se cancela hasta 4hs antes |

**Excursiones en suspenso (no vender, solo referencia histórica de precio):** Bosque de Arrayanes y Villa La Angostura, Villa La Angostura y Playa Correntoso, Villa Traful medio día.

---

## 5. Reglas de auditoría (catálogo real vs. webs)

Estas reglas gobiernan cualquier comparación automatizada entre el catálogo maestro y lo publicado en las 13 webs:

1. **Nunca comparar por nombre libre — usar SKU exacto.** El matching por nombre difuso genera falsos positivos (confirmado con Rafting Valle del Manso y Rafting Patagonia, dominios casi vacíos en el multisitio).
2. **"No existe" / "Borrador" / "Pendiente" en un sitio NO es automáticamente un error** — depende de si la excursión está activa o inactiva en el catálogo maestro. Si está inactiva (texto gris en el doc), que ningún sitio la publique es lo correcto.
3. **Esquema de color de referencia** (usado en la auditoría real, Google Sheets): verde = publicado y coincide · naranja = publicado pero no coincide (precio/horario) · **lila** = producto en Borrador/Pendiente (no durazno — cambiado 29/07) · rojo/rosado = no existe en ese sitio · **texto gris** (solo fuente, nunca relleno) = excursión inactiva en el catálogo maestro · amarillo = excursión "sin referencia" (no aparece en ningún doc maestro).
4. **Ante nombres parecidos o ambiguos, jamás resolver solo** — consultar a Cielo, incluso si un criterio (SKU, precio) parece inequívoco. Ya generó errores dos veces por resolver "a criterio propio".
5. **Las 5 marcas de rafting se excluyen de comparaciones fuera de temporada** (septiembre reactivan) — no marcarlas en rojo/crítico por catálogo inactivo esperado.
6. **Nunca asumir fila/posición fija** en ninguna hoja de auditoría — Cielo edita manualmente sin avisar. Siempre releer en vivo y matchear por nombre/SKU antes de escribir.
7. **Horarios:** solo los bloques `type=time && bookable=yes` de `_wc_booking_availability` son horarios reales de salida (los `type=custom` son rangos de fecha de temporada, no horarios).
8. **Excursiones nuevas sin SKU** (porque el producto todavía no existe en ningún sitio) se agregan igual a la auditoría — mostrar visualmente qué falta subir, no omitir.

---

## 6. Automatizaciones existentes (n8n) relevantes

- **"Editor de Auditorías TM — Google Sheets"** y **"Google APIs Proxy (OAuth)"**: mantienen actualizadas las hojas de auditoría (Cruce de Nombres, Auditoría de Precios, Auditoría de Horarios) vía Google Sheets API + Google Docs API (para leer el color de fuente de los docs maestros).
- **"CM - Generar Contenido"** (motor de contenido para la CM, marca `crm_cm` en Supabase): genera copy por marca desde brief manual, catálogo, tendencias (búsqueda web) o consultas reales de Chatwoot — sigue las 4 estructuras de copy obligatorias. Hoy solo tiene cargado el catálogo de **invierno** (26 excursiones activas) — Canopy y otras "todo el año" no están conectadas ahí todavía.
- **Fotos — Flujo General (13 marcas):** formulario n8n que sube fotos de un producto a las 13 marcas, con espera de 5s entre marca para no saturar.

---

## 7. Reglas de oro / seguridad

- **Nunca modificar producción (DB, archivos del hosting, plugins, precios en vivo) sin autorización explícita de Cielo** — son 13 sitios de venta real.
- **Nunca incluir credenciales reales (SSH, API keys, tokens) en documentos de texto plano, Slack, o cualquier canal no seguro.** Provisionarlas directo en el gestor de credenciales de la herramienta de automatización.
- Existe un **backdoor activo conocido** (`wp-upgrad.php`) en el hosting del multisitio, hoy inactivo — no tocar, Cielo lo gestiona con el proveedor.
- Rafting reactiva la temporada de venta en **septiembre 2026** — a partir de ahí, las reglas de "excluir rafting" de las auditorías dejan de aplicar.
- Cualquier cambio replicado en varias marcas (precio, horario, foto) es 100% scriptable hoy (WP-CLI para las 12 del multisitio + API REST para Adventure Center) — no requiere trabajo manual sitio por sitio si se automatiza bien.

---

_Documento vivo — actualizar cuando cambien precios, se resuelvan los conflictos de datos marcados con ⚠️, o cambie la arquitectura de hosting._
