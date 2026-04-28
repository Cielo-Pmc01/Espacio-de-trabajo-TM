import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";
import { getPageBlocks } from "@/lib/server/notion-blocks";
import type { ContentSection, InfoAdicionalData } from "@/lib/training-types";

// ---------------------------------------------------------------------------
// Property helpers
// ---------------------------------------------------------------------------

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
 * Fetches Información Adicional content from Notion.
 *
 * Notion setup:
 *   - Pages in Cursos DB with Modulo = "Info Adicional".
 *   - Bloque options: "Bloque Vendedores Online", "Glosario".
 *   - Sorted by OrdenID.
 */
export async function getInfoAdicionalFromNotion(): Promise<InfoAdicionalData> {
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
        select: { equals: "Info Adicional" },
      },
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const sorted = [...pages].sort((a, b) => getNumber(a, "OrdenID") - getNumber(b, "OrdenID"));
  const bodies = await Promise.all(sorted.map((p) => getPageBlocks(p.id)));

  const sections: ContentSection[] = sorted.map((page, i) => ({
    id: page.id,
    title: getTitle(page),
    blocks: bodies[i],
  }));

  return sections;
}
