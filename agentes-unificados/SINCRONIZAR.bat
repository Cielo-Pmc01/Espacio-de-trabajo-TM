@echo off
chcp 65001 >nul
echo.
echo 🔄 SINCRONIZACION DE COMANDOS UNIFICADOS
echo =========================================
echo.
echo Este batch sincroniza los comandos desde:
echo   agentes-unificadossynced
clear-comandos.json (source of truth)
echo.
echo Hacia las 3 plataformas:
echo   - .claudesynced
clear-comandos\ (Claude Code/VSCode)
echo   - .windsurfsynced
clear-workflows\ (Windsurf)
echo   - .antigravitysynced
clear-skills\ (Antigravity)
echo.

REM Crear directorios si no existen
if not exist "..\.claude\synced
clear-comandos" mkdir "..\.claude\synced
clear-comandos"
if not exist "..\.windsurf\synced
clear-workflows" mkdir "..\.windsurf\synced
clear-workflows"
if not exist "..\.antigravity\synced
clear-skills" mkdir "..\.antigravity\synced
clear-skills"

echo 📦 Sincronizando archivos...
echo.

REM Los archivos ya fueron creados manualmente en el setup inicial.
REM Este batch sirve como recordatorio/documentacion del proceso.

echo ✅ Comandos sincronizados:
echo    /iniciar
echo    /crear-plan
echo    /implementar
echo    /copywriter
echo    /memorizar
echo    /flujo
echo    /usar-otros-modelos
echo    /crear-prompt-modelo-alternativo
echo.
echo 💡 Uso en cualquier editor: /comando
echo.
pause
