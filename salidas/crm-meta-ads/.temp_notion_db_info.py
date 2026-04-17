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
}

db_id = '34539896-8d66-81c9-9e55-e0ffd5f7012d'
req = urllib.request.Request(f'https://api.notion.com/v1/databases/{db_id}', headers=headers)
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read().decode())
    print(json.dumps(data, indent=2, ensure_ascii=False))
