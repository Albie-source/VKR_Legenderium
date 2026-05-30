"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { materialSchema } from "@/lib/schemas";

export async function updateMaterialAction(
  materialId: number,
  formData: FormData
) {
  await requireAdmin();

  const topicIds = formData
    .getAll("topicIds")
    .map((v) => Number(v))
    .filter((v) => !Number.isNaN(v));

  const result = materialSchema.safeParse({
    title: formData.get("title") ?? "",
    shortDescription: formData.get("shortDescription") ?? "",
    fullText: formData.get("fullText") ?? "",
    regionId: formData.get("regionId"),
    peopleId: formData.get("peopleId"),
    genreId: formData.get("genreId"),
    sourceId: formData.get("sourceId"),
    latitude: formData.get("latitude") ?? "",
    longitude: formData.get("longitude") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    audioUrl: formData.get("audioUrl") ?? "",
    videoUrl: formData.get("videoUrl") ?? "",
    status: formData.get("status") ?? "DRAFT",
  });

  if (!result.success || Number.isNaN(materialId)) return;

  const data = result.data;

  await prisma.material.update({
    where: { id: materialId },
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      fullText: data.fullText,
      latitude: data.latitude,
      longitude: data.longitude,
      imageUrl: data.imageUrl,
      audioUrl: data.audioUrl,
      videoUrl: data.videoUrl,
      status: data.status,
      regionId: data.regionId,
      peopleId: data.peopleId,
      genreId: data.genreId,
      sourceId: data.sourceId,
      topics: {
        deleteMany: {},
        create: topicIds.map((topicId) => ({ topicId })),
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/library");
  revalidatePath("/map");
  revalidatePath(`/materials/${materialId}`);

  redirect("/admin");
}
