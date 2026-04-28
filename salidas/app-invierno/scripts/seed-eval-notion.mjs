// Script para crear las preguntas del Módulo 3 en Notion
const TOKEN = "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";
const DB_ID = "33f39896-8d66-80a9-bb72-e39b655cee99";
const BASE = "https://api.notion.com/v1";
const HEADERS = {
  "Authorization": `Bearer ${TOKEN}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const questions = [
  { id:"q1", type:"mc", section:"Protocolos", pts:1, q:"¿Qué hay que hacer SIEMPRE antes de confirmar cualquier excursión con el cliente?", opts:["Verificar el precio en la lista vigente","Consultar disponibilidad con el proveedor","Cargar el voucher en el sistema","Enviar el voucher a RESERVAS INTERNAS"], ans:1 },
  { id:"q2", type:"mc", section:"Proveedores", pts:1, q:"¿Cuál es el grupo de WhatsApp para consultar disponibilidad de La Cueva?", opts:["CUEVA Bariloche","EXTREMO ENCANTADO Disponibilidad","LA CUEVA Disponibilidad","DIVERSIDAD Disponibilidad"], ans:2 },
  { id:"q3", type:"mc", section:"Ventas", pts:1, q:"¿Qué excursión se recomienda priorizar PRIMERO cuando el cliente no tiene preferencia clara?", opts:["Noche Encantada","La Cueva Cena","Roca Negra","Nieve Encantada"], ans:3 },
  { id:"q4", type:"mc", section:"Protocolos", pts:1, q:"¿Qué valor se carga como \"precio por pasajero\" en el voucher de una excursión con seña/saldo?", opts:["El precio total de la excursión","El saldo pendiente","El valor de la SEÑA","El precio en tarjeta"], ans:2 },
  { id:"q5", type:"mc", section:"Protocolos", pts:1, q:"Si un cliente abona el 100% en una excursión con sistema seña/saldo, ¿qué hacés?", opts:["No se hace nada especial","Cargar saldo como cero en el voucher","Cancelar la seña original","Reenviar voucher a Adm003 con \"ABONÓ TOTAL\""], ans:3 },
  { id:"q6", type:"mc", section:"Excursiones", pts:1, q:"¿Dónde se puede alquilar ropa de nieve en Bariloche?", opts:["Cerro Catedral — local de equipos","Adventure Center — oficina central","Patagonia Showroom, Moreno 193","En el hotel del cliente"], ans:2 },
  { id:"q7", type:"mc", section:"Protocolos", pts:1, q:"¿En qué grupo de WhatsApp se envía el voucher post-reserva, sin excepción?", opts:["Al supervisor directamente","RESERVAS INTERNAS","El grupo del proveedor correspondiente","EXTREMO ENCANTADO Disponibilidad"], ans:1 },
  { id:"q8", type:"mc", section:"Excursiones", pts:1, q:"¿Qué días opera la excursión Villa La Angostura y Cerro Bayo?", opts:["Todos los días de la semana","Martes, jueves y sábado","Solo fines de semana","Lunes, miércoles, viernes y domingo"], ans:3 },
  { id:"q9", type:"mc", section:"Excursiones", pts:1, q:"¿Cuál afirmación sobre ropa de nieve es CORRECTA?", opts:["Es opcional en todas las actividades","Solo es obligatoria en pistas de ski","Es obligatoria en actividades de nieve y opcional (recomendada) en traslados","Solo aplica a menores de edad"], ans:2 },
  { id:"q10", type:"mc", section:"Proveedores", pts:1, q:"¿Cuál es el grupo de disponibilidad para Nieve Encantada, Noche Encantada y Culipatín?", opts:["DIVERSIDAD Disponibilidad","SKI NÓRDICO Disponibilidad","RESERVAS INTERNAS","EXTREMO ENCANTADO Disponibilidad"], ans:3 },
  { id:"q11", type:"open", section:"Protocolos", pts:0, q:"¿Por qué es importante informar el saldo pendiente al cliente al enviar el voucher, incluso si ya fue informado verbalmente?", placeholder:"Escribí tu respuesta..." },
  { id:"q12", type:"open", section:"Protocolos", pts:0, q:"Describí en orden los pasos correctos para confirmar una excursión con un proveedor externo.", placeholder:"Paso 1: ...\nPaso 2: ..." },
  { id:"q13", type:"open", section:"Ventas", pts:0, q:"Un cliente de 35 años viaja con su pareja sin experiencia previa en nieve y con un solo día libre. ¿Qué excursión le recomendás y por qué?", placeholder:"Escribí tu respuesta..." },
  { id:"q14", type:"open", section:"Excursiones", pts:0, q:"¿Cuáles son las dos diferencias principales entre Nieve Encantada y Noche Encantada?", placeholder:"Diferencia 1: ...\nDiferencia 2: ..." },
  { id:"q15", type:"drag", section:"Proveedores", pts:4, q:"Asigná cada excursión/actividad al grupo de WhatsApp de disponibilidad correcto", items:["Roca Negra","Noche Nórdica","Diversidad (Neumeyer)","La Cueva"], zones:["ROCA NEGRA Disponibilidad","SKI NÓRDICO Disponibilidad","Diversidad Disponibilidad","LA CUEVA Disponibilidad"], correct:{"Roca Negra":"ROCA NEGRA Disponibilidad","Noche Nórdica":"SKI NÓRDICO Disponibilidad","Diversidad (Neumeyer)":"Diversidad Disponibilidad","La Cueva":"LA CUEVA Disponibilidad"} },
  { id:"q16", type:"drag", section:"Ventas", pts:3, q:"Ordená estas excursiones de mayor a menor prioridad de venta", items:["La Cueva After Ski","Noche Encantada","Nieve Encantada"], zones:["Prioridad 1 — Mayor","Prioridad 2","Prioridad 3 — Menor"], correct:{"Nieve Encantada":"Prioridad 1 — Mayor","Noche Encantada":"Prioridad 2","La Cueva After Ski":"Prioridad 3 — Menor"} },
  { id:"q17", type:"drag", section:"Excursiones", pts:4, q:"Clasificá cada actividad según si la ropa de nieve es obligatoria u opcional", items:["Nieve Encantada","Traslado Cerro Catedral","Culipatín","Traslado Cerro Bayo"], zones:["Ropa OBLIGATORIA","Ropa OPCIONAL (recomendada)"], correct:{"Nieve Encantada":"Ropa OBLIGATORIA","Traslado Cerro Catedral":"Ropa OPCIONAL (recomendada)","Culipatín":"Ropa OBLIGATORIA","Traslado Cerro Bayo":"Ropa OPCIONAL (recomendada)"} },
  { id:"q18", type:"match", section:"Proveedores", pts:4, q:"Unir cada proveedor/actividad con su grupo de WhatsApp de disponibilidad", left:["Diversidad (Neumeyer)","Winter Park","Bautismo Ski (Epic)","Escuelita Ski/Snow"], right:["WINTER PARK Disponibilidad","Diversidad Disponibilidad","MOUNTAIN Disponibilidad","EPIC Disponibilidad"], correct:{"Diversidad (Neumeyer)":"Diversidad Disponibilidad","Winter Park":"WINTER PARK Disponibilidad","Bautismo Ski (Epic)":"EPIC Disponibilidad","Escuelita Ski/Snow":"MOUNTAIN Disponibilidad"} },
  { id:"q19", type:"match", section:"Protocolos", pts:3, q:"Unir cada protocolo con su acción clave", left:["Protocolo 1 — Disponibilidad","Protocolo 2 — Seña/Saldo","Protocolo 3 — Pago Total"], right:["Cargar SEÑA como precio por pasajero en el voucher","Reenviar voucher a Adm003 indicando ABONÓ TOTAL","Consultar disponibilidad ANTES de confirmar al cliente"], correct:{"Protocolo 1 — Disponibilidad":"Consultar disponibilidad ANTES de confirmar al cliente","Protocolo 2 — Seña/Saldo":"Cargar SEÑA como precio por pasajero en el voucher","Protocolo 3 — Pago Total":"Reenviar voucher a Adm003 indicando ABONÓ TOTAL"} },
  { id:"q20", type:"match", section:"Excursiones", pts:3, q:"Unir cada excursión con su descripción principal", left:["Nieve Encantada","Noche Encantada","La Cueva — Paseo Nocturno"], right:["Experiencia nocturna con fuerte componente emocional","Cena show y paseo nocturno en La Cueva, Cerro Catedral","4x4 + 2 actividades en nieve + gastronomía — producto principal diurno"], correct:{"Nieve Encantada":"4x4 + 2 actividades en nieve + gastronomía — producto principal diurno","Noche Encantada":"Experiencia nocturna con fuerte componente emocional","La Cueva — Paseo Nocturno":"Cena show y paseo nocturno en La Cueva, Cerro Catedral"} },
];

function richText(content) {
  return [{ type: "text", text: { content } }];
}

function heading2(text) {
  return { type: "heading_2", heading_2: { rich_text: richText(text) } };
}

function bullet(text) {
  return { type: "bulleted_list_item", bulleted_list_item: { rich_text: richText(text) } };
}

function buildBlocks(q) {
  if (q.type === "mc") {
    return [
      heading2("Opciones"),
      ...q.opts.map(bullet),
    ];
  }
  if (q.type === "open") {
    return [
      heading2("Placeholder"),
      { type: "paragraph", paragraph: { rich_text: richText(q.placeholder) } },
    ];
  }
  if (q.type === "drag") {
    return [
      heading2("Items"),
      ...q.items.map(bullet),
      heading2("Zonas"),
      ...q.zones.map(bullet),
      heading2("Respuestas"),
      ...Object.entries(q.correct).map(([k, v]) => bullet(`${k} → ${v}`)),
    ];
  }
  if (q.type === "match") {
    return [
      heading2("Izquierda"),
      ...q.left.map(bullet),
      heading2("Derecha"),
      ...q.right.map(bullet),
      heading2("Respuestas"),
      ...Object.entries(q.correct).map(([k, v]) => bullet(`${k} → ${v}`)),
    ];
  }
  return [];
}

async function notion(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${JSON.stringify(data)}`);
  return data;
}

// Paso 1: agregar propiedades a la base de datos
async function addProperties() {
  console.log("Agregando propiedades a la base de datos...");
  await notion("PATCH", `/databases/${DB_ID}`, {
    properties: {
      TipoPregunta: { select: {} },
      SeccionEval: { select: {} },
      Puntos: { number: { format: "number" } },
      Correcta: { number: { format: "number" } },
      OrdenEval: { number: { format: "number" } },
      Placeholder: { rich_text: {} },
    },
  });
  console.log("✓ Propiedades agregadas");
}

// Paso 2: crear páginas para cada pregunta
async function createQuestion(q, index) {
  const properties = {
    Nombre: { title: richText(q.q) },
    Modulo: { select: { name: "Módulo 3" } },
    Subtitulo: { select: { name: "Evaluación" } },
    TipoPregunta: { select: { name: q.type } },
    SeccionEval: { select: { name: q.section } },
    Puntos: { number: q.pts },
    OrdenEval: { number: index + 1 },
  };

  if (q.type === "mc") {
    properties.Correcta = { number: q.ans };
  }
  if (q.type === "open" && q.placeholder) {
    properties.Placeholder = { rich_text: richText(q.placeholder) };
  }

  const page = await notion("POST", "/pages", {
    parent: { database_id: DB_ID },
    properties,
    children: buildBlocks(q),
  });

  console.log(`✓ ${q.id} — ${q.type} — ${q.q.slice(0, 50)}...`);
  return page;
}

async function main() {
  await addProperties();
  console.log(`\nCreando ${questions.length} preguntas...\n`);
  for (let i = 0; i < questions.length; i++) {
    await createQuestion(questions[i], i);
    // Pequeña pausa para no superar rate limit de Notion
    await new Promise(r => setTimeout(r, 350));
  }
  console.log(`\n✅ Listo — ${questions.length} preguntas creadas en Módulo 3`);
}

main().catch(console.error);
