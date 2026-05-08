# iniciar

## Descripción

Inicia una nueva sesión de trabajo leyendo el contexto del workspace Adventure Center y proporcionando un resumen completo.

## Cuándo usar

- Al comenzar una nueva sesión de trabajo
- Cuando necesites orientación sobre el estado actual del workspace
- Para recordar planes activos y contexto disponible

## Instrucciones

1. Leer `CLAUDE.md` en la raíz para entender la estructura del proyecto
2. Leer `README.md` para información general del workspace
3. Listar directorios principales:
   - `contexto/` - información de negocio
   - `planes/` - planes de implementación
   - `salidas/` - productos generados
   - `referencia/` - plantillas y ejemplos
4. Identificar archivos `.md` recientes en cada directorio
5. Presentar resumen estructurado:
   - Descripción del workspace
   - Planes activos en `planes/`
   - Temas disponibles en `contexto/`
   - Sugerencias de próximos pasos

## Formato de salida

```markdown
## Resumen del Workspace Adventure Center

**Estructura:** [descripción breve]

**Planes activos:**
- [lista de planes]

**Contexto disponible:**
- [temas principales]

**Próximo paso:**
¿Qué te gustaría trabajar hoy?
```

## Ejemplo de uso

```
/iniciar
```

O escribe: "Inicia el workspace y muéstrame el resumen"
