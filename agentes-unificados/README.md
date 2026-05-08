# Agentes Unificados - Multi-IDE Workspace

Sistema de comandos/agentes portátiles entre **Claude Code**, **Windsurf**, **Antigravity** y **VSCode**.

## 🎯 Objetivo

Trabajar de manera continua sin depender de tokens de una sola IA. Si se acaban los tokens en Claude, cambias a Windsurf. Si no funciona Antigravity, usas VSCode. **Mismos comandos, mismo comportamiento.**

## 📁 Estructura

```
agentes-unificados/
├── README.md                 # Este archivo
├── comandos/                 # SOURCE OF TRUTH (JSON)
│   ├── iniciar.json          ← Edita aquí para modificar
│   ├── crear-plan.json
│   ├── implementar.json
│   ├── copywriter.json
│   ├── memorizar.json
│   ├── flujo.json
│   ├── usar-otros-modelos.json
│   └── crear-prompt-modelo-alternativo.json
└── SINCRONIZAR.bat           # Documentación del proceso
```

## 🔄 Flujo de trabajo para modificar comandos

### 1. Editar el SOURCE OF TRUTH
Modifica el archivo `.json` correspondiente en `comandos/`

### 2. Replicar manualmente (o pedirme que lo haga)
Copia los cambios a las 3 ubicaciones:
- `.claude/commands/[nombre].md`
- `.windsurf/workflows/[nombre].md`
- `.antigravity/skills/[nombre]/SKILL.md`

> **💡 Tip:** Dime "sincroniza los comandos desde los JSON" y yo actualizo las 3 plataformas automáticamente.

### 3. Usar en cualquier editor
- **Claude Code**: `/iniciar`
- **Windsurf**: `/iniciar`
- **Antigravity**: `/iniciar` o "usa el skill iniciar"
- **VSCode + extensión Claude**: `/iniciar`

## 🚀 Comandos disponibles

| Comando | Función | Uso típico |
|---------|---------|------------|
| `/iniciar` | Cargar contexto del workspace | Al empezar a trabajar |
| `/crear-plan` | Crear plan de implementación | Antes de cambios grandes |
| `/implementar` | Ejecutar plan paso a paso | Durante la ejecución |
| `/copywriter` | Generar copy para ads | Marketing/RRSS |
| `/memorizar` | Guardar preferencias | Cuando el usuario da instrucciones |
| `/flujo` | Crear nuevo workflow | Automatizar tareas repetitivas |
| `/usar-otros-modelos` | Guía tokens limitados | Cambiar de modelo/IDE |
| `/crear-prompt-modelo-alternativo` | Optimizar prompts | Portabilidad entre IAs |

## 🆘 ¿Te quedaste sin tokens?

1. Guarda tu trabajo actual
2. Abre otro editor (Windsurf ↔ Claude Code ↔ Antigravity)
3. Ejecuta `/iniciar` en el nuevo editor
4. Continúa desde donde estabas - los planes están en `planes/`

## 📝 Notas importantes

- Los archivos en `.claude/`, `.windsurf/` y `.antigravity/` se **regeneran automáticamente**
- Nunca edites directamente esas carpetas - se sobrescriben
- El formato unificado (`.json`) es más fácil de mantener que 3 formatos separados
- Si agregas un comando nuevo, crea el `.json` y ejecuta `sync.ps1`

## 🔧 Instalación inicial

```bash
# 1. Clonar/crear el workspace
# 2. Ejecutar sincronización inicial
.\sync.ps1

# 3. Listo - comandos disponibles en todos los editores
```
