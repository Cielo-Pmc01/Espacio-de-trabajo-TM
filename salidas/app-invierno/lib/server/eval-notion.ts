import { connection } from "next/server";

import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import notion from "@/lib/notion-client";
import { getPageBlocks, parseBulletItems, parseSectionedBlocks } from "@/lib/server/notion-blocks";
import type {
  DragQuestion,
  EvalQuestion,
  MatchQuestion,
  MultipleChoiceQuestion,
  OpenQuestion,
  QuestionSection,
} from "@/lib/training-types";

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

function getRichText(page: PageObjectResponse, prop: string): string {
  const p = page.properties[prop];
  if (!p || p.type !== "rich_text") return "";
  return p.rich_text.map((t) => t.plain_text).join("");
}

function getTitle(page: PageObjectResponse): string {
  const p = page.properties["Nombre"];
  if (!p || p.type !== "title") return "";
  return p.title.map((t) => t.plain_text).join("");
}

// ---------------------------------------------------------------------------
// Page body → question data
// ---------------------------------------------------------------------------

async function parseQuestionBody(
  pageId: string,
  type: string,
): Promise<Partial<EvalQuestion>> {
  const blocks = await getPageBlocks(pageId);
  const sections = parseSectionedBlocks(blocks);

  if (type === "mc") {
    const opts = parseBulletItems(sections["Opciones"] ?? []);
    return { opts } as Partial<MultipleChoiceQuestion>;
  }

  if (type === "open") {
    const paraBlock = (sections["Placeholder"] ?? []).find(
      (b) => b.type === "paragraph",
    );
    const placeholder =
      paraBlock?.type === "paragraph"
        ? paraBlock.paragraph.rich_text.map((t) => t.plain_text).join("")
        : "Escribí tu respuesta...";
    return { placeholder } as Partial<OpenQuestion>;
  }

  if (type === "drag") {
    const items = parseBulletItems(sections["Items"] ?? []);
    const zones = parseBulletItems(sections["Zonas"] ?? []);
    const correct: Record<string, string> = {};
    for (const line of parseBulletItems(sections["Respuestas"] ?? [])) {
      const [k, v] = line.split(" → ");
      if (k && v) correct[k.trim()] = v.trim();
    }
    return { items, zones, correct } as Partial<DragQuestion>;
  }

  if (type === "match") {
    const left = parseBulletItems(sections["Izquierda"] ?? []);
    const right = parseBulletItems(sections["Derecha"] ?? []);
    const correct: Record<string, string> = {};
    for (const line of parseBulletItems(sections["Respuestas"] ?? [])) {
      const [k, v] = line.split(" → ");
      if (k && v) correct[k.trim()] = v.trim();
    }
    return { left, right, correct } as Partial<MatchQuestion>;
  }

  return {};
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function getEvalQuestionsFromNotion(): Promise<EvalQuestion[]> {
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
        select: { equals: "Evaluación" },
      },
    });

    for (const page of response.results) {
      if (page.object === "page" && "properties" in page) {
        pages.push(page as PageObjectResponse);
      }
    }

    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Ordenar por OrdenEval
  const sorted = pages.sort(
    (a, b) => getNumber(a, "OrdenEval") - getNumber(b, "OrdenEval"),
  );

  // Construir cada pregunta en paralelo
  const questions = await Promise.all(
    sorted.map(async (page, i): Promise<EvalQuestion | null> => {
      const type = getSelectName(page, "TipoPregunta");
      const section = getSelectName(page, "SeccionEval") as QuestionSection;
      const pts = getNumber(page, "Puntos");
      const q = getTitle(page);
      const id = `q${getNumber(page, "OrdenEval") || i + 1}`;

      if (!type || !q) return null;

      const body = await parseQuestionBody(page.id, type);

      if (type === "mc") {
        const correcta = getNumber(page, "Correcta");
        return {
          id,
          type: "mc",
          section,
          pts,
          q,
          opts: (body as Partial<MultipleChoiceQuestion>).opts ?? [],
          ans: correcta,
        } satisfies MultipleChoiceQuestion;
      }

      if (type === "open") {
        const placeholder =
          getRichText(page, "Placeholder") ||
          (body as Partial<OpenQuestion>).placeholder ||
          "Escribí tu respuesta...";
        return {
          id,
          type: "open",
          section,
          pts,
          q,
          placeholder,
        } satisfies OpenQuestion;
      }

      if (type === "drag") {
        const b = body as Partial<DragQuestion>;
        return {
          id,
          type: "drag",
          section,
          pts,
          q,
          items: b.items ?? [],
          zones: b.zones ?? [],
          correct: b.correct ?? {},
        } satisfies DragQuestion;
      }

      if (type === "match") {
        const b = body as Partial<MatchQuestion>;
        return {
          id,
          type: "match",
          section,
          pts,
          q,
          left: b.left ?? [],
          right: b.right ?? [],
          correct: b.correct ?? {},
        } satisfies MatchQuestion;
      }

      return null;
    }),
  );

  return questions.filter((q): q is EvalQuestion => q !== null);
}
