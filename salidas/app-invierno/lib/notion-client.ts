import { Client } from "@notionhq/client";

// Pasamos un fetch personalizado con cache: 'no-store' para que Next.js
// nunca cachee las respuestas de Notion, ni en build ni en runtime.
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
  fetch: (url, init) =>
    fetch(url, { ...init, cache: "no-store" }),
});

export default notion;
