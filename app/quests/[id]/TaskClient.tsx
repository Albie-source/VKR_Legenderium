"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

// ─── Config types ─────────────────────────────────────────────────────────────

type SingleChoiceConfig = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
};

type MatchingConfig = {
  question: string;
  pairs: { left: string; right: string }[];
  explanation?: string | null;
};

type VisualNovelScene = {
  id: string;
  text: string;
  imageUrl?: string | null;
  isEnd?: boolean;
  isCorrect?: boolean;
  choices?: { text: string; nextScene: string }[];
};

type VisualNovelConfig = {
  scenes: VisualNovelScene[];
  explanation?: string | null;
};

type HiddenObject = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
};

type HiddenObjectsConfig = {
  question: string;
  imageUrl: string;
  objects: HiddenObject[];
  explanation?: string | null;
};

type WhoAmIConfig = {
  clues: string[];
  answer: string;
  options: string[];
  explanation?: string | null;
};

type MemoPair = {
  id: string;
  cardA: string;
  cardB: string;
  image?: string | null;
};

type MemoConfig = {
  question: string;
  pairs: MemoPair[];
  cardBack?: string | null;
  explanation?: string | null;
};

type OutfitSlot = {
  id: string;
  label: string;
  correctItem: string;
};

type OutfitItem = {
  id: string;
  label: string;
  slotId: string;
};

type AssembleOutfitConfig = {
  question: string;
  character?: string | null;
  slots: OutfitSlot[];
  items: OutfitItem[];
  explanation?: string | null;
};

// ─── Shared result type ───────────────────────────────────────────────────────

type SaveTaskResult = {
  isAuthenticated: boolean;
  isCorrect: boolean;
  progressUpdated: boolean;
  completedGoals: { id: number; title: string; cardTitle: string }[];
  fragmentRestored: boolean;
  fragmentTitle: string | null;
};

type TaskClientProps = {
  taskId: number;
  taskType: string;
  config: unknown;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
};

// ─── Router ──────────────────────────────────────────────────────────────────

export default function TaskClient({
  taskId,
  taskType,
  config,
  saveTaskResult,
}: TaskClientProps) {
  if (taskType === "single_choice" && isSingleChoiceConfig(config)) {
    return <SingleChoiceTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "matching" && isMatchingConfig(config)) {
    return <MatchingTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "visual_novel" && isVisualNovelConfig(config)) {
    return <VisualNovelTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "hidden_objects" && isHiddenObjectsConfig(config)) {
    return <HiddenObjectsTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "who_am_i" && isWhoAmIConfig(config)) {
    return <WhoAmITask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "memo" && isMemoConfig(config)) {
    return <MemoTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }
  if (taskType === "assemble_outfit" && isAssembleOutfitConfig(config)) {
    return <AssembleOutfitTask taskId={taskId} config={config} saveTaskResult={saveTaskResult} />;
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Задание</p>
      <h2 className="mb-3 text-3xl font-extrabold text-stone-950">Тип задания пока не поддерживается</h2>
      <p className="leading-7 text-stone-700">
        Задание с идентификатором {taskId} имеет тип{" "}
        <span className="font-extrabold text-stone-950">{taskType}</span>. Для него ещё не создан
        интерфейс прохождения или некорректно заполнена конфигурация.
      </p>
    </section>
  );
}

// ─── 1. Single Choice ─────────────────────────────────────────────────────────

function SingleChoiceTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: SingleChoiceConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCorrect = useMemo(() => selectedAnswer === config.correctAnswer, [selectedAnswer, config.correctAnswer]);

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
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Вопрос</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">{config.question}</h2>
      </div>

      <div className="mb-7 space-y-3">
        {config.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === config.correctAnswer;

          let stateClass = "border-[#eadbc7] bg-[#fbf7f1] text-stone-800 hover:border-[#d8a342]/55 hover:bg-[#fff8e8]";
          let numberClass = "bg-white text-stone-700";

          if (isSelected && !isChecked) { stateClass = "border-[#d8a342] bg-[#fff4d8] text-stone-950"; numberClass = "bg-[#d8a342] text-[#06151a]"; }
          if (isChecked && isCorrectOption) { stateClass = "border-emerald-300 bg-emerald-50 text-emerald-950"; numberClass = "bg-emerald-600 text-white"; }
          if (isChecked && isSelected && !isCorrectOption) { stateClass = "border-red-300 bg-red-50 text-red-950"; numberClass = "bg-red-600 text-white"; }

          return (
            <button
              key={option}
              type="button"
              onClick={() => { if (!isChecked) setSelectedAnswer(option); }}
              className={["flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-left shadow-sm transition", stateClass, isChecked ? "cursor-default" : "cursor-pointer"].join(" ")}
            >
              <span className={["flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold shadow-sm transition", numberClass].join(" ")}>
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
          {!selectedAnswer && <p className="text-sm text-stone-500">Выберите один вариант ответа.</p>}
        </div>
      ) : (
        <ResultBlock isCorrect={isCorrect} correctAnswer={config.correctAnswer} explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

// ─── 2. Matching ──────────────────────────────────────────────────────────────

function MatchingTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: MatchingConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const rightOptions = useMemo(() => {
    return [...config.pairs].map((pair) => pair.right).sort((a, b) => getStableHash(a) - getStableHash(b));
  }, [config.pairs]);

  function getStableHash(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) { hash = (hash * 31 + value.charCodeAt(i)) >>> 0; }
    return hash;
  }

  const selectedCount = Object.values(answers).filter(Boolean).length;
  const isReady = selectedCount === config.pairs.length;
  const isCorrect = useMemo(() => config.pairs.every((pair) => answers[pair.left] === pair.right), [answers, config.pairs]);

  function handleChange(left: string, right: string) {
    if (isChecked) return;
    setAnswers((current) => ({ ...current, [left]: right }));
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
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Сопоставление</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">{config.question}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-600">Для каждого образа выберите подходящее значение из списка.</p>
      </div>

      <div className="mb-7 space-y-4">
        {config.pairs.map((pair, index) => {
          const selectedValue = answers[pair.left] ?? "";
          const isPairCorrect = selectedValue === pair.right;

          let rowClass = "border-[#eadbc7] bg-[#fbf7f1]";
          if (isChecked && isPairCorrect) rowClass = "border-emerald-300 bg-emerald-50";
          if (isChecked && !isPairCorrect) rowClass = "border-red-300 bg-red-50";

          return (
            <div key={pair.left} className={["grid gap-4 rounded-2xl border p-4 shadow-sm md:grid-cols-[1fr_1.2fr]", rowClass].join(" ")}>
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-stone-700 shadow-sm">{index + 1}</span>
                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Образ</p>
                  <p className="text-lg font-extrabold text-stone-950">{pair.left}</p>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Значение</label>
                <select
                  value={selectedValue}
                  onChange={(event) => handleChange(pair.left, event.target.value)}
                  disabled={isChecked}
                  className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1] disabled:cursor-default"
                >
                  <option value="">Выберите значение</option>
                  {rightOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
                {isChecked && !isPairCorrect && <p className="mt-2 text-sm font-semibold text-red-700">Правильно: {pair.right}</p>}
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
          {!isReady && <p className="text-sm text-stone-500">Заполнено {selectedCount} из {config.pairs.length}.</p>}
        </div>
      ) : (
        <ResultBlock isCorrect={isCorrect} correctAnswer="Все пары должны быть сопоставлены правильно" explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

// ─── 3. Visual Novel ──────────────────────────────────────────────────────────

function VisualNovelTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: VisualNovelConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const startScene = config.scenes[0];
  const [currentSceneId, setCurrentSceneId] = useState(startScene?.id ?? "");
  const [history, setHistory] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const sceneMap = useMemo(() => {
    const map: Record<string, VisualNovelScene> = {};
    for (const scene of config.scenes) map[scene.id] = scene;
    return map;
  }, [config.scenes]);

  const currentScene = sceneMap[currentSceneId];

  function handleChoice(nextSceneId: string) {
    setHistory((h) => [...h, currentSceneId]);
    const nextScene = sceneMap[nextSceneId];
    setCurrentSceneId(nextSceneId);
    if (nextScene?.isEnd) {
      const correct = nextScene.isCorrect ?? false;
      setIsCorrect(correct);
      setIsFinished(true);
      startTransition(async () => {
        const result = await saveTaskResult(taskId, JSON.stringify({ endScene: nextSceneId, isCorrect: correct }));
        setServerResult(result);
      });
    }
  }

  function handleBack() {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCurrentSceneId(prev);
    setIsFinished(false);
    setServerResult(null);
  }

  function handleReset() {
    setCurrentSceneId(startScene?.id ?? "");
    setHistory([]);
    setIsFinished(false);
    setIsCorrect(false);
    setServerResult(null);
  }

  if (!currentScene) {
    return (
      <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md">
        <p className="text-stone-600">Сцена не найдена.</p>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white shadow-md overflow-hidden">
      {/* Scene image */}
      {currentScene.imageUrl && (
        <div className="relative h-64 overflow-hidden bg-[#eadfce] md:h-80">
          <Image
            src={currentScene.imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover object-center transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
      )}

      <div className="p-7 md:p-8">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Визуальная новелла</p>

        {/* Story text */}
        <div className="mb-7 rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5">
          <p className="text-lg leading-8 text-stone-800">{currentScene.text}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 flex gap-1.5">
          {config.scenes.filter(s => !s.isEnd).map((_, i) => (
            <div
              key={i}
              className={["h-1.5 flex-1 rounded-full transition-all", i < history.length ? "bg-[#d8a342]" : "bg-stone-200"].join(" ")}
            />
          ))}
        </div>

        {/* End state */}
        {isFinished ? (
          <ResultBlock isCorrect={isCorrect} correctAnswer="" explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
        ) : (
          <div className="space-y-4">
            {currentScene.choices?.map((choice) => (
              <button
                key={choice.nextScene}
                type="button"
                onClick={() => handleChoice(choice.nextScene)}
                className="flex w-full items-center gap-3 rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] px-5 py-4 text-left font-semibold text-stone-800 shadow-sm transition hover:border-[#d8a342] hover:bg-[#fff8e8] hover:text-stone-950"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#d8a342]/20 text-sm font-black text-[#9f661f]">→</span>
                {choice.text}
              </button>
            ))}

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="mt-2 text-sm font-semibold text-stone-500 underline underline-offset-2 hover:text-stone-700"
              >
                ← Вернуться назад
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 4. Hidden Objects ────────────────────────────────────────────────────────

function HiddenObjectsTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: HiddenObjectsConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [clicks, setClicks] = useState<{ x: number; y: number; hit: boolean; id: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const imgRef = useRef<HTMLImageElement>(null);

  const allFound = found.size === config.objects.length;

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isFinished) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    let hitId: string | null = null;
    for (const obj of config.objects) {
      if (found.has(obj.id)) continue;
      const dist = Math.hypot(xPct - obj.x, yPct - obj.y);
      if (dist <= obj.radius) { hitId = obj.id; break; }
    }

    if (hitId) {
      const newFound = new Set(found);
      newFound.add(hitId);
      setFound(newFound);
      setClicks((c) => [...c, { x: xPct, y: yPct, hit: true, id: hitId! }]);
      if (newFound.size === config.objects.length) {
        setIsFinished(true);
        startTransition(async () => {
          const result = await saveTaskResult(taskId, JSON.stringify({ found: [...newFound] }));
          setServerResult(result);
        });
      }
    } else {
      setClicks((c) => [...c, { x: xPct, y: yPct, hit: false, id: "" }]);
      setTimeout(() => setClicks((c) => c.filter((cl) => cl.hit || cl.x !== xPct || cl.y !== yPct)), 1000);
    }
  }, [config.objects, found, isFinished, saveTaskResult, taskId]);

  function handleReset() {
    setFound(new Set());
    setClicks([]);
    setIsFinished(false);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-5">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Скрытые объекты</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">{config.question}</h2>
        <p className="mt-2 text-sm text-stone-600">Найдено: {found.size} из {config.objects.length}</p>
      </div>

      {/* Checklist */}
      <div className="mb-5 flex flex-wrap gap-2">
        {config.objects.map((obj) => (
          <span
            key={obj.id}
            className={["rounded-full border px-3 py-1 text-xs font-bold transition-all",
              found.has(obj.id) ? "border-emerald-300 bg-emerald-50 text-emerald-700 line-through" : "border-[#eadbc7] bg-[#fbf7f1] text-stone-600"
            ].join(" ")}
          >
            {obj.label}
          </span>
        ))}
      </div>

      {/* Image area */}
      <div
        className="relative mb-7 cursor-crosshair overflow-hidden rounded-2xl border border-[#eadbc7] select-none"
        onClick={handleImageClick}
      >
        <img
          ref={imgRef}
          src={config.imageUrl}
          alt="Найдите объекты"
          className="w-full object-cover"
          draggable={false}
        />

        {/* Ripple clicks */}
        {clicks.map((cl, i) => (
          <div
            key={i}
            className={["pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 animate-ping",
              cl.hit ? "border-emerald-400 h-8 w-8" : "border-red-400 h-6 w-6"
            ].join(" ")}
            style={{ left: `${cl.x}%`, top: `${cl.y}%` }}
          />
        ))}

        {/* Found markers */}
        {config.objects.filter(o => found.has(o.id)).map((obj) => (
          <div
            key={obj.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-emerald-400 bg-emerald-500/90 text-white shadow-lg">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
          </div>
        ))}
      </div>

      {isFinished && (
        <ResultBlock isCorrect={true} correctAnswer="" explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

// ─── 5. Who Am I ─────────────────────────────────────────────────────────────

function WhoAmITask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: WhoAmIConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const [revealedClues, setRevealedClues] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isCorrect = selectedAnswer === config.answer;

  function handleCheck() {
    if (!selectedAnswer) return;
    setIsChecked(true);
    startTransition(async () => {
      const result = await saveTaskResult(taskId, selectedAnswer);
      setServerResult(result);
    });
  }

  function handleReset() {
    setRevealedClues(1);
    setSelectedAnswer(null);
    setIsChecked(false);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Кто я?</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">Угадайте персонажа по подсказкам</h2>
        <p className="mt-2 text-sm text-stone-600">Раскрыто подсказок: {revealedClues} из {config.clues.length}</p>
      </div>

      {/* Clues */}
      <div className="mb-7 space-y-3">
        {config.clues.map((clue, index) => (
          <div
            key={index}
            className={["rounded-2xl border p-4 transition-all duration-500",
              index < revealedClues
                ? "border-[#d8a342]/40 bg-[#fff8e8]"
                : "border-[#eadbc7] bg-[#f7f3ee] opacity-50 blur-sm select-none"
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <span className={["flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold",
                index < revealedClues ? "bg-[#d8a342] text-[#06151a]" : "bg-stone-300 text-stone-600"
              ].join(" ")}>
                {index + 1}
              </span>
              <p className="leading-7 text-stone-800">{index < revealedClues ? clue : "???"}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reveal more */}
      {revealedClues < config.clues.length && !isChecked && (
        <button
          type="button"
          onClick={() => setRevealedClues((n) => Math.min(n + 1, config.clues.length))}
          className="mb-6 rounded-2xl border border-[#d8a342]/40 bg-[#fff4d8] px-5 py-2.5 text-sm font-extrabold text-[#9f661f] transition hover:bg-[#ffe8a3]"
        >
          Открыть следующую подсказку
        </button>
      )}

      {/* Options */}
      {!isChecked && (
        <div className="mb-7 grid gap-3 sm:grid-cols-2">
          {config.options.map((option) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setSelectedAnswer(option)}
                className={["rounded-2xl border px-5 py-4 text-left font-semibold shadow-sm transition",
                  isSelected
                    ? "border-[#d8a342] bg-[#fff4d8] text-stone-950"
                    : "border-[#eadbc7] bg-[#fbf7f1] text-stone-800 hover:border-[#d8a342]/55 hover:bg-[#fff8e8]"
                ].join(" ")}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}

      {!isChecked ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!selectedAnswer}
            className="rounded-2xl bg-[#d8a342] px-6 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 disabled:shadow-none"
          >
            Ответить
          </button>
          {!selectedAnswer && <p className="text-sm text-stone-500">Выберите персонажа.</p>}
        </div>
      ) : (
        <ResultBlock isCorrect={isCorrect} correctAnswer={config.answer} explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

// ─── 6. Memo ──────────────────────────────────────────────────────────────────

type MemoCard = { id: string; pairId: string; side: "A" | "B"; label: string; image?: string | null };

function MemoTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: MemoConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const cards: MemoCard[] = useMemo(() => {
    const all: MemoCard[] = [];
    for (const pair of config.pairs) {
      all.push({ id: `${pair.id}-A`, pairId: pair.id, side: "A", label: pair.cardA, image: pair.image });
      all.push({ id: `${pair.id}-B`, pairId: pair.id, side: "B", label: pair.cardB, image: pair.image });
    }
    return shuffleSeeded(all);
  }, [config.pairs]);

  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>([]);
  const [locked, setLocked] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [attempts, setAttempts] = useState(0);

  function handleCardClick(cardId: string) {
    if (locked || matched.has(cardId) || flipped.has(cardId)) return;

    const newFlipped = new Set(flipped);
    newFlipped.add(cardId);
    setFlipped(newFlipped);

    const newSelected = [...selected, cardId];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setLocked(true);
      setAttempts((a) => a + 1);
      const [a, b] = newSelected;
      const cardA = cards.find((c) => c.id === a)!;
      const cardB = cards.find((c) => c.id === b)!;

      if (cardA.pairId === cardB.pairId && cardA.side !== cardB.side) {
        const newMatched = new Set(matched);
        newMatched.add(a);
        newMatched.add(b);
        setMatched(newMatched);
        setSelected([]);
        setLocked(false);
        if (newMatched.size === cards.length) {
          setIsFinished(true);
          startTransition(async () => {
            const result = await saveTaskResult(taskId, JSON.stringify({ matched: [...newMatched], attempts: attempts + 1 }));
            setServerResult(result);
          });
        }
      } else {
        setTimeout(() => {
          const rev = new Set(newFlipped);
          rev.delete(a);
          rev.delete(b);
          setFlipped(rev);
          setSelected([]);
          setLocked(false);
        }, 1000);
      }
    }
  }

  function handleReset() {
    setFlipped(new Set());
    setMatched(new Set());
    setSelected([]);
    setLocked(false);
    setIsFinished(false);
    setAttempts(0);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Мемо</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">{config.question}</h2>
        <p className="mt-2 text-sm text-stone-600">Найдите все пары карточек. Попыток: {attempts}</p>
      </div>

      <div
        className="memo-grid mb-7 grid gap-2 sm:gap-3"
        style={{
          "--memo-cols-mobile": Math.min(cards.length > 12 ? 5 : Math.min(cards.length, 4), 3),
          "--memo-cols-desktop": cards.length > 12 ? 5 : Math.min(cards.length, 4),
        } as React.CSSProperties}
      >
        {cards.map((card) => {
          const isFlipped = flipped.has(card.id) || matched.has(card.id);
          const isMatched = matched.has(card.id);

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              disabled={isMatched || locked || isFlipped}
              className={["relative aspect-square overflow-hidden rounded-2xl border-2 text-center text-sm font-extrabold shadow-sm transition-all duration-300 select-none",
                isMatched
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 cursor-default"
                  : isFlipped
                    ? "border-[#d8a342] bg-[#fff8e8] text-stone-950 cursor-default"
                    : "border-[#eadbc7] bg-[#fbf7f1] text-stone-400 hover:border-[#d8a342]/55 hover:bg-[#fff4d8] cursor-pointer"
              ].join(" ")}
            >
              {card.image ? (
                isFlipped ? (
                  <Image src={card.image} alt={card.label} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
                ) : config.cardBack ? (
                  <Image src={config.cardBack} alt="" fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center p-2 leading-snug">?</span>
                )
              ) : (
                <span className="flex h-full w-full items-center justify-center p-2 leading-snug">
                  {isFlipped ? card.label : "?"}
                </span>
              )}
              {isMatched && (
                <span className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">✓</span>
              )}
            </button>
          );
        })}
      </div>

      {isFinished && (
        <ResultBlock isCorrect={true} correctAnswer="" explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

function shuffleSeeded<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ─── 7. Assemble Outfit ───────────────────────────────────────────────────────

function AssembleOutfitTask({
  taskId,
  config,
  saveTaskResult,
}: {
  taskId: number;
  config: AssembleOutfitConfig;
  saveTaskResult: (taskId: number, selectedAnswer: string) => Promise<SaveTaskResult>;
}) {
  const [slotSelections, setSlotSelections] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [serverResult, setServerResult] = useState<SaveTaskResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const filledCount = Object.values(slotSelections).filter(Boolean).length;
  const isReady = filledCount === config.slots.length;

  const isCorrect = useMemo(() => {
    return config.slots.every((slot) => slotSelections[slot.id] === slot.correctItem);
  }, [slotSelections, config.slots]);

  function getItemsForSlot(slotId: string) {
    return config.items.filter((item) => item.slotId === slotId);
  }

  function handleSelect(slotId: string, itemLabel: string) {
    if (isChecked) return;
    setSlotSelections((prev) => ({ ...prev, [slotId]: itemLabel }));
  }

  function handleCheck() {
    if (!isReady) return;
    setIsChecked(true);
    startTransition(async () => {
      const result = await saveTaskResult(taskId, JSON.stringify(slotSelections));
      setServerResult(result);
    });
  }

  function handleReset() {
    setSlotSelections({});
    setIsChecked(false);
    setServerResult(null);
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
      <div className="mb-7">
        <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">Собери образ</p>
        <h2 className="text-3xl font-extrabold leading-tight text-stone-950">{config.question}</h2>
        {config.character && <p className="mt-2 text-sm font-semibold text-stone-600">Персонаж: {config.character}</p>}
      </div>

      <div className="mb-7 space-y-5">
        {config.slots.map((slot) => {
          const items = getItemsForSlot(slot.id);
          const selected = slotSelections[slot.id];
          const isSlotCorrect = selected === slot.correctItem;

          let slotClass = "border-[#eadbc7] bg-[#fbf7f1]";
          if (isChecked && isSlotCorrect) slotClass = "border-emerald-300 bg-emerald-50";
          if (isChecked && selected && !isSlotCorrect) slotClass = "border-red-300 bg-red-50";

          return (
            <div key={slot.id} className={["rounded-2xl border p-5 shadow-sm", slotClass].join(" ")}>
              <p className="mb-3 text-sm font-black uppercase tracking-[0.18em] text-stone-500">{slot.label}</p>
              <div className="flex flex-wrap gap-3">
                {items.map((item) => {
                  const isItemSelected = selected === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(slot.id, item.label)}
                      disabled={isChecked}
                      className={["rounded-2xl border px-5 py-3 text-sm font-semibold shadow-sm transition",
                        isItemSelected
                          ? "border-[#d8a342] bg-[#fff4d8] text-stone-950"
                          : "border-[#dccab3] bg-white text-stone-700 hover:border-[#d8a342]/55 hover:bg-[#fff8e8]",
                        isChecked ? "cursor-default" : "cursor-pointer"
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
              {isChecked && !isSlotCorrect && selected && (
                <p className="mt-3 text-sm font-semibold text-red-700">Правильно: {slot.correctItem}</p>
              )}
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
            Проверить образ
          </button>
          {!isReady && <p className="text-sm text-stone-500">Выбрано {filledCount} из {config.slots.length} элементов.</p>}
        </div>
      ) : (
        <ResultBlock isCorrect={isCorrect} correctAnswer="Все элементы образа должны быть правильными" explanation={config.explanation} isPending={isPending} serverResult={serverResult} onReset={handleReset} />
      )}
    </section>
  );
}

// ─── Miron celebration popup ──────────────────────────────────────────────────

function MironCelebration({
  goals,
  fragmentRestored,
  fragmentTitle,
}: {
  goals: { id: number; title: string; cardTitle: string }[];
  fragmentRestored: boolean;
  fragmentTitle: string | null;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5500);
    return () => clearTimeout(t);
  }, []);

  const message =
    goals.length > 0
      ? `Превосходно! Свиток «${goals[0].cardTitle}» восстановлен для архива!`
      : fragmentRestored
        ? `Фрагмент${fragmentTitle ? ` «${fragmentTitle}»` : ""} восстановлен и занял своё место в архиве!`
        : "Превосходно! Архив пополнен ещё одной страницей!";

  return (
    <div
      className={[
        "fixed bottom-24 right-6 z-50 flex max-w-xs items-end gap-3 transition-all duration-500",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <Image
        src="/images/miron-happy.png"
        alt="Мирон"
        width={112}
        height={112}
        className="h-28 w-28 shrink-0 object-contain drop-shadow-xl"
      />
      <div className="rounded-2xl border border-[#d8a342]/30 bg-[#0b1f22]/95 p-4 shadow-2xl backdrop-blur-md">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#d8a342]">
          Архивариус Мирон
        </p>
        <p className="text-sm font-semibold leading-6 text-[#fff8e8]">{message}</p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="mt-2 text-xs text-white/35 transition hover:text-white/60"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

// ─── Result Block ─────────────────────────────────────────────────────────────

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
      {serverResult?.isAuthenticated &&
        serverResult.isCorrect &&
        (serverResult.progressUpdated || serverResult.fragmentRestored) && (
          <MironCelebration
            goals={serverResult.completedGoals}
            fragmentRestored={serverResult.fragmentRestored}
            fragmentTitle={serverResult.fragmentTitle}
          />
        )}
      <div className={["rounded-[1.5rem] border p-6 shadow-sm", isCorrect ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-red-300 bg-red-50 text-red-950"].join(" ")}>
        <p className="mb-2 text-sm font-black uppercase tracking-[0.2em]">Результат</p>
        <h3 className="mb-3 text-2xl font-extrabold">{isCorrect ? "Верно!" : "Ответ неверный"}</h3>
        {!isCorrect && correctAnswer && (
          <p className="leading-7">Правильный ответ: <span className="font-extrabold">{correctAnswer}</span></p>
        )}
        {explanation && <p className="mt-3 leading-7">{explanation}</p>}
      </div>

      {isPending && (
        <div className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5 text-stone-700">Сохраняем результат...</div>
      )}

      {serverResult && !serverResult.isAuthenticated && (
        <div className="rounded-2xl border border-[#d8a342]/40 bg-[#fff4d8] p-5 text-stone-800 shadow-sm">
          <h4 className="mb-2 text-xl font-extrabold text-stone-950">Результат не сохранён</h4>
          <p className="mb-4 leading-7 text-stone-700">Вы прошли задание, но прогресс целей сохраняется только для авторизованных пользователей.</p>
          <Link href="/login" className="inline-flex rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]">Войти в аккаунт</Link>
        </div>
      )}

      {serverResult?.isAuthenticated && serverResult.isCorrect && (
        <div className="rounded-2xl border border-[#d8a342]/40 bg-[#fff4d8] p-5 text-stone-800 shadow-sm">
          <h4 className="mb-2 text-xl font-extrabold text-stone-950">Прогресс сохранён</h4>
          {serverResult.progressUpdated ? (
            <p className="leading-7 text-stone-700">Ответ засчитан. Прогресс по связанным целям обновлён.</p>
          ) : (
            <p className="leading-7 text-stone-700">Ответ засчитан. Для этого задания прогресс целей не изменился или уже был сохранён ранее.</p>
          )}
          {serverResult.completedGoals.length > 0 && (
            <div className="mt-5 space-y-3">
              <p className="font-extrabold text-stone-950">Завершённые цели:</p>
              {serverResult.completedGoals.map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-[#eadbc7] bg-white p-4">
                  <p className="font-extrabold text-stone-950">{goal.title}</p>
                  <p className="mt-1 text-sm text-stone-600">Получена карточка: <span className="font-bold text-[#8a5418]">{goal.cardTitle}</span></p>
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
        <button type="button" onClick={onReset} className="rounded-2xl border border-[#d8c3a5] bg-white px-5 py-3 font-extrabold text-stone-700 transition hover:bg-[#fff8e8]">
          Ответить заново
        </button>
        <Link href="/quests" className="rounded-2xl border border-[#d8c3a5] bg-white px-5 py-3 font-extrabold text-stone-700 transition hover:bg-[#fff8e8]">
          К списку заданий
        </Link>
      </div>
    </div>
  );
}

// ─── Type guards ──────────────────────────────────────────────────────────────

function isSingleChoiceConfig(config: unknown): config is SingleChoiceConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<SingleChoiceConfig>;
  return typeof v.question === "string" && Array.isArray(v.options) && typeof v.correctAnswer === "string";
}

function isMatchingConfig(config: unknown): config is MatchingConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<MatchingConfig>;
  return typeof v.question === "string" && Array.isArray(v.pairs) && v.pairs.every((p) => p && typeof p === "object" && typeof (p as {left?:unknown}).left === "string" && typeof (p as {right?:unknown}).right === "string");
}

function isVisualNovelConfig(config: unknown): config is VisualNovelConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<VisualNovelConfig>;
  return Array.isArray(v.scenes) && v.scenes.length > 0 && v.scenes.every((s) => s && typeof s === "object" && typeof (s as {id?:unknown}).id === "string" && typeof (s as {text?:unknown}).text === "string");
}

function isHiddenObjectsConfig(config: unknown): config is HiddenObjectsConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<HiddenObjectsConfig>;
  return typeof v.question === "string" && typeof v.imageUrl === "string" && Array.isArray(v.objects);
}

function isWhoAmIConfig(config: unknown): config is WhoAmIConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<WhoAmIConfig>;
  return Array.isArray(v.clues) && typeof v.answer === "string" && Array.isArray(v.options);
}

function isMemoConfig(config: unknown): config is MemoConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<MemoConfig>;
  return typeof v.question === "string" && Array.isArray(v.pairs);
}

function isAssembleOutfitConfig(config: unknown): config is AssembleOutfitConfig {
  if (!config || typeof config !== "object") return false;
  const v = config as Partial<AssembleOutfitConfig>;
  return typeof v.question === "string" && Array.isArray(v.slots) && Array.isArray(v.items);
}
