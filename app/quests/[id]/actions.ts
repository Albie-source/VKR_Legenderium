"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { markMaterialRestored } from "@/lib/materialProgress";

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

type VisualNovelScene = {
  id: string;
  isEnd?: boolean;
  isCorrect?: boolean;
};

type VisualNovelConfig = {
  scenes: VisualNovelScene[];
};

type HiddenObjectsConfig = {
  objects: { id: string }[];
};

type WhoAmIConfig = {
  answer: string;
};

type MemoConfig = {
  pairs: { id: string }[];
};

type AssembleOutfitConfig = {
  slots: { id: string; correctItem: string }[];
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
  fragmentRestored: boolean;
  fragmentTitle: string | null;
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

function isVisualNovelConfig(config: unknown): config is VisualNovelConfig {
  if (!config || typeof config !== "object") return false;
  const value = config as Partial<VisualNovelConfig>;
  return (
    Array.isArray(value.scenes) &&
    value.scenes.every(
      (scene) => scene && typeof scene === "object" && typeof (scene as { id?: unknown }).id === "string"
    )
  );
}

function isHiddenObjectsConfig(config: unknown): config is HiddenObjectsConfig {
  if (!config || typeof config !== "object") return false;
  const value = config as Partial<HiddenObjectsConfig>;
  return (
    Array.isArray(value.objects) &&
    value.objects.every(
      (obj) => obj && typeof obj === "object" && typeof (obj as { id?: unknown }).id === "string"
    )
  );
}

function isWhoAmIConfig(config: unknown): config is WhoAmIConfig {
  if (!config || typeof config !== "object") return false;
  const value = config as Partial<WhoAmIConfig>;
  return typeof value.answer === "string";
}

function isMemoConfig(config: unknown): config is MemoConfig {
  if (!config || typeof config !== "object") return false;
  const value = config as Partial<MemoConfig>;
  return (
    Array.isArray(value.pairs) &&
    value.pairs.every(
      (pair) => pair && typeof pair === "object" && typeof (pair as { id?: unknown }).id === "string"
    )
  );
}

function isAssembleOutfitConfig(config: unknown): config is AssembleOutfitConfig {
  if (!config || typeof config !== "object") return false;
  const value = config as Partial<AssembleOutfitConfig>;
  return (
    Array.isArray(value.slots) &&
    value.slots.every(
      (slot) =>
        slot &&
        typeof slot === "object" &&
        typeof (slot as { id?: unknown }).id === "string" &&
        typeof (slot as { correctItem?: unknown }).correctItem === "string"
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
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

    let isCorrect = false;

    if (task.type === "single_choice" && isSingleChoiceConfig(task.config)) {
      isCorrect = selectedAnswer === task.config.correctAnswer;
    } else if (task.type === "matching" && isMatchingConfig(task.config)) {
      isCorrect = checkMatchingAnswer(task.config, selectedAnswer);
    } else if (task.type === "visual_novel" && isVisualNovelConfig(task.config)) {
      isCorrect = checkVisualNovelAnswer(task.config, selectedAnswer);
    } else if (task.type === "hidden_objects" && isHiddenObjectsConfig(task.config)) {
      isCorrect = checkHiddenObjectsAnswer(task.config, selectedAnswer);
    } else if (task.type === "who_am_i" && isWhoAmIConfig(task.config)) {
      isCorrect = selectedAnswer === task.config.answer;
    } else if (task.type === "memo" && isMemoConfig(task.config)) {
      isCorrect = checkMemoAnswer(task.config, selectedAnswer);
    } else if (task.type === "assemble_outfit" && isAssembleOutfitConfig(task.config)) {
      isCorrect = checkAssembleOutfitAnswer(task.config, selectedAnswer);
    } else {
      return {
        isAuthenticated: Boolean(user),
        isCorrect: false,
        progressUpdated: false,
        completedGoals: [],
        fragmentRestored: false,
        fragmentTitle: null,
      };
    }

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

function checkMatchingAnswer(config: MatchingConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as Record<string, string>;

    return config.pairs.every((pair) => parsed[pair.left] === pair.right);
  } catch {
    return false;
  }
}

function checkVisualNovelAnswer(config: VisualNovelConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as { endScene?: string };
    const scene = config.scenes.find((s) => s.id === parsed.endScene);

    return Boolean(scene?.isEnd && scene.isCorrect);
  } catch {
    return false;
  }
}

function checkHiddenObjectsAnswer(config: HiddenObjectsConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as { found?: string[] };
    const found = new Set(parsed.found ?? []);

    return config.objects.every((obj) => found.has(obj.id));
  } catch {
    return false;
  }
}

function checkMemoAnswer(config: MemoConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as { matched?: string[] };
    const matched = new Set(parsed.matched ?? []);

    return matched.size === config.pairs.length * 2;
  } catch {
    return false;
  }
}

function checkAssembleOutfitAnswer(config: AssembleOutfitConfig, selectedAnswer: string) {
  try {
    const parsed = JSON.parse(selectedAnswer) as Record<string, string>;

    return config.slots.every((slot) => parsed[slot.id] === slot.correctItem);
  } catch {
    return false;
  }
}
