# Plan: CRM para campañas de Meta Ads

**Creado:** 2026-04-17
**Estado:** Nuevo
**Pedido:** Crear un CRM práctico que gestione campañas, leads y seguimiento de Meta Ads dentro del workspace.

---

## Objetivo

Construir una herramienta simple pero útil para:
- Registrar campañas de Meta Ads
- Administrar leads generados por campañas
- Controlar estados y etapas de seguimiento
- Guardar información localmente para uso rápido
- Filtrar por campaña, estado y etapa
- Exportar datos si es necesario

## Alcance inicial

### Funcionalidades mínimas
- Panel de campañas
- Panel de leads
- Filtros por campaña, estado y etapa
- Formulario de carga rápida de leads
- Notas y próxima acción
- Almacenamiento en `localStorage`
- Exportar CSV para control manual

### Limitaciones actuales
- No integra con Meta Ads API
- No hay autenticación de usuarios
- Es una herramienta de apoyo interno para la gestión de campañas y seguimiento

## Archivos a crear

- `salidas/crm-meta-ads/index.html`
- `salidas/crm-meta-ads/README.md`

## Tareas de implementación

1. Crear UI básica para campañas y leads.
2. Implementar CRUD simple en JavaScript con `localStorage`.
3. Agregar filtros y búsqueda.
4. Agregar exportación a CSV.
5. Documentar uso en README.

## Próximos pasos posibles

- Conectar con Google Sheets o Notion para sincronizar datos.
- Integrar autenticación con Supabase o Airtable.
- Agregar una sección de reportes de performance de Meta Ads.
- Conectar con el panel de campañas de Meta para importar datos.
