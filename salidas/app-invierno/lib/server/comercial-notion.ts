import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";
import { getPageBlocks } from "@/lib/server/notion-blocks";
import type { ComercialData, ContentSection, ModuleMeta } from "@/lib/training-types";

// ---------------------------------------------------------------------------
// Property helpers
// ---------------------------------------------------------------------------

function getSelectName(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "select" && p.select ? p.select.name : "";
}

function getNumber(page: PageObjectResponse, prop: string): number {
  const p = page.properties[prop];
  return p?.type === "number" && p.number != null ? p.number : 0;
}

function getTitle(page: PageObjectResponse): string {
  const p = page.properties["Nombre"];
  if (!p || p.type !== "title") return "";
  return p.title.map((t) => t.plain_text).join("");
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetches Module 3 (Área Comercial) content from Notion.
 *
 * Notion setup:
 *   - Pages in Cursos DB with Modulo = "Módulo 3".
 *   - Each page has a Bloque select property (e.g. "Bloque 1").
 *   - Each page has an OrdenID number property for ordering within the bloque.
 *   - The page body (blocks) is the section content for NotionBlockRenderer.
 *   - The page Nombre (title) is the section title.
 *
 * Returns: sections grouped by Bloque, each section with its blocks.
 */
export async function getComercialFromNotion(): Promise<{ comercial: ComercialData; meta: ModuleMeta }> {
  await connection();
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const pages: PageObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
      filter: {
        property: "Modulo",
        select: { equals: "Módulo 3" },
      },
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Sort by OrdenID
  const sorted = [...pages].sort((a, b) => getNumber(a, "OrdenID") - getNumber(b, "OrdenID"));

  // Fetch all page bodies concurrently
  const bodies = await Promise.all(sorted.map((p) => getPageBlocks(p.id)));

  // Build sections
  const sections: ContentSection[] = sorted.map((page, i) => ({
    id: page.id,
    title: getTitle(page),
    blocks: bodies[i],
  }));

  // Group sections by Bloque
  const bloqueOrder: string[] = [];
  const bloqueMap = new Map<string, ContentSection[]>();

  for (let i = 0; i < sorted.length; i++) {
    const bloque = getSelectName(sorted[i], "Bloque") || "Bloque 1";
    if (!bloqueMap.has(bloque)) {
      bloqueMap.set(bloque, []);
      bloqueOrder.push(bloque);
    }
    bloqueMap.get(bloque)!.push(sections[i]);
  }

  const comercial: ComercialData = bloqueOrder.map((bloque) => ({
    bloque,
    sections: bloqueMap.get(bloque) ?? [],
  }));

  const meta: ModuleMeta =
    sorted.length > 0
      ? {
          shortLabel: getSelectName(sorted[0], "Modulo"),
          title: getSelectName(sorted[0], "Subtitulo"),
        }
      : { shortLabel: "Módulo 3", title: "Desarrollo del Área Comercial" };

  return { comercial, meta };
}
