"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function deleteTaskAction(formData: FormData) {
  await requireAdmin();

  const taskId = Number(formData.get("taskId"));

  if (Number.isNaN(taskId)) {
    return;
  }

  await prisma.interactiveTask.delete({
    where: {
      id: taskId,
    },
  });

  revalidatePath("/admin/tasks");
  revalidatePath("/quests");
}
