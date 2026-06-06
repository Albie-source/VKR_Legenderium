"use server";

import crypto from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/schemas";
import { sendPasswordResetEmail } from "@/lib/email";

export async function forgotPasswordAction(formData: FormData) {
  const result = forgotPasswordSchema.safeParse({
    email: formData.get("email") ?? "",
  });

  if (!result.success) {
    redirect("/forgot-password?sent=1");
  }

  const email = result.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    try {
      await sendPasswordResetEmail(email, token);
    } catch {
      // Не раскрываем ошибку отправки
    }
  }

  // Всегда показываем успех — не раскрываем, существует ли email
  redirect("/forgot-password?sent=1");
}
