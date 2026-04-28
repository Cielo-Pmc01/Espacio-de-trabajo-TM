/**
 * Configuración centralizada de variables de entorno
 * Todas las env vars se leen desde aquí para mantener consistencia
 */

export const config = {
  // Notion API
  notionToken: process.env.NOTION_TOKEN || '',
  notionDatabaseContentId: process.env.NOTION_DATABASE_CONTENT_ID || '',
  notionDatabaseUsersId: process.env.NOTION_DATABASE_USERS_ID || '',
  notionDatabaseEvaluationsId: process.env.NOTION_DATABASE_EVALUATIONS_ID || '',
  notionDatabaseProgressId: process.env.NOTION_DATABASE_PROGRESS_ID || '',

  // Admin
  adminPin: process.env.ADMIN_PIN || '1234',

  // Avatar IA
  avatarOpenAiKey: process.env.AVATAR_OPENAI_API_KEY || '',
  avatarElevenLabsKey: process.env.AVATAR_ELEVENLABS_API_KEY || '',

  // n8n Webhook
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
} as const;

// Validación de configuración
export function validateConfig(): void {
  const required = [
    'NOTION_TOKEN',
    'NOTION_DATABASE_CONTENT_ID',
    'NOTION_DATABASE_USERS_ID',
    'NOTION_DATABASE_EVALUATIONS_ID',
    'NOTION_DATABASE_PROGRESS_ID',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️  Variables de entorno faltantes: ${missing.join(', ')}`);
  }
}
