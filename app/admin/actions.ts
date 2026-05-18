"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function archiveMaterialAction(formData: FormData) {
  await requireAdmin();

  const materialId = Number(formData.get("materialId"));

  if (Number.isNaN(materialId)) {
    return;
  }

  await prisma.material.update({
    where: {
      id: materialId,
    },
    data: {
      status: "ARCHIVED",
    },
  });

  revalidatePath("/admin");
  revalidatePath("/library");
  revalidatePath("/map");
}
