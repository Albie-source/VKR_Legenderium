"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

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
};

type TaskClientProps = {
  taskId: number;
  taskType: string;
  config: unknown;
  saveTaskResult: (
    taskId: number,
    selectedAnswer: string
  ) => Promise<SaveTaskResult>;
};

export default function TaskClient({
  taskId,
  taskType,
  config,
  saveTaskResult,
}: TaskClientProps) {
  if (taskType === "single_choice" && isSingleChoiceConfig(config)) {
    return (
      <SingleChoiceTask
        taskId={taskId}
        config={config}
        saveTaskResult={saveTaskResult}
      />
    );
  }

  if (taskType === "matching" && isMatchingConfig(config)) {
    return (
      <MatchingTask
        taskId={taskId}
        config={config}
        saveTaskResult={saveTaskResult}
      />
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">
        Задание
      </p>

      <h2 className="mb-3 text-3xl font-extrabold text-stone-950">
        Тип задания пока не поддерживается
      </h2>

      <p className="leading-7 text-stone-700">
        Задание с идентификатором {taskId} имеет тип{" "}
        <span className="font-extrabold text-stone-950">{taskType}</span>. Для
        него ещё не создан интерфейс прохождения или некорректно заполнена
        конфигурация.
      </p>
    </section>
  );
}

function SingleChoiceTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: SingleChoiceConfig;
  saveTaskResult: (
    taskId: number,
    selectedAnswer: string
  ) => Promise<SaveTaskResult>;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCorrect = useMemo(() => {
    return selectedAnswer === config.correctAnswer;
  }, [selectedAnswer, config.correctAnswer]);

  function handleCheck() {
    if (!selectedAnswer) return;

    setIsChecked(true);

    startTransition(async () => {
      const result = await saveTaskResult(taskId, selectedAnswer);
      setServerResult(result);
    });
  }

  function handleReset() {
    setSelectedAnswer(null);
    setIsChecked(false);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">
          Вопрос
        </p>

        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">
          {config.question}
        </h2>
      </div>

      <div className="mb-7 space-y-3">
        {config.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === config.correctAnswer;

          let stateClass =
            "border-[#eadbc7] bg-[#fbf7f1] text-stone-800 hover:border-[#d8a342]/55 hover:bg-[#fff8e8]";

          let numberClass = "bg-white text-stone-700";

          if (isSelected && !isChecked) {
            stateClass = "border-[#d8a342] bg-[#fff4d8] text-stone-950";
            numberClass = "bg-[#d8a342] text-[#06151a]";
          }

          if (isChecked && isCorrectOption) {
            stateClass = "border-emerald-300 bg-emerald-50 text-emerald-950";
            numberClass = "bg-emerald-600 text-white";
          }

          if (isChecked && isSelected && !isCorrectOption) {
            stateClass = "border-red-300 bg-red-50 text-red-950";
            numberClass = "bg-red-600 text-white";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (!isChecked) setSelectedAnswer(option);
              }}
              className={[
                "flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left shadow-sm transition",
                stateClass,
                isChecked ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm transition",
                  numberClass,
                ].join(" ")}
              >
                {index + 1}
              </span>

              <span className="leading-7">{option}</span>
            </button>
          );
        })}
      </div>

      {!isChecked ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="rounded-2xl bg-[#d8a342] px-6 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
          >
            Проверить ответ
          </button>

          {!selectedAnswer && (
            <p className="text-sm text-stone-500">
              Выберите один вариант ответа.
            </p>
          )}
        </div>
      ) : (
        <ResultBlock
          isCorrect={isCorrect}
          correctAnswer={config.correctAnswer}
          explanation={config.explanation}
          isPending={isPending}
          serverResult={serverResult}
          onReset={handleReset}
        />
      )}
    </section>
  );
}

function MatchingTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: MatchingConfig;
  saveTaskResult: (
    taskId: number,
    selectedAnswer: string
  ) => Promise<SaveTaskResult>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const rightOptions = useMemo(() => {
    return [...config.pairs]
      .map((pair) => pair.right)
      .sort((a, b) => getStableHash(a) - getStableHash(b));
  }, [config.pairs]);

  function getStableHash(value: string) {
    let hash = 0;

    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }

    return hash;
  }

  const selectedCount = Object.values(answers).filter(Boolean).length;
  const isReady = selectedCount === config.pairs.length;

  const isCorrect = useMemo(() => {
    return config.pairs.every((pair) => answers[pair.left] === pair.right);
  }, [answers, config.pairs]);

  function handleChange(left: string, right: string) {
    if (isChecked) return;

    setAnswers((current) => ({
      ...current,
      [left]: right,
    }));
  }

  function handleCheck() {
    if (!isReady) return;

    setIsChecked(true);

    startTransition(async () => {
      const result = await saveTaskResult(taskId, JSON.stringify(answers));
      setServerResult(result);
    });
  }

  function handleReset() {
    setAnswers({});
    setIsChecked(false);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">
          Сопоставление
        </p>

        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">
          {config.question}
        </h2>

        <p className="mt-3 text-sm leading-6 text-stone-600">
          Для каждого образа выберите подходящее значение из списка.
        </p>
      </div>

      <div className="mb-7 space-y-4">
        {config.pairs.map((pair, index) => {
          const selectedValue = answers[pair.left] ?? "";
          const isPairCorrect = selectedValue === pair.right;

          let rowClass = "border-[#eadbc7] bg-[#fbf7f1]";

          if (isChecked && isPairCorrect) {
            rowClass = "border-emerald-300 bg-emerald-50";
          }

          if (isChecked && !isPairCorrect) {
            rowClass = "border-red-300 bg-red-50";
          }

          return (
            <div
              key={pair.left}
              className={[
                "grid gap-4 rounded-2xl border p-4 shadow-sm md:grid-cols-[1fr_1.2fr]",
                rowClass,
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-stone-700 shadow-sm">
                  {index + 1}
                </span>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                    Образ
                  </p>

                  <p className="text-lg font-extrabold text-stone-950">
                    {pair.left}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                  Значение
                </label>

                <select
                  value={selectedValue}
                  onChange={(event) => handleChange(pair.left, event.target.value)}
                  disabled={isChecked}
                  className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1] disabled:cursor-default"
                >
                  <option value="">Выберите значение</option>

                  {rightOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>

                {isChecked && !isPairCorrect && (
                  <p className="mt-2 text-sm font-semibold text-red-700">
                    Правильно: {pair.right}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isChecked ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!isReady}
            className="rounded-2xl bg-[#d8a342] px-6 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
          >
            Проверить сопоставление
          </button>

          {!isReady && (
            <p className="text-sm text-stone-500">
              Заполнено {selectedCount} из {config.pairs.length}.
            </p>
          )}
        </div>
      ) : (
        <ResultBlock
          isCorrect={isCorrect}
          correctAnswer="Все пары должны быть сопоставлены правильно"
          explanation={config.explanation}
          isPending={isPending}
          serverResult={serverResult}
          onReset={handleReset}
        />
      )}
    </section>
  );
}

function ResultBlock({
  isCorrect,
  correctAnswer,
  explanation,
  isPending,
  serverResult,
  onReset,
}: {
  isCorrect: boolean;
  correctAnswer: string;
  explanation?: string | null;
  isPending: boolean;
  serverResult: SaveTaskResult | null;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      <div
        className={[
          "rounded-[1.5rem] border p-6 shadow-sm",
          isCorrect
            ? "border-emerald-300 bg-emerald-50 text-emerald-950"
            : "border-red-300 bg-red-50 text-red-950",
        ].join(" ")}
      >
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">
          Результат
        </p>

        <h3 className="mb-3 text-2xl font-extrabold">
          {isCorrect ? "Верно!" : "Ответ неверный"}
        </h3>

        {!isCorrect && (
          <p className="leading-7">
            Правильный ответ:{" "}
            <span className="font-extrabold">{correctAnswer}</span>
          </p>
        )}

        {explanation && <p className="mt-3 leading-7">{explanation}</p>}
      </div>

      {isPending && (
        <div className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5 text-stone-700">
          Сохраняем результат...
        </div>
      )}

      {serverResult && !serverResult.isAuthenticated && (
        <div className="rounded-2xl border border-[#d8a342]/40 bg-[#fff4d8] p-5 text-stone-800 shadow-sm">
          <h4 className="mb-2 text-xl font-extrabold text-stone-950">
            Результат не сохранён
          </h4>

          <p className="mb-4 leading-7 text-stone-700">
            Вы прошли задание, но прогресс целей сохраняется только для
            авторизованных пользователей.
          </p>

          <Link
            href="/login"
            className="inline-flex rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
          >
            Войти в аккаунт
          </Link>
        </div>
      )}

      {serverResult?.isAuthenticated && serverResult.isCorrect && (
        <div className="rounded-2xl border border-[#d8a342]/40 bg-[#fff4d8] p-5 text-stone-800 shadow-sm">
          <h4 className="mb-2 text-xl font-extrabold text-stone-950">
            Прогресс сохранён
          </h4>

          {serverResult.progressUpdated ? (
            <p className="leading-7 text-stone-700">
              Ответ засчитан. Прогресс по связанным целям обновлён.
            </p>
          ) : (
            <p className="leading-7 text-stone-700">
              Ответ засчитан. Для этого задания прогресс целей не изменился или
              уже был сохранён ранее.
            </p>
          )}

          {serverResult.completedGoals.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="font-extrabold text-stone-950">
                Завершённые цели:
              </p>

              {serverResult.completedGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-2xl border border-[#eadbc7] bg-white p-4"
                >
                  <p className="font-extrabold text-stone-950">{goal.title}</p>

                  <p className="mt-1 text-sm text-stone-600">
                    Получена карточка:{" "}
                    <span className="font-bold text-[#8a5418]">
                      {goal.cardTitle}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {serverResult?.isAuthenticated && !serverResult.isCorrect && (
        <div className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5 text-stone-700 shadow-sm">
          Прогресс не обновлён, потому что ответ был неверным.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-2xl border border-[#d8c3a5] bg-white px-5 py-3 font-extrabold text-stone-700 transition hover:bg-[#fff8e8]"
        >
          Ответить заново
        </button>

        <Link
          href="/quests"
          className="rounded-2xl border border-[#d8c3a5] bg-white px-5 py-3 font-extrabold text-stone-700 transition hover:bg-[#fff8e8]"
        >
          К списку заданий
        </Link>
      </div>
    </div>
  );
}

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
