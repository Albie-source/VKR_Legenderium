"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim();

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    redirect(makeLoginErrorUrl(next));
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    redirect(makeLoginErrorUrl(next));
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  if (isSafeInternalPath(next)) {
    redirect(next);
  }

  redirect("/profile");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);

  redirect("/login");
}

function makeLoginErrorUrl(next: string) {
  const params = new URLSearchParams();

  params.set("error", "1");

  if (isSafeInternalPath(next)) {
    params.set("next", next);
  }

  return `/login?${params.toString()}`;
}

function isSafeInternalPath(value: string) {
  return value.startsWith("/") && !value.startsWith("//");
}
