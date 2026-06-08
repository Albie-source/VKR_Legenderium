"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";

type Topic = { id: number; name: string };
type Material = {
  id: number;
  title: string;
  imageUrl: string | null;
  region: { name: string };
  genre: { name: string };
  topics: { topic: Topic }[];
} | null;

export type TaskItem = {
  id: number;
  title: string;
  description: string | null;
  type: string;
  difficulty: string | null;
  material: Material;
};

const TYPE_LABELS: Record<string, string> = {
  single_choice: "Выбор ответа",
  matching: "Сопоставление",
  ordering: "Порядок",
  text_input: "Ответ текстом",
  visual_novel: "Визуальная новелла",
  hidden_objects: "Скрытые объекты",
  who_am_i: "Кто я?",
  memo: "Мемо",
  assemble_outfit: "Собери образ",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Лёгкое",
  medium: "Среднее",
  hard: "Сложное",
};

export default function QuestsFilter({ tasks }: { tasks: TaskItem[] }) {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [activeDifficulty, setActiveDifficulty] = useState<string | null>(null);

  const availableTypes = useMemo(
    () => [...new Set(tasks.map((t) => t.type))],
    [tasks]
  );

  const availableDifficulties = useMemo(
    () => [...new Set(tasks.map((t) => t.difficulty).filter(Boolean))] as string[],
    [tasks]
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (activeType && t.type !== activeType) return false;
      if (activeDifficulty && t.difficulty !== activeDifficulty) return false;
      return true;
    });
  }, [tasks, activeType, activeDifficulty]);

  const hasFilters = activeType !== null || activeDifficulty !== null;

  function resetFilters() {
    setActiveType(null);
    setActiveDifficulty(null);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
      {/* Filters sidebar */}
      <aside className="rounded-[1.75rem] border border-[#e4d4bf] bg-[#f8f0df] p-6 shadow-md">
        <p className="mb-5 text-sm font-bold text-stone-800">Фильтры</p>

        {availableTypes.length > 1 && (
          <div className="mb-6">
            <p className="mb-2.5 text-xs font-black uppercase tracking-[0.22em] text-stone-500">
              Тип задания
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveType(activeType === type ? null : type)}
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-bold transition",
                    activeType === type
                      ? "border-[#d8a342] bg-[#d8a342] text-[#06151a]"
                      : "border-[#dccab3] bg-white text-stone-700 hover:border-[#d8a342] hover:text-[#9f661f]",
                  ].join(" ")}
                >
                  {TYPE_LABELS[type] ?? type}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableDifficulties.length > 0 && (
          <div className="mb-6">
            <p className="mb-2.5 text-xs font-black uppercase tracking-[0.22em] text-stone-500">
              Сложность
            </p>
            <div className="flex flex-wrap gap-2">
              {availableDifficulties.map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() =>
                    setActiveDifficulty(activeDifficulty === diff ? null : diff)
                  }
                  className={[
                    "rounded-full border px-4 py-2 text-sm font-bold transition",
                    activeDifficulty === diff
                      ? "border-[#3aa6a0] bg-[#3aa6a0] text-white"
                      : "border-[#dccab3] bg-white text-stone-700 hover:border-[#3aa6a0] hover:text-[#247670]",
                  ].join(" ")}
                >
                  {DIFFICULTY_LABELS[diff] ?? diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="w-full rounded-xl border border-[#dccab3] bg-white px-4 py-2.5 text-sm font-semibold text-stone-600 transition hover:border-[#d8a342] hover:text-[#9f661f]"
          >
            × Сбросить фильтры
          </button>
        )}
      </aside>

      {/* Results */}
      <div className="min-w-0 rounded-[1.75rem] border border-[#e4d4bf] bg-[#f8f0df] p-6 shadow-md md:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-bold text-stone-700">
            Найдено <span className="text-[#9f661f]">{filtered.length}</span>{" "}
            {hasFilters ? "по фильтрам" : "заданий"}
          </p>

          {hasFilters && (
            <span className="rounded-full border border-[#d8a342]/35 bg-[#fff8e8] px-4 py-1.5 text-xs font-bold text-[#9f661f]">
              Применены фильтры
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-[1.5rem] border border-[#e4d4bf] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d8a342]/30 bg-[#fff5dc] text-2xl text-[#c78a24]">
              ?
            </div>
            <h3 className="mb-3 text-2xl font-extrabold text-stone-950">
              Ничего не найдено
            </h3>
            <p className="mx-auto max-w-xl leading-7 text-stone-600">
              Нет заданий, подходящих под выбранные фильтры. Попробуйте изменить условия.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  return (
    <article className="animate-fade-in-up group flex flex-col overflow-hidden rounded-[1.5rem] border border-[#e4d4bf] bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-32 overflow-hidden bg-[#eadfce]">
        {task.material?.imageUrl ? (
          <Image
            src={task.material.imageUrl}
            alt={task.material.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-[center_42%] transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#efe4d3,#e5d4bd)] px-6 text-center text-xs font-semibold text-stone-600">
            Изображение не добавлено
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-[#d8a342]/30 bg-[#fff8e8]/90 px-2.5 py-0.5 text-[11px] font-extrabold text-[#9f661f] shadow-sm backdrop-blur">
            {TYPE_LABELS[task.type] ?? task.type}
          </span>
          {task.difficulty && (
            <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur">
              {DIFFICULTY_LABELS[task.difficulty] ?? task.difficulty}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {task.material && (
          <p className="mb-1.5 truncate text-xs font-bold text-[#247670]">
            {task.material.region.name} · {task.material.genre.name}
          </p>
        )}

        <h3 className="mb-2 line-clamp-2 text-lg font-extrabold leading-tight text-stone-950">
          {task.title}
        </h3>

        {task.material && (
          <p className="mb-4 line-clamp-1 text-sm text-stone-500">
            По материалу: <span className="font-bold text-stone-700">{task.material.title}</span>
          </p>
        )}

        <Link
          href={`/quests/${task.id}`}
          className="mt-auto rounded-xl bg-[#d8a342] px-4 py-2.5 text-center text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Перейти к заданию
        </Link>
      </div>
    </article>
  );
}
