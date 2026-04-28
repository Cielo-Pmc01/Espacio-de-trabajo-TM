import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";
import {
  getPageBlocks,
  parseBulletItems,
  parseSectionedBlocks,
  parseTable,
} from "@/lib/server/notion-blocks";
import type { ModuleMeta, Product, ProductPrice, ProductType } from "@/lib/training-types";

// Mapping de OrdenID → categoria de excursion
const CATEGORIA_MAP: Record<number, Product["categoria"]> = {
  // Invernales (nieve)
  5: "invernal",
  6: "invernal",
  7: "invernal",
  9: "invernal",
  10: "invernal",
  11: "invernal",
  12: "invernal",
  13: "invernal",
  14: "invernal",
  15: "invernal",
  16: "invernal",
  17: "invernal",
  22: "invernal",
  23: "invernal",
  24: "invernal",
  25: "invernal",
  // Terrestres
  1: "terrestre",
  27: "terrestre",
  28: "terrestre",
  29: "terrestre",
  30: "terrestre",
  31: "terrestre",
  41: "terrestre",
  // Lacustres
  32: "lacustre",
  33: "lacustre",
  // Aventura
  34: "aventura",
  35: "aventura",
  36: "aventura",
  39: "aventura",
  40: "aventura",
  42: "aventura",
  43: "aventura",
  // Alquiler
  26: "alquiler",
};

// ---------------------------------------------------------------------------
// Property helpers
// ---------------------------------------------------------------------------

function getText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  if (!p || p.type !== "rich_text") return "";
  return p.rich_text.map((t) => t.plain_text).join("");
}

function getSelect(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "select" && p.select ? p.select.name : "";
}

// ---------------------------------------------------------------------------
// Body (block) helpers
// ---------------------------------------------------------------------------

/** Fetch and group the page body into named sections by heading_2 */
async function getProductBody(pageId: string): Promise<{
  prices: ProductPrice[];
  includes: string[];
  notIncludes: string[];
  additional: string[];
  itinerary: string | undefined;
}> {
  const blocks = await getPageBlocks(pageId);
  const sections = parseSectionedBlocks(blocks);

  // Precios → table with header row "Método | Precio"
  const preciosBlocks = sections["Precios"] ?? [];
  const priceRows = await parseTable(preciosBlocks);
  const prices: ProductPrice[] = priceRows
    .filter((row) => row.length >= 2 && row[0])
    .map((row) => ({ method: row[0], price: row[1] ?? "" }));

  // Listas → bullets
  const includes = parseBulletItems(sections["Incluye"] ?? []);
  const notIncludes = parseBulletItems(sections["No incluye"] ?? []);
  const additional = parseBulletItems(sections["Adicional"] ?? []);

  // Itinerario → first paragraph block text
  const itinerarioBlocks = sections["Itinerario"] ?? [];
  const paraBlock = itinerarioBlocks.find((b) => b.type === "paragraph");
  const itinerary =
    paraBlock?.type === "paragraph"
      ? paraBlock.paragraph.rich_text.map((t) => t.plain_text).join("") || undefined
      : undefined;

  return { prices, includes, notIncludes, additional, itinerary };
}

// ---------------------------------------------------------------------------
// Page → Product (properties only — body is fetched separately)
// ---------------------------------------------------------------------------

function mapPageProps(page: PageObjectResponse): Omit<Product, "prices" | "includes" | "notIncludes" | "additional" | "itinerary"> {
  const nameTitle = page.properties["Nombre"];
  const name =
    nameTitle?.type === "title"
      ? nameTitle.title.map((t) => t.plain_text).join("")
      : "";

  const ordenProp = page.properties["OrdenID"];
  const id =
    ordenProp?.type === "number" && ordenProp.number != null ? ordenProp.number : 0;

  const tipoProp = page.properties["Tipo"];
  const type: ProductType =
    tipoProp?.type === "select" && tipoProp.select
      ? (tipoProp.select.name as ProductType)
      : "excursion";

  const tagsProp = page.properties["Tags"];
  const tags: string[] =
    tagsProp?.type === "multi_select"
      ? tagsProp.multi_select.map((t) => t.name)
      : [];

  return {
    id,
    name,
    type,
    emoji: getText(page, "Emoji"),
    provider: getText(page, "Proveedor") || undefined,
    diferencial: getText(page, "Diferencial") || undefined,
    schedule: getText(page, "Horarios"),
    duration: getText(page, "Duracion") || undefined,
    description: getText(page, "Descripcion"),
    season: getText(page, "Temporada"),
    meetingPoint: getText(page, "PuntoEncuentro"),
    freeAge: getText(page, "EdadLibre") || null,
    tags,
    categoria: CATEGORIA_MAP[id],
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function getProductsFromNotion(): Promise<{ products: Product[]; meta: ModuleMeta }> {
  await connection();
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
      page_size: 100,
      filter: {
        property: "Modulo",
        select: { equals: "Módulo 1" },
      },
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Avoid relying on the mutable Notion select label for "Modulo".
  // Products are identified by a positive OrdenID and their product-specific fields.
  const validPages = pages.filter((p) => {
    const ordenProp = p.properties["OrdenID"];
    const id = ordenProp?.type === "number" && ordenProp.number != null ? ordenProp.number : 0;
    return id > 0;
  });

  // Fetch all page bodies concurrently
  const bodies = await Promise.all(validPages.map((p) => getProductBody(p.id)));

  const meta: ModuleMeta = validPages.length > 0
    ? {
        shortLabel: getSelect(validPages[0], "Modulo"),
        title: getSelect(validPages[0], "Subtitulo"),
      }
    : { shortLabel: "Módulo 1", title: "Excursiones" };

  const products = validPages
    .map((page, i) => ({
      ...mapPageProps(page),
      ...bodies[i],
    }))
    .sort((a, b) => a.id - b.id);

  return { products, meta };
}
