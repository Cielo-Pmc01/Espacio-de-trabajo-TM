# Plan: Carga de Contenido en Módulos de Capacitación

**Fecha:** 2026-05-18  
**Estado:** Pendiente  
**Proyecto:** capacitacion-tm  
**Fase:** Post-Fase 6 (Sofía IA operativa)

---

## Contexto y Justificación

Sofía IA y el indexador semántico están operativos (Fase 6 ✅). Ahora necesitamos **cargar el contenido real de las excursiones, protocolos y procedimientos** en los módulos y bloques existentes.

**Objetivo:** Llenar la plataforma con contenido base (15+ lecciones) cargan **vía inserts SQL directos**, generando Tiptap JSON automático con IA. El botón **✨ "Cargar con IA"** se reserva para iteraciones/completudes futuras cuando la mayoría del contenido ya exista.

**Fuentes de contenido:**
- Catálogos de excursiones (todo el año, verano, invierno)
- Tabla de precios y seña
- Protocolos operativos (`copy_protocol.md`)
- Perfiles de marcas (`brand_profiles.md`)

**Impacto:** Una vez indexado, Sofía podrá responder preguntas sobre excursiones, precios, procedimientos, etc.

---

## Alcance

### ✅ INCLUYE
1. **Recibir instrucciones del usuario:** "Carga tal contenido en bloque X"
2. **Procesar contenido:** Leer/extraer texto, generar Tiptap JSON vía IA
3. **Insertar en Supabase:** SQL directo a tabla `lessons`
4. **Publicar automático:** `is_published = true` al crear
5. **Iteración:** Repetir paso por paso conforme el usuario indique más contenido
6. **Crear nuevos módulos/bloques si es necesario** (si el usuario lo requiere)
7. **Diseño editorial avanzado:** Formateo Tiptap personalizado, estilos, estructuras
8. **Reindexación final:** POST `/admin/ia/indexar` cuando el usuario lo indique
9. **Validación:** Chat Sofía responde sobre contenido cargado

---

## Arquitectura / Decisiones Técnicas

| Aspecto | Decisión |
|--------|----------|
| **Input:** Contenido | Catálogos `.md` en `contexto/negocio/` |
| **Tool:** Generación | Claude/GPT-4o genera Tiptap JSON en background (NO botón ✨) |
| **Output:** Formato | `content_json` Tiptap (`{tiptap: {...}, blocks: []}`) |
| **Insert:** Método | SQL directo en Supabase SQL Editor (bulk inserts) |
| **Publicación:** Inmediato | `is_published = true` al crear |
| **Sector visibility:** | Cada lección hereda `visible_sectors` del bloque padre |
| **Reindexación:** | POST `/admin/ia/indexar` después de cargar todo |
| **Validación:** | Chat Sofía → pregunta sobre contenido → cita correcta |

---

## Tareas

### T1 — Listo para recibir instrucciones

**Estado inicial:** Esperando que el usuario indique qué contenido cargar

**Formato de instrucción esperado:**
```
"Carga esto en [módulo] → [bloque]:
[contenido a cargar]"
```

Ejemplo:
```
"Carga en Excursiones → Isla Victoria:
🕘 10:30 - 18:30 / 12:30 - 18:30 hs aprox.
Catamarán por lago Nahuel Huapi..."
```

**Criterio:** Estar listo para procesar instrucciones conforme el usuario las vaya dando

---

### T2 — Por cada instrucción de carga:

**Acción:**

1. Recibir contenido + ubicación (módulo/bloque)
2. Generar Tiptap JSON automático (usando Claude/GPT-4o)
3. Obtener `block_id` de Supabase (query a tabla `blocks`)
4. INSERT en tabla `lessons` con:
   - `title` (extraído del contenido o generado)
   - `content_json` (Tiptap JSON)
   - `block_id` (del bloque indicado)
   - `visible_sectors` (heredado del bloque)
   - `is_published = true`
   - `lesson_type = 'generic'`
5. Confirmar inserción: "✅ Lección creada: [título]"

**Criterio:** Cada lección insertada correctamente, visible en admin

---

### T3 — Reindexación (cuando el usuario lo indique)

**Acción:** Después de cargar todas las lecciones que el usuario indique:

1. Login como SP → `/admin`
2. Click botón **"Reindexar IA"**
3. Esperar confirmación (Indexadas: N, Saltadas: 0, Errores: 0)

**Criterio:** Todas las lecciones indexadas sin errores

---

### T4 — Validación Final (cuando el usuario lo indique)

**Acción:** Probar Sofía con preguntas sobre contenido cargado

1. Login como alumno
2. Click 💬 Sofía
3. Preguntas sobre contenido cargado
4. Verificar respuestas + citas

**Criterio:** Sofía responde correctamente con citas válidas

---

## Criterio de Éxito

- ✅ **Cada instrucción procesada:** Usuario dice "carga X", se carga X
- ✅ **Lecciones visibles en admin:** Cada inserción aparece en el bloque correcto
- ✅ **Tiptap JSON válido:** Content renderiza sin errores en editor
- ✅ **Publicadas automáticamente:** `is_published = true` al crear
- ✅ **Reindexación exitosa:** 0 errores en `/admin/ia/indexar`
- ✅ **Sofía responde correctamente:** Con citas de lecciones cargadas
- ✅ **Merge a main cuando el usuario lo indique**

---

## Notas / Riesgos

### Dependencias
- Supabase accesible (DB + SQL Editor)
- OpenAI API (`OPENAI_API_KEY`) válida y con balance
- Servidor `pnpm dev` corriendo en puerto 5174

### Riesgos
1. **Contenido sin estructura clara** → IA genera content_json poco legible
   - *Mitigación:* Revisar antes de publicar, editar si es necesario
2. **Sector visibility heredada** → si bloque tiene `visible_sectors=['B1']`, todas las lecciones se heredan
   - *Mitigación:* Asegurar bloques tengan visible_sectors correctos
3. **Reindexación lenta** → si hay muchas lecciones, puede tardar
   - *Mitigación:* Reindexar en horario bajo demanda

### Decisiones Pendientes
- ¿Cuántos bloques creo por módulo? (estructura clara en la BD?)
- ¿Qué tan granular debo ser con lecciones? (1 excursión = 1 lección, o agrupar?)
- ¿Los editores van a revisar/editar contenido IA post-carga?

---

## Cronograma Estimado

| Tarea | Estimado |
|-------|----------|
| T1 (Preparación) | Instantáneo |
| T2 (Por cada lección) | ~2-3 min (generar JSON + insert) |
| T3 (Reindexación) | ~30 seg |
| T4 (Validación Sofía) | ~5 min |
| **Total por lección** | ~3 min |
| **10 lecciones** | ~30 min |
| **20 lecciones** | ~60 min |

---

## Próximos Pasos Post-Carga

Una vez completado este plan:
1. **Fase 7 — Deploy:** Docker + servidor de la empresa
2. **Operación:** Vendedores usan app en producción, Sofía responde preguntas
3. **Iteración:** Recolectar feedback, mejorar contenido, agregar más lecciones
