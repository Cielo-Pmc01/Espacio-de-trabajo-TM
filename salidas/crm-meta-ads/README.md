# CRM Meta Ads

Herramienta simple para gestionar campañas y leads de Meta Ads.

## Qué hace

- Registra campañas y leads
- Almacena datos en el navegador con `localStorage`
- Filtra por campaña, estado y etapa
- Captura campos clave de TM: marca, campaña, excursión, canal, responsable, venta y monto estimado
- Permite llevar notas y fecha de próximo contacto
- Exporta datos a CSV para compartir o archivar

## Notion

- Se creó una base de datos de CRM en Notion usando el token de `.env`
- URL: https://www.notion.so/345398968d6681c99e55e0ffd5f7012d

## Cómo usar

1. Abrir `salidas/crm-meta-ads/index.html` en el navegador.
2. Crear campañas nuevas en el panel "Campañas".
3. Agregar leads desde el panel "Leads".
4. Usar filtros para ver leads por campaña, estado o etapa.
5. Exportar los datos cuando necesites entregar un reporte.

## Extensiones sugeridas

- Conectar con Meta Ads API para importar nombre de campaña, presupuesto y resultados.
- Agregar autenticación si varios usuarios deben usar la herramienta.
- Registrar conversiones y ROI por campaña.
