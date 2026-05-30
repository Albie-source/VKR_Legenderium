"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/schemas";

export async function createGoalAction(formData: FormData) {
  await requireAdmin();

  const result = goalSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    requiredMaterialsCount: formData.get("requiredMaterialsCount"),
    cardTitle: formData.get("cardTitle") ?? "",
    cardImageUrl: formData.get("cardImageUrl") ?? "",
    genreId: formData.get("genreId"),
    topicId: formData.get("topicId"),
  });

  if (!result.success) return;

  const data = result.data;

  await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      requiredMaterialsCount: data.requiredMaterialsCount,
      cardTitle: data.cardTitle,
      cardImageUrl: data.cardImageUrl,
      genreId: data.genreId,
      topicId: data.topicId,
      isActive: true,
    },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/goals");
}

export async function toggleGoalActivityAction(formData: FormData) {
  await requireAdmin();

  const goalId = Number(formData.get("goalId"));
  const isActive = String(formData.get("isActive")) === "true";

  if (Number.isNaN(goalId)) {
    return;
  }

  await prisma.goal.update({
    where: { id: goalId },
    data: { isActive: !isActive },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/goals");
}
