"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type SingleChoiceConfig = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
};

type MatchingConfig = {
  question: string;
  pairs: {
    left: string;
    right: string;
  }[];
  explanation?: string | null;
};

type SaveTaskResult = {
  isAuthenticated: boolean;
  isCorrect: boolean;
  progressUpdated: boolean;
  completedGoals: {
    id: number;
    title: string;
    cardTitle: string;
  }[];
  error?: string;
};

function isSingleChoiceConfig(config: unknown): config is SingleChoiceConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const value = config as Partial<SingleChoiceConfig>;

  return (
    typeof value.question === "string" &&
    Array.isArray(value.options) &&
    typeof value.correctAnswer === "string"
  );
}

function isMatchingConfig(config: unknown): config is MatchingConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const value = config as Partial<MatchingConfig>;

  return (
    typeof value.question === "string" &&
    Array.isArray(value.pairs) &&
    value.pairs.every(
      (pair) =>
        pair &&
        typeof pair === "object" &&
        typeof (pair as { left?: unknown }).left === "string" &&
        typeof (pair as { right?: unknown }).right === "string"
    )
  );
}

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
      };
    }

    let isCorrect = false;

    if (task.type === "single_choice" && isSingleChoiceConfig(task.config)) {
      isCorrect = selectedAnswer === task.config.correctAnswer;
    } else if (task.type === "matching" && isMatchingConfig(task.config)) {
      isCorrect = checkMatchingAnswer(task.config, selectedAnswer);
    } else {
      return {
        isAuthenticated: Boolean(user),
        isCorrect: false,
        progressUpdated: false,
        completedGoals: [],
      };
    }

    if (!user) {
      return {
        isAuthenticated: false,
        isCorrect,
        progressUpdated: false,
        completedGoals: [],
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

    if (!isCorrect || previousSuccessfulAttempt) {
      return {
        isAuthenticated: true,
        isCorrect,
        progressUpdated: false,
        completedGoals: [],
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
    };
  } catch (err) {
    console.error("saveTaskResultAction error:", err);
    return {
      isAuthenticated: false,
      isCorrect: false,
      progressUpdated: false,
      completedGoals: [],
      error: "Произошла ошибка при сохранении результата. Попробуйте снова.",
    };
  }
}

function checkMatchingAnswer(config: MatchingConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as Record<string, string>;

    return config.pairs.every((pair) => parsed[pair.left] === pair.right);
  } catch {
    return false;
  }
}
