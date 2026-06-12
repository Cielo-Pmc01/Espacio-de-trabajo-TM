#!/usr/bin/env bash
# Context7 REST API client
# Uso: context7.sh search "library-name"
#      context7.sh docs "/vendor/library" "topic" "code|info"
#
# Requiere: curl (incluido en Windows 10+), Python (3.x)
# Opcional: set CONTEXT7_API_KEY para mayor rate limit

BASE_URL="https://context7.com/api/v1"
TOKENS="${CONTEXT7_TOKENS:-10000}"

_urlencode() {
  python -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1]))" "$1"
}

cmd_search() {
  local query="$1"
  if [[ -z "$query" ]]; then
    echo "Error: se requiere un término de búsqueda." >&2
    echo "Uso: context7.sh search \"library-name\"" >&2
    exit 1
  fi

  local encoded
  encoded=$(_urlencode "$query")

  local headers=(-H "Accept: application/json")
  [[ -n "$CONTEXT7_API_KEY" ]] && headers+=(-H "Authorization: Bearer $CONTEXT7_API_KEY")

  local response
  response=$(curl -s "${headers[@]}" "$BASE_URL/search?query=$encoded")

  if [[ -z "$response" ]]; then
    echo "Error: sin respuesta del servidor." >&2
    exit 1
  fi

  echo "$response" | python -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
except Exception as e:
    print('Error parseando respuesta:', e)
    sys.exit(1)

results = data.get('results', data) if isinstance(data, dict) else data
if not results:
    print('Sin resultados.')
    sys.exit(0)

print(f'Resultados encontrados: {len(results)}')
print('-' * 50)
for i, r in enumerate(results[:10]):
    lib_id = r.get('id', r.get('libraryId', '?'))
    name   = r.get('name', r.get('title', lib_id))
    desc   = (r.get('description') or '')[:80]
    score  = r.get('score', r.get('relevance', ''))
    score_str = f' [score: {score:.2f}]' if isinstance(score, (int, float)) else ''
    print(f'{i+1}. {lib_id}{score_str}')
    print(f'   {name} — {desc}')
"
}

cmd_docs() {
  local library_id="$1"
  local topic="${2:-}"
  local mode="${3:-code}"

  if [[ -z "$library_id" ]]; then
    echo "Error: se requiere library-id." >&2
    echo "Uso: context7.sh docs \"/vendor/library\" \"topic\" \"code|info\"" >&2
    exit 1
  fi

  local url="$BASE_URL${library_id}?tokens=$TOKENS"
  [[ -n "$topic" ]] && url+="&topic=$(_urlencode "$topic")"
  [[ -n "$mode"  ]] && url+="&mode=$mode"

  local headers=(-H "Accept: application/json")
  [[ -n "$CONTEXT7_API_KEY" ]] && headers+=(-H "Authorization: Bearer $CONTEXT7_API_KEY")

  # La API de docs devuelve texto plano (Markdown), no JSON
  local response
  response=$(curl -s "${headers[@]}" "$url")

  if [[ -z "$response" ]]; then
    echo "Error: sin respuesta del servidor. Verificá el library-id." >&2
    exit 1
  fi

  # Si es JSON, es un error de API; si es texto plano, imprimir directo
  echo "$response" | python -c "
import json, sys
raw = sys.stdin.read()
try:
    data = json.loads(raw)
    if isinstance(data, dict) and 'error' in data:
        print('Error API:', data['error'])
        sys.exit(1)
    print(json.dumps(data, indent=2, ensure_ascii=False)[:5000])
except json.JSONDecodeError:
    print(raw)
"
}

# Router principal
case "$1" in
  search)
    cmd_search "$2"
    ;;
  docs)
    cmd_docs "$2" "$3" "$4"
    ;;
  *)
    echo "Context7 Documentation Lookup"
    echo ""
    echo "Uso:"
    echo "  context7.sh search \"library-name\"                    — buscar ID de librería"
    echo "  context7.sh docs \"/vendor/library\" \"topic\" \"mode\"   — obtener documentación"
    echo ""
    echo "Modos: code (default) | info"
    echo "Env:   CONTEXT7_API_KEY, CONTEXT7_TOKENS (default: 10000)"
    ;;
esac
