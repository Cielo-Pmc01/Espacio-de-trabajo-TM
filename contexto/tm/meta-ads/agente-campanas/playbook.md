# Playbook de campañas Meta Ads

Reglas y decisiones de Cielo. Hoy está vacío a propósito: el agente arranca sin límites y las restricciones se van sumando acá a medida que aprende. Formato: **regla** — por qué — fecha.

## Reglas y límites
- **Sin límites de capacidad, pero cada acción que modifique algo se le consulta a Cielo y se hace solo con su «sí».** Consultar y leer no necesita permiso. — decisión de Cielo — 2026-10-22
- **Para decir si una campaña, un anuncio o una cuenta está activa, usar entrega real (gasto o impresiones > 0 en el período, a nivel anuncio), no el estado de la campaña.** — El estado de la campaña puede decir ACTIVE con los anuncios pausados; ya pasó en Ale Sopran y con ~85 campañas zombie de Sergio ADC. Detalle en `contexto/marcas/criterios-plataforma-tm.md` — 2026-10-22
- **«Mensajes» = conversaciones iniciadas (el primer tipo de acción con valor > 0 de la lista, sin sumarlos), igual a «Resultados» del Administrador de anuncios; no «Contactos de mensajes».** — Es la definición validada de la Plataforma TM — 2026-10-22
- **No sumar monedas distintas (ARS, BRL, USD).** — Cada cuenta tiene su moneda — 2026-10-22
- **Fuentes de datos: primero Meta en vivo (MCP `meta-ads`); si el MCP no puede resolverlo (caído, sin autenticar, cuenta no consultable o dato faltante), usar la Plataforma TM (`plataforma_consultar`) y aclarar que el dato viene de ahí y de qué hora.** — decisión de Cielo — 2026-10-23
- **Toda campaña nueva se nombra empezando con el código de la marca (`TB - …`, `TP - …`).** — Es como la Plataforma TM asigna la marca; sin prefijo la campaña no suma en los rankings — 2026-10-22

## Notas técnicas del MCP de Meta Ads
- Cada llamada necesita `client_conversation_id`: 20 caracteres alfanuméricos, se genera en la primera llamada y se reutiliza en toda la conversación.
- `ads_get_ad_accounts` devuelve `is_ads_mcp_enabled`, `is_queryable` y `has_payment_method`; una cuenta con `is_ads_mcp_enabled: false` no se puede usar con el MCP.
- `ads_get_user_pages` pagina de a 50 (usar `next_cursor`).
- Windsor no tiene acción de borrar.

## Preguntas abiertas
- ¿Con qué marcas se empieza?
- ¿De dónde sale el video y cómo se vuelve URL pública (Windsor la exige)?
