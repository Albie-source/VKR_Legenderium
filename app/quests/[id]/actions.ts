"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markMaterialRestored } from "@/lib/materialProgress";
import { checkTaskAnswer } from "@/lib/taskAnswers";

type SaveTaskResult = {
  isAuthenticated: boolean;
  isCorrect: boolean;
  progressUpdated: boolean;
  completedGoals: {
    id: number;
    title: string;
    cardTitle: string;
  }[];
  fragmentRestored: boolean;
  fragmentTitle: string | null;
  error?: string;
};

export async function saveTaskResultAction(
  taskId: number,
  selectedAnswer: string
): Promise<SaveTaskResult> {
  try {
    const user = await getCurrentUser();

    const task = await prisma.interactiveTask.findUnique({
      where: { id: taskId },
      include: {
        material: {
          include: { topics: true },
        },
      },
    });

    if (!task) {
      return {
        isAuthenticated: Boolean(user),
        isCorrect: false,
        progressUpdated: false,
        completedGoals: [],
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

    const checkResult = checkTaskAnswer(task.type, task.config, selectedAnswer);

    if (checkResult === null) {
      return {
        isAuthenticated: Boolean(user),
        isCorrect: false,
        progressUpdated: false,
        completedGoals: [],
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

    const isCorrect = checkResult;

    if (!user) {
      return {
        isAuthenticated: false,
        isCorrect,
        progressUpdated: false,
        completedGoals: [],
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

    const previousSuccessfulAttempt = await prisma.taskAttempt.findFirst({
      where: { userId: user.id, taskId: task.id, isCompleted: true },
    });

    await prisma.taskAttempt.create({
      data: {
        userId: user.id,
        taskId: task.id,
        isCompleted: isCorrect,
        score: isCorrect ? 100 : 0,
      },
    });

    const fragmentRestored = isCorrect && task.materialId !== null && !previousSuccessfulAttempt;

    if (isCorrect && task.materialId !== null) {
      await markMaterialRestored(user.id, task.materialId);
    }

    if (!isCorrect || previousSuccessfulAttempt) {
      return {
        isAuthenticated: true,
        isCorrect,
        progressUpdated: false,
        completedGoals: [],
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

    const materialTopicIds = task.material?.topics.map((topic) => topic.topicId) ?? [];

    const activeGoals = await prisma.goal.findMany({
      where: { isActive: true },
      include: {
        genres: true,
        topics: true,
        pinnedMaterials: true,
      },
    });

    const matchingGoals = activeGoals.filter((goal) => {
      if (goal.pinnedMaterials.length > 0) {
        if (task.materialId === null) return false;
        return goal.pinnedMaterials.some(
          (pm) => pm.materialId === task.materialId
        );
      }
      if (
        goal.genres.length > 0 &&
        !goal.genres.some((g) => g.genreId === task.material?.genreId)
      ) {
        return false;
      }
      if (
        goal.topics.length > 0 &&
        !goal.topics.some((t) => materialTopicIds.includes(t.topicId))
      ) {
        return false;
      }
      if (goal.regionId && goal.regionId !== task.material?.regionId) {
        return false;
      }
      return true;
    });

    const completedGoals: SaveTaskResult["completedGoals"] = [];

    for (const goal of matchingGoals) {
      const existingProgress = await prisma.goalProgress.findUnique({
        where: { userId_goalId: { userId: user.id, goalId: goal.id } },
      });

      if (existingProgress?.isCompleted) {
        continue;
      }

      const currentProgress = existingProgress?.currentProgress ?? 0;
      const newProgress = Math.min(
        currentProgress + 1,
        goal.requiredMaterialsCount
      );
      const isGoalCompleted = newProgress >= goal.requiredMaterialsCount;

      await prisma.goalProgress.upsert({
        where: { userId_goalId: { userId: user.id, goalId: goal.id } },
        update: {
          currentProgress: newProgress,
          isCompleted: isGoalCompleted,
          rewardReceived: false,
          completedAt: isGoalCompleted ? new Date() : null,
        },
        create: {
          userId: user.id,
          goalId: goal.id,
          currentProgress: newProgress,
          isCompleted: isGoalCompleted,
          rewardReceived: false,
          completedAt: isGoalCompleted ? new Date() : null,
        },
      });

      if (isGoalCompleted) {
        completedGoals.push({
          id: goal.id,
          title: goal.title,
          cardTitle: goal.cardTitle,
        });
      }
    }

    return {
      isAuthenticated: true,
      isCorrect,
      progressUpdated: matchingGoals.length > 0,
      completedGoals,
      fragmentRestored,
      fragmentTitle: fragmentRestored ? task.material?.title ?? null : null,
    };
  } catch (err) {
    console.error("saveTaskResultAction error:", err);
    return {
      isAuthenticated: false,
      isCorrect: false,
      progressUpdated: false,
      completedGoals: [],
      fragmentRestored: false,
      fragmentTitle: null,
      error: "Произошла ошибка при сохранении результата. Попробуйте снова.",
    };
  }
}
