/**
 * NotionBlockRenderer
 *
 * Generic React component that renders an array of Notion BlockObjectResponse
 * blocks as styled HTML. Used by Module 0, Module 3, and Información Adicional.
 *
 * Supported block types:
 *   heading_2, heading_3, paragraph,
 *   bulleted_list_item, numbered_list_item,
 *   callout, divider
 */

import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

// ---------------------------------------------------------------------------
// Rich text → React (handles bold, italic, code, links)
// ---------------------------------------------------------------------------

function RichText({ items }: { items: RichTextItemResponse[] }) {
  return (
    <>
      {items.map((item, i) => {
        const text = item.plain_text;
        if (!text) return null;

        let node: React.ReactNode = text;

        if (item.annotations.code) {
          node = (
            <code
              key={i}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-700"
            >
              {text}
            </code>
          );
        } else {
          if (item.annotations.bold && item.annotations.italic) {
            node = <strong key={i}><em>{text}</em></strong>;
          } else if (item.annotations.bold) {
            node = <strong key={i}>{text}</strong>;
          } else if (item.annotations.italic) {
            node = <em key={i}>{text}</em>;
          } else {
            node = <span key={i}>{text}</span>;
          }
        }

        if (item.href) {
          node = (
            <a
              key={i}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-sky-400 underline-offset-2 hover:text-sky-700"
            >
              {node}
            </a>
          );
        }

        return node;
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Group helper: merge consecutive list blocks into runs
// ---------------------------------------------------------------------------

type BlockRun =
  | { type: "block"; block: BlockObjectResponse }
  | { type: "bullet-list"; items: BlockObjectResponse[] }
  | { type: "number-list"; items: BlockObjectResponse[] };

function groupBlocks(blocks: BlockObjectResponse[]): BlockRun[] {
  const runs: BlockRun[] = [];

  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      const last = runs[runs.length - 1];
      if (last?.type === "bullet-list") {
        last.items.push(block);
      } else {
        runs.push({ type: "bullet-list", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      const last = runs[runs.length - 1];
      if (last?.type === "number-list") {
        last.items.push(block);
      } else {
        runs.push({ type: "number-list", items: [block] });
      }
    } else {
      runs.push({ type: "block", block });
    }
  }

  return runs;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function NotionBlockRenderer({
  blocks,
}: {
  blocks: BlockObjectResponse[];
}) {
  const runs = groupBlocks(blocks);

  return (
    <div className="notion-content space-y-3 text-sm leading-7 text-slate-700">
      {runs.map((run, i) => {
        if (run.type === "bullet-list") {
          return (
            <ul key={i} className="space-y-1.5 pl-5">
              {run.items.map((item, j) => {
                if (item.type !== "bulleted_list_item") return null;
                return (
                  <li key={j} className="relative before:absolute before:-left-4 before:text-slate-400 before:content-['•']">
                    <RichText items={item.bulleted_list_item.rich_text} />
                  </li>
                );
              })}
            </ul>
          );
        }

        if (run.type === "number-list") {
          return (
            <ol key={i} className="space-y-1.5 pl-6 list-decimal">
              {run.items.map((item, j) => {
                if (item.type !== "numbered_list_item") return null;
                return (
                  <li key={j}>
                    <RichText items={item.numbered_list_item.rich_text} />
                  </li>
                );
              })}
            </ol>
          );
        }

        const block = run.block;

        if (block.type === "heading_2") {
          return (
            <h2
              key={i}
              className="mt-6 mb-2 font-display text-lg font-bold text-slate-900 first:mt-0"
            >
              <RichText items={block.heading_2.rich_text} />
            </h2>
          );
        }

        if (block.type === "heading_3") {
          return (
            <h3
              key={i}
              className="mt-4 mb-1.5 text-base font-semibold text-slate-800 first:mt-0"
            >
              <RichText items={block.heading_3.rich_text} />
            </h3>
          );
        }

        if (block.type === "paragraph") {
          const text = block.paragraph.rich_text;
          if (!text.length) {
            return <div key={i} className="h-2" aria-hidden />;
          }
          return (
            <p key={i}>
              <RichText items={text} />
            </p>
          );
        }

        if (block.type === "callout") {
          const icon = block.callout.icon;
          const emoji = icon?.type === "emoji" ? icon.emoji : "💡";
          return (
            <div
              key={i}
              className="flex gap-3 rounded-[1.2rem] border border-amber-200 bg-amber-50/80 px-5 py-4"
            >
              <span className="shrink-0 text-base leading-7">{emoji}</span>
              <p className="text-slate-700">
                <RichText items={block.callout.rich_text} />
              </p>
            </div>
          );
        }

        if (block.type === "divider") {
          return <hr key={i} className="border-slate-200" />;
        }

        if (block.type === "table") {
          const rows = (block as any)._rows as BlockObjectResponse[] | undefined;
          if (!rows || rows.length === 0) return null;
          const hasHeader = block.table.has_column_header;
          const headerRow = hasHeader && rows[0]?.type === "table_row" ? rows[0] : null;
          const bodyRows = hasHeader ? rows.slice(1) : rows;
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse bg-white text-left text-sm">
                {headerRow ? (
                  <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-400">
                    <tr>
                      {headerRow.table_row.cells.map((cell, ci) => (
                        <th key={ci} className="px-4 py-3 font-semibold">
                          {cell.map((t) => t.plain_text).join("")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {bodyRows.map((row, ri) => {
                    if (row.type !== "table_row") return null;
                    return (
                      <tr key={ri} className="border-t border-slate-100 even:bg-slate-50/50">
                        {row.table_row.cells.map((cell, ci) => (
                          <td key={ci} className="px-4 py-3 text-slate-700">
                            {cell.map((t) => t.plain_text).join("")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        // Unknown block type — render nothing
        return null;
      })}
    </div>
  );
}
