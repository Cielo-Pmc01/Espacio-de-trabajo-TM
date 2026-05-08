# Sincronización multi-plataforma - Versión simple
$SourceDir = "$PSScriptRoot\comandos"
$RootDir = Split-Path $PSScriptRoot -Parent

$TargetDirs = @{
    claude = "$RootDir\.claude\commands"
    windsurf = "$RootDir\.windsurf\workflows"
    antigravity = "$RootDir\.antigravity\skills"
}

Write-Host "`n🔄 Sincronizando comandos...`n"

# Crear directorios
foreach ($dir in $TargetDirs.Values) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Creado: $dir"
    }
}

$files = Get-ChildItem -Path "$SourceDir\*.json"
$count = 0

foreach ($file in $files) {
    $j = Get-Content $file.FullName | ConvertFrom-Json
    $name = $j.name
    $desc = $j.description
    
    # Instrucciones como lista
    $instList = ($j.instructions | ForEach-Object { "- $_" }) -join "`n"
    
    # Output format
    $output = "[Formato de salida]"
    if ($j.output_format.template) { $output = $j.output_format.template }
    elseif ($j.output_format.sections) { $output = $j.output_format.sections -join "`n" }
    elseif ($j.output_format.confirmation) { $output = $j.output_format.confirmation }
    
    # Claude
    $claude = "# $name - $desc`n`n## Descripción`n`n$desc`n`n## Instrucciones`n`n$instList`n`n## Formato de salida`n`n```$output```"
    $claude | Out-File "$($TargetDirs.claude)\$name.md" -Encoding UTF8
    
    # Windsurf
    $turbo = ""
    if ($j.turbo) { $turbo = "`n`n// turbo - Este comando puede ejecutarse automáticamente" }
    $windsurf = "---`ndescription: $desc`n---`n`n# /$name - $name`n`n## Propósito`n`n$desc`n`n## Instrucciones para el asistente`n`n$instList`n`n## Formato de salida esperado`n`n```$output```$turbo"
    $windsurf | Out-File "$($TargetDirs.windsurf)\$name.md" -Encoding UTF8
    
    # Antigravity
    $agDir = "$($TargetDirs.antigravity)\$name"
    if (!(Test-Path $agDir)) { New-Item -ItemType Directory -Path $agDir -Force | Out-Null }
    $ag = "# $name`n`n## Descripción`n`n$desc`n`n## Cuándo usar`n`n- Cuando necesitas ejecutar este flujo`n`n## Instrucciones`n`n$instList`n`n## Formato de salida`n`n```$output````n`n## Ejemplo de uso`n`n    /$name"
    $ag | Out-File "$agDir\SKILL.md" -Encoding UTF8
    
    Write-Host "✓ $name sincronizado"
    $count++
}

Write-Host "`n✅ $count comandos sincronizados en 3 plataformas"
Write-Host "`n💡 Uso: /iniciar, /crear-plan, /implementar, /copywriter, etc.`n"
