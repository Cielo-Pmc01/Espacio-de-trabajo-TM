import "server-only";

import type { ServiceConfig } from "@/lib/training-types";

const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 12;

export function getServerConfig(): ServiceConfig {
  const rawTtl = Number(process.env.SP_SESSION_TTL_SECONDS);

  return {
    supabaseUrl: process.env.SUPABASE_URL?.trim() || null,
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null,
    webhookUrl: process.env.N8N_WEBHOOK_URL?.trim() || null,
    spPin: process.env.SP_PIN?.trim() || null,
    sessionSecret:
      process.env.SP_SESSION_SECRET?.trim() ||
      "capacitacion-invierno-sp-session",
    sessionTtlSeconds:
      Number.isFinite(rawTtl) && rawTtl > 0
        ? Math.round(rawTtl)
        : DEFAULT_SESSION_TTL_SECONDS,
  };
}

export function hasSupabaseConfig(config = getServerConfig()) {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}
