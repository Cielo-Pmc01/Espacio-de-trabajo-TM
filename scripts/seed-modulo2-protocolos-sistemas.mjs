import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  "https://mrovdtkeckxgknkoeqva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY",
  { db: { schema: "capacitacion_tm" } }
);

const MODULE_ID        = "9c184965-dc68-46e6-bfd4-e4701498d806";
const BLOQUE_PROTOCOLOS = "04c11591-b913-4d90-bf45-f6ff8337add6"; // Protocolos Operativos y de Caja
const CHATWOOT_BLOCK_TITLE = "Chatwoot — CRM y Gestión de Conversaciones";

// ── Helpers ──────────────────────────────────────────────────────────────────

const r = () => randomUUID();

function richTextBlock(content) {
  return { id: r(), type: "rich_text", content };
}

function alertBlock(color, title, alertText) {
  return { id: r(), type: "alert", color, title, text: alertText };
}

function separatorBlock() {
  return { id: r(), type: "separator" };
}

function doc(...nodes) {
  return { type: "doc", content: nodes };
}

function p(...inlines) {
  if (inlines.length === 0) return { type: "paragraph" };
  return { type: "paragraph", content: inlines };
}

function h2(t) {
  return { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: t }] };
}

function h3(t) {
  return { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: t }] };
}

function b(t) {
  return { type: "text", text: t, marks: [{ type: "bold" }] };
}

function t(str) {
  return { type: "text", text: str };
}

function li(content) {
  if (typeof content === "string") {
    return { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] };
  }
  return { type: "listItem", content: [{ type: "paragraph", content }] };
}

function ul(...items) {
  return { type: "bulletList", content: items.map(li) };
}

function ol(...items) {
  return { type: "orderedList", attrs: { start: 1 }, content: items.map(li) };
}

// ── Lección 1: Protocolo de Ingreso ──────────────────────────────────────────

const contenidoIngreso = [
  richTextBlock(doc(
    h2("Protocolo Diario de Ingreso a Ventas Online"),
    h3("Toma de conciencia y responsabilidad"),
    p(
      t("El equipo de "), b("Ventas Online"),
      t(" debe tener presente que el "), b("teléfono celular es la herramienta principal de trabajo"),
      t(". De su correcto funcionamiento depende la comunicación con nuestros clientes, el seguimiento de reservas y el rendimiento comercial diario."),
    ),
    p(
      t("Cada integrante es responsable de "),
      b("cuidar, mantener operativo y en condiciones el dispositivo asignado"),
      t(", asegurando que el "), b("WhatsApp funcione correctamente"),
      t(", con buena conexión, sonido y batería suficiente para toda la jornada."),
    ),
    h3("Pasos de ingreso diario"),
    ol(
      "Ingreso a la oficina: al llegar, realizar el control inicial del dispositivo siguiendo el orden numérico asignado.",
      [b("Revisión del celular:"), t(" verificar que esté encendido y operativo, con batería mínimo 80%, sonido y notificaciones activados, y conexión Wi-Fi o datos estables.")],
      [b("Control de WhatsApp:"), t(" abrir WhatsApp Business, verificar que las conversaciones estén visibles y sincronizadas. En caso de fallas, informar inmediatamente al supervisor.")],
      [b("Confirmación de operatividad:"), t(" enviar un mensaje con el icono ✅ al agente de control SP 005 Yamila (+54 9 2944 414753). Este mensaje confirma que el dispositivo está operativo y listo para comenzar.")],
    ),
    h3("Observaciones finales"),
    ul(
      "Si algún celular presenta fallas, debe ser reportado de inmediato al supervisor.",
      "Ningún agente puede iniciar tareas sin haber realizado el check de control diario.",
      "Mantener los celulares limpios, con fundas y cargadores en buen estado.",
      "Al finalizar el día, guardar los equipos en el espacio asignado y conectarlos a carga.",
    ),
  )),
];

// ── Lección 2: Protocolo de Salidas ──────────────────────────────────────────

const contenidoSalidas = [
  richTextBlock(doc(
    h2("Protocolo de Salidas"),
    p(t("Al finalizar la jornada de trabajo, seguir estos pasos en orden:")),
    ol(
      "Verificar la carga de todos los celulares.",
      "Cerrar sesión de Chatwoot en todos los equipos.",
      "Verificar que no queden datos bancarios en las conversaciones abiertas.",
      "Suspender las computadoras.",
      "Verificar cierre de ventanas de la oficina.",
      "Apagar luces y aire acondicionado.",
      "Realizar el protocolo de rendición (ver Protocolo de Rendiciones y Comisiones).",
      "Cierre de oficina y entrega de llave en Administración.",
    ),
  )),
];

// ── Lección 3: Protocolos de Disponibilidad ───────────────────────────────────

const contenidoDisponibilidad = [
  richTextBlock(doc(
    h2("Gestión de Disponibilidad — Mesa Operativa"),
    p(
      t("La "), b("Mesa Operativa"),
      t(" es el área encargada de informar la disponibilidad actualizada de excursiones, tanto propias como de proveedores externos."),
    ),
    h3("Horario límite del Master"),
    p(
      t("Las excursiones visibles en el Master pueden reservarse "),
      b("hasta las 17:30 hs"),
      t(" aproximadamente (para reservar actividades del día siguiente). Después de ese horario es obligatorio consultar disponibilidad por mensaje. Para proveedores externos, siempre hay que consultar disponibilidad sin importar el horario."),
    ),
    h3("¿Por qué es importante preguntar disponibilidad?"),
    ul(
      "Muchas actividades tienen cupos limitados.",
      "Algunos proveedores exigen confirmación previa.",
      "Pueden cerrar agenda antes del horario límite.",
      "Evita cargar reservas erróneas o sin lugar disponible.",
    ),
    h3("Protocolo para consultar a Mesa Operativa"),
    p(
      t("La interacción con Mesa Operativa se realiza a través del grupo de WhatsApp "),
      b("RESERVAS INTERNAS"),
      t(". Consultar de forma directa y sencilla: \"¿Hay dos Tronador para mañana?\" / \"¿Queda un Circuito Chico para hoy?\""),
    ),
    h3("Reglas por tipo de excursión"),
    ul(
      [b("Proveedores externos:"), t(" siempre consultar disponibilidad, sin excepción.")],
      [b("Excursiones internas:"), t(" consultar por RESERVAS INTERNAS. Si se toma la reserva, enviar el voucher generado por ese mismo grupo.")],
      [b("Excursiones Turisur:"), t(" consultar disponibilidad por DISPONIBILIDAD TURISUR. Enviar el voucher con el saldo por RESERVAS INTERNAS. Mesa Operativa confirmará con un código VCM-xxxx. Si la reserva fue al valor total, informar igualmente el voucher con saldo a Adm03.")],
    ),
  )),
];

// ── Lección 4: Protocolo de Pick Ups ─────────────────────────────────────────

const contenidoPickUps = [
  richTextBlock(doc(
    h2("Protocolo de Pick Ups"),
    p(
      t("Antes de gestionar cualquier reserva, es "),
      b("obligatorio verificar y comunicar el punto de pick up"),
      t(" al pasajero. Nuestras excursiones no realizan búsqueda hotel por hotel, sino que operan mediante "),
      b("puntos de encuentro definidos"),
      t(" que varían según el proveedor."),
    ),
    h3("Excursiones propias — Adventure Center / gestión interna"),
    p(t("Puntos de encuentro en zona centro:")),
    ul(
      "Patagonia Booking",
      "La Fonda del Tío",
      "Estación de Servicio Puma Energy",
      "Terminal de Ómnibus",
      "Hotel NH Edelweiss",
      "Hotel Chamonix",
      "Av. Bustillo y Av. De Los Pioneros hasta km 8",
    ),
    p(t("Pueden existir puntos excepcionales según la excursión.")),
    h3("Excursiones proveedor Turisur"),
    p(
      t("Los puntos de encuentro están detallados en el archivo "),
      b("\"Horarios Pick Up\" (Excel)"),
      t(". Identificar el punto más cercano al pasajero y confirmar el horario correspondiente."),
    ),
    h3("Importante"),
    ul(
      "El pick up debe informarse siempre antes del pago.",
      "El pasajero debe conocer claramente su punto de encuentro y horario antes de abonar.",
      "Esto evita confusiones, reclamos y problemas operativos.",
    ),
  )),
];

// ── Lección 5: Protocolos de Cierre de Venta ─────────────────────────────────

const contenidoCierreVenta = [
  richTextBlock(doc(
    h2("Protocolos de Cierre de Venta"),
    p(
      t("Al momento del cierre de venta, es fundamental contar con "),
      b("toda la información del pasajero"),
      t(" antes de procesar el pago. Si durante la conversación no se relevaron todos los datos, enviar la "),
      b("planilla de datos"),
      t(" usando el atajo "),
      b("/datos"),
      t(" en Chatwoot o WhatsApp."),
    ),
    h3("Datos obligatorios para reservar"),
    ul(
      "Nombre y Apellido",
      "Número de celular",
      "Mail",
      "DNI",
      "Excursión",
      "Fecha de excursión",
      "Forma de pago",
      "Cantidad de pasajeros",
      "Hospedaje",
    ),
    h3("Proceso de pago"),
    ul(
      [b("Modalidad online:"), t(" transferencia bancaria o link de pago.")],
      [b("Modalidad presencial:"), t(" efectivo o tarjeta.")],
    ),
    h3("Carga en Patagonia Booking"),
    p(
      t("Una vez realizado el pago, cargar la reserva en el sistema "),
      b("Patagonia Booking (PB2)"),
      t(" y generar el voucher correspondiente para enviárselo al pasajero."),
    ),
  )),
];

// ── Lección 6: Protocolo de Grupos ───────────────────────────────────────────

const contenidoGrupos = [
  richTextBlock(doc(
    h2("Protocolo de Grupos"),
    p(
      t("El grupo de WhatsApp es el "),
      b("canal oficial de comunicación con el pasajero durante la post-venta"),
      t(". Es fundamental garantizar: participantes correctos, método de ingreso adecuado y orden correcto en el envío de información."),
    ),
    h3("Creación del grupo"),
    p(t("Participantes obligatorios:")),
    ul("Asistencia al pasajero", "Reclamos Formales"),
    h3("Nombre del grupo"),
    p(b("[Nomenclatura PB] + Apellido + x (cantidad de pax)")),
    p(t("Ejemplo: PB-14 Pérez x2. Solo primera letra en mayúscula, incluir cantidad de pasajeros.")),
    h3("Envío de invitación"),
    ul(
      "Enviar link del grupo por Chatwoot / WhatsApp.",
      "Utilizar el atajo /me (mensaje de bienvenida).",
      "Si la venta fue desde otra marca, agregar esa marca al grupo para reforzar confianza.",
    ),
    h3("⚠️ Regla clave"),
    p(b("Nunca enviar información antes de que el pasajero se una al grupo.")),
    p(t("Si se envía antes, el pasajero no podrá ver los mensajes.")),
    h3("Orden de envío de información"),
    ol(
      "🎫 Voucher: enviar transcripción del voucher + link.",
      "✅ Confirmación de datos: usar atajo /confirmo. Pedir al pasajero que confirme nombre, excursión, fecha y horario.",
      "🛡️ Seguros: ofrecer Seguro de Reprogramación ($15.000), Cancelación ($15.000) o Pack Flexible ($25.000). Usar atajo /cancel o /seg.",
      "📌 Recomendaciones: Circuito Chico / Campanario → /campa | Tronador / Bolsón → /parque | Rafting → /rafting | Isla Victoria → /puerto.",
      "📍 Punto de encuentro: enviar dirección escrita, día, horario y link de Google Maps.",
    ),
  )),
];

// ── Lección 7: Rendiciones y Comisiones ──────────────────────────────────────

const contenidoRendiciones = [
  richTextBlock(doc(
    h2("Protocolo de Rendiciones y Comisiones"),
    h3("Caja de vouchers"),
    p(t("El cierre de caja se realiza diariamente usando la información registrada en Patagonia Booking.")),
    ol(
      "Ingresar a la pestaña de Reservas en Patagonia Booking.",
      "Visualizar todas las ventas del día.",
      "Completar los datos personales: nombre y apellido, usuario (nomenclatura), turno, fecha, día, número de hoja.",
      "Cargar cada voucher con su número e importe.",
      "Clasificar por forma de pago: Efectivo, Transferencia o Tarjeta (todos en pesos argentinos).",
      "Completar totales: efectivo, tarjeta, transferencia y total general.",
      "Verificar que todos los datos estén completos y firmar la hoja.",
    ),
    h3("Rendición de caja en efectivo"),
    p(t("Realizar si hubo pagos en efectivo durante el día:")),
    ol(
      "Completar datos personales: nombre, apellido, oficina, turno.",
      "Registrar pesos argentinos: cantidad de billetes por denominación.",
      "Registrar moneda extranjera (ej. USD): cantidad de billetes, tipo y cotización del día.",
      "Calcular totales en pesos argentinos (convertir moneda extranjera con la cotización del día).",
      "Completar el código interno con formato: Año + Mes + Día.",
    ),
    h3("Comisiones"),
    p(t("Los vendedores reciben comisiones sobre el total facturado:")),
    ul(
      [b("1%"), t(" sobre ventas propias (excursiones internas).")],
      [b("3%"), t(" sobre ventas de proveedores externos.")],
    ),
    p(t("Las comisiones se liquidan junto con la rendición mensual.")),
  )),
];

// ── Lecciones Bloque 1 ────────────────────────────────────────────────────────

const LECCIONES_PROTOCOLOS = [
  { title: "Protocolo de Ingreso",                  blocks: contenidoIngreso,       order: 1 },
  { title: "Protocolo de Salidas",                   blocks: contenidoSalidas,       order: 2 },
  { title: "Protocolos de Disponibilidad",           blocks: contenidoDisponibilidad, order: 3 },
  { title: "Protocolo de Pick Ups",                  blocks: contenidoPickUps,       order: 4 },
  { title: "Protocolos de Cierre de Venta",          blocks: contenidoCierreVenta,   order: 5 },
  { title: "Protocolo de Grupos",                    blocks: contenidoGrupos,        order: 6 },
  { title: "Protocolo de Rendiciones y Comisiones",  blocks: contenidoRendiciones,   order: 7 },
];

// ── Chatwoot — 5 Módulos CRM ─────────────────────────────────────────────────

const contenidoChatwoot1 = [
  richTextBlock(doc(
    h2("Módulo 1: El Desafío de la Densidad de Datos y la Mentalidad de Gestión"),
    p(
      t("El objetivo principal de esta capacitación es establecer "),
      b("cinco hábitos fundamentales"),
      t(" en el uso del CRM para profesionalizar la gestión de ventas. No buscamos solo usar un software, sino dominar una metodología que permita manejar el alto flujo de demanda actual."),
    ),
    h3("El Problema: La Trampa de la Memoria"),
    p(
      t("Actualmente, recibimos un promedio de "),
      b("500 clientes nuevos cada día"),
      t(". Es humanamente imposible gestionar tal volumen confiando solo en la memoria. Cuando la memoria falla, perdemos el hilo de la venta, no hacemos seguimientos idóneos y las conversaciones se acumulan históricamente, saturando la vista de trabajo."),
    ),
    h3("Entendiendo al cliente: High Ticket vs. Low Ticket"),
    p(t("Desde el primer contacto, debemos identificar el perfil:")),
    ul(
      [b("High Ticket:"), t(" clientes con alta capacidad de compra que buscan servicios premium o múltiples actividades.")],
      [b("Low Ticket:"), t(" clientes más austeros que buscan servicios básicos o traslados económicos.")],
    ),
    p(t("Identificar esto temprano permite priorizar esfuerzos y ofrecer el producto adecuado a la persona adecuada.")),
    h3("El Hábito de la \"Bandeja Limpia\" — Botón Resolver"),
    p(
      t("Para no perdernos en el mar de 500 chats, utilizamos la lógica "),
      b("Kanban"),
      t(" (Sin estado, En proceso, Listo). El botón "),
      b("\"Resolver\""),
      t(" se usa cuando una venta se cierra o el cliente ya no comprará próximamente. No hay que tenerle miedo: si el cliente vuelve a escribir en el futuro, el sistema lo saca automáticamente de \"Resuelto\" y lo pone de nuevo en la lista de activos."),
    ),
    h3("El Método Henry Ford: Personalización a Gran Escala"),
    p(
      t("El objetivo es que cada cliente sienta que es nuestro \"único\" cliente. Henry Ford gestionaba miles de contactos anotando detalles personales: cumpleaños, nombres de familiares, intereses. No tenía memoria prodigiosa, tenía "),
      b("ficheros anotados"),
      t(". Si él pudo gestionar 10.000 personas sin tecnología, nosotros podemos gestionar 500 al día con las herramientas actuales."),
    ),
    h3("El cuaderno como respaldo"),
    p(t("En momentos de mucho tráfico, el cuaderno es el mejor aliado. Anotar número, nombre e intención de compra permite calcular cuánto tiempo tardamos en responder y asegurar que ningún cliente quede pendiente.")),
  )),
];

const contenidoChatwoot2 = [
  richTextBlock(doc(
    h2("Módulo 2: El Perfil del Contacto y el Poder de las Notas Internas"),
    h3("Hábito 1: Completar el Perfil — No más contactos anónimos"),
    p(t("Cada vez que alguien nos escribe, nuestro primer hábito es transformar ese número de teléfono en una ficha de cliente real.")),
    ul(
      [b("Datos básicos:"), t(" registrar nombre, apellido y fundamentalmente el correo electrónico.")],
      [b("¿Para qué sirve el email?"), t(" Con el correo podemos enviar descuentos o promociones que el cliente puede reenviar a sus amigos, generando ventas por \"boca a boca\" incluso meses después.")],
      [b("Segmentación geográfica y de género:"), t(" marcar si el cliente viene de Argentina, Brasil u otro lugar, y si es hombre o mujer. Esto permite analizar quiénes nos compran más y adaptar el discurso de venta.")],
    ),
    h3("Hábito 2: Notas Internas — Tu memoria de 30 segundos"),
    p(
      t("Las notas internas son el corazón de la eficiencia en el equipo. Muchos agentes pierden entre 6 y 7 minutos releyendo historiales de chats. Con una nota interna bien redactada, se puede retomar la charla en solo "),
      b("30 segundos"),
      t("."),
    ),
    p(t("¿Qué anotar en las notas?")),
    ol(
      "Composición del grupo: ej. '3 pasajeros, 2 adultos y un nene'.",
      "Intereses específicos: si la persona quiere acción (Rafting, Canopy) o algo más tranquilo.",
      "Trabajo en equipo: si un compañero cubre tu turno, las notas permiten continuar la venta sin preguntarle al cliente lo mismo que ya respondió.",
      "Venta futura: si anotaste que el cliente tiene hijos y vino en verano, en invierno podés filtrar esos contactos y ofrecerles actividades de nieve.",
    ),
    h3("La Estrategia de la Cercanía"),
    p(t("Si anotamos cuándo regresa el cliente a su casa, podemos enviarle un mensaje de 'feliz viaje' justo a tiempo. Ese detalle hace que el cliente se sienta especial y nos recomiende.")),
    h3("Combinación de contactos"),
    p(t("A veces nos habla el marido por un lado y la mujer por otro. El sistema permite combinar contactos para unificar la charla, lo que permite ofrecer un paquete cerrado para toda la familia y aumentar el ticket de venta.")),
  )),
];

const contenidoChatwoot3 = [
  richTextBlock(doc(
    h2("Módulo 3: Respuestas Guardadas y Etiquetado Estratégico"),
    h3("Hábito 3: La Respuesta Fraccionada — No más bloques de texto"),
    p(t("Un error común es enviar un texto enorme que obliga al cliente a presionar 'ver más'. En WhatsApp, eso reduce las probabilidades de cierre.")),
    ul(
      [b("La técnica del fraccionamiento:"), t(" dividir la información en 3 o 5 fragmentos cortos.")],
      [b("Facilidad de lectura:"), t(" el cliente identifica rápidamente lo que le interesa (precio, punto de encuentro) sin leer todo.")],
      [b("Personalización:"), t(" tener las respuestas precargadas en el sistema pero reestructurarlas con la propia forma de hablar. El mensaje se siente humano, no robótico.")],
    ),
    h3("Seguridad y Respaldo Legal"),
    p(t("Fraccionar mensajes también protege legalmente. Al enviar detalles específicos (como requisitos físicos para Rafting) en mensajes separados, nos aseguramos de que la información crítica fue notificada de forma clara, lo cual es vital para la cobertura legal de la excursión.")),
    h3("Hábito 4: El Poder del Etiquetado — Tags"),
    p(t("Las etiquetas son filtros de búsqueda potentes que permiten recuperar conversaciones meses después.")),
    ul(
      [b("Segmentación por fechas:"), t(" etiquetar a los clientes por el mes de interés (ej. 'Pendiente Julio', 'Agosto').")],
      [b("Identificación de intereses:"), t(" si pregunta por Rafting, etiquetar 'Acción'. Al lanzar Parapente, filtrar esa etiqueta para encontrar clientes listos para comprar.")],
      [b("Estado de la venta:"), t(" usar etiquetas 'Pendiente de pago' o 'Por reservar' para saber a quién contactar primero al iniciar el día.")],
    ),
    h3("Filtrado Inteligente"),
    p(t("Gracias a las etiquetas, se pueden usar filtros avanzados en la sección 'Mías' del CRM para ver solo lo necesario: por fecha de creación, por urgencia o por actividad específica. Esto evita el scroll infinito buscando un cliente de hace dos semanas.")),
  )),
];

const contenidoChatwoot4 = [
  richTextBlock(doc(
    h2("Módulo 4: Gestión de Estados, el Botón \"Resolver\" y la Función \"Posponer\""),
    p(
      t("Un CRM con 500 contactos diarios puede volverse un caos si no se sabe cómo limpiar la vista de trabajo. Aprendemos a usar los estados: "),
      b("Abierto, Pendiente, Pospuesto y Resuelto"),
      t("."),
    ),
    h3("Hábito 5: Resolver — Limpieza y Eficiencia"),
    ul(
      [b("¿Cuándo usar Resolver?"), t(" Cuando la venta se haya concretado o cuando el cliente no comprará en el corto plazo.")],
      [b("Sin miedo a perder datos:"), t(" al resolver, la charla desaparece de la vista actual pero no se borra. Si el cliente vuelve a escribir, el sistema la reabre automáticamente.")],
      [b("Evita la bola de nieve:"), t(" no dejar chats abiertos evita que se acumulen miles de conversaciones viejas que ralentizan el sistema.")],
    ),
    h3("La Lógica Kanban — Estados de la conversación"),
    ul(
      [b("Abierto:"), t(" clientes 'calientes' que necesitan respuesta inmediata.")],
      [b("Pendiente:"), t(" cuando se espera algo específico, como una transferencia o confirmación de datos. Filtrar los 'pendientes' al final del día para seguimiento.")],
      [b("Pospuesto (Snooze):"), t(" herramienta estratégica para indicarle al sistema cuándo volver a atender esa conversación.")],
    ),
    h3("El Botón \"Posponer\" y la IA Magda"),
    p(
      t("Magda (nuestra IA) está programada para ayudar si un cliente no recibe respuesta. Si ya se está gestionando la venta y no se quiere que Magda intervenga, "),
      b("usar \"Posponer\""),
      t("."),
    ),
    p(t("Si un cliente dice 'te aviso mañana', posponer el chat para mañana a las 9:00 a. m. Esto indica al sistema que la conversación está siendo gestionada. Si no se usa esta función y el cliente escribe, Magda podría intervenir pensando que el chat está desatendido.")),
    h3("Prioridades — Atender lo Urgente primero"),
    ul(
      [b("Urgente:"), t(" clientes que ya tienen el dinero en mano o esperan un voucher para salir mañana.")],
      [b("Alta / Media:"), t(" clientes interesados con los que se está negociando.")],
      [b("Baja:"), t(" consultas generales o clientes que preguntan por fechas muy lejanas.")],
    ),
  )),
];

const contenidoChatwoot5 = [
  richTextBlock(doc(
    h2("Módulo 5: Cierre de Jornada, Métricas y la Mentalidad del Éxito"),
    h3("El Cierre del Día — La Regla de las 24 Horas"),
    p(t("Al finalizar el turno, realizar un escaneo de la bandeja de entrada:")),
    ul(
      [b("Sin chats en 'Abierto':"), t(" verificar que no queden conversaciones en estado 'Abierto' por más de 24 horas. Si la gestión terminó, pasar a 'Resuelto' o 'Pospuesto'.")],
      [b("Evitar la bola de nieve:"), t(" dejar chats abiertos 'por las dudas' genera acumulación histórica que ralentiza el sistema para todos.")],
    ),
    h3("Tu impacto en el Marketing — Registrar Ventas Cerradas"),
    p(t("Cuando se concrete una venta:")),
    ul(
      [b("Notas de Venta:"), t(" anotar en las notas internas qué se vendió y marcarlo como 'vendido'.")],
      [b("¿Por qué importa?"), t(" Esta información llega directamente al equipo de marketing. Si saben qué excursiones son las más vendidas, pueden optimizar las publicidades para atraer más clientes de mejor calidad gastando menos dinero.")],
    ),
    h3("Atajos de Teclado — Velocidad Pro"),
    p(t("El sistema cuenta con atajos de teclado para resolver una conversación y pasar automáticamente a la siguiente sin usar el mouse. Segundos ahorrados en 500 contactos se traducen en horas de tiempo libre al final de la semana.")),
    h3("La Curva de Aprendizaje — Los Primeros 4 Días"),
    p(
      t("Los primeros 3 o 4 días con el nuevo sistema se sentirá más lento. Es normal. Primero aprendemos el equilibrio, luego a pedalear y finalmente a hacer trucos. Este CRM es el mismo que utilizan gigantes como "),
      b("Amazon o Despegar"),
      t(". Dominarlo permite gestionar a 500 personas y venderle a la gran mayoría con control total de la información."),
    ),
    h3("El Respaldo de Magda"),
    p(t("Magda, la IA del sistema, no duerme. Está disponible para responder consultas fuera del horario laboral y asegura que ningún lead se pierda por falta de respuesta. En equipo con el vendedor, Magda potencia la capacidad de atención del sistema.")),
  )),
];

const LECCIONES_CHATWOOT = [
  { title: "Módulo 1: El Desafío de la Densidad de Datos",              blocks: contenidoChatwoot1, order: 1 },
  { title: "Módulo 2: El Perfil del Contacto y las Notas Internas",    blocks: contenidoChatwoot2, order: 2 },
  { title: "Módulo 3: Respuestas Guardadas y Etiquetado Estratégico",  blocks: contenidoChatwoot3, order: 3 },
  { title: "Módulo 4: Estados, Resolver y Posponer",                   blocks: contenidoChatwoot4, order: 4 },
  { title: "Módulo 5: Cierre de Jornada y Métricas",                   blocks: contenidoChatwoot5, order: 5 },
];

// ── Helpers de base de datos ──────────────────────────────────────────────────

async function getOrCreateChatwootBlock() {
  const { data: existing } = await supabase
    .from("blocks")
    .select("id")
    .eq("module_id", MODULE_ID)
    .eq("title", CHATWOOT_BLOCK_TITLE)
    .maybeSingle();

  if (existing) {
    console.log(`   Bloque Chatwoot ya existe: ${existing.id}`);
    return existing.id;
  }

  const id = randomUUID();
  const { error } = await supabase.from("blocks").insert({
    id,
    module_id: MODULE_ID,
    title: CHATWOOT_BLOCK_TITLE,
    description: "",
    order: 3,
    visible_sectors: ["B1", "VR", "VP"],
  });
  if (error) throw error;
  console.log(`   Bloque Chatwoot creado: ${id}`);
  return id;
}

async function upsertLeccion({ blockId, title, contentBlocks, order }) {
  const { data: existing } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("block_id", blockId)
    .eq("title", title)
    .maybeSingle();

  if (existing) {
    console.log(`  ⚠️  Ya existe: "${title}" — actualizando...`);
    const { error } = await supabase
      .from("lessons")
      .update({
        content_json: contentBlocks,
        lesson_type: "generic",
        is_published: true,
        visible_sectors: ["B1", "VR", "VP"],
      })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`  ✅ Actualizado: "${title}"`);
    return;
  }

  const { error } = await supabase.from("lessons").insert({
    id: randomUUID(),
    block_id: blockId,
    title,
    content_json: contentBlocks,
    order,
    lesson_type: "generic",
    is_published: true,
    visible_sectors: ["B1", "VR", "VP"],
  });
  if (error) throw error;
  console.log(`  ✅ Creada: "${title}"`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Cargando Módulo 2 — Protocolos y Sistemas\n");

  // Bloque 1: 7 protocolos operativos
  console.log(`\n📁 Bloque 1: Protocolos Operativos y de Caja (${LECCIONES_PROTOCOLOS.length} lecciones)`);
  for (const leccion of LECCIONES_PROTOCOLOS) {
    await upsertLeccion({
      blockId: BLOQUE_PROTOCOLOS,
      title: leccion.title,
      contentBlocks: leccion.blocks,
      order: leccion.order,
    });
  }

  // Bloque 4: Chatwoot (crearlo si no existe)
  console.log(`\n📁 Bloque Chatwoot: ${CHATWOOT_BLOCK_TITLE} (${LECCIONES_CHATWOOT.length} lecciones)`);
  const chatwootBlockId = await getOrCreateChatwootBlock();
  for (const leccion of LECCIONES_CHATWOOT) {
    await upsertLeccion({
      blockId: chatwootBlockId,
      title: leccion.title,
      contentBlocks: leccion.blocks,
      order: leccion.order,
    });
  }

  console.log("\n✨ Listo. Módulo 2 cargado.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
