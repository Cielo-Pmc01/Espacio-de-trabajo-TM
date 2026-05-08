# Script de sincronización multi-plataforma
# Genera formatos específicos desde el source of truth (JSON)

param([switch]$DryRun)

$ErrorActionPreference = "Stop"

$SourceDir = Join-Path $PSScriptRoot "comandos"
$RootDir = Split-Path $PSScriptRoot -Parent
$TargetDirs = @{
    "claude"      = Join-Path $RootDir ".claude\commands"
    "windsurf"    = Join-Path $RootDir ".windsurf\workflows"
    "antigravity" = Join-Path $RootDir ".antigravity\skills"
}

Write-Host "`n🔄 Sincronizando comandos unificados...`n"

function Get-Instructions($instructions) {
    $lines = @()
    foreach ($inst in $instructions) {
        $lines += "- $inst"
    }
    return $lines -join "`n"
}

function Get-OutputFormat($format) {
    if ($format.template) { return $format.template }
    if ($format.sections) { return $format.sections -join "`n`n" }
    if ($format.confirmation) { return $format.confirmation }
    return "[Formato de salida]"
}

# Crear directorios si no existen
foreach ($dir in $TargetDirs.Values) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✓ Creado: $dir" -ForegroundColor Green
    }
}

$jsonFiles = Get-ChildItem -Path "$SourceDir\*.json" -File
$count = 0

foreach ($file in $jsonFiles) {
    $json = Get-Content $file.FullName | ConvertFrom-Json
    $name = $json.name
    $desc = $json.description
    $instructions = Get-Instructions $json.instructions
    $output = Get-OutputFormat $json.output_format
    $turbo = ""
    if ($json.turbo) { $turbo = "`n`n// turbo - Este comando puede ejecutarse automáticamente" }
    
    Write-Host "📦 Procesando: $name" -ForegroundColor Cyan
    
    # Claude
    $claudeContent = @"
# $name - $desc

## Descripción

$desc

## Instrucciones

$instructions

## Formato de salida

```
$output
```
"@
    $claudeContent | Out-File -FilePath (Join-Path $TargetDirs.claude "$name.md") -Encoding UTF8
    
    # Windsurf
    $windsurfContent = @"
---
description: $desc
---

# /$name - $name

## Propósito

$desc

## Instrucciones para el asistente

$instructions

## Formato de salida esperado

```
$output
```$turbo
"@
    $windsurfContent | Out-File -FilePath (Join-Path $TargetDirs.windsurf "$name.md") -Encoding UTF8
    
    # Antigravity
    $antigravityDir = Join-Path $TargetDirs.antigravity $name
    if (!(Test-Path $antigravityDir)) {
        New-Item -ItemType Directory -Path $antigravityDir -Force | Out-Null
    }
    $antigravityContent = @"
# $name

## Descripción

$desc

## Cuándo usar

- Cuando necesitas ejecutar este flujo de trabajo
- Para automatizar tareas de $name

## Instrucciones

$instructions

## Formato de salida

```
$output
```

## Ejemplo de uso

    /$name

O escribe: "Ejecuta /$name"
"@
    $antigravityContent | Out-File -FilePath (Join-Path $antigravityDir "SKILL.md") -Encoding UTF8
    
    Write-Host "  ✓ Sincronizado" -ForegroundColor Green
    $count++
}

Write-Host "`n📊 Resumen:" -ForegroundColor Cyan
Write-Host "  Comandos sincronizados: $count" -ForegroundColor White
Write-Host "  Ubicaciones:" -ForegroundColor White
Write-Host "    - .claude/commands/" -ForegroundColor Gray
Write-Host "    - .windsurf/workflows/" -ForegroundColor Gray
Write-Host "    - .antigravity/skills/" -ForegroundColor Gray

# Guardar timestamp
$syncDir = Join-Path $PSScriptRoot ".synced"
if (!(Test-Path $syncDir)) {
    New-Item -ItemType Directory -Path $syncDir -Force | Out-Null
}
Get-Date -Format "yyyy-MM-dd HH:mm:ss" | Out-File -FilePath (Join-Path $syncDir "last-sync.txt")

Write-Host "`n✅ Sincronización completada" -ForegroundColor Green
Write-Host "`n💡 Uso en cualquier editor:" -ForegroundColor Cyan
Write-Host "  /iniciar, /crear-plan, /implementar, /copywriter, etc." -ForegroundColor White
Write-Host ""
