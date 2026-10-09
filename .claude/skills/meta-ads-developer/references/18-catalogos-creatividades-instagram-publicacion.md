# 18 — Catálogos, creatividades dinámicas y publicación en Instagram

✅ doc oficial leída el 2026-10-08 · ⚠️ no extraído/re-verificar. Las páginas resumidas por WebFetch pueden omitir datos: "no especificado" = **no verificado**.

## 1. Catálogos: cargar ítems ✅ parcial (`catalog/guides/manage-catalog-items`)
- **Batch API:** las actualizaciones viajan **directamente en el payload de un POST**; **para borrar productos siempre hay que hacer una llamada DELETE**.
- **Alternativa:** **Feed API** subiendo datos en modo **"replace"** con actualizaciones **programadas** (por hora, día o semana). Los feeds también pueden cargarse desde hojas de cálculo (ver `09`).
- ⚠️ **No extraído:** endpoint exacto (`/{catalog_id}/items_batch` ⚠️ de memoria), estructura `requests[]` (`CREATE`/`UPDATE`/`DELETE`), `item_type`, `allow_upsert`, límites por tanda y frecuencia, campos obligatorios del producto y formato de precio. **No generar código de carga de catálogo sin leer la referencia del Batch API.**
- **Product sets:** la referencia `/docs/marketing-api/reference/product-set/` dio 404 → ⚠️ sin verificar cómo se crean ni cómo se usan en anuncios dinámicos.
- 🏢 En Turismo Patagonia existen **catálogos "Shadow"** creados por Meta (barilocheexcursiones.com.ar, centroreservasbariloche.com, adventurecenter.com.ar); TB tiene la Página sin dueño, lo que bloquea catálogo (ver `99`).

## 2. Advantage+ creative ✅ parcial (`marketing-api/creative/advantage-creative`)
Aplica a anuncios de **imagen única, video único, carrusel, catálogo o publicación existente**: crea **variaciones automáticas** del anuncio y muestra a cada cuenta del Centro de cuentas la que tenga más probabilidad de respuesta. ⚠️ **No extraído:** qué mejoras concretas incluye (brillo/recorte, música, plantillas de texto, texto con IA), el control por API (`degrees_of_freedom_spec` / `creative_features_spec` con *opt in/out* por función ⚠️ de memoria) y recomendaciones para marcas con identidad estricta. **Consecuencia 🧭:** antes de activarlo para marcas con tono/diseño muy definido (ej. Rafting Patagonia "sobrio y pro"), revisar y apagar las mejoras que alteren la identidad, y verificar el campo exacto en la referencia de `AdCreative`.

## 3. Creatividades dinámicas (`asset_feed_spec`) ✅ parcial (`ad-creative/asset-feed-spec`)
- Campos: `images` (por hash), `videos` (con `video_id`, `thumbnail_url`, `url_tags`), `bodies`, `titles`, `descriptions`, `link_urls`, `call_to_action_types` (ej. `SHOP_NOW`), `ad_formats` (ej. `SINGLE_IMAGE`, `SINGLE_VIDEO`) y `optimization_type`. Se envía por Graph API con **múltiples variantes por tipo de asset**; Meta entrega combinaciones distintas a distintos usuarios.
- **Reglas verificadas:** mínimo **2 reglas** para *Asset Customization Rules*; **no mezclar** reglas de personalización con Dynamic Creative.
- ⚠️ **No extraído:** cantidad máxima de variantes por tipo y cómo ver resultados por combinación (los breakdowns `image_asset`, `video_asset`, `body_asset`, `title_asset`, `link_url_asset` existen en Insights ✅ ver `16`, pero no se confirmó su uso con `asset_feed_spec`).

## 4. Publicación en Instagram por API ✅ (`docs/instagram-platform/content-publishing`)
- **Paso 1 — crear contenedor:** `POST /{ig-user-id}/media` con `image_url` o `video_url` (**URL pública**), `media_type` (`VIDEO`, `REELS`, `STORIES`, `CAROUSEL`), y `is_carousel_item=true` si es parte de un carrusel. Responde `{ "id": "<IG_CONTAINER_ID>" }`.
- **Paso 2 — publicar:** `POST /{ig-user-id}/media_publish` con `creation_id=<IG_CONTAINER_ID>` → `{ "id": "<IG_MEDIA_ID>" }`.
- **Estado del contenedor:** `GET /{IG_CONTAINER_ID}?fields=status_code` → `IN_PROGRESS`, `FINISHED`, `PUBLISHED`, `ERROR`, `EXPIRED`. **Esperar `FINISHED` antes de publicar** (los videos tardan).
- **Límite: 100 publicaciones por 24 horas** (un carrusel cuenta como una). Consultar el cupo: `GET /{IG_ID}/content_publishing_limit`.
- ⚠️ **No extraído:** permisos exactos por tipo de login (Instagram vs Facebook; ver `17`), tokens, restricciones de formato (JPEG), máximo de elementos por carrusel (⚠️ 10 de memoria) y requisitos de autorización de publicación de la Página (PPA).
- **Aplicación 🧭 (Luciana/redes):** un flujo n8n de publicación programada = crear contenedor → *polling* de `status_code` → publicar; el video debe estar en una URL pública accesible (ej. Drive público no sirve si requiere login); registrar el `IG_MEDIA_ID` y respetar el cupo diario.
