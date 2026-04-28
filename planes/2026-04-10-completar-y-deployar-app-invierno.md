# Plan: Completar y deployar la App de Capacitación Invierno

**Creado:** 2026-04-10
**Estado:** Listo para implementar
**Pedido:** Continuar el proyecto de app de capacitación de invierno — completar productos faltantes, corregir inconsistencias, agregar tabla de señas y deployar a Vercel.

---

## Descripción General

### Qué Logra Este Plan

Llevar la app de invierno (`salidas/app-invierno/index.html`) de su estado actual (21 productos cargados) al estado **production-ready**: todos los productos del catálogo representados, inconsistencias corregidas, tabla de señas/saldos visible, README documentado y app publicada en Vercel con URL accesible para los vendedores.

### Por Qué Importa

La app es prioridad ALTA en `proyectos.md`. La temporada de invierno arranca en junio 2026 — menos de 2 meses. Los vendedores necesitan poder consultar precios y horarios desde el celular antes de que empiece la temporada.

---

## Estado Actual

### Lo que ya está hecho

| Recurso | Estado |
|---------|--------|
| `salidas/app-invierno/index.html` | 21 productos cargados, diseño completo, filtros funcionando |
| `salidas/app-invierno/v1-canva-original.html` | Guardado como copia intacta |
| Filtros Todos / Excursiones / Traslados / Proveedores | Funcionando |
| Modal de detalle por producto | Implementado |
| Header, search, diseño responsivo | Completo |

### Productos en el catálogo vs. en la app

**En el catálogo pero AUSENTES en la app:**

| Producto | Motivo de ausencia | Precios disponibles |
|----------|-------------------|---------------------|
| Traslado + Equipo Ski/Snow sin clases | ID 8 faltante (gap en el array) | `$-` en catálogo |
| Piedras Blancas — Solo Ingreso + Traslado | No existe en el array | $18.500 / $21.250 |
| Piedras Blancas — Pista Infantil | No existe en el array | $55.000 / $63.250 |
| La Estación: Tren Patagónico + Cena | No existe en el array | `$-` en catálogo |
| Cena Nórdica | Existe como "Noche Nórdica" (id 17) con precios "Consulta" pero el catálogo tiene precio en USD | Inconsistencia de nombre y precio |
| Seguro de Cancelación | No existe en el array | $15.000 |

### Inconsistencias detectadas

1. **Nombre "Noche Nórdica" vs "Cena Nórdica"**: El id 17 en el app se llama "Noche Nórdica" y muestra precio "Consulta". El catálogo lo llama "Cena Nórdica" y tiene precios en USD (300 / 260 / 75 USD). La tabla de señas también lo llama "Cena Nórdica". → Unificar nombre y actualizar precios.
2. **Tabla de señas/saldos de junio**: Está en el catálogo pero no tiene sección visible en la app.

### Brechas restantes

- Productos faltantes del catálogo (algunos con precio `$-`)
- Inconsistencia "Noche Nórdica" / "Cena Nórdica"
- Sin tabla de señas/saldos en la app
- Sin README.md
- No deployada en Vercel

---

## Cambios Propuestos

### Resumen de Cambios

- Agregar los productos faltantes al array `products` en `index.html` (con lógica para `$-`)
- Corregir nombre + precios de "Noche Nórdica" → "Cena Nórdica"
- Agregar sección de Tabla de Señas/Saldos (Junio) accesible desde la app
- Crear `salidas/app-invierno/README.md`
- Deployar a Vercel
- Actualizar `contexto/proyectos.md` y `CLAUDE.md`

### Nuevos Archivos a Crear

| Ruta del Archivo | Propósito |
|-----------------|-----------|
| `salidas/app-invierno/README.md` | Documentación de la app para futuras sesiones o IAs |

### Archivos a Modificar

| Ruta del Archivo | Cambios |
|-----------------|---------|
| `salidas/app-invierno/index.html` | Agregar 5-6 productos, corregir Noche/Cena Nórdica, agregar tabla de señas |
| `contexto/proyectos.md` | Mover "Página Capacitación Invierno" a "Completados" cuando esté deployada |
| `CLAUDE.md` | Agregar `salidas/app-invierno/` en la tabla de estructura |

---

## Decisiones de Diseño

### Decisiones Clave Tomadas

1. **Productos con precio `$-`**: Incluirlos con precio `"A confirmar"` o `"Consultar"` y tag especial "Precio a confirmar". Es mejor tenerlos visibles (el vendedor sabe que existe el producto y que debe consultar) que no tenerlos. Aplica a: Traslado + Equipo Ski/Snow y La Estación Tren Patagónico.

2. **Cena Nórdica en USD**: Mostrar el precio base en USD y aclarar en la card que "el saldo se cotiza al dólar venta BNA del día". El vendedor ya sabe esto — es mejor tenerlo claro que un genérico "Consultar".

3. **Seguro de Cancelación**: Incluirlo como producto especial con un tipo distinto (`"servicio"`) o tratarlo como tipo `"excursion"` con tag "Servicio Adicional". Usar tipo existente para no romper los filtros — tag "Servicio adicional" alcanza.

4. **Tabla de señas/saldos**: Agregar como una sección separada dentro de la vista de Proveedores (o como un botón/panel flotante en la página). La opción más limpia: agregar un botón "📋 Tabla de señas" en el header que despliega un modal con la tabla. No afecta los filtros existentes.

5. **Piedras Blancas Solo Ingreso y Pista Infantil**: Estas entradas tienen precios propios (diferentes a la entrada principal). Incluirlas como productos separados con tipo `"excursion"` y tag "Piedras Blancas".

### Alternativas Consideradas

- **Excluir productos con `$-`**: Descartado. Genera desorientación cuando un cliente pide algo y el vendedor no lo encuentra en la guía.
- **Tabla de señas como página separada**: Descartado. Agrega complejidad de navegación. Un modal desde el header es suficiente y mantiene todo en un solo archivo.

### Preguntas Abiertas

> Estas preguntas NO bloquean la implementación. Se puede avanzar con los supuestos documentados arriba y ajustar si el usuario responde diferente.

1. **¿Los precios `$-` (Traslado + Equipo Ski/Snow y La Estación) se muestran como "Consultar" o se omiten?** El plan asume "Consultar".
2. **¿Hay tabla de señas para julio y agosto?** El catálogo solo tiene la de junio. El plan solo incluye junio.
3. **¿La app va en el mismo proyecto Vercel que `capacitacion_v4.html` o en uno nuevo?** El plan asume proyecto separado (carpeta `salidas/app-invierno/` como raíz del deploy).

---

## Tareas Paso a Paso

### Paso 1: Corregir "Noche Nórdica" → "Cena Nórdica"

Actualizar el id 17 en el array `products` de `index.html`.

**Acciones:**
- Cambiar `name: "Noche Nórdica"` → `"Cena Nórdica"`
- Cambiar `provider: "Noche Nórdica"` → `"Cerro Otto"`
- Actualizar precios de `"Consulta"` → precios reales en USD:
  - Adultos efectivo: `"USD 300 (cotización BNA del día)"`
  - Adultos tarjeta: `"USD 300 + 20%"`
  - Menores 6-12 efectivo: `"USD 260 (cotización BNA del día)"`
  - Menores 6-12 tarjeta: `"USD 260 + 20%"`
  - Infantes 3-5 efectivo: `"USD 75 (cotización BNA del día)"`
- Actualizar `tags` para incluir `"Cena en USD"`
- Actualizar `description` para mencionar el refugio de Cerro Otto y cuatriciclos

**Archivos afectados:**
- `salidas/app-invierno/index.html` (objeto id 17)

---

### Paso 2: Agregar Traslado + Equipo Ski/Snow sin clases (id 8)

Agregar el producto faltante en la posición correcta del array (entre id 7 y id 9).

**Contenido del producto:**
```js
{
  id: 8, name: "Traslado + Equipo Ski/Snow en Cerro Catedral (sin clases)", type: "clase", emoji: "🎿", provider: "Epic",
  schedule: "Diarias — 08:00 a 16:30 hs aprox.",
  duration: "Día completo",
  description: "Traslado al Cerro Catedral más equipamiento completo de ski o snowboard. Sin clases incluidas — ideal para quienes ya saben esquiar. El pase se abona aparte.",
  season: "Invierno (junio, julio, agosto, septiembre)",
  meetingPoint: "Centro de San Carlos de Bariloche.",
  itinerary: "Salida desde el centro de Bariloche | Traslado al Cerro Catedral | Retiro de equipamiento (ski o snowboard) | Día libre en el cerro | Devolución del equipo | Regreso",
  includes: ["Traslado ida y vuelta", "Equipamiento completo (ski: tablas, botas y bastones o snowboard: tabla y botas)"],
  notIncludes: ["Clases", "Ropa de nieve", "Pase (keycard)", "Almuerzo", "Pick up por alojamiento"],
  additional: ["Ropa de nieve obligatoria", "Keycard se abona en destino y se reintegra al devolver"],
  prices: [
    { method: "Efectivo / Transferencia", price: "Consultar" },
    { method: "Tarjeta 1-3 cuotas (recargo 20%)", price: "Consultar" }
  ],
  freeAge: null,
  tags: ["Equipo", "Precio a confirmar", "Cerro Catedral"]
}
```

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 3: Agregar Piedras Blancas — Solo Ingreso + Traslado

**Contenido del producto:**
```js
{
  id: 18, name: "Piedras Blancas — Solo Ingreso + Traslado", type: "excursion", emoji: "🛷", provider: "Piedras Blancas",
  schedule: "09:30 a 14:00 hs / 10:30 a 15:30 hs",
  duration: "Medio día",
  description: "Ingreso al complejo Piedras Blancas con un ascenso en aerosilla y traslado opcional desde el centro. Sin trineos ni pistas adicionales.",
  season: "Invierno",
  meetingPoint: "Complejo Piedras Blancas — Acceso Cerro Otto. Traslado desde centro: consultar.",
  itinerary: "Llegada al complejo | Ingreso y 1 ascenso en aerosilla | Tiempo libre en el complejo | Regreso",
  includes: ["Ingreso al complejo", "1 ascenso en aerosilla"],
  notIncludes: ["Culipatín", "Trineo", "Tubing", "Zipline", "Pista infantil", "Comidas"],
  additional: ["Traslado opcional disponible — consultar precio"],
  prices: [
    { method: "Adultos - Efectivo/Transferencia", price: "$18.500" },
    { method: "Adultos - Tarjeta 1 pago", price: "$21.250" },
    { method: "Adultos - Tarjeta 3-6-12 cuotas sin interés", price: "$29.750" }
  ],
  freeAge: null,
  tags: ["Piedras Blancas", "Cerro Otto", "Aerosilla"]
}
```

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 4: Agregar Piedras Blancas — Pista Infantil

**Contenido del producto:**
```js
{
  id: 19, name: "Piedras Blancas — Pista Infantil", type: "excursion", emoji: "👶", provider: "Piedras Blancas",
  schedule: "09:30 a 14:00 hs / 10:30 a 15:30 hs",
  duration: "Medio día",
  description: "Pista habilitada para los más pequeños (1 a 4 años). Incluye trineo y acceso a la pista infantil del complejo. Sin pistas para adultos.",
  season: "Invierno",
  meetingPoint: "Complejo Piedras Blancas — Acceso Cerro Otto.",
  itinerary: "Llegada al complejo | Ingreso a pista infantil | Uso de trineo | Tiempo libre | Regreso",
  includes: ["Ingreso al complejo", "1 trineo", "Pista infantil"],
  notIncludes: ["Comidas", "Pistas para adultos"],
  additional: ["Dirigido a niños de 1 a 4 años", "Traslado opcional — consultar"],
  prices: [
    { method: "Efectivo/Transferencia", price: "$55.000" },
    { method: "Tarjeta 1 pago", price: "$63.250" },
    { method: "Tarjeta 3-6-12 cuotas sin interés", price: "$88.550" }
  ],
  freeAge: "Para niños de 1 a 4 años",
  tags: ["Infantil", "Piedras Blancas", "Trineos"]
}
```

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 5: Agregar La Estación — Tren Patagónico + Cena

**Contenido del producto:**
```js
{
  id: 20, name: "La Estación — Tren Patagónico + Cena", type: "excursion", emoji: "🚂", provider: "La Estación",
  schedule: "17:30 a 23:00 hs",
  duration: "5 a 6 hs",
  description: "Recorrido en tren hasta la estepa patagónica para descubrir un paisaje diferente: vastas llanuras, fauna y vegetación únicos. Cena en la Estación Perito Moreno.",
  season: "Invierno",
  meetingPoint: "Estación de Tren de San Carlos de Bariloche.",
  itinerary: "Presentación en la estación | Viaje en tren hacia la estepa | Paisajes del Parque Nacional Nahuel Huapi | Llegada a Estación Perito Moreno | Cena | Regreso en tren",
  includes: ["Ticket de tren ida y vuelta", "Cena"],
  notIncludes: ["Traslado a la estación"],
  additional: ["0 a 3 años liberados", "Precio a confirmar para temporada 2026"],
  prices: [
    { method: "Adultos - Efectivo/Transferencia", price: "Consultar" },
    { method: "Menores 4-12 - Efectivo/Transferencia", price: "Consultar" }
  ],
  freeAge: "0 a 3 años liberados",
  tags: ["Tren", "Estepa", "Precio a confirmar"]
}
```

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 6: Agregar Seguro de Cancelación

**Contenido del producto:**
```js
{
  id: 21, name: "Seguro de Cancelación", type: "excursion", emoji: "🛡️", provider: "Tur Central",
  schedule: "Contratar al momento de reservar la excursión",
  duration: "Cubre toda la actividad contratada",
  description: "Seguro que permite cancelar por cualquier motivo hasta 4 horas antes de la salida. Debe contratarse en el mismo momento en que se reserva la excursión para tener validez.",
  season: "Todo el año",
  meetingPoint: "Se contrata junto con la excursión.",
  itinerary: "Contratación al momento de la reserva | Cobertura hasta 4 horas antes de la actividad",
  includes: ["Cancelación por cualquier motivo hasta 4 hs antes"],
  notIncludes: ["Gastos médicos", "Gastos de traslados", "Gastos bancarios", "Gastos no vinculados a la actividad"],
  additional: ["Debe contratarse al mismo tiempo que la excursión — no se puede agregar después"],
  prices: [
    { method: "Efectivo/Transferencia", price: "$15.000" },
    { method: "Tarjeta 1 pago o Previaje", price: "$15.000" }
  ],
  freeAge: null,
  tags: ["Seguro", "Servicio adicional"]
}
```

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 7: Agregar Tabla de Señas/Saldos (Junio)

Agregar un botón "📋 Tabla de señas" en el header de la app que despliega un modal con la tabla de junio.

**Acciones:**
- Agregar botón en el header, debajo del título, con estilo acorde al diseño (fondo sky-500 o similar)
- Crear función `openSeñasModal()` en el JS que genera un modal con la tabla
- La tabla tiene los datos del catálogo para junio

**Contenido de la tabla (a incluir en el modal):**

| Actividad | Seña | Saldo (NO MODIFICABLE) | Total |
|-----------|------|------------------------|-------|
| Bautismo Ski (EPIC) | $44.250 | $55.250 | $99.500 |
| Laguna Congelada | $34.500 | $94.500 | $129.000 |
| La Cueva AFTER SKI | $87.500 | $262.500 | $350.000 |
| La Cueva AFTER menores | $70.000 | $210.000 | $280.000 |
| La Cueva CENA | $94.500 | $283.500 | $378.000 |
| La Cueva CENA menores | $76.250 | $228.750 | $305.000 |
| La Cueva DIURNO | $40.625 | $121.875 | $162.500 |
| La Cueva Diurno CON TRASLADO 1 pax | $54.125 | $121.875 | $176.000 |
| La Cueva Diurno CON TRASLADO 2 pax | $67.625 | $121.875 | $189.500 |
| Piedras Blancas CON TRASLADO | $79.000 | — | COBRAR TOTAL |
| Alquiler de ropa | $6.000 | $16.220 | $22.220 |
| Cena Nórdica adultos +13 | $87.500 | $262.500 | $350.000 |
| Cena Nórdica menores 6-12 | $78.125 | $234.375 | $312.500 |
| Cena Nórdica infantes 3-5 | $21.875 | $65.625 | $87.500 |

**Diseño del modal:**
- Fondo oscuro semitransparente (igual que el modal de producto)
- Encabezado con "📋 Tabla de Señas y Saldos — Junio 2026"
- Alerta destacada en rojo/naranja: "⚠️ Los saldos son NO MODIFICABLES"
- Tabla con columnas: Actividad / Seña / Saldo / Total
- Botón cerrar (X) en esquina superior derecha

**Archivos afectados:**
- `salidas/app-invierno/index.html`

---

### Paso 8: Crear README.md

Crear `salidas/app-invierno/README.md` con documentación completa.

**Contenido del README:**
```markdown
# App de Capacitación Invierno 2026

## Qué es esto

Guía de consulta rápida para vendedores de Tur Central. Cubre todas las excursiones y traslados de la temporada invernal (junio a septiembre 2026).

## Para quién

Vendedores que necesitan consultar precios, horarios y qué incluye cada excursión en el momento de la venta.

## Stack

HTML + CSS (Tailwind CDN) + JS vanilla. Sin frameworks. Sin build step.
Fuentes: Google Fonts (DM Sans + Playfair Display). Íconos: Lucide.

## Archivos

- `index.html` — app principal (se edita esta)
- `v1-canva-original.html` — copia intacta del diseño original de Canva (no editar)

## Cómo agregar una excursión nueva

1. Abrir `index.html`
2. Encontrar el array `const products = [...]`
3. Agregar un nuevo objeto al final del array con la estructura de los existentes
4. Asignar el siguiente `id` disponible

Campos obligatorios: `id`, `name`, `type`, `emoji`, `provider`, `schedule`, `duration`, `description`, `season`, `meetingPoint`, `itinerary`, `includes`, `notIncludes`, `additional`, `prices`, `freeAge`, `tags`

Tipos válidos: `"excursion"`, `"traslado"`, `"clase"`

## Cómo actualizar precios

1. Buscar el producto por nombre en el array `products`
2. Editar el array `prices` del objeto
3. Guardar y deployar

## Fuente de verdad

Los precios y datos provienen de `contexto/catalog_invierno.md` en el workspace.

## Deploy

Proyecto en Vercel. Para actualizar: editar `index.html` y hacer push (o re-deploy manual).
URL: [agregar cuando esté deployada]
```

**Archivos afectados:**
- `salidas/app-invierno/README.md` (nuevo)

---

### Paso 9: Deploy en Vercel

Publicar la app en Vercel para que los vendedores puedan acceder desde cualquier dispositivo.

**Acciones:**

**Opción A — Via Vercel CLI (recomendado):**
```bash
cd salidas/app-invierno
vercel --prod
```

**Opción B — Via Vercel Dashboard:**
1. Ir a vercel.com → "Add New Project"
2. Importar la carpeta `salidas/app-invierno/` (o subir los archivos directamente)
3. Framework: "Other" (HTML estático)
4. Build command: vacío (no hay build)
5. Output directory: `./` (raíz)
6. Deploy

**Después del deploy:**
- Anotar la URL en el README.md (Paso 8)
- Compartir la URL con el equipo de vendedores

**Archivos afectados:**
- `salidas/app-invierno/README.md` (actualizar con la URL)

---

### Paso 10: Actualizar referencias del workspace

**Acciones:**
- `contexto/proyectos.md`: Mover "Página Capacitación Invierno (Canva)" a sección "Completados" con URL del deploy
- `CLAUDE.md`: Agregar `salidas/app-invierno/` en la tabla de la sección Estructura del Workspace

**Archivos afectados:**
- `contexto/proyectos.md`
- `CLAUDE.md`

---

## Conexiones y Dependencias

### Archivos fuente

- `contexto/catalog_invierno.md` — fuente de precios, horarios y detalles de cada producto

### Archivos que se actualizan por consistencia

- `contexto/proyectos.md` — estado del proyecto
- `CLAUDE.md` — estructura del workspace

### Impacto en flujos existentes

Ninguno. Esta app es independiente de `capacitacion_v4.html`.

---

## Lista de Validación

- [ ] "Noche Nórdica" renombrado a "Cena Nórdica" con precios en USD
- [ ] Traslado + Equipo Ski/Snow agregado (id 8) con precio "Consultar"
- [ ] Piedras Blancas — Solo Ingreso agregado (id 18) con precios reales
- [ ] Piedras Blancas — Pista Infantil agregado (id 19) con precios reales
- [ ] La Estación Tren Patagónico agregado (id 20) con precio "Consultar"
- [ ] Seguro de Cancelación agregado (id 21)
- [ ] Tabla de señas/saldos (junio) visible desde el header
- [ ] Filtros (Todos / Excursiones / Traslados) siguen funcionando correctamente
- [ ] Vista Proveedores muestra los proveedores actualizados
- [ ] Modal de detalle funciona para los nuevos productos
- [ ] README.md creado con instrucciones claras
- [ ] App deployada en Vercel y URL accesible desde celular
- [ ] `proyectos.md` y `CLAUDE.md` actualizados

---

## Criterios de Éxito

1. Un vendedor puede abrir la URL en el celular y ver las 27 excursiones del catálogo (incluidas las nuevas).
2. La tabla de señas de junio es accesible con un toque desde la app.
3. Una IA nueva puede leer el README y continuar el trabajo sin preguntas adicionales.
4. La URL de Vercel está registrada en el README y en `proyectos.md`.

---

## Notas

- Los productos con `$-` en el catálogo (Traslado + Equipo, La Estación) se muestran como "Consultar" — es mejor tenerlos visibles que ausentes.
- La Cena Nórdica cotiza en USD al dólar BNA del día — esto debe quedar claro en la card.
- El Seguro de Cancelación es un servicio transversal que aplica a todas las excursiones — posicionarlo al final del listado o marcarlo con tag especial para que sea fácil de encontrar.
- Si en el futuro hay precios actualizados para julio/agosto, el flujo es: editar `catalog_invierno.md` + actualizar los precios en `index.html` + re-deploy.
