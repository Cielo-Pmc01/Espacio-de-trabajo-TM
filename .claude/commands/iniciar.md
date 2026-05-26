# /iniciar — Inicialización de Sesión

Ejecuta este comando al comienzo de cada sesión para cargar el contexto completo del workspace.

## Pasos Obligatorios

1. **Leer los archivos de contexto principales:**
   - `CLAUDE.md` — reglas del workspace (ya cargado automáticamente)
   - `contexto/info-personal.md` — rol y responsabilidades de Cielo
   - `contexto/estrategia.md` — dirección estratégica del área TM
   - `contexto/proyectos/datos-actuales.md` — estado actual de proyectos y métricas
   - `contexto/proyectos/proyectos.md` — lista de proyectos en desarrollo y backlog
   - `contexto/negocio/info-negocio.md` — información del negocio y las marcas
   - `contexto/negocio/brand_profiles.md` — perfiles de las 14 marcas

2. **Revisar la memoria persistente:**
   - Leer `C:\Users\opera\.claude\projects\d--Desktop-Espacio-trabajo-TM\memory\MEMORY.md` para cargar contexto de sesiones anteriores

3. **Detectar memorias viejas (>7 días):**

   Ejecutar este comando en PowerShell para listar memorias de proyecto que no se actualizan hace más de 7 días:

   ```powershell
   Get-ChildItem "C:\Users\opera\.claude\projects\d--Desktop-Espacio-trabajo-TM\memory\project_*.md" |
     Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
     Sort-Object LastWriteTime |
     Select-Object Name, @{N='DiasSinTocar';E={[int]((Get-Date) - $_.LastWriteTime).TotalDays}} |
     Format-Table -AutoSize
   ```

   Si hay resultados, incluirlos en una sección **📅 Memorias para revisar** del resumen ejecutivo (sin bloquear ni forzar revisión — solo señalar).

4. **Producir un resumen ejecutivo en el chat con:**
   - Quién es el usuario y su rol actual
   - Estado de los proyectos activos (con prioridades)
   - Pendientes críticos o blockers detectados
   - **📅 Memorias para revisar** (si las hay del paso 3) — listadas con días sin tocar
   - Confirmación de que Claude está listo para asistir

## Notas

- Las memorias `user_*`, `feedback_*` y `reference_*` son más estables — no se chequean por antigüedad. Solo `project_*` que sí cambian con el avance del trabajo.
- El chequeo de memorias viejas es una sugerencia, no una obligación. Cielo decide cuándo refrescar.
- Para actualizar memorias al final de una sesión productiva, usar `/cerrar`.

## Criterio de Éxito

Claude debe poder responder sin que el usuario re-explique contexto. Si algo está desactualizado o falta información, señalarlo y preguntar.
