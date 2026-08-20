# Conexiones para automatizar precios/disponibilidad en las webs (WordPress + WooCommerce)

> Documento de traspaso para replicar en otro VSCode (ej. para SP Yamila). Cubre las 8 marcas activas de invierno: los 7 sitios del multisitio de Hostinger + Adventure Center (hosting separado).
>
> **Importante:** esto NO es una automatización corriendo (no hay workflow n8n todavía armado para esto — queda pendiente diseñarlo). Es el acceso técnico + los comandos manuales que permiten hacer cualquier cambio de precio/horario/disponibilidad hoy mismo, sitio por sitio.

---

## 1. Sitios del multisitio de Hostinger (7 marcas activas + rafting)

Dominios cubiertos: turcentral.com.ar, patagoniabooking.com, turismopatagonia.ar, turismobariloche.ar, barilocheexcursiones.com.ar, passeiosbariloche.com, centroreservasbariloche.com. (El multisitio completo tiene 19 sitios, incluidas las 5 marcas de rafting — mismo mecanismo aplica a todas.)

### Acceso SSH
- **IP:** `193.203.180.217`
- **Puerto:** `65002`
- **Usuario:** `u504568529`

**No copiar la clave privada de una máquina a otra.** Es más seguro generar una clave nueva en cada máquina que vaya a operar:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/hostinger_turcentral -C "claude-code-yamila"
```

Agregar la clave pública (`.pub`) en **hPanel → Avanzado → Acceso SSH → Claves SSH** (quien tenga acceso al hPanel de Cielo la carga ahí, con cualquier nombre identificable).

Conexión una vez cargada la clave:

```bash
ssh -i ~/.ssh/hostinger_turcentral -p 65002 -o StrictHostKeyChecking=accept-new -o BatchMode=yes u504568529@193.203.180.217
```

### Cómo operar (WP-CLI, ya instalado en el servidor)

Desde `~/domains/turcentral.com.ar/public_html`, agregando siempre `--url=<dominio> --allow-root` para apuntar al sitio correcto dentro de la red:

```bash
# Leer disponibilidad de un producto (horarios de una excursión)
wp post meta get <ID_PRODUCTO> _wc_booking_availability --url=<dominio> --allow-root

# Escribir disponibilidad — SIEMPRE con `wp eval` y un array PHP real.
# Nunca pasar un string ya serializado a mano: WordPress lo serializa 2 veces (maybe_serialize)
# y corrompe el dato.
wp eval 'update_post_meta(<ID>, "_wc_booking_availability", array(
  array("type"=>"time","bookable"=>"yes","priority"=>10,"from"=>"08:00","to"=>"09:00"),
  array("type"=>"time","bookable"=>"yes","priority"=>10,"from"=>"14:30","to"=>"15:30")
));' --url=<dominio> --allow-root

# Sincronizar el horario "de vidriera" — NO se actualiza solo con lo anterior
wp post meta update <ID> _wc_booking_first_block_time '08:00' --url=<dominio> --allow-root

# Precio/nombre/estado de todos los productos de un sitio
wp wc product list --url=<dominio> --allow-root --user=1 --status=any --per_page=100 \
  --fields=id,name,status,type,regular_price,sale_price,price,sku --format=json

# Cambiar precio regular de un producto puntual
wp wc product update <ID_PRODUCTO> --user=1 --url=<dominio> --allow-root --regular_price=<NUEVO_PRECIO>
```

**Siempre verificar después de escribir** (leer de nuevo el meta/producto) antes de dar el cambio por bueno.

---

## 2. Adventure Center (hosting separado, detrás de Cloudflare — NO está en el multisitio)

No usa SSH — se opera 100% vía API REST de WooCommerce. Estas credenciales son portables, se pueden copiar tal cual a la otra máquina.

**Clave de solo lectura (consultas/auditorías):**
- Consumer Key: `ck_afc91a0cfa5a84f19a9581ae23737a60e836c839`
- Consumer Secret: `cs_8203109cb012f5a29c0fad95962a42e1aa258cae`

**Clave de lectura/escritura (para aplicar cambios):**
- Consumer Key: `ck_48517bb174e5cd4abc91fc113b3a87172c96b8a4`
- Consumer Secret: `cs_58d6b33376d7577490a59717d4364a6baf695e98`

### Gotchas obligatorios (si no se respetan, falla)
- Mandar siempre un **User-Agent de navegador real** (ej. `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36`) — sin esto, 403.
- Autenticar con **query params** en la URL (`?consumer_key=...&consumer_secret=...`), no con header `Authorization: Basic` — eso da 401 (el servidor no pasa bien el header).

### Endpoints usados

```bash
# Buscar un producto por nombre
curl -A "Mozilla/5.0 ... Chrome/120.0 Safari/537.36" \
  "https://adventurecenter.com.ar/wp-json/wc/v3/products?consumer_key=CK&consumer_secret=CS&search=circuito+chico&_fields=id,name,status,type"

# Ver detalle completo de booking (disponibilidad, horarios, duración)
curl -A "Mozilla/5.0 ..." \
  "https://adventurecenter.com.ar/wp-json/wc-bookings/v1/products/{id}?consumer_key=CK&consumer_secret=CS"

# Precio "de vidriera" (display_cost) — el _price normal de wc/v3 NO se puede escribir por REST
curl -X PUT -A "Mozilla/5.0 ..." -H "Content-Type: application/json" \
  "https://adventurecenter.com.ar/wp-json/wc-bookings/v1/products/{id}?consumer_key=CK&consumer_secret=CS" \
  -d '{"display_cost": "35400"}'

# Disponibilidad/horarios — PUT #1: el array completo de bloques
curl -X PUT -A "Mozilla/5.0 ..." -H "Content-Type: application/json" \
  "https://adventurecenter.com.ar/wp-json/wc-bookings/v1/products/{id}?consumer_key=CK&consumer_secret=CS" \
  -d '{"availability":[{"type":"time","bookable":"yes","priority":10,"from":"08:00","to":"09:00"},{"type":"time","bookable":"yes","priority":10,"from":"14:30","to":"15:30"}]}'

# PUT #2 — separado, sincroniza el horario "de vidriera" (no se actualiza solo con el PUT anterior)
curl -X PUT -A "Mozilla/5.0 ..." -H "Content-Type: application/json" \
  "https://adventurecenter.com.ar/wp-json/wc-bookings/v1/products/{id}?consumer_key=CK&consumer_secret=CS" \
  -d '{"first_block_time":"08:00"}'
```

**Siempre verificar con un GET después de cada PUT** antes de dar el cambio por confirmado.

---

## 3. IDs de referencia — Circuito Chico (ejemplo ya resuelto, 2026-07-22)

| Sitio | ID producto |
|---|---|
| turcentral.com.ar | 213 |
| patagoniabooking.com | 29 |
| turismopatagonia.ar | 377145 |
| turismobariloche.ar | 87 |
| barilocheexcursiones.com.ar | 810 |
| passeiosbariloche.com | 65773 |
| centroreservasbariloche.com | 230735 |
| adventurecenter.com.ar | 376949 |

---

## 4. Protocolo de seguridad — leer antes de tocar nada

- **No hacer ningún cambio de escritura sin confirmación explícita de Cielo para esa acción puntual** — es producción real, 19 sitios en venta activa.
- No compartir la contraseña de la cuenta de hosting (existe, pero se evita usarla — el acceso por clave SSH es más seguro y ya está probado).
- Hay 2 hallazgos de seguridad activos en el hosting (un mu-plugin neutralizado por el antivirus y un backdoor `wp-upgrad.php` todavía activo sin cuarentena) — ya reportados a Cielo, ella decide con el programador/Hostinger. No tocar esos archivos.

## 5. Lo que falta armar

El flujo n8n de automatización real (para que este proceso deje de ser manual, sitio por sitio) todavía está pendiente de diseñar — es el próximo paso natural una vez que este documento esté replicado y probado en la otra máquina.
