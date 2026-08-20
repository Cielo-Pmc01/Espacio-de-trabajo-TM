# /subir-obsidian — Sincronizar workspace al vault de Obsidian

Ejecuta el script de sync manual (`scripts/sync-obsidian.ps1`) que copia `D:\Desktop\Espacio-trabajo-TM\` al vault de Obsidian en `D:\Desktop\Espacio de trabajo TM\` vía robocopy /E.

## Pasos

1. Ejecutar en PowerShell:
   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File "D:\Desktop\Espacio-trabajo-TM\scripts\sync-obsidian.ps1"
   ```
2. Mostrar el resultado (últimas líneas del log en `scripts/.sync-obsidian.log`) y confirmar que terminó sin errores (exit codes 0-7 de robocopy = éxito).

## Notas

- Este es ahora el ÚNICO disparador del sync — no hay hook automático de `SessionEnd` ni tarea programada (se desactivaron el 2026-07-29 a pedido de Cielo, ver `reference_obsidian_vault_sync.md`).
- Si hace falta volver al sync automático, reactivar la tarea programada Windows `Sync-WorkspaceTM-Obsidian` (`Enable-ScheduledTask`) y/o restaurar el hook `SessionEnd` en `.claude/settings.json`.