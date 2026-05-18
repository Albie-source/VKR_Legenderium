"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createGoalAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const requiredMaterialsCount = Number(
    formData.get("requiredMaterialsCount")
  );

  const cardTitle = String(formData.get("cardTitle") ?? "").trim();
  const cardImageUrl = String(formData.get("cardImageUrl") ?? "").trim();

  const genreId = Number(formData.get("genreId"));
  const topicId = Number(formData.get("topicId"));

  if (
    !title ||
    !cardTitle ||
    Number.isNaN(requiredMaterialsCount) ||
    requiredMaterialsCount <= 0 ||
    Number.isNaN(genreId) ||
    Number.isNaN(topicId)
  ) {
    return;
  }

  await prisma.goal.create({
    data: {
      title,
      description: description || null,
      requiredMaterialsCount,
      cardTitle,
      cardImageUrl: cardImageUrl || null,
      genreId,
      topicId,
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
    where: {
      id: goalId,
    },
    data: {
      isActive: !isActive,
    },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/goals");
}
