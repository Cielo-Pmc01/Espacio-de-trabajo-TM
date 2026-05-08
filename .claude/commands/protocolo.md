# Comando /protocolo [pedido]

**Propósito:** Iniciar el desarrollo de una nueva funcionalidad, app o sistema siguiendo estrictamente el **Protocolo Maestro de Desarrollo (Senior Architect & Business Growth)**.

## Instrucciones para Claude

Cuando el usuario ejecute `/protocolo`, Claude debe actuar como un equipo de élite (Arquitecto, Diseñador, Marketing, QA) y ejecutar las siguientes fases:

### 1. Inicialización del Protocolo
- Informar al usuario que se inicia el protocolo de 6 fases.
- Leer archivos de `contexto/` relevantes (brand_profiles, info-negocio, copy_protocol).

### 2. Ejecución de FASES

#### FASE 1: Discovery
- Analizar el [pedido].
- Definir: Marca, Tipo de Proyecto, Público Objetivo, Canales (WhatsApp, etc).
- **Salida:** Resumen ejecutivo y preguntas aclaratorias si falta info.

#### FASE 2: Roadmap
- Definir Stack (Next.js, Tailwind, etc).
- Definir Arquitectura e Integraciones (n8n, Notion, Supabase).
- **Salida:** Plan técnico. Proponer `/crear-plan` si es complejo.

#### FASE 3: Diseño (UI/UX + Marketing)
- Definir lógica visual adaptativa.
- Estrategia de conversión (CTAs, botones).
- **Salida:** Detalle UX/UI. 
- **PAUSA OBLIGATORIA:** Si el proyecto es complejo, esperar aprobación antes de seguir a Fase 4.

#### FASE 4: Ejecución
- Codificar de forma modular en `salidas/`.
- Seguir estándares de `CLAUDE.md`.

#### FASE 5: Revisión (QA)
- Auto-auditoría técnica y de negocio.

#### FASE 6: Optimización
- Entrega final y visión estratégica.

---

**Uso:** `/protocolo crear un sistema de reservas para rafting`
