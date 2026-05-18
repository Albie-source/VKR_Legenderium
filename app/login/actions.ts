"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    redirect("/login?error=1");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  // Временная поддержка старого admin123 из seed, если пароль ещё был обычной строкой.
  // После первого успешного входа пароль автоматически перезапишется хешем.
  const isLegacyPasswordValid = user.passwordHash === password;

  if (!isPasswordValid && !isLegacyPasswordValid) {
    redirect("/login?error=1");
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

  redirect("/profile");
}

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete(AUTH_COOKIE_NAME);

  redirect("/login");
}
