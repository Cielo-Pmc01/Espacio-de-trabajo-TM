# Modelo mental del CRM Meta Ads — revisado con Cielo

**Última revisión:** 2026-06-24
**Estado:** ✅ Validado por Cielo — base para implementar filtros dinámicos en el CRM

---

## Jerarquía de estructuras

```
Business Portfolio (BM)
  └── Cuenta Publicitaria (Ad Account)
        └── Campaña (Campaign)
              └── Conjunto de Anuncios (Ad Set)
                    └── Anuncio (Ad)
```

El CRM fetchea en nivel **cuenta** (para totales generales) y **anuncio** (para el drawer de cada marca). El nivel campaña se usa solo para identificar a qué marca pertenece cada anuncio.

---

## Los Business Portfolios

| Portfolio | Cuentas dentro |
|-----------|----------------|
| turcentralpatagonia | Sergio ADC (…6931) + Ale Sopran (…3716) |
| rafting adventure | Rafting Adventure (…4230) |
| Portafolio Brasil | Alex Sopran BR (…1194) |

Cada portfolio tiene su propio **System User Token** (permanente, no expira). Por eso son 3 tokens para 4 cuentas.

---

## Las 4 cuentas publicitarias

Se identifican por los **últimos 4 dígitos** del ID completo.

| Cuenta | ID completo | ID corto | Moneda | Estado real |
|--------|-------------|----------|--------|-------------|
| Sergio ADC | 585100972496931 | **6931** | ARS | ⛔ Desactivada (falta de pago) |
| Ale Sopran | 946831613383716 | **3716** | ARS | ✅ Activa |
| Alex Sopran BR | 681859433781194 | **1194** | BRL | ✅ Activa |
| Rafting Adventure | 488232131974230 | **4230** | ARS | ⏸ Pausada (invierno) |

---

## Las marcas — abreviaciones, prefijos de campaña y cuentas

### Marcas argentinas (cuentas 6931 y/o 3716)

| Marca | Abrev. | Prefijo campaña | Cuenta(s) |
|-------|--------|----------------|-----------|
| Turismo Bariloche | TB | `TB` | 6931 |
| Centro de Reservas | CDR | `CDR` | 6931 |
| Bariloche Excursiones | BE | `BE` | 6931 |
| Turismo Patagonia | TP | `TP` | 6931 + 3716 |
| Tur Central | TC | `TC` | 6931 + 3716 |
| Adventure Center | ADV / ADVC | `ADV` / `ADVC` | 6931 |
| Patagonia Booking | PB | `PB` | 6931 + 3716 |
| Cabalgatas Bariloche | CB | `CB` | 6931 |
| General | General | `General` | 6931 |

> **General:** campañas que hablan de venir a Bariloche, vacaciones en Patagonia — no apuntan a una excursión específica. Puede ser para mensajes o interacciones en redes.

### Marcas Brasil (cuenta 1194)

| Marca | Abrev. | Prefijo campaña | Cuenta |
|-------|--------|----------------|--------|
| TB Brasil | TB BR | `TB` | 1194 |
| Passeios Bariloche | Pass | `Pass` / `Passeios` | 1194 |
| Patagonia Booking (Brasil) | PB | `PB` | 1194 |

> **TB vs TB BR:** El prefijo `TB` en cuenta **1194** = TB Brasil. El mismo prefijo `TB` en cuenta **6931** = Turismo Bariloche Argentina. El contexto (cuenta) determina la marca.

### Marcas Rafting (cuenta 4230)

| Marca | Abrev. | Prefijo campaña |
|-------|--------|----------------|
| Rafting Adventure | RA | `RA` |
| Rafting Valle del Manso | RVDM | `RVDM` |
| Rafting Patagonia | RP | `RP` |
| Rafting Villegas | RV | `RV` |
| Rafting Bariloche | RB | `RB` |
| Rafting Limay | RL | `RL` |

> Todas pausadas en temporada invierno. Rafting Limay es la sexta marca de rafting.

---

## Cómo el CRM separa marcas que comparten cuenta

Cuando varias marcas corren en la misma cuenta, el CRM fetcha todos los anuncios de esa cuenta con el nombre de la campaña y filtra por prefijo:

```
Cuenta 1194 (Brasil):
  campaña "TB mensajes..."     → TB Brasil
  campaña "passeios - Copia"   → Passeios Bariloche
  campaña "PB Arg..."          → Patagonia Booking

Cuenta 6931 (Sergio ADC):
  campaña "TB mensajes..."     → Turismo Bariloche (Argentina)
  campaña "CDR interaccion..." → Centro de Reservas
  campaña "TP mensajes..."     → Turismo Patagonia
  etc.
```

---

## Datos que trae la API

**Por cuenta** (totales del período):
- `spend` · `impressions` · `clicks` · `actions[]`

**Por anuncio** (para el drawer de cada marca):
- `name` · `status` · `campaign.name` (para filtrar marca) · `insights` con las mismas métricas

**Períodos disponibles:**

| Nombre en CRM | Preset API | Estado actual |
|---------------|-----------|--------------|
| Hoy | `today` | ✅ Dinámico |
| Últimos 7 días | `last_7d` | ✅ Dinámico |
| Este mes | `this_month` | ✅ Dinámico |
| 2026 YTD | `this_year` | 🔄 A implementar dinámico |

---

## Mensajes — cómo se cuentan

Meta registra cada conversación bajo múltiples categorías a la vez. El CRM toma una sola categoría por conversación (la más específica que tenga valor > 0) para no contar el mismo mensaje varias veces.

---

## Pendientes en el código

1. ✅ Cuenta 1194 (Brasil): TB Brasil, Passeios y PB ya tienen filtros dinámicos
2. ✅ Cuentas 6931 y 3716: filtros de campaña para todas las marcas argentinas implementados
3. ✅ Cuenta 4230: las 6 marcas de Rafting separadas (RA, RB, RV, RP, RVDM, RL) — implementado 2026-06-29
4. ✅ YTD: dinámico en PERIODS (`this_year` equivale a since=YYYY-01-01 calculado en runtime)
5. 🔄 UI: mostrar últimos 4 dígitos del ID de cuenta (mejora visual, no es blocker)
6. 🔄 Deploy: el CRM se sirve localmente. Pendiente publicar en servidor.
