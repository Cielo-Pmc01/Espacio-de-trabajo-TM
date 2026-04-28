export const providerAvailabilityRows = [
  ["Diversidad (Neumeyer)", "Diversidad Disponibilidad"],
  ["Noche Nórdica", "SKI NÓRDICO Disponibilidad"],
  ["Roca Negra", "ROCA NEGRA Disponibilidad"],
  ["La Cueva", "LA CUEVA Disponibilidad"],
  ["Winter Park", "WINTER PARK Disponibilidad"],
  ["Bautismo Ski/Snow (Epic)", "EPIC Disponibilidad"],
  ["Escuelita Ski/Snow", "MOUNTAIN Disponibilidad"],
  [
    "Internos (Nieve/Noche Encantada, Culipatín)",
    "EXTREMO ENCANTADO Disponibilidad",
  ],
] as const;

export const generalClothingNotes = [
  {
    tone: "critical",
    label: "Obligatoria",
    text: "en todas las actividades y excursiones de nieve",
  },
  {
    tone: "muted",
    label: "Opcional",
    text: "(recomendada) en traslados",
  },
  {
    tone: "positive",
    label: "Alquiler disponible",
    text: "Patagonia Showroom, Moreno 193, centro de Bariloche",
  },
] as const;

export const salesPriority = [
  {
    title: "Nieve Encantada",
    description:
      "4x4 + 2 actividades en nieve + gastronomía. Producto principal diurno.",
  },
  {
    title: "Noche Encantada",
    description:
      "Experiencia nocturna con fuerte componente emocional. Producto principal de noche.",
  },
] as const;

export const paymentWarnings = [
  'Usar únicamente los valores de seña del documento "2-EXCURSIONES DE INVIERNO".',
  "No modificar valores bajo ningún concepto.",
] as const;

export const paymentCommunicationRules = [
  "Informar siempre el saldo pendiente al enviar el voucher.",
  "Repetirlo aunque el cliente ya lo haya escuchado previamente.",
] as const;

export const fullPaymentSteps = [
  "Reenviar el voucher a Adm003.",
  'Indicar la leyenda "ABONÓ TOTAL".',
  "Detallar el valor que correspondía como saldo.",
] as const;

export const availabilityChecklist = [
  "No confirmar sin disponibilidad del proveedor.",
  "Siempre esperar OK del proveedor antes de confirmar.",
  "Post-reserva: enviar voucher al grupo RESERVAS INTERNAS sin excepción.",
] as const;

export const moduleTabs = [
  {
    id: "module0",
    shortLabel: "Módulo 1",
    title: "Contenido",
    eyebrow: "iAdventure Center",
  },
  {
    id: "module1",
    shortLabel: "Módulo 1",
    title: "Excursiones",
    eyebrow: "Temporada Invierno 2026",
  },
  {
    id: "module2",
    shortLabel: "Módulo 2",
    title: "Protocolos",
    eyebrow: "Operación Segura",
  },
  {
    id: "module3",
    shortLabel: "Módulo 3",
    title: "Área Comercial",
    eyebrow: "Desarrollo Comercial",
  },
] as const;
