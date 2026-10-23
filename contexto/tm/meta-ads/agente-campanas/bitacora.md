# Bitácora — agente de campañas Meta Ads

Más reciente arriba. Una entrada por tarea: pedido, qué se hizo, resultado, pendiente.

## 2026-10-22 — Conexión del MCP oficial de Meta Ads
- **Pedido:** conectar el MCP propio de Meta Ads para poder armar campañas.
- **Hecho:** servidor `meta-ads` (`https://mcp.facebook.com/ads`) agregado con `claude mcp add --transport http --scope user` usando la app **Claude-AI** (ID `2661225857664047`) y puerto de callback 8080. Autenticado con la cuenta de Cielo. Se agregaron casos de uso a la app (MCP de anuncios, API de marketing, leads, catálogos, páginas, Messenger, Instagram, video en vivo, oEmbed).
- **Verificado (solo lectura):** 8 cuentas publicitarias y ~50 Páginas visibles. Detalle en `activos.md`.
- **Resultado:** MCP funcionando. No se creó ni cambió nada en Meta.
- **Pendiente:** definir la primera tarea chica de campaña; decidir cuál es la Página oficial en las marcas con duplicados.
