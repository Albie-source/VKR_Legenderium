"use server";

import fs from "fs/promises";
import path from "path";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const uploadsDir = path.join(process.cwd(), "public", "images", "uploads");

async function saveUploadedImage(file: File, prefix: string) {
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  await fs.mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, filename), buffer);
  return `/images/uploads/${filename}`;
}

export async function createMemoTaskAction(formData: FormData) {
  await requireAdmin();

  const materialIdRaw = (formData.get("materialId") as string)?.trim();
  const materialId = materialIdRaw ? parseInt(materialIdRaw) : null;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const question = (formData.get("question") as string)?.trim();
  const explanation = (formData.get("explanation") as string)?.trim() || null;
  const difficulty = (formData.get("difficulty") as string) || null;
  const pairsJson = formData.get("pairsJson") as string;
  const cardBackFile = formData.get("cardBackFile") as File | null;

  if (!title || !question) throw new Error("Заполните название и текст задания");

  let pairsMeta: unknown;
  try {
    pairsMeta = JSON.parse(pairsJson);
  } catch {
    throw new Error("Не удалось обработать список карточек");
  }
  if (!Array.isArray(pairsMeta) || pairsMeta.length < 2)
    throw new Error("Добавьте хотя бы две карточки");

  let cardBack: string | null = null;
  if (cardBackFile && cardBackFile.size > 0) {
    try {
      cardBack = await saveUploadedImage(cardBackFile, "memo-back");
    } catch (err) {
      console.error("Failed to save card back image:", err);
      throw new Error("Не удалось сохранить рубашку карточек. Попробуйте снова.");
    }
  }

  const pairs = [];
  for (const entry of pairsMeta) {
    if (!entry || typeof entry !== "object") continue;
    const { id, label } = entry as { id?: unknown; label?: unknown };
    if (typeof id !== "string" || typeof label !== "string" || !label.trim()) continue;

    const file = formData.get(`image_${id}`) as File | null;
    if (!file || file.size === 0) {
      throw new Error(`Загрузите картинку для карточки «${label}»`);
    }

    let imageUrl: string;
    try {
      imageUrl = await saveUploadedImage(file, "memo-card");
    } catch (err) {
      console.error("Failed to save memo card image:", err);
      throw new Error("Не удалось сохранить картинку карточки. Попробуйте снова.");
    }

    pairs.push({ id, cardA: label.trim(), cardB: label.trim(), image: imageUrl });
  }

  if (pairs.length < 2) throw new Error("Добавьте хотя бы две карточки с картинками");

  const task = await prisma.interactiveTask.create({
    data: {
      materialId,
      title,
      description,
      type: "memo",
      difficulty,
      config: {
        question,
        cardBack,
        pairs,
        explanation,
      },
    },
  });

  redirect(`/quests/${task.id}`);
}
