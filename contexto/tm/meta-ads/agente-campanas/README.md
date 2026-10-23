# Agente de campañas Meta Ads — entorno de trabajo diario

Se construye **de abajo hacia arriba**: no se define la estrategia completa de antemano. Cada día se resuelve una tarea concreta y lo aprendido se acumula en el playbook. Cuando haya suficiente material, se ordena en módulos por marca o por tipo de campaña.

## Piezas
| Archivo | Para qué sirve | Quién lo escribe |
|---|---|---|
| `bitacora.md` | Registro por día: qué se pidió, qué se hizo, qué quedó pendiente | El agente, al terminar cada tarea |
| `playbook.md` | Reglas y decisiones aprendidas (qué se hace y por qué) | El agente **propone**, Cielo **aprueba** |
| `activos.md` | Mapa de cuentas publicitarias, Páginas, Pixels y números por marca | El agente, verificando con el MCP |
| `.claude/agents/meta-campaign-builder.md` | El agente que ejecuta las tareas | — |

## Ciclo diario
1. Cielo dice la tarea chica de hoy (ej. "armá una campaña de tráfico para X").
2. El agente lee `playbook.md` y `activos.md` y ejecuta con el MCP.
3. Al cerrar la tarea: el agente agrega una entrada en `bitacora.md` y propone líneas nuevas para el playbook.
4. Cielo aprueba, corrige o descarta cada línea. Las **restricciones** también entran por acá: el agente arranca sin límites y se los va poniendo Cielo.

## Herramientas
- **MCP oficial de Meta Ads** (`meta-ads`, servidor `https://mcp.facebook.com/ads`): primera opción.
- **Windsor.ai**: respaldo (4 cuentas conectadas; sin acción de borrar).
- Skill `meta-ads-developer` para diagnóstico técnico; `paid-ads` y `ad-creative` para estrategia y copy.

## Cuándo reordenar
Cuando el playbook pase de unas 40 reglas o empiece a repetirse, se divide en módulos (por marca, por objetivo) y se evalúa pasarlo a skill reutilizable para otros workspaces.
