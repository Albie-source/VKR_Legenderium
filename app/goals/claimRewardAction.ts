"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function claimGoalRewardAction(goalId: number) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.goalProgress.updateMany({
    where: {
      userId: user.id,
      goalId,
      isCompleted: true,
      rewardReceived: false,
    },
    data: { rewardReceived: true },
  });
}
