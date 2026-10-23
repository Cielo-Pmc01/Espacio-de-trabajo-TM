"""Prueba del editor de mensaje de bienvenida (clonar creatividad + re-apuntar el anuncio + verificar + revertir).
Ad de prueba: 'gral' en campaña pausada. El token llega por variable de entorno META_T (no se imprime)."""
import json, os, sys, urllib.request, urllib.parse, urllib.error

T = os.environ["META_T"]
API = "https://graph.facebook.com/v21.0"
ACT = "act_585100972496931"
AD = "120248868459430734"   # TC | La cueva diurna (Tur Central, campaña pausada)
ORIG = "1675655820146334"
TEST_TEXT = "[PRUEBA - ignorar] ¡Hola! Este es un texto de prueba del editor de mensajes."


def call(method, path, params=None):
    params = dict(params or {})
    params["access_token"] = T
    data = urllib.parse.urlencode(params).encode()
    url = f"{API}/{path}"
    if method == "GET":
        url += "?" + urllib.parse.urlencode(params)
        req = urllib.request.Request(url)
    else:
        req = urllib.request.Request(url, data=data, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {"error": {"message": "sin cuerpo"}}


def err(b):
    e = b.get("error", {})
    return f"{e.get('message')} (code {e.get('code')}/{e.get('error_subcode')}) {e.get('error_user_msg','')}"


def welcome_text(creative_id):
    s, b = call("GET", creative_id, {"fields": "object_story_spec"})
    if s != 200:
        return None, err(b)
    oss = b["object_story_spec"]
    for k in ("video_data", "link_data", "photo_data"):
        if k in oss and "page_welcome_message" in oss[k]:
            pw = json.loads(oss[k]["page_welcome_message"])
            return pw["text_format"]["message"]["text"], None
    return None, "sin page_welcome_message"


# 1) leer la creatividad original
s, orig = call("GET", ORIG, {"fields": "name,object_story_spec,degrees_of_freedom_spec,url_tags,asset_feed_spec"})
if s != 200:
    sys.exit("1) no se pudo leer la original: " + err(orig))
print("1) original leída:", orig["name"][:60])
txt0, _ = welcome_text(ORIG)
print("   saludo original:", (txt0 or "")[:70].replace("\n", " "))

# 2) armar el clon con el saludo de prueba
oss = json.loads(json.dumps(orig["object_story_spec"]))
kind = "video_data" if "video_data" in oss else "link_data"
blk = oss[kind]
pw = json.loads(blk["page_welcome_message"])
pw["text_format"]["message"]["text"] = TEST_TEXT
for fmt in ("image_format", "video_format"):
    if fmt in pw and "message" in pw[fmt]:
        pw[fmt]["message"]["text"] = TEST_TEXT
pw["welcome_message_edited"] = True
blk["page_welcome_message"] = json.dumps(pw, ensure_ascii=False)
if blk.get("image_hash"):
    blk.pop("image_url", None)  # se usa el hash

params = {
    "name": orig["name"][:90] + " [PRUEBA mensaje]",
    "object_story_spec": json.dumps(oss, ensure_ascii=False),
}
dof = orig.get("degrees_of_freedom_spec")
if dof:
    dof = json.loads(json.dumps(dof))
    # Meta ya no acepta 'standard_enhancements' al crear una creatividad (obsoleto)
    dof.get("creative_features_spec", {}).pop("standard_enhancements", None)
    params["degrees_of_freedom_spec"] = json.dumps(dof)
if orig.get("asset_feed_spec"):
    # anuncios de varios destinos (WhatsApp/Messenger/Instagram): hay que conservar la definición
    params["asset_feed_spec"] = json.dumps(orig["asset_feed_spec"])
    print("   (creatividad de varios destinos: se copia asset_feed_spec)")
if orig.get("url_tags"):
    params["url_tags"] = orig["url_tags"]

s, b = call("POST", f"{ACT}/adcreatives", params)
if s != 200 and b.get("error", {}).get("code") != 10 and "standard_enhancements" in json.dumps(dof or {}):
    print("2) primer intento rechazado:", err(b))
    print("   reintento sin 'standard_enhancements' (Meta no lo acepta al crear)")
    dof2 = json.loads(json.dumps(dof))
    dof2.get("creative_features_spec", {}).pop("standard_enhancements", None)
    params["degrees_of_freedom_spec"] = json.dumps(dof2)
    s, b = call("POST", f"{ACT}/adcreatives", params)
if s != 200:
    sys.exit("2) no se pudo crear la creatividad nueva: " + err(b))
NEW = b["id"]
print("2) creatividad nueva creada:", NEW)

# 3) re-apuntar el anuncio
s, b = call("POST", AD, {"creative": json.dumps({"creative_id": NEW})})
if s != 200:
    print("3) NO se pudo re-apuntar el anuncio:", err(b))
    print("   (la creatividad nueva quedó creada pero sin uso; el anuncio sigue con la original)")
    sys.exit(1)
print("3) anuncio re-apuntado:", b)

# 4) verificar
s, b = call("GET", AD, {"fields": "id,name,status,effective_status,creative{id}"})
print("4) anuncio ahora:", b.get("creative"), "|", b.get("status"), "|", b.get("effective_status"))
txt1, e = welcome_text(b["creative"]["id"])
print("   saludo ahora:", (txt1 or e)[:80].replace("\n", " "))
print("   ¿coincide con el de prueba?:", txt1 == TEST_TEXT)

# 5) revertir a la original
s, b = call("POST", AD, {"creative": json.dumps({"creative_id": ORIG})})
print("5) revertido:", b if s == 200 else err(b))
s, b = call("GET", AD, {"fields": "id,status,effective_status,creative{id}"})
print("6) anuncio final:", b.get("creative"), "|", b.get("status"), "|", b.get("effective_status"))
txt2, _ = welcome_text(b["creative"]["id"])
print("   saludo final igual al original:", txt2 == txt0)
