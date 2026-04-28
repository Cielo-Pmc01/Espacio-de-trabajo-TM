import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerConfig } from "@/lib/server/config";

export const SUPERVISOR_SESSION_COOKIE = "capacitacion_sp_session";

function createSignature(timestamp: string) {
  const { sessionSecret } = getServerConfig();
  return createHmac("sha256", sessionSecret).update(timestamp).digest("base64url");
}

export function createSupervisorSessionValue(now = Date.now()) {
  const issuedAt = String(now);
  const signature = createSignature(issuedAt);
  return `${issuedAt}.${signature}`;
}

export function hasValidSupervisorSession(value?: string | null) {
  if (!value) {
    return false;
  }

  const [issuedAt, signature] = value.split(".");

  if (!issuedAt || !signature || !/^\d+$/.test(issuedAt)) {
    return false;
  }

  const expected = createSignature(issuedAt);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return false;
  }

  const { sessionTtlSeconds } = getServerConfig();
  const issuedAtMs = Number(issuedAt);

  if (!Number.isFinite(issuedAtMs)) {
    return false;
  }

  return Date.now() - issuedAtMs <= sessionTtlSeconds * 1000;
}

export async function isSupervisorAuthenticated() {
  const cookieStore = await cookies();
  return hasValidSupervisorSession(
    cookieStore.get(SUPERVISOR_SESSION_COOKIE)?.value,
  );
}

export async function requireSupervisorSession() {
  if (!(await isSupervisorAuthenticated())) {
    redirect("/sp/login");
  }
}

export function getSupervisorSessionCookieOptions() {
  const { sessionTtlSeconds } = getServerConfig();

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionTtlSeconds,
  };
}
