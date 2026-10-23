# Activos de Meta Ads (verificado con el MCP el 2026-10-22)

Re-verificar con `ads_get_ad_accounts` y `ads_get_user_pages` antes de usar: puede haber cambiado.

## Cuentas publicitarias
| ID | Nombre / portafolio | Moneda | Estado | Pago | MCP |
|---|---|---|---|---|---|
| 585100972496931 | Sergio ADC — Turismo Patagonia | ARS | ACTIVE | Sí | Sí |
| 946831613383716 | Ale Sopran — Turismo Patagonia | ARS | ACTIVE | Sí | Sí |
| 681859433781194 | Alex Sopran BR — Turismo Patagonia | BRL | ACTIVE | Sí | Sí |
| 10020498901314306 | Adventure Center — turcentralpatagonia | ARS | ACTIVE | **No** | Sí |
| 106276119709880 | Sin nombre ni portafolio | ARS | ACTIVE | Sí | Sí |
| 1264845594170437 | rafting adventure | USD | ACTIVE | **No** | Sí |
| 488232131974230 | Rafting Adventure | ARS | **UNSETTLED** | Sí | No consultable |
| 2019411605622000 | Turismo Patagonia | USD | ACTIVE | **No** | **No habilitada** (rollout de Meta) |

## Páginas de Facebook por marca (link = facebook.com/ID)
⚠️ = hay más de una Página parecida; falta definir cuál es la oficial.

| Marca | Página (ID) |
|---|---|
| Adventure Center ⚠️ | Adventure Center `107514092918776` / AdventureCenter `1337793629424360` |
| Bariloche Excursiones ⚠️ | `102372081151184` / Barilocheexcursiones `1305971872601679` |
| Turismo Bariloche | `102178264504118` (antes figuraba sin dueño; ahora aparece con permiso de anunciar — verificar) |
| Turismo Bariloche BR | `104172466066023` |
| Centro de Reservas | Centro Reservas Bariloche `107534265744455` |
| Passeios Bariloche | `106726088413756` |
| Turismo Patagonia ⚠️ | `112719105152138` / Turismo Patagonia AR `539115872611964` |
| Patagonia Booking ⚠️ | `648869234987137` / Patagoniabooking `107319397314798` / Patagonia Booking BR `102567956228350` |
| Tur Central | turcentralpatagonia `109290265276027` |
| Rafting Adventure | `314331365346570` |
| Rafting Valle del Manso | `112823687515422` |
| Rafting Patagonia ⚠️ | `104367591756922` (duplicadas: `758990473962694`, `776655395531617`) |
| Rafting Villegas | `110106108818622` |
| Rafting Bariloche | `104767571731804` |
| Rafting Limay ⚠️ | `109606601899672` / `1417584831435389` |
| Rafting Light.com ⚠️ | `104356312733879` / `1364056920124165` |
| Rafting del Manso | `1286250194563701` |
| Rafting Manso | `1401050469755826` |
| Rafting Booking | `1424040387448154` |
| Rafting Argentina | `1386105187917171` |
| Rafting Rio Manso | `838729352657147` |
| Rafting Límite | `1405946025931229` |
| Bariloche Booking | `115072848316729` |
| Cabalgatas Bariloche ⚠️ | `101588523015954` / Cabalgatasbariloche `106620402130920` |
| Cabalgatas Patagonia | `104487129312226` |
| Kayak Travesía Bariloche | `104202369079935` |
| Navegación AR | `1370366369491730` |
| Navegación Bariloche | `106365565491458` |
| Navegación Patagonia | `104151526086725` |
| Ski Bariloche | `100884026419308` |
| Transfer Bariloche | `1326016760603214` |
| Traslados Bariloche | `1324958257373905` |
| Velero Bariloche | `1404036426122987` |
| Buceo Bariloche | `1434674936390376` |
| Canopy Patagonia | `1455894237598382` |
| Navega Bariloche | `1412818935254044` |
| Navega.com.ar | `1387314864465229` |
| Excursiones Bariloche | `1363285596872437` |

## Pendiente de verificar
- Qué cuenta publicitaria corresponde a cada marca (hoy no está mapeado; existe la tabla `meta_ads.brand_meta_mapping` en Supabase).
- Pixel/dataset de cada marca (Turismo Bariloche perdió el Pixel el 14/9).
- Qué Páginas tienen permiso de anunciar en cada cuenta (`ads_get_ad_account_pages`).
