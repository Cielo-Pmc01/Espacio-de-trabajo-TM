import json
import urllib.request
from pathlib import Path

lines = Path('.env').read_text().strip().splitlines()
token = None
for line in lines:
    if line.startswith('NOTION_TOKEN='):
        token = line.split('=', 1)[1]
if not token:
    raise SystemExit('No NOTION_TOKEN in .env')

headers = {
    'Authorization': f'Bearer {token}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
}

db_id = '34539896-8d66-81c9-9e55-e0ffd5f7012d'

sample_leads = [
    {
        'Nombre': 'Juan Pérez',
        'Marca': 'TC',
        'Campaña': 'Invierno PB',
        'Excursión': 'Piedras Blancas',
        'Canal': 'Meta Ads',
        'Teléfono': '+54 9 11 1234 5678',
        'Email': 'juan.perez@example.com',
        'Fecha de ingreso': '2026-04-17',
        'Estado': 'Contactado',
        'Responsable': 'SP',
        'Venta': 'No',
        'Monto estimado': 42000,
        'Notas': 'Cliente interesado en traslado y alquiler de equipo.'
    },
    {
        'Nombre': 'María García',
        'Marca': 'TB',
        'Campaña': 'Verano 2026',
        'Excursión': 'Circuito Chico',
        'Canal': 'WhatsApp',
        'Teléfono': '+54 9 11 8765 4321',
        'Email': 'maria.garcia@example.com',
        'Fecha de ingreso': '2026-04-16',
        'Estado': 'Reservado',
        'Responsable': 'Ventas',
        'Venta': 'Sí',
        'Monto estimado': 28000,
        'Notas': 'Reserva confirmada para grupo de 4 personas.'
    },
    {
        'Nombre': 'Lucas Fernández',
        'Marca': 'TC',
        'Campaña': 'Invierno PB',
        'Excursión': 'Cerro Catedral',
        'Canal': 'Meta Ads',
        'Teléfono': '+54 9 11 5555 6666',
        'Email': 'lucas.fernandez@example.com',
        'Fecha de ingreso': '2026-04-15',
        'Estado': 'Interesado',
        'Responsable': 'SP',
        'Venta': 'No',
        'Monto estimado': 52000,
        'Notas': 'Busca opción de traslado + equipo sin clase.'
    }
]

for lead in sample_leads:
    properties = {
        'Nombre': {
            'title': [{'type': 'text', 'text': {'content': lead['Nombre']}}]
        },
        'Marca': {'select': {'name': lead['Marca']}},
        'Campaña': {'rich_text': [{'type': 'text', 'text': {'content': lead['Campaña']}}]},
        'Excursión': {'rich_text': [{'type': 'text', 'text': {'content': lead['Excursión']}}]},
        'Canal': {'select': {'name': lead['Canal']}},
        'Teléfono': {'phone_number': lead['Teléfono']},
        'Email': {'email': lead['Email']},
        'Fecha de ingreso': {'date': {'start': lead['Fecha de ingreso']}},
        'Estado': {'select': {'name': lead['Estado']}},
        'Responsable': {'rich_text': [{'type': 'text', 'text': {'content': lead['Responsable']}}]},
        'Venta': {'select': {'name': lead['Venta']}},
        'Monto estimado': {'number': lead['Monto estimado']},
        'Notas': {'rich_text': [{'type': 'text', 'text': {'content': lead['Notas']}}]}
    }
    payload = {'parent': {'database_id': db_id}, 'properties': properties}
    req = urllib.request.Request('https://api.notion.com/v1/pages', data=json.dumps(payload).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print('CREATED', data.get('id'))
