# Guía paso a paso: conectar Instagram y Facebook (Messenger) a Chatwoot

> Creada 2026-10-23. Basada en el servidor real `72.60.149.227` (Dokploy B, `srv1127624`), revisado por SSH en **solo lectura**. Nada fue modificado.

---

## 1. Estado real del servidor (verificado hoy)

| Dato | Valor |
|------|-------|
| Chatwoot | **v4.18.0** (la memoria vieja decía 4.14.0), imagen `chatwoot/chatwoot:latest` |
| URL pública | `https://iadventurecenter.com` (`FRONTEND_URL`), Traefik con Let's Encrypt |
| Proyecto Dokploy | `chatwoot-chatwoot-ts9frq` · compose en `/etc/dokploy/compose/chatwoot-chatwoot-ts9frq/code/` |
| Contenedores | `...-chatwoot-rails-1`, `...-sidekiq-1`, `...-postgres-1` (pgvector pg14), `...-redis-1` |
| Cuentas de Chatwoot | 1 Patagonia Booking (56 bandejas, la de Magda), 2 VP, 3 "Desarrollo Facebook APP Connect", 4 Correos |
| Variables de Meta | **Ninguna definida**: `FB_APP_ID`, `FB_APP_SECRET`, `FB_VERIFY_TOKEN`, `IG_VERIFY_TOKEN`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` → todas NO DEFINIDAS |
| Canales hoy | 53 Api (Evolution), 9 WebWidget, 1 Email, 1 WhatsApp, **0 Instagram**, 1 FacebookPage (ver nota) |

**Nota sobre el inbox de Facebook existente:** es el inbox 59, cuenta 3, creado el 2025-02-15, con nombre de página de prueba ("Enlightened Business People in Favor of a Local Burger Joint"). Es un resto de una prueba vieja, sin uso real. No tocar hasta confirmarlo.

**Conclusión:** hoy ni Instagram ni Facebook se pueden conectar. Falta crear la app en Meta y cargar sus credenciales en Chatwoot.

---

## 1b. Avance en Meta (2026-10-23)

App creada: **Chatwoot Adventure Center**, ID `1672817091080677`, portafolio Turismo Patagonia (verificado), casos de uso Messenger + Instagram. Modo: sin publicar.
- **Instagram tiene su propio ID de app: `1127708207063876`** (distinto del de Facebook). Su clave secreta se ve en Casos de uso → API de Instagram. Va en `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET`. El ID/clave de Facebook (`1672817091080677`) van en `FB_APP_ID` / `FB_APP_SECRET`.
- Hecho: dominio `iadventurecenter.com`, política/condiciones/eliminación de datos (`https://turcentral.com.ar/privacy-policy/`, igual que Claude IA - Ads), categoría "Negocios y páginas", ícono Tur Central, permisos de Instagram agregados, URL de redirección OAuth `https://iadventurecenter.com/instagram/callback`.
- **Cambio de orden:** Meta avisa "para recibir webhooks, la app debe estar publicada". El webhook de Instagram NO se puede verificar hasta pasar la app a Live. Orden real: cargar variables en Chatwoot → redeploy → publicar la app → verificar webhooks.
- Pendiente: webhooks (Instagram y Messenger), rol de prueba para quien administra Tur Central, revisión de permisos, publicar.

---

## 2. Cómo funciona (dos canales distintos en Chatwoot 4.18)

| Canal | Para qué | Credenciales de Chatwoot | Permisos de Meta |
|-------|----------|--------------------------|------------------|
| **Instagram** (Instagram Login) | DMs de Instagram. Se conecta cuenta por cuenta con el login de Instagram, **sin necesitar la Página de Facebook** | `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `INSTAGRAM_VERIFY_TOKEN` | `instagram_business_basic`, `instagram_business_manage_messages` |
| **Messenger** (Facebook Page) | Mensajes de la Página de Facebook | `FB_APP_ID`, `FB_APP_SECRET`, `FB_VERIFY_TOKEN` | `pages_messaging`, `pages_manage_metadata`, `pages_show_list`, `pages_read_engagement`, `business_management` |

Además existe `IG_VERIFY_TOKEN` (usado por la ruta de webhook de Instagram). **Cargar `IG_VERIFY_TOKEN` e `INSTAGRAM_VERIFY_TOKEN` con el mismo valor** para no depender de cuál lea esta versión.

**URLs que Meta va a necesitar (todas bajo `iadventurecenter.com`):**
- Webhook Messenger: `https://iadventurecenter.com/bot`
- Webhook Instagram: `https://iadventurecenter.com/webhooks/instagram`
- Callback OAuth de Instagram: `https://iadventurecenter.com/instagram/callback`

---

## 3. Decisiones previas (necesito tu confirmación)

1. **App de Meta nueva y exclusiva para mensajería** (recomendado), por ejemplo "Chatwoot Adventure Center". No reutilizar `Claude-AI` ni `Claude IA - Ads`, que manejan los tokens de anuncios (`ads_management`). Mezclar mensajería y anuncios en la misma app aumenta el riesgo si se filtra el secreto.
2. **Cuenta de Chatwoot destino:** la **1** (Patagonia Booking), porque es donde corren Magda y el webhook a n8n.
3. **Marca piloto:** una sola (1-2 como máximo, acordado antes). Sugerencia: una que ya tenga Instagram y Página de Facebook vinculadas y permiso de Página asignado (por ejemplo Tur Central o TB BR, donde ya hay permiso de anunciar).
4. **Horario del despliegue:** ver paso 6. Reinicia el sistema que usan los vendedores.

---

## 4. Paso a paso

### PASO 1: Prerrequisitos en Meta (los hace Cielo en la web)
1. Entrar a `business.facebook.com` → Configuración del negocio → **Centro de seguridad** → confirmar que la **Verificación del negocio** está completa. Si no lo está, iniciarla ahora porque tarda días y es lo que más demora todo.
2. Para la marca piloto: confirmar que el Instagram es **Business/Creator** y está vinculado a su Página de Facebook (ya confirmado para las originales).
3. Confirmar que tu usuario es **administrador** de la Página y del Instagram de esa marca en el portafolio correcto.

### PASO 2: Crear la app en Meta for Developers
1. `developers.facebook.com` → Mis apps → **Crear app**. Tipo: **Empresa (Business)**. Vincularla al portafolio dueño de las marcas.
2. **Configuración de la app → Básica:**
   - Dominios de la app: `iadventurecenter.com`
   - URL de política de privacidad (obligatoria para pasar a Live)
   - Anotar **ID de la app** y **Clave secreta** (esos son `FB_APP_ID` y `FB_APP_SECRET`).
3. **Agregar productos:**
   - **Messenger** (para Facebook) y **Instagram** (para Instagram API con Instagram Login).
   - **Facebook Login for Business** (lo usa Chatwoot para conectar las Páginas).
4. En el producto **Instagram** → "API setup with Instagram login": ahí aparece un **ID de la app de Instagram** y una **Clave secreta de la app de Instagram**. **No son los mismos** que los de Facebook. Son `INSTAGRAM_APP_ID` e `INSTAGRAM_APP_SECRET`.
5. En ese mismo producto, configurar:
   - **Webhook de Instagram:** URL de devolución `https://iadventurecenter.com/webhooks/instagram` y token de verificación (el que vayas a poner en `IG_VERIFY_TOKEN`). **Todavía no se puede verificar**: Chatwoot recién lo responde después del paso 4. Dejarlo para el paso 5.
   - **URL de redireccionamiento OAuth:** `https://iadventurecenter.com/instagram/callback`

### PASO 3: Inventar los tokens de verificación
Generar dos cadenas aleatorias largas (una para Messenger, otra para Instagram), por ejemplo con `openssl rand -hex 24`. Guardarlas en el gestor de contraseñas. No se pegan en el chat ni se suben a git.

### PASO 4: Cargar las variables en Chatwoot (Dokploy, lo hace Cielo)
Esto es el punto técnico clave. **No alcanza con agregarlas a la pestaña "Environment"**: el compose solo pasa al contenedor las variables que están listadas en su bloque `environment:` (por eso `OPENAI_API_KEY` existe en el `.env` pero el contenedor no la recibe).

1. Dokploy (`http://72.60.149.227:3000`) → proyecto **chatwoot** → pestaña **Environment**: agregar
   ```
   FB_APP_ID=...
   FB_APP_SECRET=...
   FB_VERIFY_TOKEN=...
   IG_VERIFY_TOKEN=...
   INSTAGRAM_APP_ID=...
   INSTAGRAM_APP_SECRET=...
   INSTAGRAM_VERIFY_TOKEN=...   (mismo valor que IG_VERIFY_TOKEN)
   ```
2. Editar el **docker-compose** (pestaña General/Compose) y, dentro de `x-base-config` → `environment:`, agregar debajo de `RAILS_MAX_THREADS`:
   ```
   - FB_APP_ID=${FB_APP_ID}
   - FB_APP_SECRET=${FB_APP_SECRET}
   - FB_VERIFY_TOKEN=${FB_VERIFY_TOKEN}
   - IG_VERIFY_TOKEN=${IG_VERIFY_TOKEN}
   - INSTAGRAM_APP_ID=${INSTAGRAM_APP_ID}
   - INSTAGRAM_APP_SECRET=${INSTAGRAM_APP_SECRET}
   - INSTAGRAM_VERIFY_TOKEN=${INSTAGRAM_VERIFY_TOKEN}
   ```
   Esto aplica a `rails` y `sidekiq` a la vez (comparten `x-base-config`).

### PASO 5: Antes de redesplegar, protegé el sistema ⚠️
Chatwoot es **crítico** (vendedores + Magda). Antes de tocar nada:
1. **Backup de la base** (lo puedo hacer yo por SSH, es solo lectura sobre la base):
   `docker exec <postgres> pg_dump -U <user> <db> | gzip > /root/backup-chatwoot-AAAA-MM-DD.sql.gz`
2. **Imagen `latest`:** el compose usa `chatwoot/chatwoot:latest`. Si Dokploy hace pull al redesplegar, puede subir de versión sin avisar y pisar las modificaciones custom (`zzz_plan_lock.rb`, branding). Antes: anotar el digest actual (`docker inspect` de la imagen) y, si querés, fijar la versión `v4.18.0` en el compose.
3. **Horario:** redesplegar fuera del horario de ventas (madrugada o domingo). Rails tarda 1-3 minutos en volver. Avisar al equipo.
4. Consultarle al programador (dueño del servidor) antes de redesplegar. Es su infraestructura.

### PASO 6: Redesplegar y verificar
1. Dokploy → **Deploy/Redeploy** del compose de Chatwoot.
2. Verificar que las variables llegaron (lo hago yo por SSH, sin mostrar valores):
   `docker exec <rails> printenv FB_APP_ID INSTAGRAM_APP_ID` → deben aparecer definidas.
3. Verificar que Chatwoot arrancó: `https://iadventurecenter.com` carga y los inbox de WhatsApp siguen recibiendo.

### PASO 7: Verificar los webhooks en Meta
1. En el producto **Instagram** de la app → Webhooks → URL `https://iadventurecenter.com/webhooks/instagram` + el token `IG_VERIFY_TOKEN` → **Verificar y guardar**. Suscribirse al campo `messages` (y `messaging_seen`, `message_reactions` si querés).
2. En el producto **Messenger** → Webhooks → URL `https://iadventurecenter.com/bot` + `FB_VERIFY_TOKEN` → verificar. Suscribir `messages`, `messaging_postbacks`, `message_deliveries`, `message_reads`, `message_echoes`.
3. Si falla la verificación: revisar que no esté Cloudflare bloqueando (ya hubo 403 a clientes sin User-Agent) y mirar `docker logs <rails>` mientras apretás el botón.

### PASO 8: Conectar la marca piloto (modo Desarrollo)
1. En la app de Meta: **Roles → Roles** → agregar a Cielo (y a quien pruebe) como administrador o probador. En modo Desarrollo solo funcionan las cuentas con rol en la app.
2. Chatwoot → cuenta 1 → **Configuración → Bandejas → Agregar bandeja → Instagram** (y luego **Messenger**).
3. Instagram: te lleva al login de Instagram, aceptás permisos, y la bandeja queda creada. Messenger: login con Facebook, elegís la Página.
4. Asignar agentes y equipo a la bandeja nueva (como en las demás).
5. **Prueba:** desde otra cuenta de Instagram con rol en la app, mandar un DM a la marca piloto. Debe aparecer en Chatwoot y poder responderse.

### PASO 9: Pasar a producción (para clientes reales)
Mientras la app esté en modo Desarrollo, **solo llegan mensajes de cuentas con rol en la app**. Para clientes reales:
1. Completar la **Verificación del negocio** (paso 1).
2. **App Review** para: `instagram_business_manage_messages`, `instagram_business_basic`, `pages_messaging`, `pages_manage_metadata`, `pages_show_list`, `pages_read_engagement`, `business_management`. Meta pide un video de demostración del caso de uso (cliente escribe → agente responde en Chatwoot) y la política de privacidad.
3. Cambiar la app a **Live**.
4. Aclaración honesta: no está verificado si, al ser cuentas propias del mismo negocio, Meta deja operar con acceso estándar sin revisión completa. Se descubre en la prueba del paso 8/9; planificar igual el trámite.

### PASO 10: Escalar a las demás marcas
Una vez validada la piloto, repetir el paso 8 por marca (cada Instagram y cada Página se conecta como una bandeja nueva). Son hasta 32 Instagram. Definir antes una convención de nombres de bandeja (ej. `IG - Tur Central`, `FB - Tur Central`) para que los reportes por bandeja (`inbox_id`) sigan funcionando.

### PASO 11: Conectar con Magda / n8n (opcional, después)
El webhook de Chatwoot que dispara a Magda es de cuenta: los eventos de las bandejas nuevas van al mismo webhook. **Cuidado:** Magda hoy asume WhatsApp. Antes de activar IA en IG/FB, revisar los workflows de n8n para que no respondan en un canal que no esperan (por ejemplo, formato de teléfono, plantillas). Se puede filtrar por `channel` en el primer nodo. Arrancar sin IA, solo con vendedores humanos.

---

## 5. Riesgos y reglas

- **Ventana de 24 horas:** Instagram y Messenger solo permiten responder dentro de las 24 h del último mensaje del cliente (salvo etiqueta de agente humano, que requiere aprobación adicional). Los agentes tienen que saberlo.
- **Seguridad:** `FB_APP_SECRET` e `INSTAGRAM_APP_SECRET` no se suben a git ni a este workspace. Quedan solo en Dokploy. El repo del workspace tiene credenciales reales y hay que verificar que sea privado.
- **Servidor ajeno:** el VPS es del programador; yo trabajo solo en lectura. Cualquier cambio (compose, redeploy) lo hace Cielo desde el panel, y con aviso al programador.
- **Resto de prueba:** el inbox 59 (cuenta 3) y la cuenta "Desarrollo Facebook APP Connect" sugieren que alguien ya intentó esto en 2025. Preguntarle al programador qué app de Meta usó, por si ya existe una reutilizable.
- **Atribución:** los reportes por anuncio (ver `project-atribucion-ventas-anuncios-chatwoot`) hoy solo cubren WhatsApp. Los DMs de IG/FB abren un canal nuevo de atribución a revisar después.

## 6. Qué puedo hacer yo y qué no

| Lo hago yo (SSH, solo lectura) | Lo hace Cielo |
|---|---|
| Backup de la base, verificar variables, leer logs, confirmar que los webhooks llegan | Crear la app en Meta, verificación del negocio, App Review |
| Preparar el bloque exacto del compose | Cargar variables y redesplegar en Dokploy |
| Revisar los workflows de n8n antes de activar IA | Aprobar el horario del redeploy con el programador |
