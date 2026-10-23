# Plan: Canales oficiales de Meta para todas las marcas (WhatsApp API + Facebook + Instagram + Magda/Sasha)

Fecha: 2026-10-14. Responsable: Cielo. Apoyo técnico: agente `meta-technical-architect` (solo lectura) + Claude.
Depende de: Luciano (Chatwoot, borrado de instancias), carga del método de pago (Centro de Reservas).

## Estado de partida (verificado 2026-10-14)
Números WhatsApp API que entregan: Rafting (Adventure, Bariloche, Villegas 2, Patagonia, Valle del Manso) y Turismo Patagonia (Turismo Patagonia, Turismo Bariloche, Adventure Center, Bariloche Excursiones, Patagonia Booking, Passeios, Tur Central). Centro de Reservas: registrado pero bloqueado por pago (141006).
Servidores: app Rafting Mensajeria → s1; app mensajeria-turismopatagonia → s2. Sobrantes: 6 números libres (2 por falla de Tuenti, 2 chips sin activar y otros sin asignar).

## Fase 0 — Inventario (solo lectura, se puede hacer ya)
0.1 Qué marcas tienen campañas con gasto en los últimos 7 días (Windsor.ai) → marcas "activas en campañas" vs "no activas".
0.2 Tabla por marca: Página de Facebook, cuenta de Instagram, número WhatsApp API, instancia/servidor Evolution, bandeja Chatwoot, portafolio, quién responde (Magda/Sasha/persona).
0.3 Marcas nuevas que publican (Páginas/Instagram con actividad reciente) y NO tienen WhatsApp.
Salida: planilla/tabla única en `contexto/tm/meta-ads/` (decidir ubicación).

## Fase 1 — Marcas NO activas en campañas, con WhatsApp API ya levantado (hacer primero)
Sin riesgo de cortar mensajes de campaña. Por marca:
1. Vincular el número a la Página de Facebook (y a la cuenta de Instagram si corresponde).
2. Completar el perfil de WhatsApp Business (foto, descripción, dirección, sitio, categoría) — ver ref 14/15 de la skill.
3. Botón de WhatsApp en la Página y en Instagram.
4. Mensajes automáticos de Meta Business Suite (saludo/ausencia/respuestas rápidas) coherentes con el canal oficial.
5. Verificar con prueba de envío + prueba de entrada.

## Fase 2 — Marcas ACTIVAS en campañas (NO tocar hasta que Chatwoot esté listo)
Riesgo: al conectar el número API a la Página, el número actual por QR/Baileys deja de recibir los mensajes de campaña → desfase.
Condiciones para hacer el corte (todas): instancia API en el servidor correcto, bandeja de Chatwoot enlazada, Magda/Sasha probada contra esa bandeja, ventana de baja demanda, plan de vuelta atrás. Tarea de Luciano = condición previa.

## Fase 3 — Marcas nuevas sin WhatsApp (asignar los 6 números libres)
Por marca: elegir número → cargar en la WABA correcta → registrar por API con PIN (receta ref 14) → instancia en el servidor de la app → Chatwoot → Fase 1. Resolver antes los 2 números con falla de Tuenti y los 2 chips sin activar.

## Fase 4 — Vincular las marcas nuevas entre sí en Meta Business
Portafolio, Páginas, Instagram, cuentas publicitarias, Pixel/Dataset, WABA, roles y usuario del sistema. Revisar verificación del negocio y cupo de números por WABA (límite 2 hasta verificar, 20 después).

## Fase 5 — Proyecto aparte: Magda/Sasha respondiendo en Instagram y Messenger
Antecedente: memoria `project_automatizacion_instagram_dm.md` (arquitectura pendiente).
Opciones a evaluar (⚠️ no verificadas en esta sesión): A) canales de Facebook/Instagram de Chatwoot, de modo que Magda/Sasha respondan por la misma bandeja que hoy usan; B) webhook directo a n8n. Requisitos de Meta a verificar en doc oficial: permisos de mensajería, App Review/acceso avanzado, ventana de 24 h, etiqueta de agente humano.

## Orden recomendado
Fase 0 → Fase 1 (en paralelo con Luciano en Chatwoot) → Fase 3 y 4 → Fase 2 (cuando Chatwoot esté listo) → Fase 5.

## Decisiones que necesito de Cielo
1. Lista oficial de marcas (¿las 14 actuales + cuáles nuevas?).
2. Para cada marca: ¿se publica hoy en Facebook/Instagram? ¿tiene campañas activas?
3. Permiso para leer Páginas/Instagram con un token de usuario (permisos de administración de negocio y Páginas) cargado por vos en el Explorador.
4. Prioridad entre Fase 3 y Fase 5.

## Actualización 2026-10-14 (tarde): datos del agente interno de Cielo + cruce con lo verificado
**Fuente externa (agente de WhatsApp de la empresa, lee Pb2 y la agenda de publicaciones; NO verificado por mí):** 15 marcas con número en Pb2, 32 cuentas que publican, 17 cuentas que publican sin WhatsApp.
**Cruce con datos verificados hoy:**
- Los números de Pb2 son los **viejos/QR** en varias marcas; los números API verificados son otros. Coinciden (mismo número) en: Tur Central (499-7139), Rafting Adventure (499-9807), Rafting Patagonia (431-2589), Valle del Manso (491-3435), Passeios (459-2466). **Difieren** en: Turismo Bariloche (Pb2 …957959 vs API 499-6164), Bariloche Excursiones (…156000 vs 499-7238), Patagonia Booking (…601440 vs 499-8165), Turismo Patagonia (…150596 vs 499-9032), Adventure Center (…510300 vs 499-9806), Centro de Reservas (…995267 vs 489-9310), Rafting Bariloche (…611810, ya borrado, vs 499-9094 nuevo), Rafting Villegas (…244428, viejo, vs 499-7723 nuevo). Cabalgatas Bariloche (…999800) y TB Brasil (…898720, QR en s2) sin número API verificado. → **Decidir por marca cuál es el canal oficial y actualizar Pb2 y la planilla "Accesos"** (Pb2 no se toca desde este workspace).
- **Campañas:** el agente lista activas Rafting Bariloche, Villegas, Valle y Centro de Reservas (marcó "a confirmar"). La plataforma Supabase (sync 2026-10-14) muestra ACTIVAS con gasto: Turismo Bariloche, Centro de Reservas, Valle del Manso, Patagonia Booking, Turismo Patagonia, Tur Central, Rafting Patagonia y Rafting Villegas; **Rafting Bariloche figura PAUSADA** (gastó $148k en 7 días). Usar la de Supabase.
**17 cuentas sin WhatsApp (hipótesis de agrupación por nombre, a confirmar):** 
- Rafting (7 cuentas: @rafting._booking, @rafting.manso, @raftinglimite, @raftinglimaybariloche, @argentina.raftingbariloche, @raftinglight, @raftingdelmanso): parecen variantes de las 5 marcas de rafting que ya tienen número → reutilizar esos números, no sumar nuevos.
- Líneas sin número que sí necesitarían uno (6): Velero (@velerobarilocheok), Traslados (@transfer.brc, @trasladosbarilocheok), Navegación (@navegacionbariloche, @navega.com.ar, @navegabariloche, @navegacionar), Excursiones (@excursionesbarilocheok), Buceo (@buceobarilocheok), Cabalgatas Patagonia (@cabalgataspatagonia). Coincide con los 6 números libres, pero es inferencia por nombre.

## Decisión de la empresa (informada por Cielo 2026-10-14): 2 números por marca
- **Modelo general:** cada marca tendrá **2 números**: el número **conectado a WhatsApp API** = canal oficial de **WhatsApp y campañas**; el número que tenía hasta ahora (QR/Business) pasa a usarse **para llamadas**.
- **Excepción (1 solo número, migración Business → API ya hecha y flujo completo funcionando):** Rafting Valle del Manso (RVDM), Rafting Patagonia (RP), Tur Central (TC), Rafting Adventure (RA). Un solo número conectado a la API y el chip queda en el celular.
**Efecto en el plan:**
- Las 4 marcas de la excepción **ya están hechas** (aunque RVDM, RP y TC tengan campañas activas): no esperan corte.
- **Siguen esperando corte (campaña activa + falta Chatwoot/Magda):** Turismo Bariloche, Centro de Reservas, Patagonia Booking, Turismo Patagonia, Rafting Villegas.
- **Etapa 1 (sin campaña activa):** Adventure Center, Bariloche Excursiones, Passeios Bariloche y Rafting Bariloche (pausada, confirmar).
- **Resuelve "cuál es el canal oficial":** el número API = WhatsApp/campañas; el viejo = llamadas. Falta reflejarlo en Pb2, en la planilla "Accesos" (agregar columna "número de llamadas") y en las Páginas (teléfono/botón de llamar vs botón de WhatsApp).
**Puntos a decidir (riesgo):** (1) qué pasa con los clientes que sigan escribiendo por WhatsApp al número viejo (respuesta automática que derive al número API, o mantener la conexión QR un tiempo); (2) si las instancias por QR de los números viejos se mantienen o se dan de baja; (3) si las 6 líneas nuevas también necesitan 2 números cada una (serían 12).

## Etapa 1 — notas de ejecución (2026-10-14)
- **Adventure Center:** Cielo no tiene acceso al portafolio de la Página original (cuenta perdida) → **creó una Página de Facebook nueva**. Pendientes: (a) confirmar en qué portafolio quedó la Página nueva (debe ser el mismo de su cuenta de WhatsApp, Turismo Patagonia, para poder vincular el número); (b) vincular el Instagram `@adventurebariloche` a la Página nueva; (c) vincular el número API (+54 9 294 499-9806, phone `1309610112246051`); (d) recuperar o dar de baja la Página vieja (pedido de acceso / reclamo a Meta) para evitar duplicados y perder seguidores.
- **Chequeo del botón de WhatsApp de la fan page (para TODAS las marcas, cuando el número esté conectado a Chatwoot):** abrir la Página desde un celular → tocar el botón de llamada a la acción → debe abrir chat con el **número API** (no el de llamadas) → el mensaje debe aparecer en Chatwoot y Magda/Sasha debe responder. Hacerlo recién con el número ya enlazado a Chatwoot.

**Corrección de Cielo (2026-10-14):** las marcas que comparten **un solo número** para WhatsApp API y llamadas son **Tur Central, Rafting Valle del Manso, Rafting Adventure y Passeios Bariloche** (Passeios: número +54 9 294 459-2466, coincide con Pb2). *Rafting Patagonia* figuraba antes en esa lista y ahora no se la nombró → **confirmar si también es de un solo número**. Passeios sigue en la Etapa 1 (sin campaña activa): falta vincular número a Página/Instagram, perfil y botón.
**Aclaración (Cielo, 2026-10-14):** sobre Rafting Patagonia dijo que no sabe si ya lo había mencionado → se **asume de un solo número** (estaba en su primera lista junto a TC, RVDM y RA). Lista final provisional de 1 solo número: Tur Central, Valle del Manso, Rafting Adventure, Rafting Patagonia y Passeios. Reconfirmar con Cielo antes de tocar Páginas.

## Etapa 6 — Marcas nuevas, seguridad de Instagram, Google Maps y datos de contacto (pedido de Cielo 2026-10-15)
**Tareas:** (a) revisar las marcas nuevas ya creadas en Facebook e Instagram; (b) conectarlas entre sí (Página ↔ Instagram ↔ portafolio ↔ WhatsApp ↔ cuenta publicitaria); (c) activar autenticador (2FA por app) en las cuentas de Instagram; (d) relevamiento de Google Maps; (e) revisar los datos de contacto en redes de TODAS las marcas.
**Orden propuesto:**
1. **Fuente de verdad:** exportar la pestaña INFORMACION MARCAS de la planilla "Accesos" (72 filas) y agregar columnas: número WhatsApp API, número de llamadas, Página FB, ID Instagram, portafolio.
2. **Inventario de marcas nuevas:** las 17 cuentas que publican sin WhatsApp (lista del agente interno) + Páginas/Instagram creadas; qué está en qué portafolio. Requiere token de usuario con permisos de Páginas/Instagram.
3. **Conexión entre sí**, en este orden: Página al portafolio → Instagram al portafolio → conectar Instagram a la Página → vincular número de WhatsApp → cuenta publicitaria. (Error visto: "No se pudo agregar tu página y cuenta de Instagram a una cuenta comercial" = primero meter la Página al portafolio y luego conectar Instagram.)
4. **2FA en Instagram (hace Cielo/equipo, requiere sesión de cada cuenta):** usar app de autenticación (no SMS), guardar códigos de recuperación en un gestor de contraseñas con acceso compartido y controlado, coordinar con las personas que operan cada cuenta (CM) para no cortarles el acceso.
5. **Datos de contacto y Google Maps:** tabla por marca con nombre, dirección, teléfono (llamadas), WhatsApp (API), email, web y Linktree, comparada entre Facebook, Instagram, TikTok, YouTube, Google Maps y la web. Depende de la decisión de "2 números por marca". Skills disponibles: seo-local / seo-maps.
**Pendiente diferido por Cielo (2026-10-15):** investigación de pérdida de mensajes entrantes de Tur Central entre Evolution s2 y Chatwoot (29 en Evolution vs 9 en Chatwoot desde el 14/10 13:49) y lista de clientes sin respuesta. Retomar: mirar registros de s2 por errores de Chatwoot, prueba controlada de 5 mensajes y armar la lista (archivo fuera del repo).

### Hallazgos 2026-10-15 (revisión de webs y Maps de marcas principales + Rafting)
**Webs (curl, solo lectura):** http→https y www→dominio OK (1 redirección, 200) en: barilocheexcursiones.com.ar, turismobariloche.ar, centroreservasbariloche.com, turismopatagonia.ar, turcentral.com.ar, passeiosbariloche.com, raftingadventure.com, raftingbariloche.ar, raftingpatagonia.com, raftingvalledelmanso.com. **Con problema:** adventurecenter.com.ar (`https://www.` no responde), **patagoniabooking.com (http NO redirige a https; `https://www.` no responde)**, raftingvillegas.com (`https://www.` no responde). Causa no determinada (DNS de www o certificado).
**Google Maps (lista de Cielo, cuentas pmc y Pm07):** duplicados: Rafting Adventure Bariloche (Quaglia 266), Rafting Bariloche (Mitre 405), Zirosha (Mitre 250, Pm07); Navegación Bariloche en las dos cuentas (Mitre 339 L1); Turismo Bariloche con 2 fichas verificadas (Mitre 339 y Mitre 83). Dirección distinta de la planilla: Bariloche Excursiones en Maps = Moreno 30 (planilla: Mitre 83, oficina A); Rafting Valle del Manso en Maps = Moreno 30 dto A. Sin ficha vista: Passeios, Patagonia Booking, Rafting Villegas (separada), Cabalgatas, Excursiones Bariloche, Kayak Travesía, Navegación AR/Patagonia, TB Brasil. "Zirosha" no figura entre las 14 marcas (preguntar). Propuesta: consolidar en un solo dueño con varios administradores.
**Planilla del equipo "Progreso de Marcas I":** columna "Whatsapp API" figura FALSE en todas las marcas vistas (desactualizada); "Meta business Facebook/Instagram" FALSE; "Maps" TRUE solo en Bariloche Excursiones y Centro de Reservas.
