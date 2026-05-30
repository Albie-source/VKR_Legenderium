import { cache } from "react";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "legendarium_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET env variable is not set");
  }
  return secret ?? "dev-secret-change-in-production-min-32-chars";
}

export function signSession(userId: number): string {
  const payload = String(userId);
  const sig = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${sig}`;
}

function verifySession(cookie: string): number | null {
  const dotIndex = cookie.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = cookie.slice(0, dotIndex);
  const sig = cookie.slice(dotIndex + 1);
  const expected = createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  const userId = Number(payload);
  if (!Number.isInteger(userId) || userId <= 0) return null;

  return userId;
}

// React.cache deduplicates calls within a single request —
// Header and page components share the same DB hit.
export const getCurrentUser = cache(async function getCurrentUser() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!cookieValue) return null;

  const userId = verifySession(cookieValue);
  if (userId === null) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });

  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getAdminUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}
