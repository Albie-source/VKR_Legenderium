"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addToFavoritesAction(formData: FormData) {
  const user = await requireUser();

  const materialId = Number(formData.get("materialId"));

  if (Number.isNaN(materialId)) {
    return;
  }

  await prisma.favorite.upsert({
    where: {
      userId_materialId: {
        userId: user.id,
        materialId,
      },
    },
    update: {},
    create: {
      userId: user.id,
      materialId,
    },
  });

  revalidatePath(`/materials/${materialId}`);
  revalidatePath("/profile/favorites");
}

export async function removeFromFavoritesAction(formData: FormData) {
  const user = await requireUser();

  const materialId = Number(formData.get("materialId"));

  if (Number.isNaN(materialId)) {
    return;
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      materialId,
    },
  });

  revalidatePath(`/materials/${materialId}`);
  revalidatePath("/profile/favorites");
}

export async function requireLoginForFavoriteAction(formData: FormData) {
  const materialId = Number(formData.get("materialId"));

  if (Number.isNaN(materialId)) {
    redirect("/login");
  }

  redirect(`/login?next=/materials/${materialId}`);
}
