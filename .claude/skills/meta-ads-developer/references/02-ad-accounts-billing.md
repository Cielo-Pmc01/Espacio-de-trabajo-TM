# 02 — Cuentas publicitarias, pagos y facturación

✅ = verificado en doc oficial o en la UI real el 2026-10-08 · ⚠️ = re-verificar · 🏢 = observado en cuentas de Cielo

## Campos de AdAccount para diagnóstico ✅ (doc oficial)
`account_status`: **1** ACTIVE · **2** DISABLED · **3** UNSETTLED (deuda/pago fallido) · **7** PENDING_RISK_REVIEW · **8** PENDING_SETTLEMENT · **9** IN_GRACE_PERIOD · **100** PENDING_CLOSURE · **101** CLOSED · 201 ANY_ACTIVE · 202 ANY_CLOSED.
`disable_reason` (0–15): 0 NONE · 1 ADS_INTEGRITY_POLICY · 2 ADS_IP_REVIEW · 3 RISK_PAYMENT · 4 GRAY_ACCOUNT_SHUT_DOWN · 5 ADS_AFC_REVIEW · 6 BUSINESS_INTEGRITY_RAR · 7 PERMANENT_CLOSE · 8 UNUSED_RESELLER_ACCOUNT · 9 UNUSED_ACCOUNT · 10 UMBRELLA_AD_ACCOUNT · 11 BUSINESS_MANAGER_INTEGRITY_POLICY · 12 MISREPRESENTED_AD_ACCOUNT · 13 AOAB_DESHARE_LEGAL_ENTITY · 14 CTX_THREAD_REVIEW · 15 COMPROMISED_AD_ACCOUNT.
Financiamiento: `funding_source` (ID del método de pago), `funding_source_details`, `spend_cap` (tope de gasto de la cuenta), `amount_spent`, `balance` (facturado pendiente), `is_prepay_account`. Otros: `currency`, `timezone_name`, `business`, `owner`, `min_daily_budget`, `capabilities`, `tax_id_status` (0–5).
Lectura mínima de diagnóstico (GET): `GET /act_<ID>?fields=account_status,disable_reason,currency,timezone_name,is_prepay_account,spend_cap,amount_spent,balance,funding_source_details,business` — 1 llamada.

## Pantalla real: Facturación y pagos ✅ 🏢
Ruta: Business Settings/Business Suite → **Facturación y pagos** (`/latest/billing_hub/accounts/?business_id=<ID>`). Menú: *Métodos de pago* · *Actividad de pago* · *Notas de pago pendiente* · pestaña **Cuentas** con subpestañas *Cuentas publicitarias*, *Cuentas de WhatsApp Business*, *Cuentas de Business AI*.
Columnas: **Cuenta · Estado · Cómo efectuarás el pago · Saldo actual**. Estados vistos: **Activa**, **Inhabilitada**. Variantes de la columna "Cómo efectuarás el pago":
- **"Saldo disponible"** + monto + botón *Agregar fondos* → cuenta **prepaga** (ej. cuentas 585100972496931 en ARS y 681859433781194 en BRL).
- **Tarjeta (Mastercard •••• NNNN)** + deuda + texto **"Error en el pago"** + botón *Pagar* → cuenta con **pago fallido/deuda** (corresponde a `account_status=3`, "Inhabilitada").
- **"Ningún método de pago"** + $0,00 + botón *Agregar método de pago* → cuenta Activa **sin forma de pago**: no puede gastar (2019411605622000 al 2026-10-08).
Interpretación confirmada por Cielo: etiqueta "Cuenta publicitaria desactivada, método de pago" = desactivada por falta de pago.
En el Inicio de ayuda para empresas la misma cuenta aparece **"Restringida"** (ver `13`).

## Cómo diagnosticar "no puedo agregar tarjeta / pago rechazado" (no asumir tarjeta mala)
Orden: 1) ¿Quién intenta y con qué permiso financiero? (rol sobre la cuenta, no solo rol del Business). 2) Estado de la cuenta (`account_status`/`disable_reason`): una cuenta Inhabilitada por deuda bloquea cambios hasta pagar. 3) País/moneda de la cuenta vs país/moneda de la tarjeta (moneda de la cuenta no se cambia después de crearla ⚠️). 4) ¿Hay deuda pendiente / `balance`? Pagar la deuda con el botón **Pagar** antes de cambiar método. 5) Restricciones de riesgo (`disable_reason=3 RISK_PAYMENT`). 6) Historial en *Actividad de pago* (rechazo del emisor vs de Meta). 7) Método guardado a nivel portafolio vs cuenta. Pasos exactos de la UI para agregar/cambiar método de pago: ⚠️ no verificados (no se hizo clic en esas acciones); pedir captura de la pantalla específica.

## Prepago vs postpago 🏢
`is_prepay_account` define si se carga saldo (prepago) o se factura por umbral (postpago). Las alertas de saldo de n8n cubren cuentas prepagas; en postpago el riesgo es el **fallo del cobro** (status 3). Ver `project_automatizacion_alertas_saldo_meta_ads`.

## Límites ⚠️
`spend_cap` de cuenta (API) y *límite de gasto de la cuenta* (UI): verificar el nombre actual en pantalla. Umbral de facturación (billing threshold) en postpago: ⚠️ verificar. Cambios de gasto de cuenta: máx. 10/día (rate limit, ver `07`) ✅.

## Estructura recomendable de cuentas (Modo Ads/Business — recomendación, no hecho de Meta)
Una cuenta por línea de negocio/moneda (ARS, BRL); no mezclar cuentas con deuda histórica con las nuevas; tener siempre **método de pago de respaldo**; que el rol financiero lo tengan ≥2 admins; documentar `act_` ↔ marca ↔ dataset en `99-contexto`.
