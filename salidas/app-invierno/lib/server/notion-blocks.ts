import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";

// ---------------------------------------------------------------------------
// Fetch all child blocks of a page/block (handles pagination)
// ---------------------------------------------------------------------------
export async function getPageBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const block of response.results) {
      if ("type" in block) {
        blocks.push(block as BlockObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Eager-fetch rows for table blocks so NotionBlockRenderer can render them
  await Promise.all(
    blocks
      .filter((b) => b.type === "table")
      .map(async (b) => {
        const rows = await getPageBlocks(b.id);
        (b as BlockObjectResponse & { _rows?: BlockObjectResponse[] })._rows = rows;
      })
  );

  return blocks;
}

// ---------------------------------------------------------------------------
// Extract plain text from bulleted_list_item and numbered_list_item blocks
// ---------------------------------------------------------------------------
/** Normalize typographic (curly) quotes to straight ASCII quotes */
function normQuotes(s: string): string {
  return s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
}

export function parseBulletItems(blocks: BlockObjectResponse[]): string[] {
  return blocks
    .filter((b) => b.type === "bulleted_list_item" || b.type === "numbered_list_item")
    .map((b) => {
      if (b.type === "bulleted_list_item") {
        return normQuotes(b.bulleted_list_item.rich_text.map((t) => t.plain_text).join(""));
      }
      if (b.type === "numbered_list_item") {
        return normQuotes(b.numbered_list_item.rich_text.map((t) => t.plain_text).join(""));
      }
      return "";
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Extract callout blocks: emoji icon + text
// ---------------------------------------------------------------------------
export interface CalloutEntry {
  emoji: string;
  text: string;
}

export function parseCallouts(blocks: BlockObjectResponse[]): CalloutEntry[] {
  return blocks
    .filter((b) => b.type === "callout")
    .map((b) => {
      if (b.type !== "callout") return null;
      const text = b.callout.rich_text.map((t) => t.plain_text).join("");
      const icon = b.callout.icon;
      const emoji = icon?.type === "emoji" ? icon.emoji : "";
      return { emoji, text };
    })
    .filter((e): e is CalloutEntry => e !== null && e.text.length > 0);
}

// ---------------------------------------------------------------------------
// Fetch table rows from a table block (rows are child blocks of the table)
// Skips the header row when has_column_header = true
// Returns rows as string[][] (each row is an array of cell plain texts)
// ---------------------------------------------------------------------------
export async function parseTable(blocks: BlockObjectResponse[]): Promise<string[][]> {
  const tableBlock = blocks.find((b) => b.type === "table");
  if (!tableBlock || tableBlock.type !== "table") return [];

  const hasHeader = tableBlock.table.has_column_header;
  const rowBlocks = await getPageBlocks(tableBlock.id);

  const rows: string[][] = [];
  let isFirst = true;

  for (const row of rowBlocks) {
    if (row.type !== "table_row") continue;
    if (hasHeader && isFirst) {
      isFirst = false;
      continue; // skip header row
    }
    isFirst = false;
    const cells = row.table_row.cells.map((cell) =>
      cell.map((t) => t.plain_text).join("")
    );
    rows.push(cells);
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Group blocks by heading_2 text → returns sections as Record<heading, blocks[]>
// Blocks before the first heading go into key ""
// ---------------------------------------------------------------------------
export function parseSectionedBlocks(
  blocks: BlockObjectResponse[]
): Record<string, BlockObjectResponse[]> {
  const sections: Record<string, BlockObjectResponse[]> = { "": [] };
  let current = "";

  for (const block of blocks) {
    if (block.type === "heading_2") {
      current = block.heading_2.rich_text.map((t) => t.plain_text).join("").trim();
      sections[current] = [];
    } else {
      sections[current] = sections[current] ?? [];
      sections[current].push(block);
    }
  }

  return sections;
}
