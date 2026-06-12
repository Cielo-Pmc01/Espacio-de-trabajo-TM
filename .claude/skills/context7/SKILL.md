---
name: context7
description: "Use when looking up library documentation, API references, framework patterns, or code examples for ANY library (React, Next.js, Vue, Django, Laravel, etc.). Fetches current docs via Context7 REST API. Triggers on: how to use library, API docs, framework pattern, import usage, library example."
license: "(MIT AND CC-BY-SA-4.0)"
compatibility: "Requiere curl (incluido en Windows) y Python 3 (para parsear JSON). jq NO requerido."
metadata:
  version: "1.4.1-tm"
  repository: "https://github.com/netresearch/context7-skill"
  author: "Netresearch DTT GmbH"
  adapted: "Adventure Center TM workspace — usa Python en lugar de jq"
allowed-tools:
  - "Bash(curl:*)"
  - "Bash(python3:*)"
  - "Read"
---

# Context7 Documentation Lookup Skill

Fetch current library documentation, API references, and code examples via the Context7 REST API.

## When to Use

Use this skill when the user asks about library APIs, framework patterns, or version-specific behavior. Trigger on:

- Library questions: "How do I use [library]?", "[library] API docs", "[library] patterns"
- Import statements: `import`, `require`, `from` followed by a library name
- Framework-specific topics: hooks, routing, middleware, ORM queries, schema definitions

## When NOT to Use

Do NOT use this skill for:

- General programming concepts (closures, recursion, design patterns)
- Code review or refactoring tasks
- Debugging business logic
- Writing scripts from scratch without library-specific questions

## Core Workflow

1. **Search** for the library ID:
   ```bash
   scripts/context7.sh search "library-name"
   ```

2. **Pick the best result**: Choose the ID with the highest score and most relevant description. Prefer official sources (e.g., `/vercel/next.js` over community forks).

3. **Fetch documentation** with a focused topic:
   ```bash
   scripts/context7.sh docs "<library-id>" "<topic>" "<mode>"
   ```

Always extract a specific topic from the user's question. For "How does React Suspense work with server components?", use topic `suspense server components`.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `library-id` | Yes | From search results, format `/vendor/library` |
| `topic` | No | Focus area extracted from user query (e.g., `hooks`, `routing`, `validation`) |
| `mode` | No | `code` (default) for API references; `info` for conceptual guides |

## Mode Selection

Use `code` mode (default) when the user asks for API references, code examples, or implementation patterns.

Use `info` mode when the user asks for conceptual explanations, architecture guides, or migration tutorials.

## Examples

```bash
# React hooks API
scripts/context7.sh search "react"
scripts/context7.sh docs "/facebook/react" "hooks" "code"

# Next.js App Router conceptual guide
scripts/context7.sh search "nextjs"
scripts/context7.sh docs "/vercel/next.js" "app router" "info"

# Tailwind v4 CSS-first config
scripts/context7.sh search "tailwindcss"
scripts/context7.sh docs "/tailwindlabs/tailwindcss" "v4 configuration" "code"

# Framer Motion v12 animations
scripts/context7.sh search "framer-motion"
scripts/context7.sh docs "/framer/motion" "variants animate" "code"

# Supabase auth
scripts/context7.sh search "supabase"
scripts/context7.sh docs "/supabase/supabase" "auth row level security" "code"
```

## Environment Configuration

Set `CONTEXT7_API_KEY` for higher rate limits (optional):

```bash
export CONTEXT7_API_KEY="your-api-key"
```

Control token length (default 10000):
```bash
export CONTEXT7_TOKENS=15000
```

## Nota de implementación (TM workspace)

Este script usa **Python** para parsear JSON en lugar de `jq` (no disponible en este entorno Windows). El script está en `scripts/context7.sh`.

---

> **Contributing:** https://github.com/netresearch/context7-skill
