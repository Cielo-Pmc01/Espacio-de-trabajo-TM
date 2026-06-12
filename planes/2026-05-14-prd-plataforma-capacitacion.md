# PRD — Plataforma de Capacitación TM (Adventure Center)

> **Documento:** Product Requirements Document
> **Autora:** Cielo (TM Lead) — con asistencia de Claude Code
> **Fecha:** 2026-05-14
> **Estado:** Borrador 1 — abierto a iteración
> **Reemplaza:** `salidas/app-capacitacion-gral/` (rediseño total, no compatible hacia atrás)

---

## 1. Visión

Una plataforma interna de capacitación **profesional, clara y escalable** para los vendedores de Adventure Center. Debe sentirse al nivel de Coderhouse, Thinkific o un buen onboarding de Notion: el alumno entra y **entiende dónde está, qué le falta y qué sigue** sin pensar. El admin carga contenido en **5 minutos sin tocar HTML**, asistido por IA. Cada vendedor recibe **solo lo que le aplica** según su sector (B1, VR, VP).

### Por qué la actual no sirve
- Vistas confusas, no se ve profesional.
- Cargar material es difícil (edición tipo HTML).
- No tiene IA ni asistencia para el admin.
- Estructura de sectores parchada, no nativa.

### Brecha que cierra
Pasar de "una app que funciona" a **un producto que SP pueda mostrar como activo estratégico del área TM**.

---

## 2. Usuarios y Roles

| Rol | Quién | Qué puede hacer | Qué NO puede |
|-----|-------|-----------------|--------------|
| **Alumno** | Vendedor (sector B1, VR o VP) | Consumir módulos de su sector, hacer evaluaciones, consultar al tutor IA, ver su progreso | Editar contenido, ver otros sectores |
| **Editor** | Equipo TM (Mariano, Jonatan, Luciana o quien Cielo designe) | Crear/editar módulos, bloques y lecciones, cargar medios, usar IA admin, ver previews | Gestionar usuarios, cambiar permisos, configurar IAs, ver datos sensibles |
| **SP** (Supervisor) | Dueño de la empresa, supervisión general | Editar contenido (igual que Editor), ver progreso de todos los vendedores, ver y analizar evaluaciones, exportar reportes, ver analíticas globales | Gestionar permisos, configurar IAs, eliminar usuarios |
| **SuperAdmin** | Cielo (dueña funcional del producto) | TODO: contenido, usuarios, permisos, configuración de IAs, logs, integraciones | — |

**Notas sobre roles:**
- Un usuario tiene **un solo rol**. Si Cielo necesita "estudiar" un módulo lo hace con cuenta de Alumno demo.
- **Editor** se separa de **SuperAdmin** justamente para que Mariano/Jonatan/Luciana puedan cargar contenido sin tocar configuración crítica.
- **SP** puede editar contenido + analizar evaluaciones.
- El rol se asigna desde el panel de SuperAdmin y queda registrado en `audit_log`.

### Cómo se crean los usuarios y cómo se loguean (decisión 2026-05-14)

- **NO hay auto-registro.** Ningún alumno puede crearse una cuenta solo.
- **Los crea SP o SuperAdmin** desde el panel admin (sección Usuarios, en Fase 2).
- Al crear un usuario, SP/SuperAdmin define:
  - **Username** (entre 3 y 32 caracteres, letras/números/punto/guion/guion bajo, único)
  - **Contraseña inicial** (mínimo 6 caracteres)
  - Nombre completo, rol, sector (si es alumno)
- El alumno **se loguea con su username + contraseña**. NO usa email ni recibe mails de la plataforma.
- **Si olvida la contraseña**, el SP/SuperAdmin se la regenera desde el panel.
- Internamente Supabase Auth maneja la sesión con un email "derivado" (`{username}@capacitacion-tm.local`); esto es solo un detalle técnico para reutilizar Supabase Auth sin agregar otra columna `username` con su propio constraint. El email derivado no se muestra al usuario.

---

## 3. Estructura de Contenido (definitiva)

```
CAPACITACIÓN
├── TODO EL AÑO
│   ├── Módulo 0 — Introducción Institucional   [sin evaluación]
│   │   ├── Bloque: Índice de aprendizajes
│   │   ├── Bloque: Bienvenido a Turismo Bariloche
│   │   └── Bloque: Glosario de términos
│   ├── Módulo 1 — Excursiones y Proveedores   [con evaluación]
│   │   ├── Bloque: Listado de excursiones
│   │   └── Bloque: Proveedores y prestadores
│   └── Módulo 2 — Protocolos Operativos       [con evaluación]
│       ├── Bloque 1: Protocolos Operativos y de Caja (7 sub-bloques)
│       ├── Bloque 2: Protocolos de Reserva (Patagonia Booking)
│       ├── Bloque 3: Sistema de Meta, Marcas y WhatsApp
│       └── Bloque 4: Recursos y Carpetas en Google Drive
│
└── INVIERNO   [estacional, se reactiva cada año]
    ├── Módulo 1 — Excursiones y Proveedores   [con evaluación]
    └── Módulo 2 — Protocolos Operativos       [con evaluación]
        ├── Bloque 1: Disponibilidad (OBLIGATORIO)
        ├── Bloque 2: Metodología de Pago (Seña / Saldo)
        └── Bloque 3: Excepción: Pago Total
```

### Reglas de la estructura
- **Capacitación** → contiene **Categorías** (Todo el año, Invierno, Verano…)
- **Categoría** → contiene **Módulos**
- **Módulo** → contiene **Bloques**
- **Bloque** → contiene **Lecciones / Contenido** (texto, video, archivo, alerta, listado, card, quiz embebido)
- Todo nodo (módulo, bloque, lección) puede:
  - Restringirse a uno o más sectores
  - Tener título alternativo por sector
  - Ordenarse manualmente (drag & drop)

---

## 4. Sectores y Personalización

3 sectores: **B1, VR, VP**.

| Capacidad | Cómo funciona |
|-----------|---------------|
| **Visibilidad** | Cada módulo/bloque/lección marca qué sectores lo ven. Default: todos. |
| **Variantes por sector** | Para un mismo bloque/lección se puede personalizar: (a) **solo título** — mismo contenido pero "Protocolo de ingreso B1" vs "Ingreso VR"; (b) **solo contenido** — mismo título pero texto/video diferente por sector; (c) **ambos** — título y contenido distintos. El admin elige por nodo. |
| **Variantes parciales** | Se puede modificar solo algunas palabras del contenido por sector (ej. cambiar "vendedor B1" por "asesor VR" sin reescribir todo el bloque). Implementado con un sistema de "overrides" que parte del contenido base. |
| **Vista del alumno** | El alumno solo ve la variante que le corresponde. Filtros y nomenclatura adaptadas. Cero confusión. |
| **Vista del admin** | Editor muestra el contenido base + indicador de qué sectores tienen overrides. Se puede entrar a editar la variante de cada sector sin perder el contexto del original. |

---

## 5. Evaluaciones y Certificación

### 5.1 Filosofía (importante — define todo lo demás)

> La evaluación **NO** es un examen para desaprobar. Es una herramienta de **refuerzo + diagnóstico**.

- **Para el alumno:** sirve para repasar lo importante y fijar conceptos.
- **Para Cielo y SP:** sirve para detectar qué tema no se está entendiendo, qué pregunta confunde a la mayoría, qué falta explicar mejor. Es input para **mejorar el contenido**.
- **No penaliza:** el alumno **puede navegar libremente** por el contenido del módulo mientras hace la evaluación. Buscar la respuesta en el material es parte del aprendizaje, no trampa.

### 5.2 Mecánica

- **Cada módulo** (excepto Módulo 0) termina con una evaluación que certifica al vendedor.
- **Modo "abierto" por default:** durante la evaluación, el alumno tiene acceso a:
  - Sidebar con todos los bloques del módulo (puede abrir cualquiera en una pestaña/popup lateral sin perder la pregunta).
  - Botón "Buscar en el módulo" que busca texto dentro del contenido.
  - Sofía IA disponible (configurable: el SuperAdmin puede desactivarla durante evaluaciones si quisiera).
- **Reglas:**
  - Nota de aprobación configurable por módulo (default 70%).
  - Reintentos: ilimitados por default. El SuperAdmin puede limitar por módulo si necesario.
  - Al aprobar: certificación interna del módulo. Al completar todos los módulos de una categoría: certificación de la categoría.
- **Estado del alumno** siempre visible: Pendiente · En progreso · Completado · Certificado.

### 5.3 Tipos de pregunta soportados

| Tipo | Quién evalúa |
|------|--------------|
| Opción única | Sistema (auto) |
| Opción múltiple | Sistema (auto) |
| Verdadero / Falso | Sistema (auto) |
| Completar texto (palabra exacta o lista de aceptadas) | Sistema (auto) |
| Drag & drop (ordenar pasos o asociar pares) | Sistema (auto) |
| Respuesta corta abierta | **Default: IA evalúa con criterio cargado por admin.** Configurable a "revisión manual por SP/SuperAdmin" si Cielo o SP prefieren juzgarla a mano para esa pregunta. |
| Respuesta larga / desarrollo | **Manual obligatorio** por SP/SuperAdmin (la IA puede preanalizar y sugerir nota, pero no decidir). |

El método de evaluación de cada pregunta es **un campo editable** en el editor de evaluaciones. SP y SuperAdmin pueden cambiarlo en cualquier momento sin re-crear la pregunta.

### 5.4 Reportes y análisis (Cielo + SP)

- **Dashboard de evaluaciones:** por módulo, por sector, por vendedor.
- **Métricas clave que la app calcula sola:**
  - % de aprobación por pregunta (detecta preguntas "imposibles").
  - Preguntas con más reintentos (detecta confusión).
  - Tiempo promedio por pregunta.
  - Bloques con más consultas a Sofía IA durante evaluación.
- **Exports:**
  - CSV (descarga directa).
  - **Notion (integración nativa):** los resultados de cada evaluación se suben a una database de Notion configurada por Cielo. Permite analizar errores frecuentes y accionar sobre el contenido a reforzar. Es la única integración Notion del producto (ver §14).
- **Acción derivada:** desde el dashboard, Cielo/SP puede clickear "Reforzar este bloque" y el sistema marca el bloque para revisión + lo sugiere a la IA Admin para sugerir mejoras de redacción.

---

## 6. Experiencia del Alumno (vistas)

### 6.1 Home del Alumno
- Saludo + sector + progreso global con barra y porcentaje.
- "Continuar donde dejaste" (deep link a último bloque).
- Tarjetas grandes por **Categoría** (Todo el año / Invierno).
- Mini-card: "Próxima evaluación" y "Asistente IA disponible".

### 6.2 Vista de Categoría
- Lista de módulos en orden, cada uno con: número, título, descripción corta, estado, tiempo estimado, badge si es obligatorio.

### 6.3 Vista de Módulo (índice limpio) y Vista de Bloque (una página)

> **Decisión clave (Cielo, 2026-05-14):** vista del alumno **SIN sidebar de árbol completo**. Cada bloque tiene su propia página. Máximo espacio para el contenido. Sofía como botón flotante. (Ver wireframes §6.bis.2 y §6.bis.2.a.)

**Vista de Módulo** (cuando el alumno entra a un módulo):
- Página con el **índice limpio** de los bloques del módulo en formato tarjeta vertical.
- Cada tarjeta de bloque muestra: nombre, descripción corta, estado (✅ ⏳ 🔒), tiempo estimado.
- Acceso a **Material extra** y **Hacer evaluación** (solo se desbloquea al completar todos los bloques).
- Cero árbol expandible: el alumno hace click en un bloque y va a su página dedicada.

**Vista de Bloque** (la pantalla donde se pasa la mayor parte del tiempo):
- **Una página por bloque** — no acordeón, no sidebar de árbol.
- **Breadcrumb arriba**: `Módulo X ▸ Nombre del módulo ▸ Bloque N: Nombre`. Cada nivel es clickeable.
- **Contenido del bloque al ancho generoso** (con margen razonable, tipografía grande).
- **Sidebar derecho minimal**: solo aparece si hay Material extra. Muestra los archivos descargables. Si no hay material extra para ese bloque, esa columna ni se renderiza.
- **Botón flotante Sofía IA** abajo a la derecha (en TODAS las vistas del alumno, no solo bloque).
- **Botón "Siguiente"** abajo a la derecha del contenido (encima del flotante de Sofía):
  - Si hay más sub-protocolos/lecciones dentro del bloque → "Siguiente: [nombre]".
  - Si el bloque terminó → "Siguiente bloque: [nombre]" lleva al primer ítem del próximo bloque.
  - Si el módulo terminó → "Hacer evaluación del módulo".
- **Botón "Anterior"** equivalente a la izquierda del contenido.
- **Marcar como visto** es automático (scroll completo + tiempo mínimo de lectura). Sin botón manual.

### 6.4 Renderizado de bloque
Soporte nativo para:
- Texto rico (encabezados, listas, negritas, links, callouts/alertas)
- Imágenes (single + galería)
- Videos (YouTube, Vimeo, archivo nativo) con tracking de % visto
- Archivos descargables (PDF, DOCX, XLS) con preview
- Catálogos (tabla filtrable de excursiones/proveedores)
- Cards / tarjetas (lo que pediste como "recuadros")
- Alertas (info, warning, success, danger) — estilo callouts de Notion
- Listados destacados (checklists, paso a paso)
- Embeds (Loom, Google Slides, Google Drive)
- Quiz inline (preguntas en medio del contenido, no certifica)

### 6.5 Vista de Evaluación (modo abierto / refuerzo — ver §5)

> **Decisión clave (Cielo, 2026-05-14):** la evaluación **NO** es un examen punitivo. El alumno puede consultar el material y a Sofía mientras la resuelve. El objetivo es reforzar y diagnosticar.

- **No es modo concentración cerrado.** Durante la evaluación, el alumno mantiene acceso a:
  - **Botón "Consultar material"** en el header de la pregunta — abre un panel lateral o popup con los bloques del módulo navegables, sin perder la pregunta que está respondiendo.
  - **Buscador dentro del módulo** ("¿en qué bloque dice algo de pickup?").
  - **Botón flotante Sofía IA** (mismo de siempre, disponible salvo que SuperAdmin lo desactive para esa evaluación).
- **Timer:** opcional, configurable por evaluación (default: sin timer).
- **Feedback:** inmediato (al responder cada pregunta) o diferido (al final) — configurable por evaluación.
- **Pantalla de resultado:**
  - Nota total y por sección.
  - **Bloques sugeridos a repasar** (los que cubren las preguntas que falló).
  - Botón "Volver al módulo" + "Hacer de nuevo" si hay reintentos.
  - Para SP/SuperAdmin: link a las preguntas que respondió, tiempos y patrones.
- **Reportes automáticos a Notion** (ver §5.4) con todos los resultados para análisis posterior.

### 6.6 Asistente IA (Sofía)
- **Botón flotante** en la esquina inferior derecha de **todas** las vistas del alumno.
- Al lado del botón, **tooltip persistente las primeras visitas**: *"Consultame tus dudas"*. Después se vuelve discreto y aparece solo al hover.
- Al click abre un **panel modal** sobre la vista actual (no descoloca el contenido que estaba leyendo). Al cerrar vuelve al botón flotante.
- Chat con contexto del bloque actual.
- Responde con **citas obligatorias** (qué bloque de qué módulo respalda la respuesta) clickeables que llevan al contenido fuente.
- Sugiere lecciones relacionadas al final de cada respuesta.
- Detecta cuando no sabe y dice "consulta a tu supervisor" en vez de inventar.
- **Disponible durante evaluaciones** (configurable por SuperAdmin para activar/desactivar).

---

## 6.bis Wireframes de las Vistas Clave

> Referencias visuales aprobadas por Cielo (2026-05-14): **Coderhouse 4.0** (catálogo + vista interna con tutor IA "Ticher") y **Mighty Networks / academia patagonia** (admin con "Primeros pasos" + cursos en acordeón). Estos wireframes traducen esas referencias a nuestro caso.

### 6.bis.1 — Home del Alumno

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO TM]   Mis cursos     Explorar          [🔍 buscar]            [👤 Cielo] │
├──────────┬─────────────────────────────────────────────────────────────────────┤
│          │  Hola Cielo 👋  ·  Sector: B1                                       │
│ 🏠 Inicio│  ████████████░░░░░░░░  62%  ·  Continuar donde dejaste →            │
│ 📚 Cursos│                                                                     │
│ 🧠 IA    │  ┌─────────────────────────────────────┐  ┌─────────────────────┐   │
│ ⚙️  Perfil│  │ TODO EL AÑO            ████░░ 70%   │  │ INVIERNO    ██░ 40% │   │
│          │  │ 3 módulos · 12 bloques              │  │ 2 módulos · 6 blq.  │   │
│          │  │ Próxima evaluación: Módulo 2        │  │ Estacional · activa │   │
│          │  │              [Continuar →]          │  │      [Continuar →]  │   │
│          │  └─────────────────────────────────────┘  └─────────────────────┘   │
│          │                                                                     │
│          │  Últimas novedades                                                  │
│          │  • Nuevo bloque: "Pago Total" en Invierno · hace 2 días             │
│          │  • Sofía IA actualizó respuestas de Protocolos                      │
└──────────┴─────────────────────────────────────────────────────────────────────┘
```

### 6.bis.2 — Vista de Módulo (índice limpio)

Cada módulo tiene su propia página. La vista de módulo es el **índice limpio** de sus bloques. Acá el alumno elige por dónde seguir.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Inicio / Todo el año / Módulo 2 – Protocolos Operativos                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│   MÓDULO 2 · Protocolos Operativos                                                       │
│   Procesos estrictos para la gestión de ventas, reservas y atención operativa.           │
│                                                                                          │
│   Progreso del módulo: ████████░░░░░░░░  38%                                            │
│   El 100% es requerido para obtener la certificación.                                    │
│                                                                                          │
│   ┌────────────────────────────────────────────────────────────────────────────────┐    │
│   │  Bloque 1 — Protocolos Operativos y de Caja                       ✅ Completado │    │
│   │  7 protocolos · ~25 min                                                        │    │
│   └────────────────────────────────────────────────────────────────────────────────┘    │
│   ┌────────────────────────────────────────────────────────────────────────────────┐    │
│   │  Bloque 2 — Protocolos de Reserva (Patagonia Booking)             ⏳ En curso  │    │
│   │  3 protocolos · ~12 min                                                        │    │
│   └────────────────────────────────────────────────────────────────────────────────┘    │
│   ┌────────────────────────────────────────────────────────────────────────────────┐    │
│   │  Bloque 3 — Sistema de Meta, Marcas y WhatsApp                    🔒 Bloqueado │    │
│   │  Se desbloquea al completar el Bloque 2                                        │    │
│   └────────────────────────────────────────────────────────────────────────────────┘    │
│                                                                                          │
│   📎 Material extra        🎓 Hacer evaluación (al completar todos los bloques)         │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.bis.2.a — Vista de Bloque (la pantalla más importante: una página, sin ruido)

> Esta es la vista donde el vendedor pasa la mayor parte del tiempo. **Una página por bloque.** Sin sidebar de árbol completo. Sin chat IA permanente. Solo el contenido del bloque, máximo espacio, máxima legibilidad.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Módulo 2 ▸ Protocolos Operativos ▸ Bloque 1: Caja                                    │
├──────────────────────────────────────────────────────────────────────────┬──────────────┤
│                                                                          │              │
│   Protocolo de Ingreso                                                   │  📎  Material│
│                                                                          │     extra    │
│   Cuando un cliente entra a la oficina, el procedimiento es:             │              │
│                                                                          │  • Plantilla │
│   ┌──── ⚠ Importante ─────────────────────────────────────────┐         │    DNI       │
│   │ Siempre saludar primero. Pedir DNI o pasaporte antes de    │         │  • Lista de  │
│   │ avanzar con cualquier información de precios.              │         │    marcas    │
│   └────────────────────────────────────────────────────────────┘         │  • Form de   │
│                                                                          │    contacto  │
│   1. Saludar y confirmar la marca                                        │              │
│   2. Pedir DNI / pasaporte                                               │              │
│   3. Anotar contacto                                                     │  ────────    │
│                                                                          │              │
│   ┌─ Datos a registrar ───────────────────────────────┐                  │  🎓 Hacer    │
│   │  • Nombre completo                                 │                  │   evaluación │
│   │  • Marca de contacto                               │                  │   (al final  │
│   │  • Excursión de interés                            │                  │    del       │
│   └────────────────────────────────────────────────────┘                  │    módulo)   │
│                                                                          │              │
│                                                                          │              │
│   [◀ Anterior: Bienvenida]                            [Siguiente: Salidas ▶]            │
│                                                                          │              │
└──────────────────────────────────────────────────────────────────────────┴──────────────┘
                                                              ┌───────────────────────┐
                                                              │ 💬 Consultame tus     │
                                                              │    dudas              │
                                                              └───────────────────┐   │
                                                                                  │ 🤖 │  ← botón flotante
                                                                                  └────┘
```

**Reglas de esta vista:**
- Breadcrumb arriba: **Módulo X ▸ Nombre ▸ Bloque N: Nombre**. Clickeable para volver al nivel anterior.
- **Una sola columna principal** para el contenido. Ancho generoso, tipografía grande.
- **Sidebar derecho mínimo**: solo Material extra (si existe) + acceso a Hacer evaluación. Si no hay material extra, esa columna ni se muestra.
- **Botón "Siguiente"** abajo a la derecha:
  - Si quedan más sub-protocolos/lecciones dentro del bloque → "Siguiente: [nombre]" lleva al próximo.
  - Si el bloque terminó → "Siguiente bloque: [nombre]" lleva al primer ítem del bloque siguiente.
  - Si el módulo terminó → "Hacer evaluación del Módulo".
- **Botón "Anterior"** equivalente a la izquierda.
- **Botón flotante Sofía IA** abajo a la derecha:
  - Texto visible al lado (tooltip persistente las primeras visitas): **"Consultame tus dudas"**.
  - Al click abre un panel modal sobre el contenido (no descoloca la lectura).
  - Al cerrar el modal vuelve a quedar el botón flotante.
- **Marcar como visto:** automático cuando el alumno llega al final del bloque (scroll + tiempo mínimo). Sin botón manual molestando.

### 6.bis.3 — Vista del Editor / Admin de Contenido

Inspirado en el editor de Mighty Networks (acordeón módulo → actividades).

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏠 Inicio   📚 Cursos   👥 Usuarios   📊 Analytics    [💾 Guardado]  [🌐 No publicado]   │
├──────────┬──────────────────────────────────────────────────────────────────────────────┤
│          │ Curso: Capacitación Vendedores  ·  General · TODO EL AÑO                     │
│ EDICIÓN  │  [General] [Contenido*] [Acceso] [Sectores] [Certificación] [Analítica]      │
│          │                                                                              │
│ Cursos   │ ┌──────────────────────────────────────────────────────────────────────┐    │
│  ▸ Todo  │ │  ⬡  Módulo 0 — Introducción Institucional               🟢 Publicado  │    │
│    año   │ │  ┌────────────────────────────────────────────────────────────────┐  │    │
│  ▸ Inv.  │ │  │ ⋮⋮  📄  Bienvenido a Turismo Bariloche      [📝][👁][⋮]  ✔     │  │    │
│          │ │  │ ⋮⋮  📄  Índice de aprendizajes              [📝][👁][⋮]  ✔     │  │    │
│ Sectores │ │  │ ⋮⋮  📄  Glosario de términos                [📝][👁][⋮]  ✔     │  │    │
│  B1·VR·VP│ │  │              [+ Añadir bloque]                                  │  │    │
│          │ │  └────────────────────────────────────────────────────────────────┘  │    │
│ Medios   │ └──────────────────────────────────────────────────────────────────────┘    │
│          │                                                                              │
│ Usuarios │ ┌──────────────────────────────────────────────────────────────────────┐    │
│          │ │  ⬡  Módulo 1 — Excursiones y Proveedores                🟡 Borrador  │    │
│ ✨ IA    │ │  ┌────────────────────────────────────────────────────────────────┐  │    │
│   Admin  │ │  │ ⋮⋮  📄  Listado de excursiones              [📝][👁][⋮]  ✔     │  │    │
│          │ │  │ ⋮⋮  📄  Proveedores y prestadores           [📝][👁][⋮]  ⚠     │  │    │
│          │ │  │              [+ Añadir bloque]   [✨ Cargar con IA]            │  │    │
│          │ │  └────────────────────────────────────────────────────────────────┘  │    │
│          │ └──────────────────────────────────────────────────────────────────────┘    │
│          │                                                                              │
│          │ [+ Añadir módulo]    [⟳ Reordenar]    [✨ Index for AI]   [Publicar todo]   │
└──────────┴──────────────────────────────────────────────────────────────────────────────┘
```

### 6.bis.4 — Editor de Lección (WYSIWYG a pantalla completa)

> Cambio respecto a la idea original: la **vista previa NO está al lado del editor**. Se abre como pantalla aparte. Razón: el editor maneja mucha información (paleta de componentes, lista de bloques, sectores, overrides) y necesita el máximo espacio para que cargar sea cómodo. La vista previa se ve cuando uno quiere "ver cómo queda", no constantemente.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ◀ Módulo 2 / Bloque 1 / Lección: Protocolo de Ingreso      [💾 Guardado] [👁 Vista     │
│                                                              previa] [Publicar]         │
├──────────────────────────┬──────────────────────────────────────────────────────────────┤
│  PALETA DE COMPONENTES   │   CONTENIDO DE LA LECCIÓN (editor)                          │
│  (sticky)                │                                                              │
│                          │  ┌──────────────────────────────────────────────────────┐  │
│ Texto                    │  │ ⋮⋮ [H2]  Protocolo de Ingreso                  [🗑] │  │
│ • [H] Encabezado         │  └──────────────────────────────────────────────────────┘  │
│ • [📄] Texto             │                                                              │
│ • [☑] Lista              │  ┌──────────────────────────────────────────────────────┐  │
│                          │  │ ⋮⋮ [Texto]  Cuando un cliente entra a la oficina,   │  │
│ Multimedia               │  │           el procedimiento es:                       │  │
│ • [🖼] Imagen            │  │                                              [✏ Editar]│  │
│ • [📹] Video             │  └──────────────────────────────────────────────────────┘  │
│ • [📎] Archivo           │                                                              │
│ • [🔗] Embed             │  ┌──────────────────────────────────────────────────────┐  │
│                          │  │ ⋮⋮ [⚠ Alerta]  warning · "Siempre saludar primero" │  │
│ Énfasis                  │  │                                              [✏ Editar]│  │
│ • [⚠] Alerta             │  └──────────────────────────────────────────────────────┘  │
│ • [▦] Card               │                                                              │
│ • [▬] Separador          │  ┌──────────────────────────────────────────────────────┐  │
│                          │  │ ⋮⋮ [Listado]  3 pasos                         [✏]  │  │
│ Especializados           │  └──────────────────────────────────────────────────────┘  │
│ • [📊] Catálogo          │                                                              │
│ • [❓] Quiz inline       │  ┌──────────────────────────────────────────────────────┐  │
│                          │  │ ⋮⋮ [▦ Card]  "Datos a registrar" (3 items)    [✏]  │  │
│ ──────────────           │  └──────────────────────────────────────────────────────┘  │
│ Configuración            │                                                              │
│ Sectores que ven:        │              [+ Agregar componente]                          │
│ [✓ B1] [✓ VR] [✗ VP]     │                                                              │
│                          │                                                              │
│ Override por sector:     │                                                              │
│ • VR: editar variante    │                                                              │
└──────────────────────────┴──────────────────────────────────────────────────────────────┘
```

**Cómo se ve la vista previa (pantalla aparte):**

- Botón **"👁 Vista previa"** arriba a la derecha.
- Al click se abre en **nueva pestaña del navegador** (no modal) con la URL `…/preview/leccion-xxx`.
- Muestra la lección exactamente como la verá el alumno (incluido el sidebar de Material extra y el botón flotante de Sofía).
- Tiene un selector arriba: **"Ver como: B1 / VR / VP"** para validar overrides por sector.
- Cierre del preview no afecta el editor (que sigue abierto en su pestaña original).

**Por qué pantalla aparte y no lado-a-lado:**
- El editor con paleta lateral + lista de componentes + config de sectores ya consume el ancho útil.
- Cargar excursiones, protocolos, catálogos = muchas filas y campos. Necesita ancho.
- La vista previa se consulta puntualmente, no cada segundo. Pestaña aparte cumple igual.

### 6.bis.5 — Dashboard SuperAdmin (Cielo)

Inspirado en la vista de "academia patagonia" que mostraste.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Bienvenida de nuevo, Cielo 👋               [+ Crear módulo] [Analíticas] [Configurar]  │
├──────────┬──────────────────────────────────────────────────────────────────────────────┤
│ 🏠 Inicio│                                                                              │
│ 📚 Cursos│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐                │
│ 👥 Users │  │ Cursos          │ │ Alumnos         │ │ Evaluaciones     │                │
│ ✨ IA    │  │ ─────────────   │ │ ─────────────   │ │ ─────────────    │                │
│ 📊 Stats │  │   2             │ │   6             │ │   42 esta semana │                │
│ ⚙️ Config│  │ 1 publicado     │ │ 4 activos hoy   │ │ 87% aprob. media │                │
│          │  └─────────────────┘ └─────────────────┘ └──────────────────┘                │
│ SECTORES │                                                                              │
│   B1 · 4 │  Cursos recientes                                          Plan y uso        │
│   VR · 1 │  ┌──────────────────────────────────────────────────┐    ───────────         │
│   VP · 1 │  │ 📕 Capacitación TM — Invierno 2026   🟢 Activo  │    Cursos      2/∞    │
│          │  │      6 alumnos · actualizado hace 2h              │    Miembros    6/∞    │
│ ALERTAS  │  ├──────────────────────────────────────────────────┤    Editores    1/∞    │
│ • 1 lecc.│  │ 📘 Capacitación TM — Todo el año     🟡 Borrador │    Créditos IA 15/∞  │
│   sin    │  │      0 alumnos · creado el 14/05                  │                       │
│   sector │  └──────────────────────────────────────────────────┘    Próximos pasos     │
│                                                                                          │
│          │  Miembros recientes                                                           │
│          │  YS  Yamila Sotelo     VR  Maintainer   Apr 20                                │
│          │  SP  Secretaría 002    —   SP           Apr 17                                │
│          │  RN  Rocío Nievas      VP  Maintainer   Apr 17                                │
└──────────┴──────────────────────────────────────────────────────────────────────────────┘
```

---

## 6.ter Onboarding del Usuario (Tour Guiado tipo Coderhouse)

> **Por qué importa:** Cielo destacó la introducción explicativa de Coderhouse ("Menú de perfil — Desde aquí podés acceder a tu perfil...") con paginación "2 de 5" y botones Anterior/Siguiente. La replicamos como sistema **reutilizable** para que cualquier usuario (alumno, editor, SP) reciba un tour la primera vez que entra.

### 6.ter.1 Características del sistema de tour

- Tooltips contextuales con flecha apuntando al elemento real (no pantallas modales).
- Paginación visible: "X de N", botones **Anterior / Siguiente / Saltar tour**.
- Persistencia por usuario: si lo completó o saltó, no vuelve a aparecer.
- Recuperable: en Perfil → "Volver a ver el tour".
- Configurable por SuperAdmin: editar pasos sin tocar código (los tours son data, no código).
- Diferente tour por rol.

### 6.ter.2 Tour del Alumno (5 pasos)

```
PASO 1 — Tu home               → tooltip sobre el sidebar
PASO 2 — Tu progreso           → tooltip sobre la barra global
PASO 3 — Continuar donde dejaste → tooltip sobre el botón
PASO 4 — Sofía, tu IA tutor    → tooltip sobre el ícono de chat
PASO 5 — Tu perfil y certificados → tooltip sobre el avatar
```

### 6.ter.3 Tour del Editor (6 pasos)

```
PASO 1 — Estructura de cursos        → árbol lateral
PASO 2 — Cargar contenido sin HTML   → editor WYSIWYG
PASO 3 — Live preview                → panel derecho del editor
PASO 4 — Cargar con IA               → botón "✨ Cargar con IA"
PASO 5 — Visibilidad por sector      → toggles B1/VR/VP
PASO 6 — Publicar y vista previa     → botones del top bar
```

### 6.ter.4 Tour del SuperAdmin / SP (4 pasos)

```
PASO 1 — Dashboard global       → widgets de números
PASO 2 — Cómo asignar roles     → tab Usuarios
PASO 3 — Configurar las IAs     → tab IA Admin
PASO 4 — Exportar reportes      → botón Analíticas (solo SP)
```

### 6.ter.5 Onboarding "Primeros pasos" (checklist persistente del SuperAdmin)

Caja flotante en esquina inferior derecha (como mostró el screenshot de Mighty Networks). Marca tareas hechas y guía a Cielo en la configuración inicial:

```
✓ Crear tu primer curso
✓ Añadir módulos y bloques
□ Configurar sectores (B1, VR, VP)
□ Cargar primer lote de contenido con IA
□ Invitar a los primeros vendedores
□ Probar el tutor Sofía con preguntas reales
□ Publicar el primer curso
```

Se autocompleta a medida que Cielo hace las acciones. Reduce el síndrome de "página en blanco".

---

## 7. Panel de Administración (la otra mitad del producto)

### 7.1 Filosofía
- **Si tenés que tocar HTML, fallamos.**
- WYSIWYG con **live preview** del lado derecho mostrando exactamente cómo lo ve el alumno (inspirado en el nuevo course builder de Thinkific).
- Auto-save cada cambio.
- Drag & drop para reordenar módulos, bloques y lecciones.
- Carga de archivos con drop zone.
- Validaciones en línea (no falta título, no falta sector asignado, etc.).

### 7.2 Vistas del admin
- **Dashboard admin:** alumnos activos, evaluaciones pendientes, módulos más vistos, alertas (contenido sin sector, evaluaciones sin preguntas).
- **Editor de Capacitación → Categoría → Módulo → Bloque** (navegación tipo árbol + breadcrumbs).
- **Biblioteca de medios:** todos los videos, imágenes y archivos cargados, reutilizables.
- **Editor de evaluaciones:** crear preguntas con preview de cómo las ve el alumno.
- **Gestión de usuarios:** crear, asignar sector, ver progreso, resetear contraseña.
- **Configuración de sectores:** crear/editar sectores (B1/VR/VP) y reglas globales.
- **Logs y auditoría:** quién cambió qué.

### 7.2.bis Tipos de contenido: Genérico vs Schemas Específicos

> Hallazgo importante a partir de capturas de la app actual de Cielo: lo que **sí funciona** del proyecto vigente es que ciertos tipos de contenido (excursiones, proveedores, protocolos) **no se editan con un WYSIWYG libre**, se editan con **formularios estructurados** con campos específicos. Esto rescata claridad y consistencia. Se mantiene en la nueva plataforma.

La plataforma soporta **dos modos de creación de contenido**:

#### A) Lección Genérica (WYSIWYG con paleta de componentes)
- Para protocolos cortos, introducciones, glosarios, teoría libre.
- Es lo que se describió en §6.bis.4 (editor con paleta + lista de componentes).

#### B) Lección Tipada (Schema específico con formulario estructurado)

Cierto contenido tiene **forma fija** y debe editarse con un formulario predefinido. Beneficios: consistencia visual, datos consultables por Sofía IA con precisión, posibilidad de filtros, futuras integraciones (ej. precios desde Sheets).

**Schemas que vienen en v1:**

| Schema | Campos del formulario | Vista que se genera para el alumno |
|--------|----------------------|------------------------------------|
| **Excursión** | Título · Categoría · Proveedor · Duración · Edad mínima · Horarios de salida · Pick up operativo · Temporada/Operatividad · Diferencial estratégico · Programa/Visibilidad · Itinerario (multi-línea) · Incluye · No incluye · Importante / Restricciones · Imágenes (galería) | Tarjeta de excursión con secciones colapsables. Búsqueda y filtros (por categoría, proveedor, temporada). |
| **Proveedor / Prestador** | Nombre · Logo · Descripción · Datos de contacto · Productos asociados (links a Excursiones) | Página de proveedor con grilla de excursiones que ofrece. |
| **Protocolo** | Título · Identificador único · Cuadro de alerta/destacado (con color: celeste, amarillo, naranja, rojo, verde) · Párrafos de texto · Listados numerados o bullet · Confirmaciones requeridas | Tarjeta de protocolo con estructura visual consistente (lo que ya funciona en la app actual). |

**Cómo se ven los formularios en el admin** (idéntica filosofía a la app actual que mostraste — formularios densos pero ordenados, sidebar de items a la izquierda, formulario a la derecha):

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [Listado de Excursiones]  [Directorio de Proveedores]              [💾 Guardar catálogo]│
├──────────────────┬──────────────────────────────────────────────────────────────────────┤
│ [🔍 buscar...]   │  Detalles de la Excursión                                   [🗑]    │
│ [+ Nueva Excur.] │                                                                       │
│                  │  Título de la Excursión                Categoría                      │
│ ● 1. Circuito    │  [1. Circuito Chico y Cerro Camp.]    [Terrestre ▾]                  │
│   Chico          │                                                                       │
│   🏢 Adventure C.│  Proveedor / Prestador     Duración              Edad Mínima         │
│                  │  [Adventure Center ▾]      [4 hs (Mañana/Tarde)] [Ej: 4 años]        │
│ ○ 2. San Martín  │                                                                       │
│   por 7 Lagos    │  Horarios de Salida                       Pick Up Operativo           │
│                  │  [08:30 a 12:30 / 14:30 a 19:00…]         [Centro, Av. De Los Pio…]  │
│ ○ 3. Tronador    │                                                                       │
│                  │  Diferencial Estratégico (Valor de venta)  Programa / Visibilidad    │
│ ○ 4. Bolsón      │  [Paseo tradicional terrestre…]            [Todo el Año ▾]            │
│                  │                                                                       │
│ ○ 5. Circuito    │  Itinerario (una línea por paso)       Incluye (una línea por item)  │
│   Grande         │  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
│                  │  │ Cerro Campanario (1h)           │  │ Traslado terrestre      │   │
│ ○ 6. Colonia S.  │  │ Mirador: Punto Panorámico       │  │ Paradas panorámicas     │   │
│                  │  │ Mirador: Capilla San Eduardo    │  │                         │   │
│ ○ 7. Cervecería  │  └─────────────────────────────────┘  └─────────────────────────┘   │
│                  │                                                                       │
│ ○ 8. Catedral    │  No Incluye                            Importante / Restricciones    │
│                  │  ┌─────────────────────────────────┐  ┌─────────────────────────┐   │
│                  │  │ Ascenso a Cerro Campanario      │  │ Tarifas diferenciales   │   │
│                  │  └─────────────────────────────────┘  └─────────────────────────┘   │
└──────────────────┴──────────────────────────────────────────────────────────────────────┘
```

#### Cómo se combinan dentro de un bloque

Un bloque puede contener:
- N lecciones genéricas (WYSIWYG).
- N lecciones tipadas (schemas).
- En cualquier orden.

Por ejemplo, el **Módulo 1 — Excursiones y Proveedores** del catálogo de capacitación va a ser casi 100% lecciones tipadas. El **Módulo 0 — Introducción** va a ser casi 100% lecciones genéricas. El **Módulo 2 — Protocolos** combina ambos.

#### Schemas extensibles

El SuperAdmin puede crear nuevos schemas en el futuro (ej. "Caso de éxito", "FAQ de objeción") sin tocar código: configura los campos, su tipo y la vista resultante. Esto se hace desde **Configuración → Schemas**.

---

### 7.3 Componentes de carga (paleta del editor genérico)
Cada elemento es un "bloque" insertable en una lección. Click para agregar, drag para reordenar.

| Componente | Campos del admin |
|------------|------------------|
| Texto | Editor rico (markdown bajo el capó) |
| Encabezado | Texto + nivel (H2/H3/H4) |
| Imagen | URL/upload + alt + caption |
| Video | URL YouTube/Vimeo/archivo + título |
| Archivo descargable | Upload + descripción |
| Alerta | Tipo (info/warning/etc) + título + texto |
| Card / Recuadro | Título + descripción + ícono + (opcional) link |
| Catálogo | Fuente: tabla manual o link a Google Sheets/Drive |
| Listado | Título + items (cada uno con checkbox opcional) |
| Embed | URL (Loom, Slides, Drive) |
| Quiz inline | 1 pregunta sin valor de certificación |
| Separador | Línea visual |

### 7.4 Asistente IA del Admin
- Botón "Cargar con IA" en cada módulo/bloque.
- Acepta: pegar texto, subir PDF/DOCX, link a Google Drive.
- La IA **analiza, propone una estructura** (bloques, lecciones, alertas, listados), **muestra preview** y el admin aprueba/edita antes de publicar.
- Nunca publica sin confirmación humana.
- Casos de uso prioritarios:
  1. Subir el PDF del protocolo de ingreso → IA detecta secciones → propone bloque con listado paso a paso + alertas en puntos críticos.
  2. Pegar el listado de excursiones → IA propone catálogo filtrable.
  3. Subir el guion del avatar Sofía → IA propone bloque de video + transcripción + cards de puntos clave.

---

## 8. Stack Tecnológico

### Recomendación: **Remix / React Router v7** + Supabase + Vercel

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Framework | **React Router v7** (modo framework, ex-Remix) | Loaders/actions ideales para admin con flows complejos. Auth y forms nativos. Migración Remix→RR7 ya estable. |
| UI | React 19 + Tailwind v4 | Mismo stack que app-invierno. Reutilizamos componentes. |
| Componentes | shadcn/ui + Radix | Profesional, accesible, copiable (no librería pesada). |
| Editor rico | Tiptap o Lexical | Editor WYSIWYG moderno. Tiptap más simple, Lexical más potente (Meta). |
| Auth + DB | Supabase | Auth, Postgres, Storage (videos), Realtime, RLS para sectores. |
| Vector DB para IA | Supabase pgvector | Mismo Postgres. Una sola DB. |
| LLM Admin (carga) | Claude Opus 4.7 vía API | Mejor para tareas estructuradas. |
| LLM Tutor (alumno) | **Claude Haiku 4.5** (default) o **GPT-4o-mini** como alternativa | Ambos baratos y rápidos. Abstracción del proveedor en una capa para poder cambiar sin tocar el resto. |
| Orquestación IA | LangGraph.js o agente custom | LangGraph estándar 2026 para agents con memoria. |
| Hosting | **Servidor propio de la empresa** (mismo que app-invierno: `c1.iadventurecenter.com`) | Decisión de Cielo. Control total y consistencia con la app actual. Implica armar build + Node + reverse proxy. |
| Internacionalización | Estructura i18n desde día 1 (claves de traducción, no strings hardcoded) | Idioma único en v1 (español rioplatense), pero arquitectura lista para portugués/inglés sin refactor. |
| Animaciones | Framer Motion v12 | Stack actual. |
| Iconos | Lucide React | Stack actual. |

### Por qué Remix/RR7 y NO Astro
- Astro brilla en **contenido estático** (blogs, docs, landings). Acá la mayoría del valor está en el **admin interactivo + IA + evaluaciones drag&drop**.
- Loader/action pattern de Remix evita el over-fetching y resuelve forms sin re-inventar.
- Admin con WYSIWYG necesita SPA feel; Astro lo hace pero a contracorriente.
- Si en algún momento querés una landing pública SEO-friendly, podés agregar Astro en un subdominio sin tocar la app principal.

### Por qué NO Next.js
- Next funciona, pero el admin con loaders/actions de RR7 sale más prolijo y con menos código.
- Igualmente es una alternativa válida si el equipo ya está más cómodo con Next.

---

## 9. Modelo de Datos (alto nivel, no DDL aún)

```
users                  → id, email, role, sector, created_at
categories             → id, slug, name, order, season (yearround/winter/summer)
modules                → id, category_id, order, title, has_evaluation, passing_score
module_visibility      → module_id, sector (B1/VR/VP)
module_titles_by_sector→ module_id, sector, alt_title
blocks                 → id, module_id, order, title
block_visibility       → block_id, sector
block_titles_by_sector → block_id, sector, alt_title
lessons                → id, block_id, order, content_json (estructura del editor)
lesson_visibility      → lesson_id, sector
media                  → id, url, type, uploaded_by, mime, size
evaluations            → id, module_id, passing_score, max_attempts
questions              → id, evaluation_id, order, type, body_json, correct_json
attempts               → id, user_id, evaluation_id, started_at, finished_at, score
attempt_answers        → attempt_id, question_id, answer_json, is_correct
progress               → user_id, lesson_id, viewed_at, completed_at
chat_sessions          → id, user_id, lesson_id (nullable), created_at
chat_messages          → session_id, role, content, citations_json
embeddings             → id, content_chunk, vector, source_type, source_id
audit_log              → who, what, when, payload_json
```

Supabase RLS hace cumplir la visibilidad por sector a nivel base de datos (no solo UI).

---

## 10. IA — Detalle

### 10.1 Admin Assistant (carga de contenido)
- Endpoint server: recibe input (texto / archivo / URL).
- Pipeline:
  1. Extracción (PDF/DOCX/HTML/Drive).
  2. Análisis estructural con Claude Opus (qué es título, paso, alerta, listado).
  3. Mapeo a componentes del editor (devuelve `content_json`).
  4. Preview en UI → admin aprueba o edita.
  5. Persistencia.
- Memoria: la IA conoce la estructura existente (módulos, bloques, taxonomía) y ofrece insertar en el lugar correcto.

### 10.2 Tutor del Alumno (Sofía IA)
- RAG sobre embeddings de todo el contenido publicado.
- Filtrado por sector del alumno (no puede citar contenido de otros sectores).
- Citas obligatorias: cada respuesta indica de qué módulo/bloque viene.
- Conversación con memoria por sesión y por alumno (preferencias, dudas recurrentes).
- Fallback: "No tengo esa información, consultá con tu supervisor."
- Telemetría: qué preguntan más → input para mejorar contenido.

---

## 11. Diseño Visual

### Principios
- **Profesional pero cálido.** No SaaS frío. Toques del branding turístico (Patagonia) sin saturar.
- **Tipografía clara con jerarquía fuerte.** H1/H2/H3 muy distintos.
- **Densidad media.** Aire sí, pero no vacíos enormes.
- **Color de acento por categoría.** Todo el año = un color, Invierno = otro. Marca contexto sin gritar.

### Sistema de temas (claro + oscuro + paletas)

La plataforma soporta **modo claro y modo oscuro**. Cada modo tiene **paletas seleccionables** desde el perfil del usuario.

**Paletas v1 (todas con variante clara y oscura):**

| Nombre | Modo claro | Modo oscuro |
|--------|------------|-------------|
| Clásica B/N | Blanco + grises + negro como acento | Negro + grises + blanco como texto |
| Azul Profesional | Blanco + acento azul Patagonia | Azul muy oscuro + acento celeste |
| Amarillo Aventura | Blanco + acento amarillo | Negro + acento amarillo |

- El sistema detecta la preferencia del SO (light/dark) la primera vez.
- El usuario elige su paleta en Perfil → Apariencia.
- Las paletas están en **CSS variables** (con Tailwind v4 que es CSS-first). Agregar una paleta nueva es editar 6-8 valores, no refactorizar.
- El SuperAdmin puede **crear paletas custom** desde Configuración → Apariencia (para alinearlas a marcas si en el futuro hay academias por marca).

### Referencias visuales que sí (validadas por Cielo)
- **Coderhouse 4.0** — vista interna del curso (3 columnas: sidebar módulos / contenido / tutor IA "Ticher"). Es el layout target para la vista del alumno.
- **Coderhouse 4.0** — catálogo con sidebar simple (Mis cursos / Explorar / Playground) y card grande destacada. Es el layout target para el home.
- **Coderhouse 4.0** — sistema de tooltips de onboarding ("Menú de perfil — 2 de 5 — Anterior/Siguiente").
- **Mighty Networks / academia patagonia** — admin con dashboard de números arriba, listado de cursos en acordeón, panel "Primeros pasos" colapsable. Es el layout target para el panel admin.
- **Mighty Networks** — vista de edición de curso con tabs (General · Contenido · Acceso · Colaboradores · SEO · Certificación · Analíticas) y módulos en acordeón con actividades arrastrables.
- **Thinkific** — course builder con live preview lado a lado (referencia para el editor de lección).
- **Notion** — callouts/alertas, tipografía y jerarquía.

### Referencias visuales que NO
- Hotmart (dashboard fragmentado en mini-plataformas).
- Moodle (denso, anticuado).
- La app actual (HTML plano sin jerarquía).

---

## 12. Fases de Implementación

### Fase 1 — Esqueleto (semana 1)
- Bootstrap RR7 + Supabase + Tailwind v4 + shadcn.
- Auth (login, roles, sectores).
- Estructura de datos (migraciones Supabase).
- Layouts: shell del alumno y shell del admin.

### Fase 2 — Carga de contenido manual (semanas 2-3)
- Editor WYSIWYG con todos los componentes.
- Vista admin → módulo → bloque → lección.
- Live preview.
- Visibilidad y títulos por sector.
- Migración del contenido B1 actual.

### Fase 3 — Experiencia del alumno (semana 4)
- Home del alumno.
- Vista de categoría y módulo.
- Renderizado de bloques.
- Progreso y tracking.

### Fase 4 — Evaluaciones (semana 5)
- Editor de quizzes.
- Render del quiz para alumno.
- Cálculo de nota, certificación, reintentos.
- Reportes para supervisor.

### Fase 5 — IA Admin (semana 6)
- Endpoint de análisis.
- Pipeline de extracción.
- UI de preview/aprobar.

### Fase 6 — IA Tutor (semana 7)
- Generación de embeddings.
- Chat con RAG.
- Citas y filtrado por sector.

### Fase 7 — Pulido y deploy (semana 8)
- Modo oscuro.
- Onboarding del primer admin.
- Migración de contenido VR + VP.
- Deploy a servidor empresa o Vercel.
- Capacitar a Cielo en el admin.

> **Nota:** Las fechas son orientativas. Cada fase termina con demo navegable. La app-invierno sigue en producción durante toda la migración.

---

## 13. Criterios de Éxito

| Criterio | Métrica |
|----------|---------|
| Cielo carga un protocolo nuevo sin tocar código | < 10 min con asistencia IA, < 20 min sin IA |
| Vendedor encuentra y completa su próximo módulo | < 3 clicks desde el login |
| Vendedor consulta Sofía IA y recibe respuesta con cita correcta | > 90% precisión sobre 50 consultas test |
| Supervisor exporta reporte de su sector | < 30 segundos, CSV listo para pasar a SP |
| App reemplaza a app-capacitacion-gral | 100% del contenido migrado y aprobado |
| Vendedores prefieren la nueva | Encuesta interna ≥ 8/10 |

---

## 14. Alcance v1 vs v1.5 vs fuera

### Dentro de v1 (lo que se entrega para reemplazar la app actual)

- Web responsive **+ PWA instalable** (cubre el caso "app móvil" sin desarrollar app nativa). Se instala en el celular del vendedor desde el navegador y se ve como una app.
- **Multi-idioma** aplicado desde el inicio: español rioplatense por default + estructura para sumar portugués e inglés. Los strings de UI ya vienen con traducciones disponibles, las traducciones de contenido se cargan a medida que se necesiten.
- **Integración con Notion** para exportar resultados de evaluaciones a una database (única integración Notion del producto — ver §5.4).
- Modo claro + modo oscuro + sistema de paletas seleccionables.
- Todo lo descrito en §1 a §13.

### v1.5 (siguiente iteración, no v1)

- **Gamificación:** puntos, badges, ranking entre vendedores (interno o por sector), niveles, racha de días consecutivos.
- App móvil nativa con notificaciones push reales (la PWA cubre el 90%, esto sería un upgrade).
- IA Admin con "modo automático" (sube contenido sin pedir confirmación cuando se le aprueba un patrón).
- Schemas extra (Casos de éxito, FAQs de objeciones).

### Fuera de alcance (no v1 ni v1.5)

- Cursos en vivo / streaming.
- Pagos / monetización externa (es plataforma interna).
- Marketplace de cursos.
- App nativa iOS/Android empaquetada para tiendas (más allá de la PWA o un wrapper Capacitor en v1.5).

---

## 15. Decisiones Tomadas (resueltas 2026-05-14)

| # | Tema | Decisión | Implicancia |
|---|------|----------|-------------|
| 1 | Hosting | **Servidor propio de la empresa** (mismo de app-invierno) | Pipeline de deploy distinto a Vercel. Probable Docker + Nginx. Cielo coordina con SP el acceso. |
| 2 | Idioma | **Multi-idioma aplicado v1.** Español rioplatense por default, estructura lista para portugués e inglés. | Usar claves i18n desde día 1. Traducciones de UI completas; traducciones de contenido a medida. |
| 3 | LLM Tutor | **Haiku 4.5 (default) o GPT-4o-mini (alternativa).** Capa de abstracción del proveedor. | El código habla con un wrapper genérico (`llm.chat()`), no directo con la SDK del proveedor. |
| 4 | Evaluaciones | Migrar las existentes en la fase final. **Modo abierto / refuerzo, no examen punitivo.** | Alumno puede consultar contenido y a Sofía durante evaluaciones. Reportes a Notion. |
| 5 | Roles | **Alumno · Editor · SP (puede editar y ver evaluaciones) · SuperAdmin (Cielo).** | SP no es solo lectura — tiene capacidades de edición y análisis profundo. |
| 6 | Vista del alumno | **Una página por bloque, sin sidebar de árbol.** Sofía = botón flotante. Vista limpia, máximo espacio. | Layout simple, navegación con Anterior/Siguiente y breadcrumb. |
| 7 | Editor de lección | **Vista previa en pantalla aparte (nueva pestaña), no lado a lado.** | Editor con ancho completo para cargar mucho contenido sin compromisos. |
| 8 | Temas | **Modo claro + modo oscuro + sistema de paletas seleccionables.** v1 trae 3 paletas. | CSS variables (Tailwind v4 CSS-first). Configurable por usuario. |
| 9 | App móvil | **PWA en v1.** App nativa eventualmente en v1.5. | Servicio worker, manifest, instalable desde el navegador. |
| 10 | Notion | **Integrado solo para evaluaciones.** Exporta resultados a una database Notion configurable. | API token + database ID en config del SuperAdmin. |
| 11 | Variantes por sector | Pueden ser solo título, solo contenido, o ambos. Overrides parciales permitidos. | Modelo de datos con base + overrides por sector, no duplicación entera. |
| 12 | Schemas de contenido | **Dual: lecciones genéricas (WYSIWYG) + lecciones tipadas (formularios estructurados).** | Excursiones, Proveedores y Protocolos como schemas v1. Extensibles por SuperAdmin. |
| 13 | Login | **Username + contraseña, NO email.** Los crea SP/SuperAdmin desde el panel. Sin auto-registro ni reset por mail. | Internamente derivamos `{username}@capacitacion-tm.local` para usar Supabase Auth sin agregar columna username separada. |

---

## 16. Prompt Operativo de Arranque

> **Este es el prompt que vas a pegar al inicio de cada sesión nueva con Claude Code (o cualquier agente) cuando trabajemos en la plataforma. Es la versión destilada del PRD.**

```
Estoy construyendo una plataforma interna de capacitación para los vendedores
de Adventure Center (área TM, 14 marcas turísticas en Bariloche). Reemplaza
totalmente la app-capacitacion-gral actual.

CONTEXTO:
- Lectura obligatoria antes de tocar nada:
  - planes/2026-05-14-prd-plataforma-capacitacion.md  (PRD completo, fuente de verdad)
  - contexto/info-personal.md, contexto/negocio/info-negocio.md,
    contexto/negocio/brand_profiles.md, contexto/proyectos/datos-actuales.md

ESENCIA DEL PRODUCTO:
- Alumnos = vendedores divididos en 3 sectores: B1, VR, VP.
- Estructura: Capacitación → Categorías (Todo el año, Invierno) → Módulos → Bloques → Lecciones.
- Cada módulo (excepto Módulo 0) cierra con una evaluación que certifica.
- Cada nodo puede restringirse por sector y tener título alternativo por sector.
- Dos IAs: una asiste al admin a cargar contenido, otra (Sofía) responde dudas
  del alumno con RAG sobre el contenido publicado y citas obligatorias.
- Admin sin HTML jamás: WYSIWYG con live preview tipo Thinkific.

STACK (decidido):
- React Router v7 (modo framework, ex-Remix) + TypeScript.
- Tailwind v4 (CSS-first, sistema de temas con CSS variables).
- shadcn/ui + Radix + Framer Motion v12 + Lucide.
- Editor rico: Tiptap.
- Supabase (Auth + Postgres + Storage + pgvector + RLS por sector).
- Claude Opus 4.7 para admin IA. Tutor: Haiku 4.5 o GPT-4o-mini (capa de abstracción).
- Hosting: SERVIDOR PROPIO de la empresa (no Vercel). Mismo servidor que app-invierno.
- PWA en v1 (manifest + service worker).
- i18n con español rioplatense por default y estructura para portugués/inglés.
- Integración Notion API solo para exportar resultados de evaluaciones.

ROLES (definitivos):
- Alumno (sector B1, VR o VP)
- Editor (carga contenido, sin permisos)
- SP (puede editar contenido + ver y analizar evaluaciones + exportar reportes)
- SuperAdmin (Cielo) — todo

FILOSOFÍA NO NEGOCIABLE:
- Vista del alumno: UNA página por bloque. Limpia, sin árbol lateral.
  Sofía = botón flotante con tooltip "Consultame tus dudas".
- Evaluaciones = refuerzo + diagnóstico, NO castigo. Acceso libre al contenido
  durante la evaluación.
- Editor: vista previa en pantalla aparte, no lado a lado.
- Dos modos de contenido: lecciones genéricas (WYSIWYG) + lecciones tipadas
  con schemas estructurados (Excursión, Proveedor, Protocolo).
- Variantes por sector pueden ser solo título, solo contenido o ambos. Overrides parciales.
- Modo claro + oscuro + paletas seleccionables desde día 1.

REFERENCIAS VISUALES OBLIGATORIAS:
- Coderhouse 4.0 (vista interna del curso, catálogo, tooltips de onboarding)
- Mighty Networks / academia patagonia (admin con tabs, módulos acordeón, "Primeros pasos")
- App actual de Cielo (NADA del diseño general, PERO sí los formularios estructurados
  de Excursión, Proveedor y Protocolo + el editor de protocolos con vista previa en vivo)
NO imitar: Hotmart, Moodle, el diseño general de la app-capacitacion-gral actual.

REGLAS DEL WORKSPACE (no negociables):
- Nunca push directo a main. Rama descriptiva → push → reportar link para que
  Cielo apruebe el merge.
- Antes de cambios significativos: crear plan en planes/ con fecha YYYY-MM-DD.
- Al terminar una fase: actualizar contexto/proyectos/datos-actuales.md.
- Idioma de toda la UI y del código de usuario: español rioplatense.
- Diseño profesional cálido — referencias: Notion, Thinkific, Linear, Coderhouse 4.0.

FASE ACTUAL: [completar al iniciar cada sesión — Fase 1 al arrancar]

Tu primer paso siempre es leer el PRD completo y confirmarme qué fase
estamos por ejecutar antes de tocar código.
```

---

## 17. Próximos Pasos

1. **Cielo revisa este PRD** y marca cambios / preguntas.
2. Resolver las 5 decisiones abiertas de §15.
3. Crear el repo `salidas/capacitacion-tm/` con bootstrap de Fase 1.
4. Plan detallado de Fase 1 en `planes/` con tareas accionables.
5. Empezar.

---

_Documento vivo. Cada cambio aprobado se versiona acá. Si algo del PRD no se cumple en código, el código está mal._
