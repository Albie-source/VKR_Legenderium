"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createHiddenObjectsTaskAction(formData: FormData) {
  await requireAdmin();

  const materialId = parseInt(formData.get("materialId") as string);
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const question = (formData.get("question") as string)?.trim();
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim() || null;
  const difficulty = (formData.get("difficulty") as string) || null;
  const objectsJson = formData.get("objectsJson") as string;

  if (!materialId || !title || !question || !imageUrl) return;

  let objects: unknown;
  try {
    objects = JSON.parse(objectsJson);
  } catch {
    return;
  }

  if (!Array.isArray(objects) || objects.length === 0) return;

  const task = await prisma.interactiveTask.create({
    data: {
      materialId,
      title,
      description,
      type: "hidden_objects",
      difficulty,
      config: {
        question,
        imageUrl,
        objects,
        explanation,
      },
    },
  });

  redirect(`/quests/${task.id}`);
}
