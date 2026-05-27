"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateTaskAction(taskId: number, formData: FormData) {
  await requireAdmin();

  const materialId = Number(formData.get("materialId"));

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const question = String(formData.get("question") ?? "").trim();

  const option1 = String(formData.get("option1") ?? "").trim();
  const option2 = String(formData.get("option2") ?? "").trim();
  const option3 = String(formData.get("option3") ?? "").trim();
  const option4 = String(formData.get("option4") ?? "").trim();

  const correctAnswer = String(formData.get("correctAnswer") ?? "").trim();
  const explanation = String(formData.get("explanation") ?? "").trim();
  const difficulty = String(formData.get("difficulty") ?? "").trim();

  const options = [option1, option2, option3, option4].filter(Boolean);

  if (
    Number.isNaN(taskId) ||
    Number.isNaN(materialId) ||
    !title ||
    !question ||
    options.length < 2 ||
    !correctAnswer ||
    !options.includes(correctAnswer)
  ) {
    return;
  }

  await prisma.interactiveTask.update({
    where: {
      id: taskId,
    },
    data: {
      materialId,
      title,
      description: description || null,
      type: "single_choice",
      difficulty: difficulty || null,
      config: {
        question,
        options,
        correctAnswer,
        explanation: explanation || null,
      },
    },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/quests");
  revalidatePath(`/quests/${taskId}`);

  redirect("/admin/tasks");
}
