---
id: skill-smith-tm
name: Creador de Habilidades (Diamond Standard)
description: Generador de habilidades estructuradas que fusiona el proceso creativo con el estándar de calidad Diamond.
version: 1.2.0
category: meta-programming
risk: medium
source: custom
language: es
---

# Creador de Habilidades (Skill Smith)

Esta habilidad permite generar nuevas capacidades para el workspace siguiendo el proceso oficial y el **Diamond Standard**, asegurando que cada habilidad sea segura, documentada y fácil de orquestar.

## Proceso de Creación

1. **Identificar el nombre y propósito**: Asegúrate de tener un nombre descriptivo (en snake_case) y un objetivo claro.
2. **Crear la estructura de directorios**:
   - Carpeta en `.antigravity/skills/<nombre_de_la_habilidad>/`.
   - Subcarpetas opcionales: `scripts/`, `examples/`, `resources/`.
3. **Definir Identidad (Diamond Standard)**:
   - `id`: Slug único.
   - `category`: Categoría funcional.
   - `risk`: Nivel de riesgo (`low`, `medium`, `high`).
4. **Generar el archivo SKILL.md**:
   - Incluir frontmatter con los 7 campos estándar.
   - Redactar instrucciones en español claro y accionable.

---

## Plantilla Diamond Standard

```markdown
---
id: <skill-id>
name: <Nombre Visible>
description: <Descripción para el orquestador>
version: 1.0.0
category: <categoria>
risk: <low|medium|high>
source: local
language: es
---

# <Nombre Visible>

## Propósito
<¿Qué resuelve esta habilidad?>

## Reglas de Ejecución
- <Regla 1>
- <Regla 2>

## Instrucciones Detalladas
<Pasos específicos para el asistente>

## Ejemplos
- "Usuario: <Pedido de ejemplo>" -> <Acción esperada>
```
