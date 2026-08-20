# Chatwoot — Documentación Completa del Sistema

> CRM de atención al cliente de Adventure Center vía WhatsApp.
> **Sistema crítico de la empresa.**
> Última actualización: 2026-06-19

---

## Instalación y Configuración

| Dato | Valor |
|---|---|
| **Versión** | v4.14.0 |
| **Hosting** | Dokploy — servidor `72.60.149.227` |
| **URL actual** | `iadventurecenter.com` |
| **URL nueva (migrando)** | `iadventurecentersx.com` |
| **Account ID** | 1 |
| **API Token** | `EaxPXr92jfEGQvbeTSG3snVv` |
| **Docker Compose** | `salidas/Chatwoot#3/docker-compose.yml` |
| **Admin login** | `admin014@iadventurecenter.com` |

### Modificaciones Custom
- **Branding propio** → `../files/custom-branding/` (logo, colores)
- **Favicons personalizados** → `../files/favicons/` (16x16, 32x32, 96x96)
- **`zzz_plan_lock.rb`** → desbloquea features de plan Enterprise sin costo
- **PostgreSQL con pgvector** → extensión de vectores habilitada para IA/RAG
- **`init-vector.sql`** → script de inicialización de la extensión vector

### Servicios Docker
| Servicio | Imagen | Puerto |
|---|---|---|
| chatwoot-rails | chatwoot/chatwoot:v4.14.0 | 3000 |
| chatwoot-sidekiq | chatwoot/chatwoot:v4.14.0 | — |
| chatwoot-postgres | pgvector/pgvector:pg14 | — |
| chatwoot-redis | redis:alpine | — |

---

## Bandejas de Entrada (38 total)

### Channel::Api — Evolution API / WhatsApp (31)
Todas con auto-asignación activada salvo las indicadas.

| ID | Nombre | Auto-assign |
|---|---|---|
| 64 | 01 - VENTAS POR CAPTURAR | ✅ |
| 42 | 02 Turismo Bariloche - VA | ✅ |
| 23 | 10 Turismo Central | ✅ |
| 66 | 244428 Rafting Villegas | ✅ |
| 43 | 5267 Centro de Reservas | ✅ |
| 65 | 5492944156245 RAD | ✅ |
| 54 | 7729 - Rafting Adventure | ✅ |
| 41 | AA - Asistencias y Reclamos | ❌ |
| 16 | Adventure Center | ✅ |
| 9 | Bariloche Excursiones | ✅ |
| 74 | Cabalgatas Bariloche | ✅ |
| 45 | Cabalgatas Patagonia | ✅ |
| 13 | Centro de Reservas | ✅ |
| 39 | Diez Turismo Central | ✅ |
| 29 | Mesa Operativa | ❌ |
| 15 | Navegación Bariloche | ✅ |
| 44 | Navegación Patagonia | ✅ |
| 60 | Passeios Bariloche Official | ✅ |
| 10 | Patagonia Booking | ✅ |
| 82 | Patagonia Booking Reservas ENG | ✅ |
| 11 | Rafting Adventure | ✅ |
| 14 | Rafting Bariloche AR | ✅ |
| 38 | Rafting Patagonia | ✅ |
| 37 | Rafting Valle Del Manso | ✅ |
| 69 | Soporte Interno | ✅ |
| 2 | Tur Central | ✅ |
| 4 | Turismo Bariloche | ✅ |
| 83 | Turismo Bariloche BR 8720 | ✅ |
| 62 | Turismo Bariloche Master 01 | ✅ |
| 61 | Turismo Bariloche Master suc 02 | ✅ |
| 73 | Turismo Central DZ | ✅ |
| 12 | Turismo Patagonia | ✅ |

### Channel::Whatsapp — WhatsApp Business Nativo (1)

| ID | Nombre | Teléfono |
|---|---|---|
| 71 | Navegación Bariloche Official | +5492944918215 |

### Channel::WebWidget — Chat en Sitio Web (7)

| ID | Nombre | Mensaje de bienvenida |
|---|---|---|
| 78 | (Web) - Adventure Center | "Bienvenido a Tur Central" |
| 76 | (Web) - Bariloche Excursiones | "Hola! Estamos para ayudarte" |
| 81 | (Web) - Centro de Reservas | "Centro de Reservas esta para ayudarte" |
| 80 | (Web) - Passeios Bariloche | "Olá! Sejam bem-vindos à Passeios Bariloche" |
| 77 | (Web) - Patagonia Booking | "Hola! El equipo de Patagonia Booking esta para atenderte." |
| 75 | (Web) - Tur Central | "¡Hola! Consulta por nuestro chat en vivo" |
| 79 | (Web) - Turismo Bariloche | "El equipo de Turismo Bariloche esta para ayudarte" |

---

## Agentes (165 total)

### Administradores Activos
| ID | Nombre | Email |
|---|---|---|
| 1 | ADVENTURE CENTER | gi.gothic@gmail.com |
| 9 | Alejandro Sopranzi SADM | alejandrosopranzi@icloud.com |
| 39 | Andres Programm | iadventurecenter02@gmail.com |
| 41 | ASISTENCIA INTERNA | asistencia@iadventurecenter.com |
| 148 | Cecilia SP 004 | admin016@iadventurecenter.com |
| 71 | **Cielo** | admin014@iadventurecenter.com |
| 158 | Evelin ADM | admin022@iadventurecenter.com |
| 159 | Giselle ADM | admin023@iadventurecenter.com |
| 12 | Laura ADM01 | admin004@iadventurecenter.com |
| 156 | Laura - MO | admin020@iadventurecenter.com |
| 157 | Lucia - MO | admin021@iadventurecenter.com |
| 62 | **Magda Server Sistem** (bot IA) | info@ckdyd.net |
| 11 | Magui SP 002 | admin001@iadventurecenter.com |
| 84 | PANCHO | vd006@iadventurecenter.com |
| 138 | Pancho - perfil vendedor alterno PB2 | vd060@iadventurecenter.com |
| 151 | Rocio SP 007 | admin019@iadventurecenter.com |
| 150 | Sergio Sopranzi | sopranzisergio@gmail.com |
| 56 | 787823ERROR | 787823error@iadventurecenter.com |
| 145 | Sofia SP 009 | admin015@iadventurecenter.com |
| 36 | Vale ADM | admin009@iadventurecenter.com |
| 8 | WSS | iadventurecenter01@gmail.com |
| 13 | Yami - SP 005 | admin002@iadventurecenter.com |

### Agentes Activos
| ID | Nombre | Email |
|---|---|---|
| 134 | Agustina VP | vd056@iadventurecenter.com |
| 42 | Asistencia/MO | operador01@iadventurecenter.com |
| 66 | Asistencia y Reclamos | vendedor0029@iadventurecenter.com |
| 15 | Desarrollo | vendedor0001@iadventurecenter.com |
| 24 | Florencia M.O | vendedor0010@iadventurecenter.com |
| 130 | Jazmin Larena VP | vd052@iadventurecenter.com |
| 131 | Jazmin Patricelli VP | vd053@iadventurecenter.com |
| 122 | Marianela | vd044@iadventurecenter.com |
| 160 | MAYA ORRICO VP | vd061@iadventurecenter.com |
| 165 | Mesa Operativa - Florencia | admin024@iadventurecenter.com |
| 92 | Milagros VP | vd014@iadventurecenter.com |
| 132 | Noelia Pelussi VP | vd054@iadventurecenter.com |
| 38 | Santiago LT-B3 | vendedor0022@iadventurecenter.com |
| 161 | STIVENZ JIMENEZ VP | vd062@iadventurecenter.com |
| 129 | Tiago Gonzalez B3 | vd051@iadventurecenter.com |
| 125 | Tomas F-B3 | vd047@iadventurecenter.com |
| 96 | USER | vd018@iadventurecenter.com |
| 47 | Vanesa VP | operador06@iadventurecenter.com |
| 18 | vendedor0004 | vendedor0004@iadventurecenter.com |

### Agentes Inactivos (OFF) — ~126 agentes
| ID | Nombre | Email |
|---|---|---|
| 55 | OFF Agustina | operador14@iadventurecenter.com |
| 70 | OFF Agustina | vendedor0033@iadventurecenter.com |
| 117 | OFF Agustina | vd039@iadventurecenter.com |
| 81 | OFF Agustina Lowy | vd003@iadventurecenter.com |
| 108 | OFF Agustina Malchuk | vd030@iadventurecenter.com |
| 80 | OFF Antonella | vd002@iadventurecenter.com |
| 137 | OFF ANTONELLA VERGARA VP | vd059@iadventurecenter.com |
| 88 | OFF ARIADNA | vd010@iadventurecenter.com |
| 78 | OFF Ariana | operador22@iadventurecenter.com |
| 100 | OFF Ariana Reynolds | vd022@iadventurecenter.com |
| 45 | OFF Asistencia y Reclamos | operador04@iadventurecenter.com |
| 61 | OFF AUDITORIAS | admin013@iadventurecenter.com |
| 106 | OFF Aylen Micaela Victoriano | vd028@iadventurecenter.com |
| 83 | OFF Barbara | vd005@iadventurecenter.com |
| 135 | OFF Bianca Juarez B3 | vd057@iadventurecenter.com |
| 133 | OFF Brandon Vazquez | vd055@iadventurecenter.com |
| 112 | OFF Brisa | vd034@iadventurecenter.com |
| 54 | OFF Camila Antello | operador13@iadventurecenter.com |
| 93 | OFF Camila Fabre Leon | vd015@iadventurecenter.com |
| 124 | OFF Camila Farina B3 | vd046@iadventurecenter.com |
| 103 | OFF Carla Robert | vd025@iadventurecenter.com |
| 127 | OFF Carlota Soto B3 | vd049@iadventurecenter.com |
| 67 | OFF Catalina | vendedor0030@iadventurecenter.com |
| 49 | OFF Catalina PB | operador08@iadventurecenter.com |
| 113 | OFF Daiana | vd035@iadventurecenter.com |
| 143 | OFF Daiana Flores | operador27@iadventurecenter.com |
| 68 | OFF Daniela | vendedor0031@iadventurecenter.com |
| 52 | OFF Daniela | operador11@iadventurecenter.com |
| 121 | OFF Daniela Jimenez | vd043@iadventurecenter.com |
| 46 | OFF Dariana | operador05@iadventurecenter.com |
| 29 | OFF David | vendedor0015@iadventurecenter.com |
| 94 | OFF Elena | vd016@iadventurecenter.com |
| 31 | OFF Fabian | vendedor0017@iadventurecenter.com |
| 115 | OFF Fabricio | vd037@iadventurecenter.com |
| 119 | OFF Facundo | vd041@iadventurecenter.com |
| 142 | OFF Francisco | operador26@iadventurecenter.com |
| 86 | OFF Gaspar | vd008@iadventurecenter.com |
| 51 | OFF Gregorio ventas | operador10@iadventurecenter.com |
| 59 | OFF GREGO SP003 | admin012@iadventurecenter.com |
| 72 | OFF Guadalupe | operador16@iadventurecenter.com |
| 90 | OFF Ivonne Romero B1 | vd012@iadventurecenter.com |
| 76 | OFF Janaina | operador20@iadventurecenter.com |
| 79 | OFF Jesica B1 | vd001@iadventurecenter.com |
| 136 | OFF Jessica Bruncini B2 | vd058@iadventurecenter.com |
| 74 | OFF Joaquin | operador18@iadventurecenter.com |
| 128 | OFF Joaquin Barciocco B2 | vd050@iadventurecenter.com |
| 32 | OFF Jose | vendedor0018@iadventurecenter.com |
| 110 | OFF Jose Gutierrez | vd032@iadventurecenter.com |
| 73 | OFF Juan | operador17@iadventurecenter.com |
| 85 | OFF Juan P | vd007@iadventurecenter.com |
| 91 | OFF Juan Pablo | vd013@iadventurecenter.com |
| 35 | OFF Julieta ADS | julietstefanini@gmail.com |
| 126 | OFF Karen Villalva B1 | vd048@iadventurecenter.com |
| 147 | OFF Laura 009 | secretariaprivada009@gmail.com |
| 28 | OFF Lucas LT-B3 | vendedor0014@iadventurecenter.com |
| 139 | OFF Lucas Parada | operador23@iadventurecenter.com |
| 53 | OFF Lucia | operador12@iadventurecenter.com |
| 69 | OFF Lucia | vendedor0032@iadventurecenter.com |
| 63 | OFF Lucio | operador15@iadventurecenter.com |
| 114 | OFF Ludmila B1 | vd036@iadventurecenter.com |
| 99 | OFF Maite Alarcón | vd021@iadventurecenter.com |
| 89 | OFF Maite Barria | vd011@iadventurecenter.com |
| 118 | OFF Marco | vd040@iadventurecenter.com |
| 120 | OFF Maria Jimena | vd042@iadventurecenter.com |
| 23 | OFF Maria Jose | vendedor0009@iadventurecenter.com |
| 87 | OFF María José | vd009@iadventurecenter.com |
| 75 | OFF Martin | operador19@iadventurecenter.com |
| 107 | OFF Martina Garcia | vd029@iadventurecenter.com |
| 163 | OFF MATEO MEDRANO B1 | vd064@iadventurecenter.com |
| 164 | OFF MAXIMILIANO FERNANDEZ VP | vd065@iadventurecenter.com |
| 162 | OFF MELANIE CISTERNA VP | vd063@iadventurecenter.com |
| 104 | OFF Melina Fontana | vd026@iadventurecenter.com |
| 37 | OFF Mesa Operativa | mesaoperativa@iadventurecenter.com |
| 111 | OFF Micaela | vd033@iadventurecenter.com |
| 101 | OFF Micaela Amuñaco | vd023@iadventurecenter.com |
| 102 | OFF Monica Prelooker | vd024@iadventurecenter.com |
| 77 | OFF Nadia | operador21@iadventurecenter.com |
| 123 | OFF Nadia PB | vd045@iadventurecenter.com |
| 82 | OFF Nancy Ostermann | vd004@iadventurecenter.com |
| 97 | OFF Nicolas Faviero VP | vd019@iadventurecenter.com |
| 105 | OFF Nicolas Rivero | vd027@iadventurecenter.com |
| 140 | OFF Nico S. | operador24@iadventurecenter.com |
| 146 | OFF Pancho Dev | iadventurecenter04@gmail.com |
| 22 | OFF PB 21 - Jessica M.O | vendedor0008@iadventurecenter.com |
| 58 | OFF PB 32 - Cami | vendedor0026@iadventurecenter.com |
| 95 | OFF PB 35 - Camila | vd017@iadventurecenter.com |
| 44 | OFF Rocio Nievas | operador03@iadventurecenter.com |
| 65 | OFF Rocio Nievas ventas | vendedor0028@iadventurecenter.com |
| 98 | OFF Rodrigo Parón | vd020@iadventurecenter.com |
| 50 | OFF Romina | operador09@iadventurecenter.com |
| 48 | OFF Santiago Delgado | operador07@iadventurecenter.com |
| 149 | OFF Simon SP | admin017@iadventurecenter.com |
| 144 | OFF Simon ventas | operador28@iadventurecenter.com |
| 109 | OFF Sofia | vd031@iadventurecenter.com |
| 16 | OFF Sofi ADM | admin006@iadventurecenter.com |
| 14 | OFF SP 01 | admin005@iadventurecenter.com |
| 141 | OFF Tami | operador25@iadventurecenter.com |
| 116 | OFF Taylor | vd038@iadventurecenter.com |
| 20 | OFF Valentina | vendedor0006@iadventurecenter.com |
| 19 | OFF Vanesa-VL | vendedor0005@iadventurecenter.com |
| 57 | OFF Victoria Scolari | vendedor0025@iadventurecenter.com |
| 64 | OFF Yuliana | vendedor0027@iadventurecenter.com |
| 43 | OFF Yuliana | operador02@iadventurecenter.com |

---

## Equipos (4)

| ID | Nombre |
|---|---|
| 1 | Secretaria privada |
| 2 | Ventas automáticas |
| 3 | Ventas online |
| 4 | Soporte y asistencia |

---

## Etiquetas (63)

### Por mes (tracking temporal)
| Etiqueta | Color |
|---|---|
| enero-2025 | #C9FF1F |
| febrero-2025 | #163194 |
| marzo-2025 | #6E249F |
| abril-2025 | #8E943B |
| mayo-2025 | #22548D |
| junio-2025 | #250967 |
| julio-2025 | #09B4A1 |
| agosto-2025 | #502016 |
| septiembre-2025 | #5F30CF |
| octubre-2025 | #D8EDAD |
| noviembre-2025 | #ECC956 |
| diciembre-2025 | #42B9EB |
| enero-2026 | #68F00A |
| febrero-2026 | #031D85 |
| marzo-2026 | #CEF411 |
| abril-2026 | #AB2D8D |
| mayo-2026 | #96C750 |
| junio-2026 | #D9679D |
| julio-2026 | #AAC926 |
| agosto-2026 | #78F76E |
| septiembre-2026 | #A4EC2C |
| octubre-2026 | #B95ACF |
| noviembre-2026 | #483596 |
| diciembre-2026 | #6E1358 |

### Estado de venta
| Etiqueta | Color |
|---|---|
| venta-cerrada | #29F00F |
| venta-cerrada-perdida | #DDF68B |
| venta-perdida | #142D56 |
| por-reservar | #A72E2D |
| pendiente-de-pago | #3D8906 |
| venta-web | #CB7A31 |

### Proceso / gestión
| Etiqueta | Color |
|---|---|
| darle-seguimiento | #8D127A |
| espera-de-respuesta | #CD7E8A |
| sin-respuesta | #4C4F86 |
| reconectar | #FF0000 |
| cliente-desatendido | #FFC807 |
| auditada | #B3608E |
| intervenir | #FE0808 |
| human-response | #000000 |
| consulta-respondida-x-vendedor | #773630 |
| consulta-por-error | #FA2307 |
| consulta-vacia | #1B74FF |
| atender-x-ww | #522D62 |
| duplicado | #17024E |
| no-usar-por-capturar | #FB95DA |

### Origen
| Etiqueta | Color |
|---|---|
| origen-ads | #3E79BC |
| origen-catalogo | #576AD3 |
| origen-web | #46FE07 |
| origen_instagramcom | #1EF93E |

### Características del cliente
| Etiqueta | Color |
|---|---|
| b1 | #15F07D |
| es-de-bariloche | #A9A88C |
| está-en-bariloche | #4794B1 |
| cliente-repetido | #A6A277 |
| grupo-whatsapp | #20B204 |
| presencial | #C65739 |
| senior | #EC0FDF |
| cv-brasil | #9690D7 |
| agencia | #2CBD87 |
| nueva | #8A1A5A |

### Especiales / administrativas
| Etiqueta | Color |
|---|---|
| logros | #34BE80 |
| comunicacion-interna | #6CBDDC |
| canje | #5ECDF3 |
| sorteo | #5F73C1 |
| recursos-humanos | #8806BA |
| desarrollo | #241717 |

---

## Integraciones

| Integración | Estado | Uso |
|---|---|---|
| **Webhook** | ✅ Activo | Dispara workflows de Magda (n8n) |
| **OpenAI** | ✅ Conectado | IA integrada en Chatwoot |
| **Google Translate** | ✅ Activo | Traducción automática |
| **Dashboard Apps** | ✅ Activo | Paneles embebidos |
| Dialogflow | ❌ Desactivado | — |
| Dyte (videollamadas) | ❌ Desactivado | — |
| LeadSquared | ❌ Desactivado | — |

---

## Respuestas Rápidas / Canned Responses (37)

| Código | Contenido resumido |
|---|---|
| `/da` | Formulario de datos para reservar (nombre, DNI, excursión, fecha, pago, pasajeros, hospedaje) |
| `/pu` | ¿Ya están en Bariloche o planean venir más adelante? |
| `/co` | Chequear datos personales, excursión, fecha y horario — responder "Confirmado" |
| `/tro` | Descripción completa Cerro Tronador y Ventisquero Negro + precios |
| `/obj` | Objetos a llevar al rafting (traje de baño, short, toallón, calzado, documentación, efectivo) |
| `/li` | Confirmación final de excursión + derivación al grupo de WhatsApp |
| `/sigues` | ¿Seguís por ahí? ¿Continúo con tu consulta? |
| `/s` | Info de Seguro de Reprogramación ($15.000) y Cancelación ($15.000) / Pack Flexible ($25.000) |
| `/parq` | Tarifas ingreso Parque Nacional (extranjeros $35.000 / nacionales $15.000) |
| `/tasa` | Punto de encuentro Puerto Pañuelo + tasas + instrucciones embarque |
| `/voy` | Pedido de confirmación del voucher + info del Pack de Reserva Flexible |
| `/pix` | Datos cuenta Bradesco Brasil para pagos en pesos brasileños |
| `/aloj` | Respuesta para cuando preguntan por hospedaje (no manejamos, sólo excursiones) |
| `/Base` | Punto de encuentro Rafting (Google Maps) |
| `/web` | Protocolo compra web → grupo de WhatsApp |
| `/alias` | Datos de transferencia BCO MACRO Tour Central + CBU + alias |
| `/grupo` | Link para unirse al grupo de WhatsApp de asistencia |
| `/pe` | Confirmación de creación de grupo de WhatsApp (vouchers, horarios, punto de encuentro) |
| `/co` | Confirmación compra + protocolo grupo WhatsApp |
| `/light` | Rafting Light – Río Manso ($90.000 / promo $75.000 efectivo) |
| `/limite` | Rafting al Límite hasta Chile ($155.400 / promo $129.500 efectivo) |
| `/Comidalimite` | Almuerzo opcional en rafting al límite (asado $25.000 / pastas $20.000 / ensalada $15.000) |
| `/camp` | Tickets Cerro Campanario ($22.000 general / $15.000 menores 5-12) |
| `/recon` | Mensaje de reconexión — ¿revisaste la propuesta? |
| `/comentario` | Pedido de reseña Google con link |
| `/ht` | Link de Mercado Pago |
| `/ahi` | Respuesta cuando pusieron efectivo — ofrecer transferencia |
| `/paseos` | Lista completa de excursiones disponibles con emojis |
| `/podr` | Preguntar alojamiento para verificar punto de pick-up |
| `/gru` | Pedido de unirse al grupo de WhatsApp (protocolo) |
| `/gracias` | Agradecimiento post-compra |
| `/opcion` | Lista de excursiones con precios (circuitos, aventuras, navegaciones) |
| `/cabal` | Descripción Cabalgata Cerro López ($99.500 aprox.) |
| `/bayo` | Tickets Cerro Bayo (peatón / ½ día / 1 día — temporada baja/media/alta) |
| `/paquete` | Paquete 3 días: Circuito Chico + Tronador + 7 Lagos ($154.200 / promo $128.500 transferencia) |
| `/cate` | Tickets Cerro Catedral (peatón $90.000 / esquiador $160.000) |
| `/linkgrupo` | Link para unirse al grupo de WhatsApp + explicación del protocolo |

---

## Conexión con Otros Sistemas

```
WhatsApp (clientes)
      ↓
Evolution API (s2.iadventurecentersx.com)
      ↓
Chatwoot (iadventurecentersx.com) ← CRM central
      ↓ webhook
Magda (n8n) → responde automáticamente
      ↑
      └── OpenAI (GPT-4o)
      └── Supabase (memoria + RAG)
      └── WooCommerce (reservas)
      └── Baserow (catálogo excursiones)
```

Ver documentación de Magda: `contexto/sx/n8n-magda/magda-arquitectura.md`

---

## Pendientes

- [ ] Completar migración de dominio a `iadventurecentersx.com`
- [ ] Verificar atributos personalizados de contacto y conversación (no accesibles con token actual)
- [ ] Verificar webhooks configurados (endpoint n8n) — actualizar URL tras migración
- [ ] Chatwoot#3 (`salidas/Chatwoot#3/`) — nueva instancia configurada, pendiente deploy
- [ ] Actualizar link `/grupo` en respuesta rápida (está incompleto: `https://`)
- [ ] Actualizar link `/ht` de Mercado Pago (está incompleto: `https://mpago.li/`)
