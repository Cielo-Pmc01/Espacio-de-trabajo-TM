# sync-obsidian.ps1
# Sincroniza el workspace TM al vault de Obsidian.
# Se ejecuta automaticamente al cerrar sesion de Claude Code (hook SessionEnd).
#
# Manual: powershell -File scripts\sync-obsidian.ps1
# Log: scripts\.sync-obsidian.log

$ErrorActionPreference = 'Continue'
$src = "D:\Desktop\Espacio-trabajo-TM"
$dst = "D:\Desktop\Espacio de trabajo TM"
$logFile = Join-Path $PSScriptRoot ".sync-obsidian.log"

# Carpetas a excluir (basura tecnica sin valor en Obsidian)
$excludeDirs = @(
    'node_modules', '.next', '.turbo', 'dist', 'build',
    '.git', '.cache', 'coverage', '.vercel', 'out',
    '.playwright-mcp'
)

# Archivos a excluir
$excludeFiles = @(
    '*.log', '*.tmp', '*.lock',
    'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'
)

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"`n=== Sync $timestamp ===" | Out-File -FilePath $logFile -Append -Encoding utf8

# /E = copia subdirectorios incluyendo vacios (NO usar /MIR - borraria Dashboard y memorias del vault)
# /XD = excluir directorios
# /XF = excluir archivos
# /NFL /NDL /NJH /NJS /NC /NS /NP = silenciar salida verbosa
$result = robocopy $src $dst /E `
    /XD @excludeDirs `
    /XF @excludeFiles `
    /XA:H `
    /R:1 /W:1 `
    /NFL /NDL /NJH /NJS /NC /NS /NP 2>&1

# Robocopy exit codes: 0-7 = exito (8+ = error)
$exitCode = $LASTEXITCODE
if ($exitCode -lt 8) {
    "OK (exit $exitCode) sync completado" | Out-File -FilePath $logFile -Append -Encoding utf8
} else {
    "ERROR (exit $exitCode) sync fallo" | Out-File -FilePath $logFile -Append -Encoding utf8
    $result | Out-File -FilePath $logFile -Append -Encoding utf8
}

exit 0
