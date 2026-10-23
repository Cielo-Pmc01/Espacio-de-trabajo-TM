# Revisión de datos de marcas (principales + Rafting) — 2026-10-15

Fuente oficial: planilla "Accesos" de Cielo, pestaña INFORMACION MARCAS (leída 2026-10-15, solo esa pestaña). Comparada con el relevamiento de Google Maps de Cielo (cuentas pmc y Pm07), con la API de Meta (números) y con la revisión de webs (curl).

## 1. Dirección: planilla (oficial) vs Google Maps
| Marca | Planilla | Maps | Resultado |
|---|---|---|---|
| Adventure Center | Mitre 83 | Mitre 83 (verificada) | ✅ |
| Bariloche Excursiones | Mitre 83, oficina A | Moreno 30 (verificada) | ❌ distinta |
| Turismo Bariloche | Mitre 83, oficina A | Mitre 339 (verificada) y Mitre 83 (verificada) | ⚠️ 2 fichas; una con dirección distinta |
| Centro de Reservas | Mitre 131 | "Mitre Centro 133" (verificada) | ❌ 131 vs 133 |
| Turismo Patagonia | mitre 415 | Mitre 79 (Pm07, verificada) | ❌ distinta |
| Patagonia Booking | Mitre 131 | sin ficha | ❌ falta |
| Tur Central | Mitre 252 | Mitre 252 (verificada) | ✅ (Zirosha usa la misma dirección) |
| Passeios Bariloche | (vacía) | sin ficha | ❌ falta dirección y ficha |
| Rafting Adventure | Mitre 83, oficina A | Quaglia 266 (DUPLICADO) y Base Límite Ruta 83 km 23 (verificada) | ⚠️ |
| Rafting Bariloche | Mitre 83, oficina A | Mitre 83 Ofi A (verificada) y Mitre 405 (DUPLICADO) | ✅ + duplicado a eliminar |
| Rafting Patagonia | Ruta 82, km 23 | Ruta 82 Km 1, Río Villegas (verificada) | ❌ km 23 vs km 1 |
| Rafting Valle del Manso | Mitre 131 | Moreno 30, dto A (verificada) | ❌ distinta |
| Rafting Villegas | Moreno 28 | sin ficha | ❌ falta |
Otras fichas en Maps sin marca clara en la planilla: Zirosha (Mitre 252 y Mitre 250 duplicada), Patagonia Ski Center (Mitre 417, procesando), Navegación Bariloche (Mitre 339 L1, en las dos cuentas; la planilla no tiene dirección).

## 2. Números: planilla vs API verificada (WhatsApp)
Coinciden con la API verificada: Adventure Center 499-9806, Bariloche Excursiones 499-7238, Turismo Bariloche 499-6164, Centro de Reservas 489-9310, Passeios 459-2466, Turismo Patagonia 499-9032, Patagonia Booking 499-8165, Tur Central 499-7139, Rafting Adventure 499-9807, Valle del Manso 491-3435, Rafting Patagonia 431-2589, Rafting Villegas 499-7723, Rafting Bariloche 499-9094.
⚠️ **Rafting Adventure:** la columna "Número" dice 5492944705850, distinto del número API 499-9807 (Cielo dijo que es de un solo número). Confirmar qué es …705850.
Columna "Número" = número de llamadas/anterior (AC …510300, BE …156000, TB …957959, CDR …995267, TP …150596, PB …601440, Villegas …244428, Rafting Bariloche …611810).

## 3. Webs (curl)
OK: todas salvo — patagoniabooking.com (http no redirige a https; https://www sin respuesta), adventurecenter.com.ar (https://www sin respuesta), raftingvillegas.com (https://www sin respuesta; la planilla la tiene con http://).

## 4. Datos faltantes en la planilla (principales/Rafting)
Passeios: dirección. TB Brasil: sin número API. Rafting Adventure: dirección en Mitre 83 oficina A, revisar contra Maps.
