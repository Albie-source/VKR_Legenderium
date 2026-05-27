"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();
  const next = String(formData.get("next") ?? "").trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    redirect(makeLoginErrorUrl(next));
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  // Временная поддержка старых паролей из seed, если они были записаны обычной строкой.
  // После первого успешного входа пароль автоматически перезапишется bcrypt-хэшем.
  const isLegacyPasswordValid = user.passwordHash === password;

  if (!isPasswordValid && !isLegacyPasswordValid) {
    redirect(makeLoginErrorUrl(next));
  }

  if (isLegacyPasswordValid) {
    const newPasswordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash: newPasswordHash,
      },
    });
  }

  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, String(user.id), {
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
