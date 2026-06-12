const SUPABASE_URL = "https://mrovdtkeckxgknkoeqva.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY";

async function update(lessonId, content_json) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/lessons?id=eq.${lessonId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": KEY,
      "Authorization": `Bearer ${KEY}`,
      "Accept-Profile": "capacitacion_tm",
      "Content-Profile": "capacitacion_tm",
    },
    body: JSON.stringify({ content_json }),
  });
  return res.ok;
}

// ─── 1. Metodología — Seña / Saldo ───────────────────────────────────────────
// ID: 2a2b04f0-be84-4f37-ba7b-74586a4ee3e6

const metodologiaTiptap = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "La mayoría de las excursiones trabajan con sistema de " },
        { type: "text", marks: [{ type: "bold" }], text: "seña + saldo en destino." },
      ],
    },
  ],
};

const metodologiaBlocks = [
  {
    type: "alert",
    color: "danger",
    title: "Reglas OBLIGATORIAS — Valores de seña",
    text: "Utilizar ÚNICAMENTE los valores definidos en el documento \"2-EXCURSIONES DE INVIERNO\". No modificar valores bajo ningún concepto.",
  },
  {
    type: "alert",
    color: "info",
    title: "Carga en voucher",
    text: "\"Precio por pasajero\" = valor de la SEÑA.",
  },
  {
    type: "alert",
    color: "success",
    title: "Comunicación al cliente — OBLIGATORIO",
    text: "Informar SIEMPRE el saldo pendiente al enviar el voucher, aunque ya haya sido informado previamente.",
  },
];

// ─── 2. Excepción: Pago Total ────────────────────────────────────────────────
// ID: 8bc4f081-3296-4d36-8e28-71bc4bbe9996

const excepcionTiptap = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Cuando un cliente abona el " },
        { type: "text", marks: [{ type: "bold" }], text: "100%" },
        { type: "text", text: " en excursiones con modalidad seña/saldo." },
      ],
    },
  ],
};

const excepcionBlocks = [
  {
    type: "alert",
    color: "success",
    title: "Acción OBLIGATORIA — 3 pasos",
    text: "1. Reenviar voucher a Adm003.\n2. Informar: “ABONÓ TOTAL”.\n3. Detallar el valor que correspondía como saldo.",
  },
];

// ─── Ejecutar ─────────────────────────────────────────────────────────────────

const r1 = await update("2a2b04f0-be84-4f37-ba7b-74586a4ee3e6", {
  tiptap: metodologiaTiptap,
  blocks: metodologiaBlocks,
});
console.log(r1 ? "✅ Metodología actualizada" : "❌ Error en Metodología");

const r2 = await update("8bc4f081-3296-4d36-8e28-71bc4bbe9996", {
  tiptap: excepcionTiptap,
  blocks: excepcionBlocks,
});
console.log(r2 ? "✅ Excepción: Pago Total actualizada" : "❌ Error en Excepción");
