import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const supabase = createClient(
  "https://mrovdtkeckxgknkoeqva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yb3ZkdGtlY2t4Z2tua29lcXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTg2MzE1NywiZXhwIjoyMDkxNDM5MTU3fQ.uEefeNA9mfrHMdLn9resciBZpb6VK36rRCvthPQ59wY",
  { db: { schema: "capacitacion_tm" } }
);

const BLOQUES = {
  excursiones: "ea2253f5-23a1-4f5d-a133-93a694b48115",
  proveedores:  "6b94e483-12c0-43b6-a455-33178a15cf4c",
};

// ── Datos de excursiones ──────────────────────────────────────────────────────
// category usa "/" para separar tipo y temporada → el viewer genera filtros por ambos

const EXCURSIONES = [
  // ── TERRESTRES ──────────────────────────────────────────────────────────────
  {
    id: randomUUID(),
    title: "Circuito Chico y Cerro Campanario",
    category: "Terrestre / Todo el año",
    duration: "8:30 a 12:30 / 14:30 a 19:00 (según época del año)",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8",
    experience: [
      "Cerro Campanario (1 hora) — Ascenso opcional y adicional",
      "Mirador: Punto Panorámico (15 minutos)",
      "Mirador: Capilla San Eduardo (15 minutos)",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Ascenso a Cerro Campanario con tarifas diferenciales: Adultos / Niños / Jubilados",
    ],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "San Martín por Siete Lagos",
    category: "Terrestre / Todo el año",
    duration: "8:00 a 18:30",
    departures: "Diarias",
    pickup: "Av. De Los Pioneros o Av. Bustillo desde km. 8, Centro, Dina Huapi por RN 40",
    experience: [
      "Villa La Angostura (15 min — parada técnica)",
      "Camino de los Siete Lagos: paradas en miradores sobre RN 40 (15 min)",
      "San Martín de Los Andes (2 horas libres)",
    ],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Cerro Tronador y Ventisquero Negro",
    category: "Terrestre / Todo el año",
    duration: "9:00 a 18:30",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8, Supermercado Todo de Villa Los Coihues",
    experience: [
      "Acceso a Parques Nacionales",
      "Mirador: Playa Negra (15 min)",
      "Camping Los Rápidos (30 min) — desayuno",
      "Mirador: Isla Corazón (15 min)",
      "Pampa Linda (1 hora) — almuerzo (pueden llevar o adquirirlo ahí mismo)",
      "Mirador Cerro Tronador y Ventisquero Negro (1 hora) · Opcional en Verano: Acceso a base de Cerro Tronador y Cascada Garganta del Diablo (15 min de caminata — hay una confitería)",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Acceso a Parques Nacionales con tarifas diferenciales: Extranjeros / Residentes nacionales / Estudiantes / Jubilados / Menores",
    ],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Bolsón y Lago Puelo",
    category: "Terrestre / Todo el año",
    duration: "8:30 a 18:00",
    departures: "Martes, jueves y sábado",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8, Supermercado Todo de Villa Los Coihues",
    experience: [
      "Cañadón de la Mosca",
      "Fábrica de mermeladas 'Cabañas Mico' (30 min — desayuno)",
      "Criadero de truchas 'Granja Larix' (30 min — recorrido)",
      "Bolsón (2 horas libres)",
      "Lago Puelo (1 hora libre)",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Acceso a Parques Nacionales con tarifas diferenciales: Extranjeros / Residentes nacionales / Estudiantes / Jubilados / Menores",
    ],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Circuito Grande",
    category: "Terrestre / Todo el año",
    duration: "8:30 a 18:00",
    departures: "Lunes, miércoles y viernes",
    pickup: "Av. De Los Pioneros o Av. Bustillo desde km. 8, Centro, Dina Huapi por RN 40",
    experience: [
      "Villa Llanquín (15 min)",
      "Anfiteatro del río Limay (15 min)",
      "Valle Encantado (15 min)",
      "Villa Traful (1 hora libre)",
      "Villa La Angostura (2 horas libres — almuerzo)",
      "Mirador: Bahía Mansa / Bahía Brava (15 min)",
    ],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Adventure Center",
  },

  // ── TRASLADOS ────────────────────────────────────────────────────────────────
  {
    id: randomUUID(),
    title: "Traslado a Colonia Suiza",
    category: "Traslado / Todo el año",
    duration: "11:00 a 15:00 / 13:00 a 17:00",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8",
    experience: ["Traslado y búsqueda al punto"],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Traslado a Cervecería Patagonia 24.7",
    category: "Traslado / Todo el año",
    duration: "11:00 a 15:00 / 13:00 a 17:00",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8",
    experience: ["Traslado y búsqueda al punto"],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Traslado a Cerro Catedral",
    category: "Traslado / Todo el año",
    duration: "9:00 a 12:30 (verano) · 8:00–16:00 / 10:00–14:00 / 13:00–18:00 (invierno)",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8",
    experience: ["Traslado y búsqueda al punto"],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Adventure Center",
  },

  // ── AVENTURA — VERANO ────────────────────────────────────────────────────────
  {
    id: randomUUID(),
    title: "Rafting Light por el Río Manso",
    category: "Aventura / Verano",
    duration: "Depende del momento de la temporada",
    departures: "Diarias",
    pickup: "Centro, Av. De Los Pioneros o Av. Bustillo hasta km. 8, Supermercado Todo de Villa Los Coihues y Base Villegas",
    experience: [
      "Llegada a Base Villegas: equipamiento y preparación",
      "Zona de embarque: Charla técnica (15 min)",
      "Actividad en Río Manso (1:15 hs): 6 km con rápidos grado I/II",
      "Desembarque y retorno a Base Villegas",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Traslado opcional y adicional",
      "Ver recomendaciones de rafting antes de la actividad",
    ],
    provider: "Adventure Center",
  },
  {
    id: randomUUID(),
    title: "Rafting Al Límite",
    category: "Aventura / Verano",
    duration: "Día completo (aprox. 8:00 a 17:30)",
    departures: "Diarias (hasta tres salidas por día en alta temporada)",
    pickup: "Centro, Av. Bustillo y Av. Pioneros hasta km 8, Supermercado Todo Villa Los Coihues, Base Villegas",
    experience: [
      "Traslado de todos los pax a Parador El Maitén (aprox. 3 horas)",
      "Llegada y preparación: entrega de equipo completo (neoprene, chaleco, casco, botas, chaqueta seca, remo)",
      "Charla técnica de seguridad (15 min)",
      "Actividad de rafting: rápidos clase III/IV hasta el límite con Chile (11 km — 2 horas)",
      "Finalización en Parador El Maitén — almuerzo opcional en el parador",
      "Regreso a Bariloche (quienes fueron con movilidad propia pueden retirarse al finalizar)",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Almuerzo adicional en el Parador El Maitén",
      "Acompañantes abonan el 50% (incluye traslado y estadía en parador sin realizar la actividad)",
      "Tarifas diferenciadas con y sin traslado",
      "Ver recomendaciones de rafting antes de la actividad",
    ],
    provider: "Adventure Center",
  },

  // ── AVENTURA — TODO EL AÑO ───────────────────────────────────────────────────
  {
    id: randomUUID(),
    title: "Kayak por el Lago Moreno",
    category: "Aventura / Todo el año",
    duration: "Medio día (11:00 a 15:00 / 13:00 a 17:00)",
    departures: "Diarias",
    pickup: "Centro, Av. Bustillo y Av. Pioneros hasta km 8. También hospedajes en dirección a Colonia Suiza",
    experience: [
      "Llegada y preparación del equipo",
      "Charla técnica de seguridad",
      "Actividad guiada de kayak en Lago Moreno (kayaks Sit On Top, aguas tranquilas)",
      "Tiempo para disfrutar del entorno natural",
    ],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Interno",
  },
  {
    id: randomUUID(),
    title: "Canopy",
    category: "Aventura / Todo el año",
    duration: "Medio día (aprox. 4 hs · 11:00 a 15:00 / 13:00 a 17:00) · Sujeto a condiciones climáticas",
    departures: "Diarias",
    pickup: "Centro, Av. Bustillo y Av. Pioneros hasta km 8. También hospedajes en dirección a Colonia Suiza",
    experience: [
      "Traslado hacia base de canopy",
      "Ascenso en vehículo 4x4 hasta el inicio de la actividad",
      "Charla técnica y colocación de equipo de seguridad",
      "Recorrido de canopy: circuito de 12 plataformas con más de 1600 metros de deslizamiento por tirolesas",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Edad mínima: 5 años (0 a 4 años no realizan la actividad)",
      "Incluye traslado ida y vuelta y traslado interno en 4x4",
      "Menores de 4 a 12 años con tarifa diferencial",
    ],
    provider: "Interno",
  },
  {
    id: randomUUID(),
    title: "Cabalgatas por el Cerro López",
    category: "Aventura / Todo el año",
    duration: "Medio día (aprox. 4 hs / 1:30 hs de cabalgata · 11:00 a 15:00 / 13:00 a 17:00) · Sujeto a condiciones climáticas",
    departures: "Diarias",
    pickup: "Centro, Av. Bustillo y Av. Pioneros hasta km 8. También hospedajes en dirección a Colonia Suiza",
    experience: [
      "Traslado hacia el campo base en Cerro López",
      "Charla introductoria con guías baqueanos (15 min)",
      "Inicio de cabalgata por senderos de bosque patagónico (40 min)",
      "Paradas en miradores con vistas a los lagos del Circuito Chico (15 min)",
      "Regreso atravesando bosques y pampas abiertas (40 min)",
      "Finalización de la actividad y regreso a Bariloche",
    ],
    includes: [],
    notIncludes: [],
    important: [],
    provider: "Interno",
  },
  {
    id: randomUUID(),
    title: "Buceo en el Lago Moreno",
    category: "Aventura / Todo el año",
    duration: "Medio día (aprox. 4 hs totales / 2 hs de actividad · 11:00 a 15:00 / 13:00 a 17:00) · Sujeto a condiciones climáticas",
    departures: "Diarias",
    pickup: "Centro, Av. Bustillo y Av. Pioneros hasta km 8. También hospedajes en dirección a Colonia Suiza",
    experience: [
      "Traslado hacia Lago Moreno",
      "Charla técnica y de seguridad con instructores certificados",
      "Colocación de equipo técnico completo",
      "Práctica inicial en superficie",
      "Inmersión guiada en el lago (20 a 30 minutos según condiciones físicas)",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Edad mínima: 8 años",
      "No requiere experiencia previa",
      "Realizar con al menos 12 hs previas a un vuelo",
    ],
    provider: "Interno",
  },

  // ── LACUSTRES ────────────────────────────────────────────────────────────────
  {
    id: randomUUID(),
    title: "Isla Victoria y Bosque de Arrayanes",
    category: "Lacustre / Todo el año",
    duration: "Día completo (aprox. 6 a 8 hs · 10:30 a 18:30 / 12:30 a 18:30)",
    departures: "Diarias",
    pickup: "Puerto Pañuelo (km 25 Av. Bustillo). Traslado opcional desde el centro de Bariloche y puntos sobre Av. Bustillo",
    experience: [
      "Embarque en catamarán: Navegación por el Lago Nahuel Huapi",
      "Navegación hacia el Bosque de Arrayanes: Caminata guiada en pasarela por el bosque — Dificultad baja (45 min)",
      "Navegación hacia Isla Victoria: Recorrido guiado hacia Playa del Toro (1:30 hs / 3 hs según salida)",
      "Regreso en catamarán a Puerto Pañuelo",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Tasas de Parques Nacionales",
      "Tasas de embarque",
      "Traslado a Puerto Pañuelo opcional con costo adicional",
      "Tarifa diferencial: Menores de 0 a 4 años liberados / Menores 5 a 12 años y jubilados",
    ],
    provider: "Turisur",
  },
  {
    id: randomUUID(),
    title: "Puerto Blest y Cascada Los Cántaros",
    category: "Lacustre / Todo el año",
    duration: "Día completo (aprox. 7 a 9 hs · 8:30 a 17:00 / 11:30 a 19:00)",
    departures: "Diarias",
    pickup: "Puerto Pañuelo (km 25 Av. Bustillo). Traslado opcional desde el centro de Bariloche y puntos sobre Av. Bustillo",
    experience: [
      "Embarque en catamarán: Navegación por el Lago Nahuel Huapi atravesando Brazo Blest",
      "Arribo a Puerto Blest (zona de selva Valdiviana)",
      "Caminata guiada por el bosque. Visita a la Cascada Los Cántaros (sendero con escalinatas)",
      "Tiempo libre en Puerto Blest / servicios gastronómicos",
      "Regreso en catamarán a Puerto Pañuelo · Opción adicional: navegación por Lago Frías",
    ],
    includes: [],
    notIncludes: [],
    important: [
      "Tasas de Parques Nacionales",
      "Tasas de embarque",
      "Traslado a Puerto Pañuelo opcional con costo adicional",
      "Opción adicional de extensión a Lago Frías",
      "Tarifa diferencial: Menores de 0 a 4 años / Menores 5 a 12 años y jubilados",
    ],
    provider: "Turisur",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function upsertLeccion({ blockId, title, contentJson, lessonType, order }) {
  const { data: existing } = await supabase
    .from("lessons")
    .select("id, title")
    .eq("block_id", blockId)
    .eq("title", title)
    .maybeSingle();

  if (existing) {
    console.log(`⚠️  Ya existe: "${title}" — actualizando contenido...`);
    const { error } = await supabase
      .from("lessons")
      .update({
        content_json: contentJson,
        lesson_type: lessonType,
        is_published: true,
        visible_sectors: ["B1", "VR", "VP"],
      })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`✅ Actualizado: "${title}"`);
    return;
  }

  const { error } = await supabase.from("lessons").insert({
    id: randomUUID(),
    block_id: blockId,
    title,
    content_json: contentJson,
    order,
    lesson_type: lessonType,
    is_published: true,
    visible_sectors: ["B1", "VR", "VP"],
  });
  if (error) throw error;
  console.log(`✅ Creada: "${title}"`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🚀 Cargando Módulo 1 — Excursiones y Proveedores (Todo el año)\n");

  await upsertLeccion({
    blockId: BLOQUES.excursiones,
    title: "Catálogo de excursiones — Todo el año",
    contentJson: { excursions: EXCURSIONES },
    lessonType: "excursion",
    order: 1,
  });

  console.log("\n✨ Listo. Verificá en el admin que la lección aparezca con tipo 'excursion'.");
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
