"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { taskSchema } from "@/lib/schemas";

export async function createTaskAction(formData: FormData) {
  await requireAdmin();

  const result = taskSchema.safeParse({
    materialId: formData.get("materialId"),
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    question: formData.get("question") ?? "",
    option1: formData.get("option1") ?? "",
    option2: formData.get("option2") ?? "",
    option3: formData.get("option3") ?? "",
    option4: formData.get("option4") ?? "",
    correctAnswer: formData.get("correctAnswer") ?? "",
    explanation: formData.get("explanation") ?? "",
    difficulty: formData.get("difficulty") ?? "",
  });

  if (!result.success) return;

  const data = result.data;

  const options = [data.option1, data.option2, data.option3, data.option4].filter(
    (o): o is string => o != null && o.length > 0
  );

  if (options.length < 2 || !options.includes(data.correctAnswer)) return;

  const task = await prisma.interactiveTask.create({
    data: {
      materialId: data.materialId,
      title: data.title,
      description: data.description,
      type: "single_choice",
      difficulty: data.difficulty,
      config: {
        question: data.question,
        options,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
      },
    },
  });

  redirect(`/quests/${task.id}`);
}
