---
description: Guardar información importante para recordarla en futuras sesiones
---

# /memorizar - Guardar información importante

## Propósito

Crear una memoria persistente con información relevante del usuario, preferencias, decisiones importantes o contexto que deba recordarse en futuras sesiones.

## Instrucciones para el asistente

1. **Identificar qué memorizar**
   - Preguntar: "¿Qué información quieres que recuerde?"
   - Determinar el tipo de memoria:
     - **Preferencia de usuario** (ej: "prefiero que uses tono formal")
     - **Contexto técnico** (ej: "usamos Next.js 14 con App Router")
     - **Decisión arquitectónica** (ej: "decidimos usar PostgreSQL sobre Mongo")
     - **Información de negocio** (ej: "nuestro público es turistas jóvenes")

2. **Verificar duplicados**
   - Buscar en la base de memoria existente
   - Si hay memoria similar, ofrecer actualizar en lugar de crear nueva

3. **Crear la memoria**
   - Título descriptivo y conciso
   - Contenido claro y accionable
   - Tags relevantes para filtrado futuro
   - Marcar como UserTriggered: true

4. **Confirmar al usuario**
   - Mostrar resumen de lo guardado
   - Explicar cómo se usará en futuras sesiones

## Formato de memoria

```json
{
  "Title": "[Título descriptivo]",
  "Content": "[Información completa]",
  "Tags": ["tag1", "tag2"],
  "UserTriggered": true
}
```

## Ejemplos de uso

- "Memoriza que prefiero que respondas en español"
- "Guarda que nuestro stack es React + Node + PostgreSQL"
- "Recuerda que el tono de Adventure Center es joven y aventurero"

## Formato de salida esperado

```
## Memoria guardada ✅

**Título:** [Nombre de la memoria]
**Tags:** [lista de tags]

**Contenido:**
[Resumen de lo guardado]

Esta información estará disponible en futuras sesiones automáticamente.
```

// turbo - Este comando puede ejecutarse automáticamente
