// Reestructura la lección "Disponibilidad — Grupos por Proveedor"
// Lesson ID: 88ccd8d8-1a8e-40fc-9022-d119b563228f
// Schema: capacitacion_tm

const SUPABASE_URL = "https://mrovdtkeckxgknkoeqva.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY";
const LESSON_ID = "88ccd8d8-1a8e-40fc-9022-d119b563228f";

// ─── Tiptap JSON ──────────────────────────────────────────────────────────────
// Solo el intro + lista de grupos. Las reglas y obligación van en bloques especiales.

const tiptap = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Para " },
        { type: "text", marks: [{ type: "bold" }], text: "TODAS" },
        { type: "text", text: " las excursiones invernales (internas y externas) se debe consultar disponibilidad antes de confirmar." },
      ],
    },
    {
      type: "heading",
      attrs: { level: 3 },
      content: [{ type: "text", text: "Grupos de Consulta" }],
    },
    {
      type: "bulletList",
      content: [
        ["DIVERSIDAD", "Grupo Diversidad Disponibilidad"],
        ["NOCHE NÓRDICA", "Grupo SKI NÓRDICO Disponibilidad"],
        ["ROCA NEGRA", "Grupo ROCA NEGRA Disponibilidad"],
        ["LA CUEVA", "Grupo LA CUEVA Disponibilidad"],
        ["WINTER PARK", "Grupo WINTER PARK Disponibilidad"],
        ["Bautismo ski/sno", "Grupo EPIC Disponibilidad"],
        ["Escuelita de ski", "Grupo MOUNTAIN Disponibilidad"],
        ["INTERNOS", "Grupo EXTREMO ENCANTADO Disponibilidad"],
      ].map(([excursion, grupo]) => ({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", marks: [{ type: "bold" }], text: excursion },
              { type: "text", text: ` → ${grupo}` },
            ],
          },
        ],
      })),
    },
  ],
};

// ─── Bloques especiales ───────────────────────────────────────────────────────

const blocks = [
  {
    type: "alert",
    color: "danger",
    title: "Regla",
    text: "No confirmar sin disponibilidad. Siempre esperar OK del proveedor.",
  },
  {
    type: "alert",
    color: "success",
    title: "Post-reserva — OBLIGATORIO",
    text: "Enviar voucher al grupo RESERVAS INTERNAS SIN EXCEPCIÓN.",
  },
];

// ─── Update ───────────────────────────────────────────────────────────────────

const response = await fetch(
  `${SUPABASE_URL}/rest/v1/lessons?id=eq.${LESSON_ID}`,
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Accept-Profile": "capacitacion_tm",
      "Content-Profile": "capacitacion_tm",
    },
    body: JSON.stringify({
      content_json: { tiptap, blocks },
    }),
  }
);

if (response.ok) {
  console.log("✅ Lección actualizada correctamente.");
} else {
  const err = await response.text();
  console.error("❌ Error:", response.status, err);
}
