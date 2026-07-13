# Motor de contenido CM — Arquitectura v1

> Diseño validado con Cielo el 13/07/2026. Primer sub-proyecto de la iniciativa "Automatizar el área TM" — el resto de las automatizaciones (video, otras áreas) se listan y priorizan por separado, no en este documento.

---

## Contexto

Luciana (CM) gestiona contenido de Instagram/Facebook para 8 marcas. Hoy el proceso es:

1. Genera ideas/copy con ChatGPT manualmente.
2. Registra cada pieza en Notion — **cada marca tiene su propia base** (ej. "TURISMO PATAGONIA" dentro de "Marcas TANDA 1"), con un patrón ya consolidado: `Nombre del contenido`, `Estado`, checkbox `Aprobado`, `Fecha de grabación`/`Fecha de publicación`, desglose de carrusel diapositiva por diapositiva, bloque de `Copy` final, y medios linkeados desde Google Drive.
3. Hay además una base transversal ("ORGANIZADOR DE TAREAS") con estados operativos más granulares: `FALTA MATERIAL`, `En planificación`, `Esperando revisión`, `Aprobada para publicar`, `PROGRAMADO`, `Done`, etc.
4. En paralelo existe **crm-cm** (`salidas/crm-cm/`), un dashboard React ya construido con 6 vistas (Control, Pipeline, Calendario, Generador, Fuentes, IG Ready) pero corriendo en modo **mock** — sin backend real. Su roadmap oficial (guía `guia-dashboard-ig-command-center.pdf`) ya prevé "Pipeline editable con datos reales" como Fase 2.

Cuello de botella prioritario, según Cielo: generación de ideas/copy por marca + planificación/calendario editorial.

## Decisión de arquitectura

**n8n es el motor de generación; crm-cm es la única pantalla de Luciana.** n8n orquesta las fuentes y la IA, escribe a Supabase, y crm-cm deja de mockear sus vistas Generador/Pipeline/Calendario para leer y editar esos datos reales.

Se descartó construir una herramienta nueva desde cero (tira a la basura la migración a React ya hecha) y se descartó dejar a n8n suelto mandando resultados por WhatsApp/Notion (no resuelve el cuello de botella real de programación/calendario y no deja nada estructurado).

**El calendario de Notion se migra a crm-cm — no conviven ambos.** Notion queda como archivo histórico.

---

## Modelo de datos

Tabla `content_pipeline` en el schema **`crm_cm`** del proyecto Supabase compartido **"TM Platform"** (el mismo que usa crm-meta-ads, ver `planes/2026-07-07-crm-meta-ads-arquitectura-n8n.md`) — no un proyecto aislado. Reutiliza la tabla de roles a nivel de plataforma ya definida ahí (`admin` = Cielo, `viewer` = SP, y suma el rol `cm` = Luciana), en vez de duplicar auth. Preserva el vocabulario que Luciana ya usa para no obligarla a reaprender nada:

| Campo | Origen en Notion | Notas |
|---|---|---|
| `marca` | Prefijo del título ("TP - HISTORIA") | Columna propia — hoy vive mezclado en el texto del título |
| `nombre_contenido` | `Nombre del contenido` | — |
| `formato` | Inferido del título (Historia / Posteo / Carrusel / Reel) | Campo explícito nuevo |
| `estado` | `Estado` / `stado` | Se consolidan los ~10 valores dispersos de "ORGANIZADOR DE TAREAS" en 6 columnas del Pipeline: `Idea` → `Esperando revisión` → `Falta material` → `Aprobado para publicar` → `Programado` → `Publicado` |
| `aprobado` | `Aprobado` (checkbox) | Gate obligatorio antes de "Programado" — se mantiene, ver sección Aprobación |
| `fecha_grabacion` / `fecha_publicacion` / `hora` | ídem | — |
| `copy` | Bloque "Copy" | Texto final de la caption |
| `slides` (jsonb) | Desglose "Diapositiva 1/2/3…" | Array estructurado en vez de texto suelto — editable en crm-cm |
| `media_candidatos` (jsonb) | Links de Drive embebidos | v1: lista de carpetas/archivos candidatos sugeridos por búsqueda multi-cuenta (ver sección Drive), Luciana elige uno |
| `origen` | — (no existía) | Cuál de las 4 fuentes disparó la idea: `catalogo` / `tendencia` / `consulta_chatwoot` / `brief_manual` |
| `motivo_rechazo` | — (no existía) | Texto libre cuando Luciana pide regeneración con motivo (ver Aprobación) |

### Calendario por marca

La vista **Calendario** de crm-cm se navega por marca — igual que en Notion hoy, donde cada una de las 8 marcas tiene su propio calendario de historias/carruseles/posteos/reels. La tabla sigue siendo una sola y normalizada (evita el problema actual de 8 bases sueltas, difíciles de comparar entre sí o de usar para reportes cruzados); el filtro por `marca` en la UI es lo que reproduce la experiencia de "un calendario por marca" sin fragmentar el dato.

---

## Flujo n8n

**Trigger:** cron semanal (lunes) que genera un lote para las 8 marcas + botón manual en la vista Generador de crm-cm para pedir ideas puntuales (source + formato + objetivo, como ya simula el mock).

**Las 4 fuentes, desde el arranque:**

| Fuente | Estado | Cómo entra |
|---|---|---|
| Catálogo de excursiones | Ya estructurada | Lee `catalog_*.md` y `brand_profiles.md` |
| Briefs manuales | Ya estructurada | Campo en crm-cm ("desarrollar este tema"), GPT lo despliega por marca |
| Consultas Chatwoot | Integración nueva | n8n consulta conversaciones recientes, GPT agrupa preguntas repetidas en ángulos de contenido |
| Tendencias de temporada | Integración nueva, más experimental | Búsqueda web acotada a Bariloche/nieve/temporada — validar resultados con más cuidado que las otras 3 |

**Generación (GPT vía OpenAI API):** por cada tema, produce contenido adaptado a las 8 marcas usando el tono de `copy_protocol.md`. La salida depende del formato:
- **Carrusel:** copy final + desglose de diapositivas (concepto por slide, como ya lo hace Luciana a mano).
- **Reel/Historia:** copy + concepto/idea de lo que mostrar. **El contenido es de excursión (paisajes, actividades), no una persona hablando a cámara** — no se generan guiones de presentador.

**Búsqueda de material (Drive multi-cuenta):** la empresa tiene varias cuentas de Drive con material disperso, y la carpeta "principal" usada hoy tiene fotos/videos de 2023 (antes de este equipo). n8n busca por nombre de excursión/marca en una lista configurada de cuentas de Drive y sugiere 2-3 carpetas/archivos candidatos en `media_candidatos` — no selecciona automáticamente, le ahorra a Luciana la búsqueda cruzada manual que hace hoy. Requiere que Cielo liste qué cuentas de Drive incluir.

**Escritura:** cada idea generada se inserta en `content_pipeline` con `estado = "Idea"`, `aprobado = false`.

---

## Aprobación

`Aprobado` es un gate binario explícito operado por Luciana en crm-cm (botón **Aprobar** / **Rechazar**), no una casilla pasiva — nada avanza a "Programado" sin su OK, siguiendo el requisito de la guía oficial de crm-cm.

Al rechazar, Luciana elige entre dos caminos según el caso (decisión suya en cada pieza, no un flujo único fijo):

1. **Editar a mano** — si es un detalle puntual (una palabra, una imagen), lo corrige ella misma directo en crm-cm.
2. **Pedir regeneración con motivo** — si el enfoque no sirve, escribe un motivo corto ("muy largo", "cambiar el ángulo") y n8n vuelve a generar esa pieza con GPT incorporando el motivo, sin que Luciana tenga que pedirlo de nuevo desde cero.

---

## Alcance v1

**Entra:**
- Generación de copy + concepto por marca (8 marcas), con las 4 fuentes conectadas
- Migración de datos de Notion a `content_pipeline` en Supabase
- Vistas Generador / Pipeline / Calendario (por marca) de crm-cm con datos reales
- Gate de aprobación humana (Aprobar / Editar a mano / Rechazar-y-regenerar)
- Búsqueda multi-cuenta de Drive con candidatos sugeridos (sin selección automática)

**Queda afuera de esta v1:**
- Selección automática final del clip/foto — Luciana siempre elige entre los candidatos sugeridos
- Publicación automática a Instagram (Fase 8 del roadmap oficial de crm-cm, requiere OAuth Meta)
- Editor de video personalizable — proyecto aparte dentro de la iniciativa más amplia de automatización TM
- Resolver el déficit de material nuevo de invierno 2026 (problema operativo de filmación, no de software)

---

## Dónde encaja en el roadmap oficial de crm-cm

| Fase | Título | Relación con este proyecto |
|---|---|---|
| 1 | Dashboard mock | ✅ Hecho |
| 2 | Pipeline editable (datos reales) | **Esta v1 implementa esta fase** — content_pipeline + n8n |
| 3 | Calendario editorial | **Esta v1 implementa esta fase** — vista por marca |
| 4 | Carga manual de posts | Complementa lo generado por IA |
| 5–6 | OAuth + sync Instagram | Fuera de alcance v1 |
| 7–9 | Score automatizado, publicación, DMs | Fuera de alcance v1 |

---

## Próximo paso

Escribir plan de implementación detallado (tareas, orden, archivos a tocar) a partir de este documento.
