"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/schemas";

export async function resetPasswordAction(formData: FormData) {
  const result = resetPasswordSchema.safeParse({
    token: formData.get("token") ?? "",
    password: formData.get("password") ?? "",
  });

  const rawToken = String(formData.get("token") ?? "");

  if (!result.success) {
    redirect(`/reset-password?token=${encodeURIComponent(rawToken)}&error=1`);
  }

  const { token, password } = result.data;
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.expiresAt < new Date()) {
    redirect("/reset-password?error=expired");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    }),
  ]);

  redirect("/login?reset=1");
}
