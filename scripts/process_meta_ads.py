import json, sys, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

# ===== CARGAR DATOS =====
BASE = r'C:\Users\opera\.claude\projects\d--Desktop-Espacio-trabajo-TM\fbb79f47-bd0b-4bc2-84aa-788a875cb532\tool-results'

with open(rf'{BASE}\mcp-claude_ai_Meta_ads_sergio_adc-ads_get_ad_entities-1782155997880.txt', 'r', encoding='utf-8') as f:
    ads585 = json.loads(json.loads(f.read())['ad_entities'])

with open(rf'{BASE}\toolu_01T1byyiyb18jYUq6XLqVLzP.txt', 'r', encoding='utf-8') as f:
    ads681 = json.loads(json.loads(f.read())['ad_entities'])

with open(rf'{BASE}\mcp-claude_ai_Meta_ads_sergio_adc-ads_get_ad_entities-1782155644695.txt', 'r', encoding='utf-8') as f:
    camps585 = json.loads(json.loads(f.read())['ad_entities'])

# ===== MAPA CAMPAIGN_ID -> MARCA =====
CAMP_TO_BRAND = {}
for c in camps585:
    cid = c.get('id', '')
    name = c.get('name', '').upper()
    if 'ADV' in name or 'ADVENTURE' in name:
        CAMP_TO_BRAND[cid] = 'Adventure Center'
    elif 'TB' in name and 'RAFTING' not in name and 'BRASIL' not in name:
        CAMP_TO_BRAND[cid] = 'Turismo Bariloche'
    elif 'BE' in name and 'RAFTING' not in name:
        CAMP_TO_BRAND[cid] = 'Bariloche Excursiones'
    elif 'CDR' in name:
        CAMP_TO_BRAND[cid] = 'Centro de Reservas'
    elif ('PB' in name or 'PATAGONIA BOOKING' in name) and 'RAFTING' not in name:
        CAMP_TO_BRAND[cid] = 'Patagonia Booking'
    elif 'TC' in name or 'TUR CENTRAL' in name:
        CAMP_TO_BRAND[cid] = 'Tur Central'
    elif 'TP' in name or 'TURISMO PATAGONIA' in name:
        CAMP_TO_BRAND[cid] = 'Turismo Patagonia'
    elif 'CB' in name or 'CABALG' in name:
        CAMP_TO_BRAND[cid] = 'Cabalgatas'
    elif 'RAFTING' in name or 'RAFT' in name:
        CAMP_TO_BRAND[cid] = 'Rafting'
    elif 'PASSEIOS' in name:
        CAMP_TO_BRAND[cid] = 'Passeios Bariloche'
    elif 'INTERACCION SORTEO' in name or 'SORTEO' in name:
        CAMP_TO_BRAND[cid] = 'General'
    else:
        CAMP_TO_BRAND[cid] = 'General'

# ===== NORMALIZAR NOMBRES DE EXCURSIONES =====
ALIASES = {
    'cc': 'circuito chico', 'circ chic': 'circuito chico', 'circ chico': 'circuito chico',
    'circuito chico ventas': 'circuito chico', 'circuito chico normal': 'circuito chico',
    'circuito chico 2': 'circuito chico', 'circuito chico - copia': 'circuito chico',
    'sanma': 'san martin 7 lagos', 'sma': 'san martin 7 lagos',
    'san martin': 'san martin 7 lagos', 'san martin por 7 lagos': 'san martin 7 lagos',
    'san martin inv': 'san martin 7 lagos', 'san martin 7 lagos': 'san martin 7 lagos',
    'san martin inv': 'san martin 7 lagos',
    'trona': 'cerro tronador', 'tronador': 'cerro tronador', 'cerro tronador inv': 'cerro tronador',
    'cerro tronaddor': 'cerro tronador', 'troonadoir': 'cerro tronador',
    '01 - cerro tronaddor': 'cerro tronador', '02 - cerro tronaddor -': 'cerro tronador',
    '03 - cerro tronaddor': 'cerro tronador',
    'bautismo ski': 'bautismo de ski', 'bautismo ski  2': 'bautismo de ski',
    'bautismo ski 02': 'bautismo de ski', 'bautismo ski- pass': 'bautismo de ski',
    'bautismo ski 01': 'bautismo de ski',
    'reel kayak': 'kayak', 'kayak 2': 'kayak',
    'isla vict': 'isla victoria', 'isla victoria activa': 'isla victoria',
    'rafting al limite 2': 'rafting al limite', 'rafting limite': 'rafting al limite',
    'limite': 'rafting al limite', 'ultimos dias rafting limite': 'rafting al limite',
    '04 vid rafting': 'rafting al limite', '0301 al limite': 'rafting al limite',
    'light': 'rafting light', 'light act': 'rafting light', 'ultimos dias rafting light': 'rafting light',
    '0301 rafting light': 'rafting light',
    '0301 rafting gral': 'rafting gral', '01 rafting gral': 'rafting gral',
    '03 rafting gral': 'rafting gral', '05 rafting gral': 'rafting gral',
    'rafting': 'rafting gral', 'rafting venta gral': 'rafting gral', 'rafting venta': 'rafting gral',
    'rafting por el rio manso': 'rafting valle del manso',
    'tp - laguna congelada': 'laguna congelada', 'laguna congelada - pass': 'laguna congelada',
    'la cueva afterski': 'la cueva afterski', 'after ski': 'la cueva afterski',
    'la cueva after ski': 'la cueva afterski', 'la cueva afterski -pass': 'la cueva afterski',
    'aventura diurna la cueva': 'la cueva diurno', 'la cueva diurna': 'la cueva diurno',
    'cuerva diurno': 'la cueva diurno', 'la cueva': 'la cueva diurno',
    'la cueva- moto nieve': 'la cueva moto nieve', 'la cueva- moto nieve diurno 2': 'la cueva moto nieve',
    'culipatin cerro lopez': 'cerro lopez culipatin', 'cerro lopez culipatin': 'cerro lopez culipatin',
    'piedras blancas culipatin': 'piedras blancas culipatin',
    'piedras blancas - culipatin': 'piedras blancas culipatin',
    'piedras blancas 02': 'piedras blancas', 'piedras blancas - 02': 'piedras blancas',
    'winternight': 'winter night', 'winternnight': 'winter night',
    'tralsado cerro catedral': 'traslado cerro catedral',
    'traslado villa la angostura - pass': 'traslado villa la angostura',
    'traslado bayo': 'traslado cerro bayo', 'traslado cerro bayo - pass': 'traslado cerro bayo',
    'cerrro bayo + villa - pass': 'traslado cerro bayo',
    'paquete 3 excursiones': 'paquete 3 excursiones',
    'paquete 01': 'paquete', 'paquete 00': 'paquete', 'paquete promocional': 'paquete',
    'paquete prmocional': 'paquete',
    'terrestres': 'general terrestres', 'terrestres - copia': 'general terrestres',
    'tradicionales': 'general terrestres',
    'general': 'general', 'general invierno': 'general',
    'venta': 'general', 'ventaa': 'general',
    'tp - sma': 'san martin 7 lagos',
    'cena nordica': 'cena nordica',
    'roca negra': 'roca negra',
    'reels cabalgata x2': 'cabalgatas',
    'reels rafting adventure': 'rafting gral',
    'reels patagonia booking - bosque arrayanes': 'arroyo arrayanes',
    'circuito grande carrusel-': 'circuito grande',
    'tp - circuito grande': 'circuito grande',
    'nieve encantada': 'nieve encantada',
    'trafico': None, 'trafico web': None, 'nuevo anuncio de trafico': None,
    'nuevo anuncio de ventas': None, 'nuevo anuncio de interaccion': None,
    'nuevo anuncio de interaccion': None, 'flyer busqueda': None, 'gral': None,
    '10%': None, '10% descuento': None, 'cupon': None, 'preventa + cod': None,
    'preventa + codigo': None, 'roca negra': 'roca negra', 'isla vict': 'isla victoria',
}

def norm_excursion(raw_name):
    # Quitar prefijos de marca
    n = raw_name.strip()
    n = re.sub(r'^\s*(pb|tc|tp|🟢|❄️|🟡|🟣|🔴|🔵|🟠|🔶|🟩|🩵|🥎|🧡|⚫)\s*[|/-]?\s*', '', n, flags=re.IGNORECASE)
    n = n.strip().lower()
    # Quitar emojis
    n = re.sub(r'[^\x00-\x7F]+', '', n).strip()
    # Quitar sufijos
    n = re.sub(r'\s*-?\s*(copia|pass|act|02|01|2|x2|normal|inv|gral|activa|peque.o)$', '', n).strip()
    if n in ALIASES:
        return ALIASES[n]
    if 'nuevo anuncio' in n or 'ventas en instagram' in n or 'publicacion' in n:
        return None
    if not n:
        return None
    return n

def parse_msgs(r):
    if not r: return 0
    if isinstance(r, dict):
        val = r.get('value', '')
        if isinstance(val, str):
            nums = re.findall(r'\d+', val.replace('.', '').replace(',', ''))
            return int(nums[0]) if nums else 0
        elif isinstance(val, list):
            for item in val:
                if isinstance(item, dict):
                    for v in item.get('values', []):
                        if isinstance(v, dict) and 'value' in v:
                            return int(v['value'])
    return 0

def parse_num(s):
    if not s or s == 'Not available': return 0
    try:
        return int(str(s).replace('.', '').replace(',', '').split()[0])
    except:
        return 0

# ===== CONSTRUIR DATASET =====
all_rows = []

for e in ads585:
    cid = e.get('campaign_id', '')
    brand = CAMP_TO_BRAND.get(cid, 'General')
    exc = norm_excursion(e.get('name', ''))
    if not exc:
        continue
    exc_display = exc.title().replace(' De ', ' de ').replace(' Del ', ' del ').replace(' Por ', ' por ')
    all_rows.append({
        'brand': brand, 'excursion': exc_display,
        'msgs': parse_msgs(e.get('results')),
        'clicks': parse_num(e.get('clicks')),
        'impressions': parse_num(e.get('impressions')),
        'reach': parse_num(e.get('reach')),
        'status': e.get('effective_status', ''),
        'account': 'ARS',
    })

for e in ads681:
    exc = norm_excursion(e.get('name', ''))
    if not exc:
        continue
    exc_display = exc.title().replace(' De ', ' de ').replace(' Del ', ' del ').replace(' Por ', ' por ')
    name_lower = e.get('name', '').lower()
    brand = 'TB Brasil' if ('tb' in name_lower or 'turismo brc' in name_lower) else 'Passeios Bariloche'
    all_rows.append({
        'brand': brand, 'excursion': exc_display,
        'msgs': parse_msgs(e.get('results')),
        'clicks': parse_num(e.get('clicks')),
        'impressions': parse_num(e.get('impressions')),
        'reach': parse_num(e.get('reach')),
        'status': e.get('effective_status', ''),
        'account': 'BRL',
    })

# Agregar por excursion
by_exc = defaultdict(lambda: {'msgs': 0, 'clicks': 0, 'impressions': 0, 'brands': {}})
by_brand = defaultdict(lambda: {'msgs': 0, 'clicks': 0, 'impressions': 0, 'reach': 0})
by_brand_exc = defaultdict(lambda: defaultdict(lambda: {'msgs': 0, 'clicks': 0}))

for r in all_rows:
    exc = r['excursion']
    brand = r['brand']
    by_exc[exc]['msgs'] += r['msgs']
    by_exc[exc]['clicks'] += r['clicks']
    by_exc[exc]['impressions'] += r['impressions']
    by_exc[exc]['brands'].setdefault(brand, {'msgs': 0, 'clicks': 0})
    by_exc[exc]['brands'][brand]['msgs'] += r['msgs']
    by_exc[exc]['brands'][brand]['clicks'] += r['clicks']
    by_brand[brand]['msgs'] += r['msgs']
    by_brand[brand]['clicks'] += r['clicks']
    by_brand[brand]['impressions'] += r['impressions']
    by_brand[brand]['reach'] += r['reach']
    by_brand_exc[brand][exc]['msgs'] += r['msgs']
    by_brand_exc[brand][exc]['clicks'] += r['clicks']

# Calcular totales
total_msgs = sum(d['msgs'] for d in by_brand.values())
total_clicks = sum(d['clicks'] for d in by_brand.values())

print(f"TOTAL MENSAJES: {total_msgs:,}")
print(f"TOTAL CLICKS: {total_clicks:,}")
print(f"Total filas procesadas: {len(all_rows)}")
print()
print("=== TOP EXCURSIONES ===")
for exc, d in sorted(by_exc.items(), key=lambda x: x[1]['msgs'], reverse=True)[:25]:
    print(f"  {exc:45} {d['msgs']:>6} msgs")

print()
print("=== POR MARCA ===")
for brand, d in sorted(by_brand.items(), key=lambda x: x[1]['msgs'], reverse=True):
    print(f"  {brand:30} {d['msgs']:>7} msgs")

# Guardar JSON
output = {
    'meta': {'total_msgs': total_msgs, 'total_clicks': total_clicks, 'period': '2026 YTD (al 22-jun)'},
    'by_excursion': [
        {'name': k, 'msgs': v['msgs'], 'clicks': v['clicks'],
         'brands': [{'name': bn, 'msgs': bv['msgs'], 'clicks': bv['clicks']}
                    for bn, bv in sorted(v['brands'].items(), key=lambda x: x[1]['msgs'], reverse=True)]}
        for k, v in sorted(by_exc.items(), key=lambda x: x[1]['msgs'], reverse=True)
    ],
    'by_brand': [
        {'name': k, 'msgs': v['msgs'], 'clicks': v['clicks'], 'impressions': v['impressions'],
         'excursions': [{'name': en, 'msgs': ev['msgs'], 'clicks': ev['clicks']}
                        for en, ev in sorted(by_brand_exc[k].items(), key=lambda x: x[1]['msgs'], reverse=True)]}
        for k, v in sorted(by_brand.items(), key=lambda x: x[1]['msgs'], reverse=True)
    ],
}

with open(r'D:\Desktop\Espacio-trabajo-TM\crm-meta-data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print("\nJSON guardado OK")
