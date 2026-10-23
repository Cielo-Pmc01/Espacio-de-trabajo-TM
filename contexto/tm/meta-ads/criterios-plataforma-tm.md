# Criterios de la Plataforma TM (cómo se mide en Adventure Center)

Fuente: el workflow n8n **«MetaAds - Consolidado»** (`7W4LKQPVtGfR14kg`, nodos «Clasificar marca y armar filas», «Armar filas de cache» y las consultas a Meta), leído el 2026-10-22, y las correcciones que Cielo validó en la Plataforma TM (tm-platform / crm-meta-ads). **Es la definición oficial del área: el agente tiene que medir así, no con el estado crudo que devuelve Meta.**

## 1. ¿Qué está «activo»? (el error que ya pasó)
El `effective_status` de una **campaña** puede decir `ACTIVE` aunque sus conjuntos o anuncios estén pausados. Pasó con «Ale Sopran» (campañas ACTIVE con cero gasto) y con unas 85 campañas de 2022 de «Sergio ADC» que figuraban ACTIVE sin actividad real hace años.

**Regla: algo está activo solo si tiene ENTREGA REAL.**
- **Entrega real** = `spend > 0` **o** `impressions > 0` en el período consultado (hoy, ayer, la semana…). Se mide con insights a **nivel anuncio** (`level=ad`).
- **Anuncio:** activo si su `effective_status` es `ACTIVE` (ese estado ya refleja si la campaña o el conjunto están pausados: `CAMPAIGN_PAUSED`, `ADSET_PAUSED`) **y** tuvo entrega.
- **Campaña:** activa solo si tiene **al menos un anuncio** que cumpla lo anterior. Que la campaña diga `ACTIVE` no alcanza.
- **Cuenta** (en este orden):
  1. `account_status` ≠ 1 → no activa. 1 = Activa · 2 = Desactivada · 3 = Sin pago/pendiente (UNSETTLED) · 7 = En revisión de riesgo · 8 = Pago pendiente · 9 = Gracia de pago · 100 = Por cerrar · 101 = Cerrada.
  2. Cuenta **prepaga** con saldo 0 → «Sin fondos».
  3. Alguna campaña con `effective_status = ACCOUNT_PAUSED` → «Cuenta pausada por Meta».
  4. Cuenta ACTIVE **sin gasto ni impresiones hoy** → «Sin campañas activas» (no está rota: solo no corre nada).
- Motivos de `disable_reason`: 1 política de integridad · 2 revisión de IP/derechos · 3 falta de pago · 4 cuenta suspendida · 5 revisión AFC · 6 integridad del negocio · 7 cierre permanente.
- Cuando listes «campañas activas», mostrá **solo las que tienen entrega real** y contá aparte las «ACTIVE en Meta sin entrega» (candidatas a pausar). Nunca las mezcles en el mismo número.

## 2. ¿Cómo se cuentan los mensajes?
«Mensajes» = **conversaciones iniciadas**, no contactos únicos. Se toma el **primer** tipo de acción de esta lista que tenga valor > 0 (**no se suman entre sí**):
1. `onsite_conversion.messaging_conversation_started_7d`
2. `onsite_conversion.total_messaging_connection`
3. `onsite_conversion.messaging_first_reply`
4. `whatsapp_message`

- Es lo mismo que la columna **«Resultados»** de cada campaña en el Administrador de anuncios. **No** coincide con «Contactos de mensajes» (que deduplica personas): una diferencia de 1 o 2 por día es normal, no es un error. Si Cielo dice que «no cierra», comparar primero contra «Resultados».
- Se consulta a nivel anuncio con los campos `campaign_name, ad_name, spend, impressions, clicks, actions`, por día.
- El mismo anuncio puede aparecer repetido: se agrupa por **fecha + cuenta + campaña + anuncio** y se suman gasto, mensajes, impresiones y clics.
- **Costo por mensaje** = gasto ÷ mensajes (si mensajes = 0, no hay costo: decilo, no dividas).
- **Nunca sumes monedas distintas** (ARS, BRL, USD): cada una va aparte.

## 3. ¿De qué marca es una campaña? (y en qué cuenta va cada marca)
La plataforma asigna la marca por **el prefijo del nombre de la campaña** (sin contar un emoji inicial) **y** por la cuenta. Una campaña sin prefijo reconocible **queda sin marca y no suma en los rankings**.

| Marca | Prefijo del nombre | Cuenta (primeros 6 dígitos) |
|---|---|---|
| Turismo Bariloche (TB) | `TB ` o `TB-` | 585100 (Sergio ADC) |
| Adventure Center | `ADV ` / `ADVC ` o contiene «adventure center» | 585100 |
| Bariloche Excursiones | `BE ` | 585100 |
| Centro de Reservas | contiene `CDR` | 585100 |
| Cabalgatas Bariloche | `CB ` | 585100 |
| Turismo Patagonia (TP) | `TP ` | 585100 y 946831 (Ale Sopran) |
| Patagonia Booking (PB) | `PB ` | 585100, 946831 y 681859 (Alex Sopran BR) |
| Tur Central (TC) | `TC ` | 585100 y 946831 |
| TB Brasil | `TB ` | 681859 (BR) |
| Passeios Bariloche | contiene «passei» | 681859 |
| Rafting Adventure (RA) / Rafting Bariloche (RB) / Rafting Limay (RL) | `RA` / `RB` / `RL` | 488232 |
| Rafting Villegas (RV) / Rafting Patagonia (RP) / Valle del Manso (R VDM) | `RV` / `RP` / `R VDM` | 488232 y 946831 |

**Regla de nombres para las campañas nuevas:** el nombre tiene que **empezar con el código de la marca**, un espacio o guion y después el resto. Ejemplo: `TB - Circuito Chico - Mensajes WhatsApp`. Con el prefijo bien puesto la campaña aparece sola en la Plataforma TM; si no, no.

Cuentas que **no** están en la Plataforma TM (el «Consolidado» no las trae): `10020498901314306` (turcentralpatagonia), `106276119709880` (sin nombre) y `1264845594170437` (rafting USD). Si un dato sale de ellas, aclarar que no está en la plataforma.

## 4. Alertas de saldo (mismo criterio de entrega real)
Las alertas de saldo bajo solo avisan si la cuenta **tiene entrega real hoy**: con plata cargada pero nada corriendo no hay riesgo. La alerta de «pausada por Meta» no usa ese filtro.

## 5. Dónde está esto implementado (para contrastar)
- Plataforma TM: tabla `meta_ads.metrics_daily` (proyecto Supabase «Plataforma ecosistema meta») con las columnas `brand`, `spend`, `messages`, `impressions`, `clicks`, `campaign_status`, `account_status`.
- n8n: «MetaAds - Consolidado» (`7W4LKQPVtGfR14kg`), «MetaAds - Alertas de Saldo» (`f4VD2wz94hNA9IPP`) y «MetaAds - Reporte Bajo Demanda» (`Uo9iqt70pkvs9NOc`, ranking de excursiones y detección de presupuesto mal aprovechado).
- Si lo que dice Meta por el MCP no coincide con la plataforma, **decilo y explicá la diferencia con estos criterios**; no elijas uno en silencio.
