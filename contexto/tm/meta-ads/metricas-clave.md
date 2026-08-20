# Métricas Clave — CRM Meta Ads

> Este archivo es el catálogo vivo de qué métricas importan para el dashboard de Meta
> Ads. Es un documento que Cielo va a seguir ampliando con el tiempo — no es una lista
> cerrada. Cuando se agregue una métrica nueva acá, hay que sumarla también al schema
> de Supabase (`meta_ads`, ver `planes/2026-07-07-crm-meta-ads-arquitectura-n8n.md`).
>
> Para la estructura de cuentas/marcas/campañas (no las métricas en sí), ver
> `contexto/tm/meta-ads/modelo-mental-crm.md`.

---

## Métricas actuales (punto de partida — heredadas del CRM desde abril 2026)

Estas son las que el CRM ya calcula hoy. Se documentan acá como línea base, no porque
se haya decidido explícitamente que son "las correctas" a largo plazo.

| Métrica | Qué es | Cómo se calcula hoy | Para quién |
|---------|--------|----------------------|-----------|
| **Mensajes** | Conversaciones de WhatsApp/Messenger iniciadas desde el anuncio | `extractMessages()` — toma una sola categoría de `actions[]` por prioridad (`messaging_conversation_started_7d` > `total_messaging_connection` > `messaging_first_reply` > `whatsapp_message`) para no contar la misma conversación dos veces | Cielo (detalle por marca/campaña/anuncio) |
| **Inversión (spend)** | Gasto en pesos/reales de la cuenta, marca, campaña o anuncio | Suma directa del campo `spend` de Meta Insights | Cielo + SP (resumen) |
| **CPL (costo por lead)** | Cuánto cuesta cada mensaje/lead | `spend / mensajes` — se calcula al vuelo, no se guarda | Cielo + SP (resumen) |
| **Impresiones** | Veces que se mostró el anuncio | Campo `impressions` de Meta Insights | Cielo (detalle) |
| **Clics** | Clics en el anuncio | Campo `clicks` de Meta Insights | Cielo (detalle) |

Desglose disponible hoy: por cuenta, por marca (vía filtro de prefijo de campaña), por
campaña, por anuncio (excursión), y serie mensual del año en curso.

---

## Qué le importa a Cielo (a completar)

_Pendiente — ir completando acá qué métricas adicionales o vistas necesita Cielo para
su trabajo día a día que hoy el CRM no muestra (ej: comparativas entre marcas, alertas
de cuentas pausadas, tendencias semana a semana, etc.)._

## Qué le importa a la empresa / SP (a completar)

_Pendiente — SP necesita una vista más curada/resumida, no el mismo nivel de detalle
operativo que Cielo. Definir acá qué subconjunto de métricas y con qué frecuencia
(¿resumen semanal? ¿solo totales por marca? ¿comparado contra objetivo?). Esto alimenta
directamente la tabla `sp_visible_metrics` del plan de arquitectura — lo que se decida
acá es lo que Cielo puede prender/apagar para el rol `viewer`._

---

## Notas

- Ninguna métrica de esta lista es definitiva. El objetivo de este archivo es que
  agregar una métrica nueva sea agregar una fila acá + una columna en Supabase, no
  rearmar el sistema.
- El histórico mensual hoy se recalcula en cada carga de página (12 llamadas a la API
  por cuenta) — con el nuevo pipeline en Supabase, ese histórico queda guardado y deja
  de depender de la ventana que permite consultar Meta.
