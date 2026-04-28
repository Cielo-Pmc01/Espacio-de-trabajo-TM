import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export type ProductType = "excursion" | "traslado" | "clase";

/** A named section containing raw Notion blocks, ready for NotionBlockRenderer */
export interface ContentSection {
  id: string;
  title: string;
  blocks: BlockObjectResponse[];
}

/** Module 0 (Introducción) — flat array of blocks */
export interface IntroData {
  blocks: BlockObjectResponse[];
}

/** One bloque (sub-group) of Module 3 or Module 2 */
export interface ContentBloque {
  /** Bloque label from Notion Bloque select property, e.g. "Bloque 1" */
  bloque: string;
  sections: ContentSection[];
}

/** Module 3 (Área Comercial) — grouped by Bloque */
export type ComercialData = ContentBloque[];

/** Información Adicional — flat sections list */
export type InfoAdicionalData = ContentSection[];

/** Extended ProtocolsData will be imported from protocols-notion in Phase 4 */

export interface ModuleMeta {
  /** Tab button label, e.g. "Módulo 1" — from the Modulo select in Notion */
  shortLabel: string;
  /** Section title, e.g. "Excursiones" — from the Subtitulo select in Notion */
  title: string;
}

export interface ProductPrice {
  method: string;
  price: string;
}

export interface Product {
  id: number;
  name: string;
  type: ProductType;
  emoji: string;
  provider?: string;
  diferencial?: string;
  schedule: string;
  duration?: string;
  description: string;
  season: string;
  meetingPoint: string;
  itinerary?: string;
  includes: string[];
  notIncludes: string[];
  additional?: string[];
  prices: ProductPrice[];
  freeAge?: string | null;
  tags: string[];
  categoria?: "invernal" | "lacustre" | "terrestre" | "aventura" | "alquiler";
}

export type QuestionSection =
  | "Protocolos"
  | "Proveedores"
  | "Ventas"
  | "Excursiones";

interface BaseQuestion {
  id: string;
  section: QuestionSection;
  pts: number;
  q: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: "mc";
  opts: string[];
  ans: number;
}

export interface OpenQuestion extends BaseQuestion {
  type: "open";
  placeholder: string;
}

export interface DragQuestion extends BaseQuestion {
  type: "drag";
  items: string[];
  zones: string[];
  correct: Record<string, string>;
}

export interface MatchQuestion extends BaseQuestion {
  type: "match";
  left: string[];
  right: string[];
  correct: Record<string, string>;
}

export type EvalQuestion =
  | MultipleChoiceQuestion
  | OpenQuestion
  | DragQuestion
  | MatchQuestion;

export interface EvaluationAnswers {
  mc: Record<string, number>;
  open: Record<string, string>;
  drag: Record<string, Record<string, string>>;
  match: Record<string, Record<string, string>>;
}

export interface EvaluationSubmissionInput {
  vendor: string;
  answers: EvaluationAnswers;
}

export interface SectionScore {
  correct: number;
  total: number;
}

export type SectionBreakdown = Record<string, SectionScore>;

export interface SavedDetailEntry {
  placed?: string;
  matched?: string;
  expected?: string;
  ok: boolean;
}

export interface SavedOpenAnswer {
  qid: string;
  section: QuestionSection;
  question: string;
  answer: string;
}

interface SavedResultBase {
  qid: string;
  section: QuestionSection;
  type: EvalQuestion["type"];
  pts: number;
}

export interface SavedMcResult extends SavedResultBase {
  type: "mc";
  ok: boolean;
  chosen: number;
  correctAns: string;
}

export interface SavedInteractiveResult extends SavedResultBase {
  type: "drag" | "match";
  earned: number;
  detail: Record<string, SavedDetailEntry>;
}

export type SavedEvaluationResult = SavedMcResult | SavedInteractiveResult;

export interface SavedEvaluationPayload {
  vendor: string;
  pct: number;
  correct: number;
  total: number;
  label: string;
  sections: SectionBreakdown;
  results: SavedEvaluationResult[];
  openAnswers: SavedOpenAnswer[];
}

export interface SavedEvaluationRecord extends SavedEvaluationPayload {
  id: number | string;
  timestamp: string;
}

export interface EvaluationSubmitResponse {
  evaluation: SavedEvaluationPayload;
  saved: boolean;
  notificationSent: boolean;
  error?: string;
}

export interface SavedProgressPayload {
  vendor: string;
  vendorDate: { day: string; month: string; year: string };
  mcAnswers: Record<string, number>;
  openAnswers: Record<string, string>;
  dragAnswers: Record<string, Record<string, string>>;
  matchAnswers: Record<string, Record<string, string>>;
}

export interface SavedProgressRecord extends SavedProgressPayload {
  id: string;
  timestamp: string;
}

export interface ProgressSaveResponse {
  saved: boolean;
  error?: string;
}

export interface SupervisorLoginInput {
  pin: string;
}

export interface ServiceConfig {
  supabaseUrl: string | null;
  supabaseServiceRoleKey: string | null;
  webhookUrl: string | null;
  spPin: string | null;
  sessionSecret: string;
  sessionTtlSeconds: number;
}
