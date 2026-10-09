# 04 — Pixel / Dataset / Events Manager

> Base ✅ parcial (CAPI/dedup/params verificados en `05`). Lo demás ⚠️ [RE-VERIFICAR]: la UI de Events Manager cambia seguido.

## Conceptos
- **Pixel / Dataset:** contenedor de eventos (browser + servidor + offline + mensajería). En Meta el "Dataset" es la entidad actual que agrupa al Pixel; el **ID de Pixel y el de Dataset coinciden** en la práctica web ⚠️ verificar en la cuenta. Un Dataset pertenece a un Business y se conecta a cuentas publicitarias.
- **Events Manager:** Orígenes de datos, Resumen, Test Events, Diagnóstico, Configuración (cuentas conectadas, tokens CAPI, dominios, AEM).
- **Event Match Quality (EMQ):** puntaje por evento del 0 al 10 ⚠️ de qué tan bien los parámetros de cliente emparejan con personas de Meta. Se mejora enviando más y mejores `user_data` (`em`, `ph`, `fn`, `ln`, `external_id`, `fbp`, `fbc`, IP, user-agent) ✅ ver `05`.
- **Aggregated Event Measurement (AEM) y verificación de dominio ⚠️ (fuentes secundarias, 2026):** AEM nació tras iOS 14 exigiendo **verificar el dominio** y **configurar y priorizar 8 eventos**. Según análisis de terceros (Jon Loomer, Adviso) esos requisitos **se eliminaron en 2023**: hoy **no hace falta priorizar eventos** ni verificar el dominio para AEM, la sección AEM se quitó de las herramientas y Meta lo gestiona en segundo plano (el límite de 8 eventos por dominio se mantiene internamente). La verificación de dominio sigue **recomendada** (control de vistas previas de enlaces, protección de la marca, algunas funciones de eventos). **No lo exijas como requisito sin confirmarlo en la UI/documentación oficial del caso.**

## Verificación de dominio (parcial) ⚠️
Métodos (se usa **uno solo**): **etiqueta meta** en el HTML, **archivo HTML** en la raíz, o **registro DNS TXT** (el más estable: sobrevive a rediseños y migraciones). UI real ✅ 🏢: Business Settings → **Seguridad e idoneidad de la marca → Dominios** (`/latest/settings/domains`). Doc oficial: `developers.facebook.com/docs/sharing/domain-verification/verifying-your-domain`. Sin dominio verificado, Meta limita editar vistas previas de enlaces y configurar eventos de conversión de ese dominio (fuentes secundarias). ⚠️ No se confirmó en la doc oficial si hoy sigue exigiéndose para AEM/priorización de eventos. 🏢 Turismo Patagonia: **ningún dominio agregado**.

## Eventos estándar relevantes
PageView, ViewContent, Search, AddToCart, InitiateCheckout, AddPaymentInfo, Purchase, Lead, CompleteRegistration, Contact, Schedule, SubmitApplication ⚠️. Nombres **sensibles a mayúsculas**; usar siempre el estándar (`Purchase`, no `purchase`). Custom events: nombre propio, sin PII en parámetros.
`Purchase` requiere `value` y `currency` (ISO-4217) ⚠️ [verificar requisitos vigentes]; `ARS`/`BRL`/`USD` según la cuenta.

## Qué mirar en Events Manager (diagnóstico)
1. Orígenes → ¿el dataset correcto recibe eventos? 2. Resumen → método (Browser/Server) por evento. 3. Test Events → ¿llega el evento de prueba con `test_event_code`? 4. Diagnóstico → advertencias (falta de parámetros, duplicados, EMQ). 5. Configuración → cuentas publicitarias conectadas, tokens generados, dominios.

## Herramientas de prueba
Meta Pixel Helper (extensión de Chrome) para browser; Test Events para servidor; Payload Helper de CAPI para validar JSON ✅ (existe en docs de CAPI).

## Cómo se conecta al resto
Pixel/Dataset → conectado a **Ad Account** (para optimizar) → la campaña elige ese Pixel + evento en el ad set → dominio donde dispara debe estar en el mismo Business ⚠️. En Brasil usar dataset/moneda del portafolio Brasil 🏢.
