"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/schemas";

export async function createGoalAction(formData: FormData) {
  await requireAdmin();

  const genreIds = formData
    .getAll("genreIds")
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);

  const topicIds = formData
    .getAll("topicIds")
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);

  const pinnedMaterialIds = formData
    .getAll("pinnedMaterialIds")
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n > 0);

  const result = goalSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    requiredMaterialsCount: formData.get("requiredMaterialsCount"),
    cardTitle: formData.get("cardTitle") ?? "",
    cardImageUrl: formData.get("cardImageUrl") ?? "",
    regionId: formData.get("regionId") ?? "",
  });

  if (!result.success || genreIds.length === 0) return;

  const data = result.data;

  await prisma.goal.create({
    data: {
      title: data.title,
      description: data.description,
      requiredMaterialsCount: data.requiredMaterialsCount,
      cardTitle: data.cardTitle,
      cardImageUrl: data.cardImageUrl,
      regionId: data.regionId ?? null,
      isActive: true,
      genres: { create: genreIds.map((genreId) => ({ genreId })) },
      topics: { create: topicIds.map((topicId) => ({ topicId })) },
      pinnedMaterials: {
        create: pinnedMaterialIds.map((materialId) => ({ materialId })),
      },
    },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/goals");
}

export async function toggleGoalActivityAction(formData: FormData) {
  await requireAdmin();

  const goalId = Number(formData.get("goalId"));
  const isActive = String(formData.get("isActive")) === "true";

  if (Number.isNaN(goalId)) return;

  await prisma.goal.update({
    where: { id: goalId },
    data: { isActive: !isActive },
  });

  revalidatePath("/admin/goals");
  revalidatePath("/goals");
}
