import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";
import { getPageBlocks } from "@/lib/server/notion-blocks";
import type { IntroData, ModuleMeta } from "@/lib/training-types";

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Fetches Module 0 (Introducción) content from Notion.
 *
 * Notion setup:
 *   - The intro page has Modulo = "Módulo 0" in the Cursos database.
 *   - All body blocks are returned as-is for NotionBlockRenderer.
 */
export async function getIntroFromNotion(): Promise<{ intro: IntroData; meta: ModuleMeta }> {
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
        select: { equals: "Módulo 0" },
      },
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  const introPage = pages[0];

  const blocks = introPage ? await getPageBlocks(introPage.id) : [];

  const meta: ModuleMeta = introPage
    ? {
        shortLabel: getSelectName(introPage, "Modulo"),
        title: getSelectName(introPage, "Subtitulo"),
      }
    : { shortLabel: "Módulo 0", title: "Introducción" };

  return { intro: { blocks }, meta };
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getSelectName(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  return p?.type === "select" && p.select ? p.select.name : "";
}
