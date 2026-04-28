/**
 * Gestión de sesiones con cookies HMAC (sin librería externa)
 * Basado en app-invierno
 */

import { cookies } from "next/headers";
import { config } from "./config";

const SESSION_COOKIE = "capacitacion_session";
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 horas

export interface SessionData {
  userId: string;
  username: string;
  role: "vendor" | "admin";
  expiresAt: number;
}

// Función simple de hash (en producción usar crypto.subtle o bcrypt)
function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function createSession(data: Omit<SessionData, "expiresAt">): Promise<string> {
  const session: SessionData = {
    ...data,
    expiresAt: Date.now() + SESSION_TTL,
  };

  const sessionString = JSON.stringify(session);
  const signature = simpleHash(sessionString + config.adminPin);
  const signedSession = `${Buffer.from(sessionString).toString("base64")}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL / 1000,
    path: "/",
  });

  return signedSession;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const signedSession = cookieStore.get(SESSION_COOKIE)?.value;

  if (!signedSession) return null;

  try {
    const [sessionBase64, signature] = signedSession.split(".");
    if (!sessionBase64 || !signature) return null;

    const sessionString = Buffer.from(sessionBase64, "base64").toString();
    
    // Verificar firma
    const expectedSignature = simpleHash(sessionString + config.adminPin);
    if (signature !== expectedSignature) return null;

    const session: SessionData = JSON.parse(sessionString);

    // Verificar expiración
    if (Date.now() > session.expiresAt) {
      await destroySession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(role?: "vendor" | "admin"): Promise<SessionData> {
  const session = await getSession();
  
  if (!session) {
    throw new Error("No autorizado");
  }

  if (role && session.role !== role) {
    throw new Error("Acceso denegado");
  }

  return session;
}
