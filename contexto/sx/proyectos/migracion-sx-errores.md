# Migración SX — Errores y Soluciones

> Migración de `iadventurecenter.com` → `iadventurecentersx.com`
> Supervisión: Cielo — 22 de junio 2026

---

## Principio de la migración (por qué se rompe todo)

La migración se está haciendo sin respetar el orden de dependencias:
```
DNS → App → Configuración interna → Sistemas que dependen de ella
```
Si se cambia el dominio en una app antes de crear el DNS, o antes de actualizar las apps
que dependen de ella, se rompe la cadena completa.

---

## Orden correcto de resolución

```
1. DNS (Don Web)           → que los dominios resuelvan
2. Chatwoot                → base de Strapi auth, Magda y PB2
3. Strapi / PB2            → base de evolutionCores (URLs de Evolution para Magda)
4. Evolution API           → reconectar instancias, corregir webhooks
5. n8n / Magda             → actualizar URLs hardcodeadas en workflows
6. Verificar end-to-end    → mensaje entra → Magda responde → sale por WhatsApp
```

---

## Errores y Soluciones

---

### ❌ ERROR 1 — `dash.iadventurecentersx.com` sin registro DNS
**Sistema:** Dolibarr
**Síntoma:** `DNS_PROBE_FINISHED_NXDOMAIN` — el dominio no existe

**Causa:** Configuraron la variable `DOLIBARR_HOST=https://dash.iadventurecentersx.com`
en Strapi pero nunca crearon el registro DNS para ese subdominio.

**Solución:**
1. Entrar al panel de Don Web (o donde estén los DNS de `iadventurecentersx.com`)
2. Crear un registro **A** para `dash` apuntando a la IP del servidor
3. Esperar propagación DNS (puede tardar hasta 30 min)

**Responsable:** Área SX
**Estado:** ⏳ Pendiente

---

### ❌ ERROR 2 — Strapi Admin con error 500 en `/admin/init`
**Sistema:** Strapi / PB2 (`auth.iadventurecentersx.com`)
**Síntoma:** Panel de admin carga pantalla de "register-admin" y tira 500 en consola

**Causa:** Falta la variable `PUBLIC_URL`. Sin ella Strapi no sabe desde qué dominio
está siendo servido y el admin falla al inicializar.

**Solución:**
1. Ir a Dokploy → servicio Strapi/PB2 → pestaña **Environment**
2. Agregar la variable:
   ```
   PUBLIC_URL=https://auth.iadventurecentersx.com
   ```
3. Hacer **Redeploy**
4. Verificar entrando a `https://auth.iadventurecentersx.com/admin`

**Impacto si no se resuelve:** No se puede actualizar `evolutionCores` en Strapi
→ Magda sigue apuntando a URLs viejas de Evolution API.

**Responsable:** Área SX
**Estado:** ⏳ Pendiente

---

### ❌ ERROR 3 — Mensajes entran a Chatwoot pero no salen a WhatsApp
**Sistema:** Chatwoot + Evolution API
**Síntoma:** Los clientes escriben y se ve en Chatwoot, pero las respuestas no llegan

**Causa:** Cada bandeja de entrada en Chatwoot tiene configurada la URL de Evolution API
para el envío saliente. Si esa URL sigue siendo `s2.iadventurecenter.com` (dominio viejo),
los mensajes salientes fallan silenciosamente.

**Solución:**
1. Chatwoot → **Settings → Entradas**
2. Entrar a cada bandeja → pestaña **"Configuración"**
3. Buscar el campo con la URL del host de Evolution API
4. Cambiar `s2.iadventurecenter.com` → `s2.iadventurecentersx.com`
5. Guardar y probar enviando un mensaje

> Hacer esto en CADA bandeja que use Evolution API (las de WhatsApp).

**Responsable:** Área SX
**Estado:** ⏳ Por verificar en cada bandeja

---

### ❌ ERROR 4 — `barilocheexcursioness2` Disconnected en Evolution API
**Sistema:** Evolution API s2 — instancia de Bariloche Excursiones
**Síntoma:** En `s2.iadventurecentersx.com/manager/` aparece como **Disconnected**
(las otras 3 instancias están Connected)

**Causa:** La sesión de WhatsApp se desconectó, probablemente durante la migración
del servidor.

**Solución:**
1. Ir a `https://s2.iadventurecentersx.com/manager/`
2. Entrar a la instancia `barilocheexcursioness2`
3. Hacer **Reconectar** → escanear el QR con el teléfono de esa línea
4. Verificar que quede en estado **Connected**

**Responsable:** Quien tenga acceso al teléfono de Bariloche Excursiones
**Estado:** ⏳ Pendiente

---

### ❌ ERROR 5 — Doble barra en webhook de Adventure Center en Chatwoot
**Sistema:** Chatwoot — bandeja Adventure Center
**Síntoma:** URL del webhook configurada con `//` doble:
`https://s2.iadventurecentersx.com//chatwoot/webhook/adventurecenters2`

**Causa:** Error tipográfico al configurar el webhook (escribieron `/` de más).

**Solución:**
1. Chatwoot → Settings → Entradas → **Adventure Center** → pestaña **Ajustes**
2. Cambiar URL de Webhook a:
   ```
   https://s2.iadventurecentersx.com/chatwoot/webhook/adventurecenters2
   ```
3. Guardar

**Responsable:** Área SX
**Estado:** ⏳ Pendiente

---

### ⚠️ ERROR 6 — n8n / Magda con URLs de Chatwoot del dominio viejo
**Sistema:** n8n — workflows de Magda
**Síntoma:** Magda puede dejar de responder o de registrar conversaciones en Chatwoot

**Causa:** Los workflows de Magda (especialmente Magda 2.0 en producción y Magda 2.1 Beta)
tienen hardcodeada la URL de Chatwoot como `iadventurecenter.com`. Si el dominio nuevo
no redirige al viejo, todas las llamadas a la API de Chatwoot desde n8n fallan.

**Dónde está el problema (en los JSON de n8n):**
```
"url": "=https://iadventurecenter.com/api/v1/accounts/..."
```
Aparece en decenas de nodos en Magda 2.0, Magda 2.1 Beta y otros workflows.

**Solución:**
1. En n8n, abrir cada workflow activo de Magda
2. Buscar todas las URLs que digan `iadventurecenter.com`
3. Reemplazar por `iadventurecentersx.com`

> O más eficiente: exportar los JSON, hacer find & replace masivo, reimportar.

**Prioridad:** Alta si Chatwoot ya no acepta requests del dominio viejo.
**Responsable:** Área TM / Claude
**Estado:** ⏳ Pendiente — verificar si el dominio viejo redirige al nuevo

---

### ⚠️ ERROR 7 — evolutionCores en Strapi con URL vieja de Evolution API
**Sistema:** Strapi → colección `evolutionCores` → campo `local_evo`
**Síntoma:** Magda 1.6.4 (activo) usa la URL de Evolution API dinámicamente desde Strapi.
Si el campo `local_evo` tiene `s1.iadventurecenter.com`, Magda no puede enviar mensajes.

**Solución:**
1. Primero resolver ERROR 2 (Strapi debe estar operativo)
2. Entrar a `https://auth.iadventurecentersx.com/admin`
3. Content Manager → colección **Evolution Cores**
4. Buscar el registro con `local_evo = https://s1.iadventurecenter.com`
5. Cambiarlo a `https://s1.iadventurecentersx.com`
6. Guardar y publicar

**Responsable:** Cielo (una vez que Strapi esté operativo)
**Estado:** 🔒 Bloqueado por ERROR 2

---

## Checklist de sistemas

| Sistema | URL nueva | DNS | App | Config interna | Estado |
|---------|-----------|-----|-----|----------------|--------|
| Chatwoot | `iadventurecentersx.com` | ✅ | ✅ mensajes entran | ❌ salientes fallan | ⚠️ Parcial |
| Strapi / PB2 | `auth.iadventurecentersx.com` | ✅ | ❌ 500 en admin | — | ❌ Caído |
| Dolibarr | `dash.iadventurecentersx.com` | ❌ | ? | — | ❌ Sin DNS |
| Evolution s2 | `s2.iadventurecentersx.com` | ✅ | ✅ 3/4 instancias | webhook con `//` doble | ⚠️ Parcial |
| Evolution s1 | `s1.iadventurecentersx.com` | ? | ? | URL en Strapi desactualizada | ? |
| n8n / Magda | `md.getjasper.digital` | ✅ | ? | URLs Chatwoot viejas en workflows | ⚠️ Por verificar |
| WooCommerce | `back.iadventurecentersx.com` | ? | ? | — | ? |
| Ventas PB2 | `ventas.iadventurecentersx.com` | ? | ? | — | ? |

---

## Resumen de acciones por responsable

### Área SX
- [ ] Crear DNS para `dash.iadventurecentersx.com` en Don Web → resuelve ERROR 1
- [ ] Agregar `PUBLIC_URL` en Dokploy y redeploy de Strapi → resuelve ERROR 2
- [ ] Corregir URL de Evolution API en pestaña Configuración de cada bandeja Chatwoot → resuelve ERROR 3
- [ ] Corregir doble barra en webhook de Adventure Center → resuelve ERROR 5
- [ ] Verificar DNS y estado de `s1.iadventurecentersx.com`, `back.iadventurecentersx.com`, `ventas.iadventurecentersx.com`

### Quien tenga el teléfono de Bariloche Excursiones
- [ ] Reconectar QR en Evolution Manager → resuelve ERROR 4

### Cielo (una vez que Strapi esté operativo)
- [ ] Actualizar `local_evo` en colección `evolutionCores` de Strapi → resuelve ERROR 7

### Área TM / Claude (verificar primero si el dominio viejo redirige)
- [ ] Actualizar URLs de Chatwoot en workflows de n8n → resuelve ERROR 6
