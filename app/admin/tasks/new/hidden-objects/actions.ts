"use server";

import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createHiddenObjectsTaskAction(formData: FormData) {
  await requireAdmin();

  const materialId = parseInt(formData.get("materialId") as string);
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const question = (formData.get("question") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim() || null;
  const difficulty = (formData.get("difficulty") as string) || null;
  const objectsJson = formData.get("objectsJson") as string;
  const imageFile = formData.get("imageFile") as File | null;

  if (!materialId || !title || !question) return;
  if (!imageFile || imageFile.size === 0) return;

  let objects: unknown;
  try {
    objects = JSON.parse(objectsJson);
  } catch {
    return;
  }
  if (!Array.isArray(objects) || objects.length === 0) return;

  // Save image to public/images/uploads/
  const ext = path.extname(imageFile.name) || ".jpg";
  const filename = `hidden-${Date.now()}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await imageFile.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  const imageUrl = `/images/uploads/${filename}`;

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
