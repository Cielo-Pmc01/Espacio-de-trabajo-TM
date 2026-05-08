# memorizar

## Descripción

Guarda información importante del usuario para recordarla automáticamente en futuras sesiones.

## Cuándo usar

- Cuando el usuario expresa una preferencia de trabajo
- Para guardar contexto técnico del proyecto
- Para recordar decisiones arquitectónicas importantes
- Para almacenar información de negocio clave

## Parámetros

- **informacion** (requerido): Texto con la información a memorizar
- **tipo** (opcional): preferencia, contexto_tecnico, decision, negocio (auto-detectar si no se especifica)

## Instrucciones

1. Recibir información a memorizar del usuario
2. Determinar tipo de memoria:
   - **preferencia**: "prefiero que uses tono formal", "siempre responde en español"
   - **contexto_tecnico**: "usamos Next.js 14 con App Router", "stack es React + Node"
   - **decision**: "decidimos usar PostgreSQL sobre Mongo"
   - **negocio**: "nuestro público son turistas jóvenes", "el tono es aventurero"
3. Verificar duplicados en memoria existente
4. Si existe memoria similar, ofrecer actualizar
5. Crear nueva memoria con:
   - Título descriptivo y conciso
   - Contenido claro y accionable
   - Tags relevantes para filtrado
   - UserTriggered: true
6. Confirmar al usuario con resumen de lo guardado

## Formato de salida

```markdown
## Memoria guardada ✅

**Título:** [Nombre de la memoria]
**Tipo:** [preferencia|contexto_tecnico|decision|negocio]
**Tags:** [tag1, tag2, tag3]

**Contenido:**
[Resumen de la información guardada]

Esta información estará disponible en todas las futuras sesiones automáticamente.
```

## Ejemplos de uso

```
/memorizar informacion:"Prefiero que siempre respondas en español" tipo:preferencia
/memorizar informacion:"Usamos Next.js 14 con App Router y Tailwind CSS" tipo:contexto_tecnico
/memorizar informacion:"El tono de Adventure Center es joven, aventurero y cercano" tipo:negocio
```

O simplemente escribe: "Memoriza que [información]"
