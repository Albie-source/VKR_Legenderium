"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, signSession } from "@/lib/auth";
import { loginSchema } from "@/lib/schemas";

export async function loginAction(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    next: formData.get("next") ?? "",
  });

  if (!result.success) {
    redirect("/login?error=1");
  }

  const { email, password, next } = result.data;
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

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
