"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateMaterialAction(
  materialId: number,
  formData: FormData
) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(
    formData.get("shortDescription") ?? ""
  ).trim();
  const fullText = String(formData.get("fullText") ?? "").trim();

  const regionId = Number(formData.get("regionId"));
  const peopleId = Number(formData.get("peopleId"));
  const genreId = Number(formData.get("genreId"));
  const sourceId = Number(formData.get("sourceId"));

  const latitudeValue = String(formData.get("latitude") ?? "").trim();
  const longitudeValue = String(formData.get("longitude") ?? "").trim();

  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const audioUrl = String(formData.get("audioUrl") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();

  const status = String(formData.get("status") ?? "DRAFT");

  const topicIds = formData
    .getAll("topicIds")
    .map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (
    Number.isNaN(materialId) ||
    !title ||
    Number.isNaN(regionId) ||
    Number.isNaN(peopleId) ||
    Number.isNaN(genreId) ||
    Number.isNaN(sourceId)
  ) {
    return;
  }

  await prisma.material.update({
    where: {
      id: materialId,
    },
    data: {
      title,
      shortDescription: shortDescription || null,
      fullText: fullText || null,

      latitude: latitudeValue ? Number(latitudeValue) : null,
      longitude: longitudeValue ? Number(longitudeValue) : null,

      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      videoUrl: videoUrl || null,

      status:
        status === "PUBLISHED" || status === "ARCHIVED" || status === "DRAFT"
          ? status
          : "DRAFT",

      regionId,
      peopleId,
      genreId,
      sourceId,

      topics: {
        deleteMany: {},
        create: topicIds.map((topicId) => ({
          topicId,
        })),
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/library");
  revalidatePath("/map");
  revalidatePath(`/materials/${materialId}`);

  redirect("/admin");
}
