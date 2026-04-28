/**
 * Cliente Notion API para usar Notion como base de datos principal
 * Reemplaza a Supabase - todo se guarda en Notion
 */

import { Client } from "@notionhq/client";
import { config } from "./config";

// Cliente singleton
let notionClient: Client | null = null;

export function getNotionClient(): Client {
  if (!notionClient) {
    if (!config.notionToken) {
      throw new Error("NOTION_TOKEN no configurado");
    }
    notionClient = new Client({ auth: config.notionToken });
  }
  return notionClient;
}

// Helper para query a base de datos
export async function queryDatabase(databaseId: string, filters?: any) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filters,
    });
    return response.results;
  } catch (error) {
    console.error("Error querying Notion database:", error);
    throw error;
  }
}

// Helper para crear página
export async function createPage(databaseId: string, properties: any, content?: any[]) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
      children: content,
    });
    return response;
  } catch (error) {
    console.error("Error creating Notion page:", error);
    throw error;
  }
}

// Helper para actualizar página
export async function updatePage(pageId: string, properties: any) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    });
    return response;
  } catch (error) {
    console.error("Error updating Notion page:", error);
    throw error;
  }
}

// Helper para obtener página
export async function getPage(pageId: string) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.pages.retrieve({ page_id: pageId });
    return response;
  } catch (error) {
    console.error("Error retrieving Notion page:", error);
    throw error;
  }
}

// Helper para obtener contenido de página (bloques)
export async function getPageContent(pageId: string) {
  const notion = getNotionClient();
  
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
    });
    return response.results;
  } catch (error) {
    console.error("Error retrieving page content:", error);
    throw error;
  }
}
