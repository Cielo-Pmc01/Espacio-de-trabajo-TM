# CLAUDE.md

Este archivo provee instrucciones a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

---

## Qué Es Esto

Este es un **Claude Workspace Template** — un entorno estructurado diseñado para trabajar con Claude Code como un potente asistente agente entre sesiones. El usuario abrirá nuevas sesiones de Claude Code repetidamente, usando `/iniciar` al comienzo de cada una para cargar contexto esencial sin sobrecargar el contexto.

**Este archivo (CLAUDE.md) es la base.** Se carga automáticamente al inicio de cada sesión. Mantenelo actualizado — es la única fuente de verdad sobre cómo Claude debe entender y operar dentro de este workspace.

---

## La Relación Claude-Usuario

Claude opera como un **asistente agente** con acceso a las carpetas del workspace, archivos de contexto, comandos y salidas. La relación es:

- **Usuario**: Define objetivos, provee contexto sobre su rol/función y dirige el trabajo mediante comandos
- **Claude**: Lee el contexto, entiende los objetivos del usuario, ejecuta comandos, produce salidas y mantiene la consistencia del workspace

Claude siempre debe orientarse a través de `/iniciar` al inicio de la sesión, y luego actuar con plena conciencia de quién es el usuario, qué está tratando de lograr y cómo este workspace lo apoya.

---

## Estructura del Workspace

```
.
├── CLAUDE.md              # Este archivo — contexto principal, siempre cargado
├── .claude/
│   └── commands/          # Comandos que Claude puede ejecutar
│       ├── iniciar.md      # /iniciar — inicialización de sesión
│       ├── crear-plan.md   # /crear-plan — crear planes de implementación
│       └── implementar.md  # /implementar — ejecutar planes
├── contexto/              # Contexto del negocio, rol, estrategia y datos actuales
├── planes/                # Planes de implementación creados por /crear-plan
├── salidas/               # Proyectos y entregables (cada uno con su propio repo GitHub)
│   ├── app-invierno/          # ✅ Completada — https://c1.iadventurecenter.com/
│   ├── app-capacitacion-gral/ # En desarrollo — capacitación general vendedores
│   ├── crm-meta-ads/          # En desarrollo — análisis campañas Meta Ads (repo: CieloSosa/crm-meta-ads)
│   └── crm-equipo-tm/         # En desarrollo — seguimiento tareas equipo TM (repo: CieloSosa/crm-tm)
├── agentes/               # Agentes de IA listos para usar (prompts completos con instrucciones)
│   └── agente-copy-tm.md  # Generador de copies para las 14 marcas (Meta Ads, RRSS, Web)
├── referencia/            # Plantillas, prompts maestros, flujos n8n reutilizables
└── scripts/               # Scripts de automatización auxiliares
```

**Nota importante sobre `salidas/`:** cada subcarpeta de proyecto tiene su propio repositorio GitHub conectado. Los cambios se pushean al repo del proyecto correspondiente, no al repo principal del workspace.

**Directorios principales:**

| Directorio    | Propósito                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `contexto/`   | Quién es el usuario, su rol, prioridades actuales, estrategias. Leído por `/iniciar`.           |
| `planes/`     | Planes de implementación detallados. Creados por `/crear-plan`, ejecutados por `/implementar`.  |
| `salidas/`    | Proyectos activos. Cada uno conectado a su propio repo de GitHub.                               |
| `agentes/`    | Agentes de IA listos para usar. Cada archivo es un prompt completo con instrucciones y formulario. |
| `referencia/` | Docs de ayuda, plantillas y patrones para asistir en distintos flujos de trabajo.               |
| `scripts/`    | Scripts de automatización auxiliares (bash, python, etc.) que soporten otros flujos.            |

---

## Regla de Oro de Comandos

**PRIORIDAD ABSOLUTA:** Cualquier texto que comience con `/` (ejemplo: `/iniciar`) debe ser interpretado como un comando definido en `.claude/commands/`.
1. **No adivinar:** No ejecutar comandos de terminal estándar (como `npm run dev`) si el usuario usa un comando con `/`.
2. **Búsqueda Obligatoria:** Primero buscar el archivo `.md` correspondiente en `.claude/commands/` y seguir sus instrucciones al pie de la letra.
3. **Contexto:** Si el comando requiere leer archivos de `contexto/` o `agentes/`, hacerlo antes de responder.

---

## Comandos

### /iniciar

**Propósito:** Inicializar una nueva sesión con plena conciencia del contexto.

Ejecutalo al inicio de cada sesión. Claude:

1. Leerá CLAUDE.md y los archivos de contexto
2. Resumirá su comprensión del usuario, el workspace y los objetivos
3. Confirmará que está listo para asistir

### /crear-plan [pedido]

**Propósito:** Crear un plan de implementación detallado antes de hacer cambios.

Usalo cuando se agrega nueva funcionalidad, comandos, scripts, o se hacen cambios estructurales. Produce un documento de plan exhaustivo en `planes/` que captura contexto, justificación y tareas paso a paso.

Ejemplo: `/crear-plan agregar comando de análisis de competidores`

### /implementar [ruta-al-plan]

**Propósito:** Ejecutar un plan creado por /crear-plan.

Lee el plan, ejecuta cada paso en orden, valida el trabajo y actualiza el estado del plan.

Ejemplo: `/implementar planes/2026-01-28-comando-analisis-competidores.md`

### /copywriter

**Propósito:** Generar copies profesionales para Meta Ads y redes sociales, adaptados a cada una de las 14 marcas y sus mercados (Argentina, Brasil, internacional en inglés).

Incluye: psicología de conversión por mercado, frameworks PAS/BAB/AIDA/Hook, límites técnicos de Meta Ads, protocolo de lenguaje positivo y checklist de calidad. Genera siempre 3 variantes A/B/C con análisis de cada una.

Usarlo para: copies de Meta Ads, captions de Instagram/Facebook, guiones de Reels, copy web.

Ejemplo: `/copywriter` (solicita briefing) o pasarle directamente la marca, canal y excursión.

---

## Protocolo Obligatorio de Git y Ramas

Para evitar cualquier riesgo de romper la versión de producción (`main`), Claude **DEBE** seguir estrictamente el siguiente protocolo en cada repositorio de `salidas/`:

1. **PROHIBIDO empujar directamente a `main`:** Nunca se debe hacer push directo a la rama principal en ningún repositorio.
2. **Crear siempre una nueva rama descriptiva:** Al realizar cualquier cambio o nueva funcionalidad, Claude debe crear una rama de feature desde `main` con nomenclatura clara (ej. `feature/editor-visual-drive`).
3. **Pushear la rama y reportar:** Subir la nueva rama al repositorio remoto de GitHub correspondiente y brindarle al usuario el comando o enlace para que él la revise, apruebe y fusione cuando lo considere seguro.

---

## Instrucción Crítica: Mantener Este Archivo

**Siempre que Claude haga cambios en el workspace, DEBE considerar si CLAUDE.md necesita actualizarse.**

Después de cualquier cambio — agregar comandos, scripts, flujos de trabajo, o modificar la estructura — preguntarse:

1. ¿Este cambio agrega nueva funcionalidad que los usuarios necesitan conocer?
2. ¿Modifica la estructura del workspace documentada arriba?
3. ¿Debe listarse un nuevo comando?
4. ¿Necesita `contexto/` nuevos archivos para capturar esto?

Si la respuesta es sí a cualquiera, actualizar las secciones relevantes. Este archivo debe siempre reflejar el estado actual del workspace para que las sesiones futuras tengan contexto preciso.

**Ejemplos de cambios que requieren actualizar CLAUDE.md:**

- Agregar un nuevo comando → agregar a la sección de Comandos
- Crear un nuevo tipo de salida → documentar en Estructura del Workspace o crear una sección
- Agregar un script → documentar su propósito y uso
- Cambiar patrones de flujo de trabajo → actualizar la documentación relevante

---

## Flujo de Trabajo de Sesión

1. **Inicio**: Ejecutar `/iniciar` para cargar el contexto
2. **Trabajo**: Usar comandos o dirigir a Claude con tareas
3. **Planificar cambios**: Usar `/crear-plan` antes de adiciones significativas
4. **Ejecutar**: Usar `/implementar` para ejecutar los planes
5. **Mantener**: Claude actualiza CLAUDE.md y `contexto/` a medida que el workspace evoluciona

---

## Notas

- Mantener el contexto mínimo pero suficiente — evitar sobrecarga
- Los planes viven en `planes/` con nombres de archivo con fecha para historial
- Las salidas se organizan por tipo/propósito en `salidas/`
- Los materiales de referencia van en `referencia/` para reutilización
