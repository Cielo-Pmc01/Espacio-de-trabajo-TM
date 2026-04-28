import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import type { ModuleMeta } from "@/lib/training-types";

import notion from "@/lib/notion-client";
import {
  getPageBlocks,
  parseBulletItems,
  parseCallouts,
  parseTable,
} from "@/lib/server/notion-blocks";
import type { ContentSection } from "@/lib/training-types";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ProtocolItem {
  nombre: string;
  descripcion: string;
  tono?: "critical" | "muted" | "positive";
}

export interface ProtocolsData {
  // Bloque 1 — 7 operational protocols (block-based, rendered with NotionBlockRenderer)
  bloque1: ContentSection[];
  // Bloque 1 reference — structured quick-reference data (existing)
  salesPriority: ProtocolItem[];        // Invernales
  salesPriorityAnual: ProtocolItem[];   // Todo el año (terrestres)
  clothingNotes: ProtocolItem[];
  providerAvailability: ProtocolItem[]; // nombre = proveedor, descripcion = grupo WA
  availabilityChecklist: string[];
  paymentWarnings: string[];
  paymentRules: string[];
  fullPaymentSteps: string[];
  // Bloque 2 — block-based content sections (e.g. Patagonia Booking)
  bloque2: ContentSection[];
}

const KNOWN_PROTOCOL_SECTIONS = new Set([
  "salesPriority",
  "salesPriorityAnual",
  "clothingNotes",
  "providerAvailability",
  "availabilityChecklist",
  "paymentWarnings",
  "paymentRules",
  "fullPaymentSteps",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSeccion(page: PageObjectResponse): string {
  const p = page.properties["Seccion"];
  return p?.type === "select" && p.select ? p.select.name : "";
}

function getSelect(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "select" && p.select ? p.select.name : "";
}

/** Callout emoji → tono */
function emojiToTono(emoji: string): ProtocolItem["tono"] | undefined {
  if (emoji === "🔴") return "critical";
  if (emoji === "⚪") return "muted";
  if (emoji === "🟢") return "positive";
  return undefined;
}

// ---------------------------------------------------------------------------
// Section parsers — each receives a pageId and returns the right shape
// ---------------------------------------------------------------------------

/** Tabla de 2 columnas → ProtocolItem[] (col0=nombre, col1=descripcion) */
async function tableToItems(pageId: string): Promise<ProtocolItem[]> {
  const blocks = await getPageBlocks(pageId);
  const rows = await parseTable(blocks);
  return rows
    .filter((row) => row.length >= 2 && row[0])
    .map((row) => ({ nombre: row[0], descripcion: row[1] ?? "" }));
}

/** Callout blocks → ProtocolItem[] con tono derivado del emoji del callout */
async function calloutsToItems(pageId: string): Promise<ProtocolItem[]> {
  const blocks = await getPageBlocks(pageId);
  const entries = parseCallouts(blocks);
  return entries.map(({ emoji, text }) => {
    // Notion stores bold as annotations (annotations.bold=true) — plain_text has no ** markers.
    // Split on the first ": " to separate label from description.
    const colonIdx = text.indexOf(": ");
    if (colonIdx !== -1) {
      return {
        nombre: text.slice(0, colonIdx).trim(),
        descripcion: text.slice(colonIdx + 2).trim(),
        tono: emojiToTono(emoji),
      };
    }
    return { nombre: text, descripcion: "", tono: emojiToTono(emoji) };
  });
}

/** Bullets / numbered list → string[] */
async function bulletsToList(pageId: string): Promise<string[]> {
  const blocks = await getPageBlocks(pageId);
  return parseBulletItems(blocks);
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function getProtocolsFromNotion(): Promise<{ protocols: ProtocolsData; meta: ModuleMeta }> {
  await connection();
  const databaseId = process.env.NOTION_DATABASE_ID!;

  // Fetch all pages and identify protocol entries by their stable Seccion key,
  // instead of depending on a mutable Modulo select option label.
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const protocolPages = pages.filter((page) => KNOWN_PROTOCOL_SECTIONS.has(getSeccion(page)));

  // Bloque 1 pages: Modulo = "Módulo 2" and Bloque = "Bloque 1" (block-based operational protocols)
  const bloque1Pages = pages
    .filter(
      (page) =>
        getSelect(page, "Modulo") === "Módulo 2" &&
        getSelect(page, "Bloque") === "Bloque 1",
    )
    .sort((a, b) => {
      const aOrd = (a.properties["OrdenID"]?.type === "number" && a.properties["OrdenID"].number != null)
        ? a.properties["OrdenID"].number : 0;
      const bOrd = (b.properties["OrdenID"]?.type === "number" && b.properties["OrdenID"].number != null)
        ? b.properties["OrdenID"].number : 0;
      return aOrd - bOrd;
    });

  // Bloque 2 pages: Modulo = "Módulo 2" and Bloque = "Bloque 2"
  const bloque2Pages = pages
    .filter(
      (page) =>
        getSelect(page, "Modulo") === "Módulo 2" &&
        getSelect(page, "Bloque") === "Bloque 2",
    )
    .sort((a, b) => {
      const aOrd = (a.properties["OrdenID"]?.type === "number" && a.properties["OrdenID"].number != null)
        ? a.properties["OrdenID"].number : 0;
      const bOrd = (b.properties["OrdenID"]?.type === "number" && b.properties["OrdenID"].number != null)
        ? b.properties["OrdenID"].number : 0;
      return aOrd - bOrd;
    });

  // Index pages by their Seccion select value
  const bySeccion: Record<string, PageObjectResponse> = {};
  for (const page of protocolPages) {
    const sec = getSeccion(page);
    if (sec) bySeccion[sec] = page;
  }

  // Parse each section concurrently from the page body (blocks)
  const allResults = await Promise.all([
    bySeccion["salesPriority"]        ? tableToItems(bySeccion["salesPriority"].id)            : Promise.resolve<ProtocolItem[]>([]),
    bySeccion["salesPriorityAnual"]   ? tableToItems(bySeccion["salesPriorityAnual"].id)        : Promise.resolve<ProtocolItem[]>([]),
    bySeccion["clothingNotes"]        ? calloutsToItems(bySeccion["clothingNotes"].id)          : Promise.resolve<ProtocolItem[]>([]),
    bySeccion["providerAvailability"] ? tableToItems(bySeccion["providerAvailability"].id)      : Promise.resolve<ProtocolItem[]>([]),
    bySeccion["availabilityChecklist"]? bulletsToList(bySeccion["availabilityChecklist"].id)    : Promise.resolve<string[]>([]),
    bySeccion["paymentWarnings"]      ? bulletsToList(bySeccion["paymentWarnings"].id)          : Promise.resolve<string[]>([]),
    bySeccion["paymentRules"]         ? bulletsToList(bySeccion["paymentRules"].id)             : Promise.resolve<string[]>([]),
    bySeccion["fullPaymentSteps"]     ? bulletsToList(bySeccion["fullPaymentSteps"].id)         : Promise.resolve<string[]>([]),
    ...bloque1Pages.map((p) => getPageBlocks(p.id)),
    ...bloque2Pages.map((p) => getPageBlocks(p.id)),
  ]);

  const [salesPriority, salesPriorityAnual, clothingNotes, providerAvailability, availabilityChecklist, paymentWarnings, paymentRules, fullPaymentSteps] =
    allResults as [ProtocolItem[], ProtocolItem[], ProtocolItem[], ProtocolItem[], string[], string[], string[], string[]];

  const bloque1Bodies = allResults.slice(8, 8 + bloque1Pages.length);
  const bloque2Bodies = allResults.slice(8 + bloque1Pages.length);

  const bloque1: ContentSection[] = bloque1Pages.map((page, i) => {
    const nameProp = page.properties["Nombre"];
    const title = nameProp?.type === "title" ? nameProp.title.map((t) => t.plain_text).join("") : "";
    return { id: page.id, title, blocks: bloque1Bodies[i] as import("@notionhq/client/build/src/api-endpoints").BlockObjectResponse[] };
  });

  const bloque2: ContentSection[] = bloque2Pages.map((page, i) => {
    const nameProp = page.properties["Nombre"];
    const title = nameProp?.type === "title" ? nameProp.title.map((t) => t.plain_text).join("") : "";
    return { id: page.id, title, blocks: bloque2Bodies[i] as import("@notionhq/client/build/src/api-endpoints").BlockObjectResponse[] };
  });

  const firstPage = protocolPages[0];
  const meta: ModuleMeta = firstPage
    ? {
        shortLabel: getSelect(firstPage, "Modulo"),
        title: getSelect(firstPage, "Subtitulo"),
      }
    : { shortLabel: "Módulo 2", title: "Protocolos" };

  return {
    protocols: {
      bloque1,
      salesPriority,
      salesPriorityAnual,
      clothingNotes,
      providerAvailability,
      availabilityChecklist,
      paymentWarnings,
      paymentRules,
      fullPaymentSteps,
      bloque2,
    },
    meta,
  };
}
