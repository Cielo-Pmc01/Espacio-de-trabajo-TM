# 00 — Reglas de verificación y fuentes

## Jerarquía de fuentes (de mayor a menor autoridad)
1. Meta for Developers — **https://developers.facebook.com/documentation/ads-commerce/** (las docs de Ads/Commerce se movieron acá; las rutas viejas `/docs/marketing-api/...` aún responden en parte). Graph API: `/docs/graph-api/`.
2. Referencia de objetos Marketing API: `https://developers.facebook.com/docs/marketing-api/reference/...` (ej. `ad-account/insights`).
3. Meta Business Help Center (`facebook.com/business/help/<id>`) y Business Support. ⚠️ Estas páginas cargan con JavaScript: **WebFetch devuelve contenido vacío o inventado por el resumidor** → no confiar en un resumen de WebFetch para Help Center. Usar el navegador (Playwright) o pedirle a Cielo una captura.
4. Herramientas oficiales en vivo: Graph API Explorer, Access Token Debugger, Events Manager → Test Events / Diagnostics, Payload Helper de CAPI.
5. Terceros (blogs, Nango, Chakra, etc.): solo como pista, siempre marcados ⚠️ y contrastados.

## Cuándo es OBLIGATORIO re-verificar
Interfaz actual · permisos y niveles de acceso · endpoints/parámetros · versión de Graph API · políticas · métodos de pago · Business Verification · App Review · restricciones de cuenta · límites numéricos (rate limits, nº de System Users).

## Índice oficial navegable
`https://developers.facebook.com/documentation/ads-commerce/llms.txt` lista las páginas de Ads/Commerce con URL exacta (versión `.md` de cada una). Úsalo para localizar la página correcta antes de buscar a ciegas.
**Trampas de WebFetch (observadas 2026-10-08):** (1) algunas URLs devuelven 404 con `.md` y funcionan sin `.md` (y al revés); probar ambas. (2) El resumidor a veces dice "no está en la página" aunque exista: tratarlo como **no verificado**, no como inexistente. (3) Las URLs inventadas devuelven 404; partir siempre del índice. (4) Páginas sin extraer en esta pasada: referral de CTWA en webhooks, CAPI eventos offline, asignación de assets a System Users por API, App Review en detalle, verificación de dominio/AEM.

## Cómo verificar
- **WebFetch** con un prompt que pida citas/nombres exactos y **que diga explícitamente "si la página no contiene X, decilo"** (el resumidor tiende a rellenar). Contrastar con una segunda fuente cuando el dato sea crítico.
- Si WebFetch dice que la info "no está en el excerpt", tratarlo como **no verificado**, no como inexistente.
- **Versión de API (regla única de la skill):** la **más reciente al 2026-10-08 es v26.0** (lanzada 2026-07-29, según `/docs/graph-api/changelog/`); **v25.0 sigue disponible**. La página `.../marketing-api/overview/versioning` iba atrasada (decía v25.0): **cruzar siempre con el changelog**. En ejemplos y código usar un marcador `{API_VERSION}` y **fijar la versión en una sola variable** de cada integración. Nuevas versiones ~cada 4 meses; gracia ≥90 días. Llamadas sin versión son inválidas.
- **Hechos de la cuenta real:** nunca de docs; de Graph API (GET mínimo), Windsor, Events Manager o capturas de Cielo.

## Protocolo con la cuenta real de Cielo (precauciones)
- **Navegador (Playwright):** inicia sesión Cielo; Claude solo lee. Cero clics en guardar/crear/eliminar/transferir/pagar/aprobar.
- **Graph API:** solo GET; ≤ ~30 llamadas por sesión de investigación; `fields=` mínimos; sin loops; si hay timeout, esperar minutos, 1–2 reintentos máximo, y avisar. Preferir un único `debug_token` y un `/me/businesses` antes que barridos.
- **Escrituras:** POST/DELETE/`execute_action` solo con OK explícito de Cielo para ese cambio puntual. Crear campañas siempre en `PAUSED`.
- **Secretos:** tokens y App Secret fuera del repo. Referenciar credencial n8n por nombre (ej. `Meta_token_Ale sopran_Y_Sergio_Adc`), nunca el valor.
- **Verificación de identidad:** los documentos de una persona pueden hacerse públicos en la Biblioteca de Anuncios — confirmar con la persona antes de recomendarlo 🏢.

## Cómo pedir datos al usuario
Pedir solo lo necesario para el siguiente paso: tipo de asset + ID (los IDs no son secretos), quién ejecuta la acción, texto exacto del error (con `code`, `error_subcode`, `fbtrace_id`), y una captura específica de la pantalla relevante. Nunca pedir tokens completos.

## Registro de verificación de esta skill
| Tema | Fecha | Fuente |
|---|---|---|
| CAPI endpoint/payload/límites | 2026-10-08 | /conversions-api/using-the-api |
| CAPI parámetros | 2026-10-08 | /conversions-api/parameters |
| Dedup Pixel+CAPI | 2026-10-08 | /conversions-api/deduplicate-pixel-and-server-events |
| CAPI WhatsApp | 2026-10-08 | /conversions-api/business-messaging (⚠️ ejemplo con v16.0, verificar versión) |
| Rate limiting | 2026-10-08 | /marketing-api/overview/rate-limiting |
| Versionado | 2026-10-08 | /marketing-api/overview/versioning |
| Autorización/permisos | 2026-10-08 | /marketing-api/get-started/authorization |
| Códigos de error | 2026-10-08 | /docs/graph-api/guides/error-handling |
| Tipos de token | 2026-10-08 | /docs/facebook-login/guides/access-tokens/ |
| debug_token | 2026-10-08 | /docs/graph-api/reference/debug_token/ |
| System Users | 2026-10-08 | /docs/marketing-api/system-users/overview |
