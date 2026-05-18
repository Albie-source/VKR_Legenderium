"use client";

import { useMemo, useState } from "react";

type SingleChoiceConfig = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
};

type TaskClientProps = {
  taskId: number;
  taskType: string;
  config: unknown;
};

export default function TaskClient({
  taskId,
  taskType,
  config,
}: TaskClientProps) {
  if (taskType === "single_choice") {
    return <SingleChoiceTask config={config as SingleChoiceConfig} />;
  }

  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
        Задание
      </p>

      <h2 className="mb-3 text-3xl font-bold">
        Тип задания пока не поддерживается
      </h2>

      <p className="leading-7 text-stone-700">
        Задание с идентификатором {taskId} имеет тип{" "}
        <span className="font-medium text-stone-900">{taskType}</span>. Для
        него ещё не создан интерфейс прохождения.
      </p>
    </div>
  );
}

function SingleChoiceTask({ config }: { config: SingleChoiceConfig }) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);

  const isCorrect = useMemo(() => {
    return selectedAnswer === config.correctAnswer;
  }, [selectedAnswer, config.correctAnswer]);

  function handleCheck() {
    if (!selectedAnswer) return;
    setIsChecked(true);
  }

  function handleReset() {
    setSelectedAnswer(null);
    setIsChecked(false);
  }

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
      <div className="mb-7">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
          Вопрос
        </p>

        <h2 className="text-3xl font-bold leading-tight">
          {config.question}
        </h2>
      </div>

      <div className="mb-7 space-y-3">
        {config.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === config.correctAnswer;

          let stateClass =
            "border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100";

          if (isSelected && !isChecked) {
            stateClass = "border-amber-500 bg-amber-50 text-amber-950";
          }

          if (isChecked && isCorrectOption) {
            stateClass = "border-green-300 bg-green-50 text-green-900";
          }

          if (isChecked && isSelected && !isCorrectOption) {
            stateClass = "border-red-300 bg-red-50 text-red-900";
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                if (!isChecked) setSelectedAnswer(option);
              }}
              className={[
                "flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left transition",
                stateClass,
                isChecked ? "cursor-default" : "cursor-pointer",
              ].join(" ")}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold shadow-sm">
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
            className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:bg-stone-300"
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
        <div className="space-y-5">
          <div
            className={[
              "rounded-[1.5rem] border p-6",
              isCorrect
                ? "border-green-200 bg-green-50 text-green-900"
                : "border-red-200 bg-red-50 text-red-900",
            ].join(" ")}
          >
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em]">
              Результат
            </p>

            <h3 className="mb-3 text-2xl font-bold">
              {isCorrect ? "Верно!" : "Ответ неверный"}
            </h3>

            <p className="leading-7">
              Правильный ответ:{" "}
              <span className="font-semibold">{config.correctAnswer}</span>
            </p>

            {config.explanation && (
              <p className="mt-3 leading-7">{config.explanation}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Пройти ещё раз
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
