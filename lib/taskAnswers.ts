// Чистая логика проверки ответов на интерактивные задания.
// Вынесена из server actions, чтобы её можно было покрыть юнит-тестами.

export type SingleChoiceConfig = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
};

export type MatchingConfig = {
  question: string;
  pairs: {
    left: string;
    right: string;
  }[];
  explanation?: string | null;
};

export function isSingleChoiceConfig(
  config: unknown,
): config is SingleChoiceConfig {
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

export function isMatchingConfig(config: unknown): config is MatchingConfig {
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

export function checkMatchingAnswer(
  config: MatchingConfig,
  selectedAnswer: string,
): boolean {
  try {
    const parsed = JSON.parse(selectedAnswer) as Record<string, string>;

    return config.pairs.every((pair) => parsed[pair.left] === pair.right);
  } catch {
    return false;
  }
}

// Возвращает null, если тип задания или конфигурация не поддерживаются
export function checkTaskAnswer(
  type: string,
  config: unknown,
  selectedAnswer: string,
): boolean | null {
  if (type === "single_choice" && isSingleChoiceConfig(config)) {
    return selectedAnswer === config.correctAnswer;
  }
  if (type === "matching" && isMatchingConfig(config)) {
    return checkMatchingAnswer(config, selectedAnswer);
  }
  return null;
}
