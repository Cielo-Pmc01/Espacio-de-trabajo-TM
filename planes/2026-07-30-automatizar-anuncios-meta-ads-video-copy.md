# Plan: Automatizar carga de videos + copy en campañas de Meta Ads (borrador/pausado)

**Fecha:** 2026-07-30
**Estado:** Bloqueado por modo de la App de Meta (permiso de Página YA resuelto — ver Tarea 3d, el único paso pendiente)
**Proyecto:** Meta Ads — sirve directamente a "Meta Ads — Campañas Invierno 2026" (`contexto/tm/proyectos/proyectos.md`, prioridad ALTA: "Limpieza de cuentas publicitarias + reemplazo de anuncios preventa → venta")

## Contexto y Justificación

Hoy Cielo arma manualmente cada anuncio nuevo en Meta Ads Manager: sube el video, pega el copy, configura campaña/conjunto/anuncio. El proyecto ya documentado "Meta Ads — Campañas Invierno 2026" señala que ya hay **videos listos** para varias marcas (TP, CDR, PB inglés, Passeios, TB, TB BR, ADV C) esperando ser cargados como reemplazo de los anuncios de preventa. Automatizar la creación (en estado **PAUSED**, nunca activo) libera ese trabajo repetitivo — Cielo revisa en Meta Ads Manager y publica manualmente cuando está conforme.

Decisiones de alcance ya confirmadas por Cielo (sesión 2026-07-30):
1. **Fuente del video:** carpeta de Drive, mismo espíritu que el flujo ya existente de fotos ("Fotos — Flujo General (13 marcas)").
2. **Fuente del copy:** ~~el Motor de Contenido CM (`crm_cm.content_pipeline`)~~ **actualizado (2026-07-30): el Motor de Copys — Meta Ads dedicado** (`meta_ads.ad_copy_pipeline`, ver `planes/2026-07-30-motor-copys-meta-ads.md`) — Cielo pidió separar el copy de Ads del de redes sociales para que sea escalable a futuro (estrategias distintas: redes=awareness, Ads=conversión directa). Este plan debe ejecutarse DESPUÉS de que el motor de copys esté en producción.
3. **Cuentas:** las 4 cuentas publicitarias ya conectadas — turcentralpatagonia (Sergio ADC + Ale Sopran), Brasil (Alex Sopran BR), Rafting Adventure.
4. **Destino:** cada pieza crea **campaña + conjunto de anuncios + anuncio** nuevos de punta a punta, todo en `PAUSED`.

## Investigación hecha para armar este plan (2026-07-30)

- **Schema real de `crm_cm.content_pipeline`** (Supabase, proyecto `jvudavpopxsguiemtrkk`): tiene `marca`, `formato`, `estado`, `aprobado` (boolean), `hook`, `summary`, `copy`, `cta`, `slides` (jsonb), `media_candidatos` (jsonb, reservado pero **sin implementar** — confirmado en [[motor-contenido-cm]]), `origen`. **No tiene ningún campo de video** todavía — hay que agregarlo.
- **⚠️ Hallazgo bloqueante: NO existe una carpeta de Drive organizada por marca para videos**, a diferencia de fotos (que sí tiene una raíz limpia con subcarpetas por marca, ver [[reference-drive-fotos-estructura]]). Al buscar videos en Drive encontré material disperso en al menos 6 carpetas/cuentas distintas ("VIDEOS TV", "Videos Capacitacion", carpetas sueltas con nombres como "26-adv c bautismo ski invierno.mp4", "REEL BE-16.03.2026.mp4") — sin una estructura única y confiable, no se puede automatizar "buscar el video correcto" sin intervención de Cielo primero.
- **⚠️ Hallazgo real vía Meta Graph API (probado con datos reales, cuenta "Ale Sopran" 946831613383716):** el Page ID / Instagram Account vinculado a cada anuncio **NO es 1:1 con la cuenta publicitaria** — dentro de la MISMA cuenta hay anuncios con `page_id`/`instagram_user_id` distintos según la marca real del anuncio (ej. "Bautismo ski cerro Bayo" usa un Page/IG, "La cueva diurna"/"Canopy" usan otro). Esto confirma que el mapeo necesario es **por marca (9)**, no por cuenta (4) — hay que armar una tabla de mapeo marca→cuenta→page_id→instagram_user_id, sampleando anuncios reales existentes (mismo método ya usado en esta investigación).
- Credenciales Meta ya disponibles en n8n como `httpQueryAuth` (token en query param): `Meta_token_Ale sopran_Y_Sergio_Adc`, `Meta_token_Brasil`, `Meta_token_rafting` — reusables directo, no hace falta pedir nada nuevo a Cielo para esto.
- Convención de nombres de campaña ya en uso (ver [[project-crm-meta-ads]]): `❄️TP - invierno`, `TC-invierno Julio`, `PB Arg - Interaccion Wsp`, `TB mensajes - Interaccion` — objetivo predominante `OUTCOME_ENGAGEMENT` (mensajes de WhatsApp).

## Alcance

**Incluye:**
- ✅ Tabla Supabase **`meta_ads.brand_meta_mapping`** — poblada con datos reales de las 9 marcas (ver Tarea 1).
- Los campos de referencia al video (Drive file id) y a los ids de campaña/conjunto/anuncio ya creados **ya están contemplados directo en `meta_ads.ad_copy_pipeline`** (`video_drive_id`, `meta_campaign_id`/`meta_adset_id`/`meta_ad_id` — ver el plan del motor de copys), no hace falta agregarlos a `content_pipeline`.
- Workflow n8n nuevo **"Meta Ads - Crear Anuncio desde Pieza"**: dado un `ad_copy_pipeline.id` con `aprobado=true` → resuelve marca→cuenta/page/IG → descarga el video de Drive → sube el video a Meta (`/act_{id}/advideos`) → crea Campaña (`PAUSED`) → Conjunto de Anuncios (`PAUSED`) → Anuncio (`PAUSED`, creative con el video + copy/hook/cta de la pieza) → guarda los ids resultantes de vuelta en esa misma fila de `ad_copy_pipeline`.
- Form trigger n8n (selector de piezas aprobadas todavía no publicadas en Meta) para que Cielo dispare el proceso manualmente, igual que ya hace con "Fotos — Flujo General".

**NO incluye (fuera de alcance):**
- Publicar/activar las campañas — siempre quedan en `PAUSED`, Cielo las revisa y activa manual desde Meta Ads Manager.
- Definir targeting/presupuesto específico por campaña — usa un default razonable a confirmar con Cielo, o hereda de un conjunto de referencia existente (a decidir en la Tarea 2).
- Resolver el problema de organización de videos en Drive — es un prerequisito que depende de Cielo, este plan solo construye la automatización que consume esa carpeta una vez exista.
- Probar con datos reales contra Rafting Adventure — está pausada fuera de temporada, se construye el soporte pero no se valida ahí hasta que reactive.

## Arquitectura / Decisiones Técnicas

- **Reusar el patrón ya validado de "Fotos — Flujo General"**: form trigger n8n + Data Table de mapeo + procesamiento por lote — pero más simple, porque acá todo es llamadas HTTP (Meta Graph API + Google Drive), sin SSH/WP-CLI.
- **Secuencia real de Meta Marketing API (v21+):**
  1. `POST /act_{id}/advideos` (sube el binario del video, devuelve `video_id`).
  2. `POST /act_{id}/campaigns` (`status: PAUSED`, `objective: OUTCOME_ENGAGEMENT`, **`is_adset_budget_sharing_enabled: false`** — parámetro nuevo que Meta exige ahora y no estaba en el adset de referencia original, encontrado al probar con datos reales el 30/07).
  3. `POST /act_{id}/adsets` (`status: PAUSED`, `campaign_id`, targeting/presupuesto de la plantilla, **`bid_strategy: 'LOWEST_COST_WITHOUT_CAP'`** — también exigido ahora por Meta, encontrado en la misma prueba).
  4. `POST /act_{id}/adcreatives` (`video_data` con el `video_id`, **`image_url` obligatorio** — se obtiene con `GET /{video_id}?fields=picture` inmediatamente después de subir el video, Meta devuelve una miniatura por default sin esperar procesamiento — `page_id`/`instagram_user_id` de la marca, `message`/`title` con el copy de la pieza).
  5. `POST /act_{id}/ads` (`adset_id`, `creative_id`, `status: PAUSED`).
- **Nombrado reconocible:** campaña/conjunto/anuncio deben seguir la convención ya usada por marca (ej. `❄️{MARCA} - Auto {fecha}`) para que Cielo identifique de un vistazo qué generó el flujo al revisar en Meta Ads Manager.
- **Copy:** usar directo `hook`/`copy`/`cta` de `meta_ads.ad_copy_pipeline` (Motor de Copys — Meta Ads) — ya vienen siguiendo las 4 estructuras validadas con enfoque de conversión, no reformatear.
- Aplicar las lecciones ya documentadas de n8n antes de tocar producción: publicar (`publish_workflow`) antes de depender de un cambio, `setNodeCredential` explícito (no asumir que las credenciales embebidas en `addNode` se aplican solas), sticky notes por nodo.

## Tareas

- [x] -1. **Prerequisito cumplido:** el Motor de Copys — Meta Ads (`planes/2026-07-30-motor-copys-meta-ads.md`) está completo y en producción (7/7 tareas, 2026-07-30) — `meta_ads.ad_copy_pipeline` existe y tiene datos reales probados. Este plan ya puede empezar.
- [x] 0. **Resuelto (2026-07-30).** Carpeta raíz confirmada por Cielo: `1LNluO2BrDEaFnCIq7fpF5rvFdLBsaphq` ("Ads nuevo"). Estructura real: `<marca>/<año>/<mes>/video.mp4` — el mes más reciente dentro del año más reciente es siempre el lote vigente (confirmado por Cielo). Marcas generales/rafting viven directo en la raíz (Adventure Center, TurCentral, turismo bariloche, turismo patagonia, patagonia booking, bariloche excursiones, centro de reservas, cabalgatas, rafting×5). Marcas de Brasil viven en la subcarpeta **"01 ADS BRASIL"** (`13CRgcWSorYxFRXV7fM3sgneAvk8mkuoE`) — "turismo bariloche br"=TBBR, "passeios bariloche"=PBRS, "bariloche booking br"=PB (versión Brasil). **⚠️ La carpeta "02 ADS INVIERNO" (`1-jjkTREHC89C-BhmYOlTQpeRfMH_lYwn`) NO se usa** — Cielo se confundió al mencionarla primero y corrigió explícitamente. Ver [[reference-drive-videos-estructura]].
- [ ] 1. **En progreso — 7/9 marcas confirmadas, 2 con ambigüedad real que necesita a Cielo.** Investigado con datos reales (campañas + creatives de las 3 cuentas relevantes), reusando la clasificación `BRAND_ACCOUNTS` real ya en producción en "MetaAds - Consolidado":

  | Marca | Cuenta | page_id | instagram_user_id | Estado |
  |---|---|---|---|---|
  | Bariloche Excursiones (BE) | 585100 | 102372081151184 | 17841419784911981 | ✅ confirmado |
  | Turismo Bariloche (TB) | 585100 | 102178264504118 | 17841419434203274 | ✅ confirmado |
  | Centro de Reservas (CDR) | 585100 | 107534265744455 | 17841459582657179 | ✅ confirmado |
  | Adventure Center (ADVC) | 585100 | 107514092918776 | 17841403882352485 | ✅ confirmado |
  | Tur Central (TC) | 585100 (también existe en 946831 con el mismo page/IG) | 109290265276027 | 17841455171272811 | ✅ confirmado (mismo Page en ambas cuentas) |
  | TB Brasil (TBBR) | 681859 | 104172466066023 | 17841459876037007 | ✅ confirmado |
  | Passeios Bariloche (PBRS) | 681859 | 572959565896394 | 17841460103854283 | ✅ confirmado |
  | Turismo Patagonia (TP) | 585100 (campaña "TP - mensajes 2") — **no se confirmó si también tiene página distinta en 946831** | 539115872611964 | 17841457997853923 | ⚠️ sin confirmar si hay más de un Page |
  | Patagonia Booking (PB) | **Ambigüedad real:** hay campañas activas de PB en 585100 ("PB - ingles", "❄️PB invierno - Español") Y en 681859 ("PB Arg - Interaccion Wsp", page 648869234987137/ig 17841426399352057) — no se puede asumir cuál usar para un anuncio nuevo | — | — | ⛔ **necesita que Cielo decida** |

  **✅ Resuelto (2026-07-30) — tabla `meta_ads.brand_meta_mapping` creada y poblada con las 9 marcas:**

  | Marca | Cuenta primaria | page_id | instagram_user_id | Nota |
  |---|---|---|---|---|
  | BE | 585100972496931 | 102372081151184 | 17841419784911981 | |
  | TB | 585100972496931 | 102178264504118 | 17841419434203274 | |
  | CDR | 585100972496931 | 107534265744455 | 17841459582657179 | |
  | ADVC | 585100972496931 | 107514092918776 | 17841403882352485 | |
  | TC | 585100972496931 | 109290265276027 | 17841455171272811 | también en 946831 con mismo page/IG, elegida 585100 como única por ahora |
  | TP | 585100972496931 | 539115872611964 | 17841457997853923 | también en 946831, elegida 585100 como única por ahora |
  | TBBR | 681859433781194 | 104172466066023 | 17841459876037007 | |
  | PBRS | 681859433781194 | 572959565896394 | 17841460103854283 | |
  | PB | 946831613383716 | 648869234987137 | 17841426399352057 | **redundancia activa**: respaldo en 681859433781194 con el MISMO page/IG (confirmado: es la misma Page de Facebook, solo cambia la cuenta publicitaria) |

  **Decisión de Cielo (30/07) sobre redundancia entre cuentas:** solo PB tiene hoy esta redundancia de 2 cuentas (para que nunca deje de recibir mensajes si Ale Sopran se pausa por falta de pago — la usan vendedores presenciales de oficina). El automatizador crea SOLO en la cuenta primaria; si hace falta duplicar a la de respaldo, Cielo lo pide en el momento y se ejecuta como tarea puntual (no automático). **Esto es dinámico** — qué marca tiene prioridad/redundancia puede cambiar con el tiempo; mantener [[project-meta-ads-redundancia-cuentas]] actualizado cuando cambie, no asumir que esta tabla queda fija para siempre.

  **Bonus encontrado en la misma investigación:** la estructura real de un ad creative con CTA de WhatsApp ya existente (`video_data.call_to_action: {type: "WHATSAPP_MESSAGE", value: {app_destination: "WHATSAPP", link: "https://api.whatsapp.com/send"}}` + `page_welcome_message` con ice-breakers) + un ejemplo real completo de copy/mensaje de un anuncio activo (PB, "Traslado al cerro catedral") — sirve de plantilla real para la Tarea 3.
- [x] 2. **Resuelto reusando un conjunto de anuncios real ya activo** (`120239343508630582`, "Mensajes", cuenta Ale Sopran) como plantilla exacta — no se inventó ningún parámetro: `targeting: {age_min:25, age_max:65, geo_locations:{countries:["MX","AR","CL","PY","UY"], location_types:["home","recent"]}, targeting_automation:{advantage_audience:1}, user_age_unknown:true}`, `billing_event:"IMPRESSIONS"`, `optimization_goal:"CONVERSATIONS"`, `destination_type:"WHATSAPP"`, `daily_budget:"5000000"`, `promoted_object:{page_id:<el de la marca>}`.
- [x] 3a. **Prerequisito técnico resuelto (2026-07-30):** Cielo activó "Cualquiera con el link — Lector" en la carpeta raíz de videos (mismo mecanismo que ya usaba la carpeta de fotos) — verificado con datos reales que la Service Account de n8n ya puede listar la raíz Y subcarpetas anidadas (probado en "01 ADS BRASIL" → sus 3 marcas).
- [x] 3b. **Construido: "Meta Ads - Crear Anuncio desde Pieza"** (`0Ry2ABXe1Orsk8Ng`, https://n8n.iadventurecentersx.online/workflow/0Ry2ABXe1Orsk8Ng, sin publicar todavía — falta el permiso de la Tarea 3c antes de darlo por terminado). `POST /webhook/crear-anuncio-meta-ads` con `{id}` (id de una fila `aprobado=true` en `ad_copy_pipeline`) → trae pieza + mapeo de marca → navega Drive (año más reciente → mes más reciente por nombre calendario, no por fecha de modificación — el nodo nativo de Google no expone `modifiedTime` vía la Service Account, así que se parsea el nombre del mes) → elige el video por coincidencia difusa con el nombre de la excursión → lo descarga → rama por cuenta (Brasil vs General, mismo criterio que `brand_meta_mapping`) → sube el video a Meta (`graph-video.facebook.com`) → crea Campaña+Conjunto+Anuncio en `PAUSED` → guarda los ids reales en `ad_copy_pipeline` (`estado='Publicado'`).
- [x] 3c. **✅ RESUELTO (2026-07-30):** Cielo asignó permiso de "Anunciar" a `crmmetaads` sobre las Pages de PB, TB y TC en Business Settings → Usuarios del sistema → Asignar activos → Páginas. **Confirmado con datos reales:** conjunto de anuncios creado con éxito para TC (`120251275757540734` y `120251275810390734`, pruebas). **Pendiente:** repetir la asignación para las Pages de TP, CDR, ADVC, BE, TBBR, PBRS (algunas no aparecían en el buscador del portfolio "turcentralpatagonia" — esas Pages viven en una cuenta de Facebook aparte y hay que "reclamarlas" primero vía Cuentas → Páginas → + Agregar → Añadir una página, ya que Cielo es admin de ellas en Facebook aunque no estén conectadas al Business Manager todavía).
- [ ] 3d. **⛔ NUEVO bloqueante encontrado (2026-07-30), distinto del anterior:** al crear el AD CREATIVE (paso siguiente al conjunto de anuncios, que sí funcionó), Meta devuelve: `"La publicación creativa de anuncios se ha realizado con una aplicación que se encuentra en modo de desarrollo. Debe estar en modo público para crear este anuncio."` — la App de Meta detrás del token (**"Claude IA - Ads"**) está en **modo desarrollo**, que restringe ciertas acciones (como publicar creatives) a que estén en modo **"Activo"/Live**. **Acción pendiente de Cielo:** developers.facebook.com/apps → seleccionar "Claude IA - Ads" → cambiar el toggle de "En desarrollo" a "Activo" (puede pedir completar datos básicos de la app — ícono, categoría, política de privacidad — antes de dejar pasar el cambio). Sin esto, el paso de creative/anuncio sigue fallando aunque el permiso de Página ya esté bien.
- [ ] 4. Probar la lógica de armado con `test_workflow`/pin data (sin gastar llamadas reales a Meta).
- [ ] 5. Probar UNA vez de punta a punta contra una cuenta real de bajo riesgo, confirmando visualmente en Meta Ads Manager que la campaña/conjunto/anuncio quedan en PAUSED con el video y copy correctos.
- [ ] 6. Publicar el workflow, agregar sticky notes por nodo, documentar en memoria.
- [ ] 7. (Opcional, a pedido futuro de Cielo) conectar un botón en `crm-cm` para disparar esto directo desde el Pipeline en vez de un form de n8n aparte.

## Criterio de Éxito

- Desde una pieza "Aprobada" en `meta_ads.ad_copy_pipeline` + un video en la carpeta de Drive de su marca, se genera una campaña+conjunto+anuncio reales en la cuenta de Meta correspondiente, en estado `PAUSED`, con el video y el copy correctos — verificado visualmente por Cielo en Meta Ads Manager.
- Cielo puede repetir esto ella misma sin intervención técnica, y publicar manual cuando está conforme.
- Ninguna prueba deja campañas/anuncios "basura" activos en las cuentas reales sin limpiar.

## Notas / Riesgos

- **Riesgo principal ya identificado:** sin la carpeta de Drive organizada (Tarea 0), todo lo demás se puede construir pero no probarse de forma realista — priorizar resolver esto con Cielo antes de avanzar en las tareas técnicas.
- El mapeo marca→Page/Instagram no es 1:1 con las 4 cuentas — confirmado con datos reales, hay que resolverlo por marca.
- Meta puede rechazar el video si no cumple especificaciones (duración, resolución, formato, tamaño) — agregar manejo de error claro en el workflow, no asumido/probado todavía.
- Crear campañas reales (aunque pausadas) cuenta contra el historial de la cuenta — el nombrado reconocible es importante para que Cielo no tenga que investigar qué generó cada campaña.
- Aplicar los gotchas de n8n ya acumulados en [[project-crm-meta-ads]] antes de tocar cualquier workflow de este ecosistema.
- **Probado con datos reales (30/07) hasta donde el permiso lo permitió:** video de "CIRCUITO GRANDE TP 2.mp4" descargado real de Drive (16.4MB), subido a Meta con éxito (video_id real devuelto), campaña real creada en PAUSED (`act_585100972496931`) — todo el mecanismo técnico (Drive→Meta) queda validado. Solo el conjunto de anuncios falló, y solo por el permiso de Página (Tarea 3c).
- **⚠️ Limpieza pendiente:** varias campañas/conjuntos de prueba vacíos quedaron en `act_585100972496931` durante las pruebas de hoy (nombres "TP - Auto - CIRCUITO GRANDE" y "TC - Auto - ..."/"TEST PERMISO TC"), todos en PAUSED sin gasto — borrarlos cuando se cierre este plan.
- **Gotcha de n8n nuevo:** el nodo `httpRequest` con `predefinedCredentialType: 'googleApi'` (Service Account) **NO autentica correctamente contra APIs de Google fuera del nodo nativo** — devuelve 403 "unregistered caller" sin usar ningún token. Para listar/descargar de Drive hay que usar el nodo nativo `n8n-nodes-base.googleDrive` (`authentication:'serviceAccount'`), igual que ya hacía "Fotos — Flujo General". Costó 2 iteraciones de debugging descubrir esto.
- **Gotcha de n8n nuevo:** el nodo nativo `googleDrive` (resource `fileFolder`, operation `search`) **no expone `modifiedTime`** en su output (solo `id`/`name` por defecto, sin opción de agregarlo) — no se puede ordenar por fecha de modificación con este nodo. Se resolvió parseando el NOMBRE de la carpeta (año como número, mes por nombre en español) en vez de depender de metadata de fecha — coincide además con la regla real de Cielo ("el mes más reciente por calendario, no por cuándo se tocó el archivo").
