# Plan: App de Capacitación Invierno — Desde Canva hasta producción

**Creado:** 2026-04-10
**Estado:** 95% completo — pendiente solo ajuste de preguntas de evaluación con los SP
**Pedido:** Tomar el HTML creado en Canva AI Code, traerlo al workspace, completarlo con todo el catálogo de invierno, y dejarlo en condiciones de publicarse en Vercel.

---

## Descripción General

### Qué Logra Este Plan

Incorporar el HTML de la app de Capacitación Invierno (creado en Canva AI Code) al workspace de forma ordenada, completar su contenido con todas las excursiones del `catalog_invierno.md`, y prepararlo para publicación en Vercel. El resultado es una guía de consulta rápida para vendedores sobre la temporada de invierno: excursiones, traslados, precios y proveedores.

### Por Qué Importa

Es prioridad ALTA en `proyectos.md`. Los vendedores necesitan tener acceso rápido a información de la temporada antes de que empiece. Además, este flujo de trabajo (Canva → workspace → Vercel) establece el proceso para futuras temporadas.

---

## Estado Actual

### Lo que ya existe

| Recurso | Estado |
|---------|--------|
| `contexto/catalog_invierno.md` | Completo — todas las excursiones, precios, horarios |
| `salidas/app-capacitacion/capacitacion_v4.html` | App de capacitación principal (módulos, quiz, avatar Sofía) |
| `salidas/app-capacitacion/modulo-1-excursiones/` | 17 lecciones de verano/todo el año |
| HTML de Canva (en poder del usuario) | Creado, no está en el workspace todavía |

### Excursiones en el catálogo de invierno (`catalog_invierno.md`)

**Terrestres:**
- Villa La Angostura y Cerro Bayo
- Traslado Cerro Catedral
- Traslado Cerro Bayo
- Traslado Villa La Angostura

**Ski & Snow (Cerro Catedral):**
- Clase Bautismo Ski/Snow (EPIC) — pase no incluido
- Clase Bautismo Ski/Snow Semi Exclusiva
- Traslado + Equipo Ski/Snow sin clases

**Nieve & Refugios (Cerro López / Neumeyer):**
- Roca Negra
- Noche Encantada
- Nieve Encantada
- Culipatín — Trineos en Cerro López
- Caminata Laguna Congelada + Almuerzo (Refugio Neumeyer)
- Vivencias: Raquetas y Sabores Regionales (Refugio Neumeyer)

**Piedras Blancas:**
- Piedras Blancas Trineos-Culipatín + Traslado
- Piedras Blancas Solo Ingreso + Traslado
- Piedras Blancas Pista Infantil

**Winter Park (Cerro Otto):**
- Winter Park — Ski Principiantes + Traslado
- Winter Park — Cena Show y Ski Nocturno

**La Cueva (Cerro Catedral):**
- La Cueva — Paseo Nocturno y Cena
- La Cueva — Travesía Diurna Cuatriciclos

**Tabla de Señas/Saldos (Junio):**
- Bautismo Ski (EPIC), Laguna Congelada, La Cueva After Ski, La Cueva Cena, La Cueva Diurno, Piedras Blancas, Alquiler de ropa, Cena Nórdica

### Brechas que este plan resuelve

- El HTML de Canva no está en el workspace (no hay versión controlada)
- No existe carpeta dedicada para la app de invierno en `salidas/`
- Algunas excursiones tienen precios con `$-` (pendiente de actualizar)
- No está claro qué va en la pestaña "Proveedores" de la app
- El año en la app dice "2025" — posiblemente debe ser "2026"

---

## Cambios Propuestos

### Resumen de Cambios

- Crear carpeta `salidas/app-invierno/` como home de esta app
- Guardar el HTML de Canva como `v1-canva-original.html` (fuente)
- Crear `index.html` como versión de trabajo (se modifica esta, no el original)
- Completar todas las excursiones del catálogo que faltan en el HTML
- Corregir el año (2025 → 2026 si corresponde)
- Completar o eliminar los precios con `$-`
- Definir y completar la pestaña "Proveedores"
- Verificar que los filtros (Todos / Excursiones / Traslados / Proveedores) funcionen correctamente
- Preparar para deploy en Vercel

### Nuevos Archivos a Crear

| Ruta del Archivo | Propósito |
|-----------------|-----------|
| `salidas/app-invierno/v1-canva-original.html` | Copia intacta del HTML de Canva (nunca se edita) |
| `salidas/app-invierno/index.html` | Versión de trabajo — se edita, se despliega |
| `salidas/app-invierno/README.md` | Nota de propósito, stack, cómo actualizar para futuras temporadas |

### Archivos a Modificar

| Ruta del Archivo | Cambios |
|-----------------|---------|
| `contexto/proyectos.md` | Mover "Página Capacitación Invierno" a "En desarrollo" con estado actualizado |
| `CLAUDE.md` | Agregar `salidas/app-invierno/` a la estructura documentada |

---

## Decisiones de Diseño

### Decisiones Clave Tomadas

1. **App separada de `capacitacion_v4.html`**: La app de invierno es una guía de consulta rápida (precios, horarios, qué incluye), no un módulo de capacitación con quiz y avatar. Son herramientas distintas con propósitos distintos.

2. **Preservar el HTML de Canva intacto**: Guardar `v1-canva-original.html` sin tocar, para poder referenciar el diseño original o hacer rollback. La versión de trabajo es `index.html`.

3. **Una sola carpeta `salidas/app-invierno/`**: Mantiene el workspace limpio. Si en el futuro hay una v2 o se actualiza para 2027, se versionan archivos dentro de la misma carpeta.

4. **No integrar con `capacitacion_v4.html`**: Complejidad innecesaria. Son apps independientes. Eventualmente podrían compartir un dominio o enlazarse, pero no en esta etapa.

### Alternativas Consideradas

- **Integrar como módulo dentro de capacitacion_v4.html**: Descartado. La app de Canva tiene un diseño visual diferente y sirve como consulta, no como módulo de aprendizaje.
- **Mantenerlo solo en Canva**: Descartado. No hay control de versiones, no se puede editar con precisión, y Canva puede cambiar o perder el archivo.

### Preguntas Abiertas — NECESITO RESPUESTAS ANTES DE IMPLEMENTAR

1. **¿Podés pegar el código HTML completo de Canva acá?**
   Sin él no puedo saber qué excursiones ya están cargadas y cuáles faltan.

2. **¿El año es 2025 o 2026?**
   La app dice "TEMPORADA INVIERNO 2025" pero estamos en 2026. ¿Hay que actualizarlo?

3. **¿Qué va en la pestaña "Proveedores"?**
   En la captura se ve ese filtro. ¿Son los operadores (Cerro Catedral, La Cueva, Neumeyer, Piedras Blancas, Winter Park)? ¿Tienen datos de contacto, políticas, info especial para vendedores?

4. **¿Los precios con `$-` (Traslado + Equipo sin clases) están pendientes de definir o se sacan de la app?**

5. **¿La app va en el mismo proyecto de Vercel que `capacitacion_v4.html`, o en uno nuevo?**
   Esto define si es un archivo dentro del mismo repo o un proyecto separado.

6. **¿Hay tabla de señas/saldos para julio y agosto, o solo existe la de junio?**
   El catálogo tiene la tabla de junio. Si hay más, habría que agregarlas.

---

## Tareas Paso a Paso

> ⚠️ Esperar respuestas a las Preguntas Abiertas antes de ejecutar. Los pasos marcados con [BLOQUEADO] necesitan esa info.

### Paso 1: Recibir y guardar el HTML de Canva [BLOQUEADO hasta que pegues el código]

Pegar el HTML completo que generó Canva AI Code y guardarlo en el workspace.

**Acciones:**
- Crear carpeta `salidas/app-invierno/`
- Guardar el HTML recibido como `salidas/app-invierno/v1-canva-original.html` (copia sin tocar)
- Copiar como `salidas/app-invierno/index.html` (versión de trabajo)

**Archivos afectados:**
- `salidas/app-invierno/v1-canva-original.html` (nuevo)
- `salidas/app-invierno/index.html` (nuevo)

---

### Paso 2: Auditar el HTML vs el catálogo

Revisar qué excursiones están en el HTML vs las ~22 del catálogo de invierno.

**Acciones:**
- Leer `index.html` e identificar todas las excursiones cargadas
- Comparar con la lista completa de `contexto/catalog_invierno.md`
- Generar lista de faltantes

**Archivos afectados:**
- Lectura de `salidas/app-invierno/index.html`
- Lectura de `contexto/catalog_invierno.md`

---

### Paso 3: Completar excursiones faltantes en `index.html`

Agregar todas las excursiones del catálogo que no estén en el HTML, siguiendo el mismo formato de cards que usa el diseño de Canva.

**Acciones:**
- Para cada excursión faltante: crear una card con el mismo HTML/CSS patrón del diseño
- Incluir: nombre, tipo (Excursión / Traslado), proveedor, horarios, qué incluye/no incluye, precios (efectivo y tarjeta)
- Asegurarse de que el atributo `data-category` de cada card coincida con los filtros (excursion / traslado / proveedor)

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 4: Completar pestaña Proveedores [BLOQUEADO hasta respuesta #3]

**Acciones:**
- Según la respuesta: agregar cards de proveedores (Cerro Catedral, La Cueva, Neumeyer, Piedras Blancas, Winter Park) con info relevante para el vendedor
- Posible info útil: teléfono de reservas, política de cancelación, si aceptan tarjeta directamente, edad mínima general

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 5: Correcciones generales

**Acciones:**
- Actualizar año si corresponde (2025 → 2026)
- Resolver precios `$-` (completar o eliminar esas cards)
- Revisar que los filtros (Todos / Excursiones / Traslados / Proveedores) funcionen con las nuevas cards
- Verificar que la tabla de señas/saldos esté visible y correcta
- Revisar responsividad en mobile

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 6: Crear README de la app de invierno

Documentar para que cualquier IA o persona pueda continuar el trabajo en el futuro sin re-explicar contexto.

**Contenido del README:**
- Qué es esta app y para quién
- Stack: HTML + CSS + JS puro, sin frameworks
- Cómo agregar una excursión nueva (instrucción de 3 pasos)
- Cómo actualizar precios
- Dónde está el catálogo fuente (`contexto/catalog_invierno.md`)
- Historial de versiones

**Archivos afectados:**
- `salidas/app-invierno/README.md` (nuevo)

---

### Paso 7: Actualizar referencias del workspace

**Acciones:**
- Actualizar `contexto/proyectos.md`: mover "Página Capacitación Invierno" de backlog a "En desarrollo" con estado "contenido completo, pendiente deploy"
- Actualizar `CLAUDE.md`: agregar `salidas/app-invierno/` en la tabla de estructura

**Archivos afectados:**
- `contexto/proyectos.md`
- `CLAUDE.md`

---

### Paso 8: Deploy en Vercel [BLOQUEADO hasta respuesta #5]

**Acciones (según respuesta):**
- **Si va en el mismo proyecto**: mover `index.html` a la ruta correcta dentro del repo ya enlazado con Vercel
- **Si va en proyecto nuevo**: crear nuevo proyecto en Vercel, enlazar la carpeta `salidas/app-invierno/`
- Verificar que el deploy sea exitoso y la URL funcione

---

## Conexiones y Dependencias

### Archivos fuente que este plan lee

- `contexto/catalog_invierno.md` — fuente de verdad de todas las excursiones

### Archivos que se actualizan por consistencia

- `contexto/proyectos.md` — estado del proyecto
- `CLAUDE.md` — estructura del workspace

### Impacto en flujos existentes

- Ninguno. Esta app es independiente de `capacitacion_v4.html`.
- En el futuro, ambas apps podrían enlazarse (un botón "Ver guía de invierno" desde la app principal).

---

## Lista de Validación

- [ ] HTML de Canva guardado como `v1-canva-original.html` (intocable)
- [ ] `index.html` tiene todas las excursiones del catálogo
- [ ] Filtros (Todos / Excursiones / Traslados / Proveedores) funcionan correctamente
- [ ] No hay precios con `$-` sin resolver
- [ ] Año de temporada correcto
- [ ] Tabla de señas/saldos visible y completa
- [ ] README creado con instrucciones para actualizar
- [ ] `proyectos.md` y `CLAUDE.md` actualizados
- [ ] Deploy exitoso en Vercel y URL accesible

---

## Criterios de Éxito

1. Un vendedor puede abrir la URL en el celular, filtrar por "Traslados" y ver todos los traslados con precio y horario en menos de 10 segundos.
2. Una IA nueva (GPT, Gemini, etc.) puede leer el README y continuar el trabajo sin preguntas adicionales.
3. El `index.html` está completo: todas las excursiones del catálogo están representadas.

---

## Notas

- **Portabilidad entre IAs**: El README del Paso 6 es clave para esto. Si se terminan los tokens con Claude, otra IA puede leer `README.md` + `catalog_invierno.md` + `index.html` y continuar desde donde quedó.
- **Precios**: El catálogo tiene precios de junio. Si hay precios distintos para julio/agosto, habría que agregarlos o aclararlo en la app.
- **Temporada activa**: La temporada de invierno va de junio a septiembre. Ideal tener la app lista antes de junio 2026.
- **Las marcas de rafting están fuera de temporada** — no van en esta app.
