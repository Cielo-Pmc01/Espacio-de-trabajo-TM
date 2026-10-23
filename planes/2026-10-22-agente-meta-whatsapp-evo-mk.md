# Plan: Agente de Meta Ads por WhatsApp (base evo-mk) para Adventure Center

**Fecha:** 2026-10-22
**Estado:** En curso — Fases 0–2 hechas, 3 y 4 casi completas (2026-10-22): falta el mensaje real de Cielo, pasar a modo real y la prueba de escritura 4.4
**Proyecto:** [TM] Agente Meta Ads — evo-mk adaptado · VPS A (`187.127.39.222`, `srv1793086`)

## Contexto y Justificación

Cielo quiere un agente que viva en WhatsApp y trabaje con las campañas y anuncios de Meta de las marcas de Adventure Center, usando lo que ya construimos: la skill `meta-ads-developer` y el agente `meta-campaign-builder` (playbook, activos, bitácora).

La base es **evo-mk**, el asistente que hizo Markco Digital (Luciano) para Agencia Sunsky: un servicio Node que lee WhatsApp desde Evolution API y le pasa los mensajes a Claude Code (`claude -p`), con herramientas MCP propias, permisos por canal y confirmación de acciones sensibles por WhatsApp. El código ya está subido en `/root/evo-mk` del VPS A (sin `.env`, sin credenciales, sin datos de clientes; revisado el 2026-10-22).

**Criterio de Cielo:** agente general y sin limitaciones al empezar. Las restricciones se agregan después, a medida que aprende (vía `playbook.md`). Primero se prepara la base prolija y después se hacen las conexiones.

## Decisiones ya tomadas

| Tema | Decisión |
|---|---|
| Servidor | VPS A `187.127.39.222` (Dokploy de Cielo; aloja n8n, capacitación, Plataforma TM, Evolution de alertas, Gotenberg) |
| Node | ✅ Actualizado a **v24.22.1** (release de seguridad 2026-10-20, checksum oficial verificado). Anterior guardado en `/opt/node-v24.11.0-anterior` |
| Memoria del servicio | `MemoryMax=3G` como viene (pedido de Cielo) |
| Cuenta de Claude | La cuenta **de la empresa** de Cielo (login interactivo en el VPS) |
| Número del agente | **+54 9 294 499-5727** (instancia nueva en el Evolution del VPS A) |
| Evolution | El existente `plataforma-tm-evolutionapi-zlivm1-evolution-api-1`, imagen **v2.3.7** (ya fijada: no está en `latest`) |
| Chatwoot | **No** en la primera etapa (no es necesario: el agente lee WhatsApp directo de Evolution). Módulo opcional para más adelante |
| Canales | Solo el privado de Cielo al empezar. Sin grupos de clientes (los de Sunsky se quitan) |

## Alcance

**Incluye:**
- Adaptar evo-mk a Adventure Center: quitar lo de Sunsky, parametrizar para el VPS A, prompts y conocimiento propios.
- Instalar dependencias en el VPS A (Claude Code, sandbox, utilidades) y dejarlo como servicio.
- Conectar el número del agente (Evolution) y el MCP oficial de Meta Ads, con la skill `meta-ads-developer` y el contexto del agente de campañas.
- Modo pruebas (`DRY_RUN`) antes de habilitarlo de verdad.
- Frentes adicionales en fases posteriores (ver Fase 5).

**No incluye (por ahora):**
- Chatwoot, grupos de WhatsApp, atención a clientes.
- Kit multimedia pesado (Chromium, voces Piper, moviepy).
- Tocar el VPS B (es del programador, solo lectura).

## Arquitectura / Decisiones Técnicas

```
Cielo (WhatsApp personal) ──► número del agente 294 499-5727
                                   │
                         Evolution API v2.3.7 (Docker, VPS A)
                                   │  polling cada 2 s (red interna Docker, sin puertos nuevos)
                         evo-mk (systemd, Node 24.22.1, root)
                                   │  canal único "cielo"
                         claude -p (cuenta empresa) ── skills + CLAUDE.md del agente
                                   │
             ┌─────────────────────┼───────────────────────────┐
     MCP evo (WhatsApp,       MCP meta-ads oficial          Conectores de la cuenta
     avisos, adjuntos)        (mcp.facebook.com/ads,         (Windsor de respaldo,
                              OAuth con Facebook)            Supabase lectura, Drive…)
```

- **Código propio:** el evo-mk adaptado vive en un repo privado nuevo (no en el repo del workspace, que ya tiene credenciales). Copia local en `salidas/evo-mk/` (ignorada por git del workspace). Ramas descriptivas; nunca push directo a `main`.
- **Skill y contexto del agente:** se sincronizan del workspace al VPS solo las carpetas necesarias (`.claude/skills/meta-ads-developer/`, `contexto/tm/meta-ads/agente-campanas/`, `brand_profiles.md`, `copy_protocol.md`). Nunca el repo completo.
- **"Sin limitaciones" con una sola guarda por defecto:** todas las herramientas de Meta permitidas sin preguntar, **excepto** lo que gasta plata o publica (activar campañas/anuncios, cambiar presupuestos, borrar). Eso pide "si" por WhatsApp. Motivo: un error ahí cuesta dinero real y no se deshace. Cielo puede quitar la guarda cuando quiera (es una línea en `claude-settings.json`).
- **Por qué es razonable abrir el resto:** al empezar, el único que le escribe al agente es Cielo (`ALLOWED_NUMBERS`). El riesgo de instrucciones maliciosas metidas en mensajes aparece cuando se sumen clientes o grupos; ahí se agregan restricciones.

## Tareas

### Fase 0 — Prerrequisitos y decisiones
- [x] 0.1 Confirmar acceso SSH al VPS A (clave `~/.ssh/dokploy_vps`).
- [x] 0.2 Revisar el código subido: sin `.env`, sin credenciales, sin datos de clientes.
- [x] 0.3 Actualizar Node a v24.22.1 (verificado contra `nodejs.org/dist/index.json` y SHASUMS256).
- [x] 0.4 Número que da órdenes: **+54 9 2944 99-5806** (`ALLOWED_NUMBERS=5492944995806`).
- [ ] 0.5 **Cielo:** elegir el usuario de Facebook para autorizar el MCP de Meta (tiene que tener acceso a las cuentas publicitarias de todas las marcas).
- [x] 0.6 Decisión de Cielo: **siempre el login de la cuenta Pro/Max, nunca API key** (forzado con `forceLoginMethod: claudeai` y el entorno en lista blanca). No se vuelve a plantear el tema de los términos.
- [x] 0.7 Swap de 2 GB creado en el VPS A (`/swapfile`, persistente, `swappiness=10`). Evolution 2.3.7 confirmada como última sin licencia: no se actualiza.
- [x] 0.8 Guarda confirmada (activar/estado/presupuesto/promocionar/borrar piden «si»).

### Fase 1 — Base limpia (la "interfaz")
- [x] 1.1 Código en `salidas/evo-mk/` (repo git local, primer commit = original de Markco). ⏳ Falta el remoto privado en GitHub.
- [x] 1.2 Quitar lo específico de Sunsky: canales `vocero` y `monitor`, `cola.ts` y `pieza.ts` (la Cola y las piezas), el MCP `sunsky`, webhooks de n8n de Sunsky, servidor de medios `media.agenciasunsky.com`, conector `n8n-sunsky` de los permisos.
- [x] 1.3 Dejar Chatwoot como módulo opcional: si no hay `CHATWOOT_TOKEN`, no se arranca el lector de notas ni se registran sus herramientas.
- [x] 1.4 Parametrizar `config.ts` para el VPS A: contenedor y red de Evolution (`plataforma-tm-evolutionapi-zlivm1-…`), sin defaults de Sunsky.
- [x] 1.5 Prompts nuevos: `prompt.md` (agente de Meta Ads de Adventure Center, siempre en español, cómo usar el MCP, `client_conversation_id`, bitácora/playbook) y `adventure-center.md` (marcas, cuentas, reglas de copy, a partir de `brand_profiles.md` y `copy_protocol.md`). Reemplaza a `agencia.md`.
- [x] 1.6 `claude-settings.json`: permisos abiertos para Meta y lectura; guarda en acciones que gastan/publican/borran; `deny` con las rutas sensibles **reales** del VPS A (`/etc/dokploy`, `.env` de las apps de Dokploy, `/root/.ssh`, credenciales de Claude); quitar las rutas del servidor de Sunsky.
- [x] 1.7 `grupos.json` vacío (sin grupos de clientes).
- [x] 1.8 Rutina diaria adaptada a Meta (ver 5.3); desactivada hasta Fase 4.
- [x] 1.9 En el VPS: `npm ci`, `npm run typecheck` OK y `npm test` 12/12.

### Fase 2 — Instalación en el VPS A (modo pruebas)
- [x] 2.1 Paquetes del sistema mínimos: `bubblewrap`, `socat`, `ripgrep`, `ffmpeg` (hoy no están).
- [x] 2.2 Perfil de AppArmor para bubblewrap según la documentación vigente de Claude Code para Ubuntu 24.04 (sin esto el sandbox de comandos no funciona).
- [x] 2.3 Instalar Claude Code con el método oficial vigente (verificar la doc el día de la instalación) en `/root/.local/bin/claude`.
- [x] 2.4 Login de Cielo: claude.ai, plan Pro, cuenta de la empresa (verificado con `claude auth status`).
- [x] 2.5 Desplegar el código adaptado en `/root/evo-mk`, crear `.env` con `chmod 600`, `ENABLED=false`, `DRY_RUN=true`.
- [x] 2.6 Servicio systemd habilitado y corriendo.
- [x] 2.7 Entorno de pruebas con simulaciones OK (presentación, lectura de cuentas de Meta).

### Fase 3 — Conexión de WhatsApp
- [x] 3.1 Opción A de Cielo: se usa la instancia existente `alertas-meta-ads` (ya conectada al 294 499-5727; las alertas siguen igual). Sin QR.
- [x] 3.2 Token de la instancia y `ALLOWED_NUMBERS=5492944995806` en `.env` (cargado sin mostrarlo).
- [x] 3.3 `node src/revisar.ts` (auditoría de solo lectura) para confirmar que filtra bien.
- [x] 3.4 (Reemplazado por `revisar.ts` sobre 72 h: reconoce a Cielo, ignora 328 chats ajenos, 20 de grupos y 353 propios.)
- [~] 3.5 `ENABLED=true` + `DRY_RUN=true` corriendo. Falta: mensaje real de Cielo y pasar a `DRY_RUN=false` con su OK.

### Fase 4 — Conexión con Meta
- [x] 4.1 MCP `meta-ads` como servidor de usuario (callback fijo 33418) y autorizado por Cielo con túnel `ssh -L 33418:localhost:33418`. ✔ Connected.
- [x] 4.2 Sincronizar al workspace del agente: skill `meta-ads-developer`, `playbook.md`, `activos.md`, `bitacora.md` y un `CLAUDE.md` del agente.
- [x] 4.3 Lectura OK: el agente listó las 8 cuentas (coinciden con activos.md) y marcó pagos pendientes, cuentas sin medio de pago y la USD no habilitada.
- [ ] 4.4 Prueba de escritura: crear una campaña de prueba **pausada**, verificarla en el Administrador de anuncios, y borrarla (con "si"). ✅ Esquema verificado: las creaciones no tienen estado y quedan en borrador; solo `ads_activate_entity` publica (y sale todo ACTIVO).
- [ ] 4.5 Windsor.ai como respaldo para las cuentas que el MCP no habilita (hoy: Turismo Patagonia USD y Rafting Adventure ARS).

### Fase 5 — Frentes adicionales (propuestos, cada uno con OK de Cielo)
- [ ] 5.1 **Notas de voz:** whisper.cpp local (modelo small, español) para mandarle audios al agente. ~500 MB de RAM.
- [x] 5.2 **Creatividades (videos):** servidor de medios propio `media.iadventurecentersx.online` (DNS tipo A en DonWeb → VPS A; nginx + Traefik, HTTPS, carpetas aleatorias, borrado a las 24 h) + `bin/publicar-media.sh` + instrucciones en el prompt. Probado de punta a punta (10/10). ⏳ Falta la primera subida real a Meta (4.4/5.2b) y de dónde salen los videos por marca (Drive).
- [ ] 5.3 **Rutina diaria de Meta (9:00):** gasto de ayer por marca, campañas sin entrega, anuncios rechazados, saldos bajos (reusar la lógica de alertas de saldo), y acciones propuestas numeradas.
- [ ] 5.4 **Lectura de Supabase** (`meta_ads.metrics_daily`, `messages_by_brand_month`) para reportes y comparaciones históricas, solo lectura.
- [ ] 5.5 **MCP propio de Marketing API** con el token de System User, para lo que el MCP oficial no cubra (reglas automáticas, subida de imágenes, cuentas no habilitadas). Siguiendo la guía "B.2" de Markco.
- [ ] 5.6 **Copy:** que use el protocolo de copy y el motor de copys existente (precios de Docs 3/4 en vivo).
- [ ] 5.7 **Chatwoot** (cuando se quiera): notas `@claude` en conversaciones y atribución anuncio → WhatsApp → venta.
- [ ] 5.8 **Panel web de estado** (opcional): ver canales, costos por turno y permisos pendientes sin entrar por SSH.

### Fase 6 — Operación
- [x] 6.1 Backup diario a las 03:30 UTC (`evo-mk-backup.timer`) en `/root/backups-evo-mk/`, 14 días. Probado.
- [ ] 6.2 Aviso por WhatsApp si el servicio se cae o se llega al límite de la cuenta de Claude.
- [ ] 6.3 Registro del costo estimado por turno (viene en el evento `result`).
- [ ] 6.4 Documentación: `contexto/tm/meta-ads/agente-whatsapp.md` + memoria del proyecto + actualizar `CLAUDE.md`.
- [ ] 6.5 Revisión a las 2 semanas: qué hizo, qué falló, qué reglas pasan al playbook.

## Decisiones de la Fase 1 (2026-10-22)
- Rutina: 9:00 todos los días + resumen semanal los lunes; mide resultados según el objetivo de cada campaña; revisa todas las cuentas activas.
- Herramientas de Meta: 97 del MCP oficial (nombres tomados de sesiones reales). Guarda con reglas `ask` (verificado en la doc: deny → ask → allow) + hook PreToolUse que frena `ads_create_*` con estado ACTIVE. Conectores de Meta de la cuenta de claude.ai bloqueados.
- Pendiente menor: el manual de Evolution de Markco (`workspace/docs/evolution-api.md`) no vino en el paquete; está en el servidor personal de Cielo.

## Registro Fase 2 (2026-10-22)
- Paquetes: bubblewrap 0.9.0, socat 1.8.0, ripgrep 14.1.0, ffmpeg 6.1.1. Perfil AppArmor `/etc/apparmor.d/bwrap` (Ubuntu exigía: `apparmor_restrict_unprivileged_userns=1`), prueba de bwrap OK.
- Claude Code 2.1.308 con el instalador oficial en `/root/.local/bin/claude` (se actualiza solo). PATH agregado en `/root/.bashrc`.
- Código en `/root/evo-mk` (el paquete de Markco quedó en `/root/evo-mk-original-markco`). `.env` con `ENABLED=false`, `DRY_RUN=true`, `ALLOWED_NUMBERS=5492944995806`, chmod 600.
- Contexto subido con `deploy/contexto.sh` a producción y pruebas (4 skills, 20 referencias de meta-ads-developer, playbook/activos/bitácora, contexto de marcas).

## Registro Fases 3 y 4 (2026-10-22)
- Mensaje real de Cielo («Hola cuanto gastamos ayer en total») llegó al servicio en DRY_RUN: reconocido, encolado y procesado. Pero la cuenta de Claude estaba al 95 % de la ventana de 5 h (Opus + mis simulaciones + la rutina) y respondió «Llegué al límite… se renueva cerca de las 17:00». Aprendizaje: **no se puede evaluar la respuesta real hasta que se renueve**; las simulaciones de prueba también gastan cuota.
- Medida: `CLAUDE_MODEL=sonnet` (reversible borrando la línea del `.env`). Verificar en la próxima prueba que el alias resuelve bien.
- Pendiente: re-enviar el mensaje de prueba después de las 17:00 (Argentina), revisar la respuesta, y con el OK de Cielo pasar a `DRY_RUN=false`.

## Criterio de Éxito

- Cielo le escribe al 294 499-5727 desde su celular y el agente responde en español.
- El agente lista las cuentas y el rendimiento de las marcas con el MCP de Meta.
- Crea una campaña de prueba pausada que aparece en el Administrador de anuncios.
- Las acciones que gastan plata le piden "si" a Cielo por WhatsApp, y sin "si" no se hacen.
- El servicio sobrevive a un reinicio del VPS y no afecta a n8n ni al resto de Dokploy.

## Notas / Riesgos

- **Términos de Anthropic:** usar una cuenta de suscripción para un servicio automático 24/7 tiene información contradictoria en fuentes no oficiales. Verificar en el Centro de ayuda y en las páginas legales de Anthropic antes de la Fase 2 (tarea 0.6).
- **MCP de Meta:** está en beta abierta; algunas cuentas no están habilitadas (`is_ads_mcp_enabled: false`). Las fuentes secundarias dicen que lo que crea queda pausado; verificar en la prueba 4.4.
- **WhatsApp por Evolution (no oficial):** riesgo de bloqueo del número si se usa para volumen alto. El agente solo le habla a Cielo, así que el riesgo es bajo.
- **VPS de producción:** el agente corre como root en el mismo servidor que n8n y Dokploy. Mitigaciones: sandbox de comandos, rutas sensibles bloqueadas, `MemoryMax=3G`, swap (0.7).
- **Código de terceros:** evo-mk es trabajo de Markco Digital. Cielo lo tiene en su servidor personal; conservar el crédito y el commit original.
- **Cuota de la cuenta de Claude:** todo el uso (el agente y lo que Cielo haga con esa cuenta) sale de la misma cuota.
