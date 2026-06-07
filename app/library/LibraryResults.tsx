"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Topic = { id: number; name: string };

type MaterialCard = {
  id: number;
  title: string;
  shortDescription: string | null;
  imageUrl: string | null;
  region: { name: string };
  people: { name: string };
  genre: { name: string };
  topics: { topic: Topic }[];
};

type LibraryResultsProps = {
  materials: MaterialCard[];
  totalCount: number;
};

const SORT_OPTIONS = [
  { value: "", label: "По дате добавления" },
  { value: "title_asc", label: "По названию (А—Я)" },
  { value: "title_desc", label: "По названию (Я—А)" },
];

function materialsWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "материал";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "материала";
  return "материалов";
}

export default function LibraryResults({ materials, totalCount }: LibraryResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"grid" | "list">("grid");

  function changeSort(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/library?${qs}` : "/library");
  }

  return (
    <div className="rounded-[1.75rem] border border-[#e4d4bf] bg-[#f8f0df] p-6 shadow-md md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm font-bold text-stone-700">
          Найдено <span className="text-[#9f661f]">{totalCount}</span> {materialsWord(totalCount)}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-[#dccab3] bg-white p-1">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              title="Сетка"
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                view === "grid" ? "bg-[#d8a342] text-[#06151a]" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <rect x="4" y="4" width="7" height="7" rx="1.5" />
                <rect x="13" y="4" width="7" height="7" rx="1.5" />
                <rect x="4" y="13" width="7" height="7" rx="1.5" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              title="Список"
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                view === "list" ? "bg-[#d8a342] text-[#06151a]" : "text-stone-400 hover:text-stone-600"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <rect x="4" y="5" width="16" height="3" rx="1.5" />
                <rect x="4" y="10.5" width="16" height="3" rx="1.5" />
                <rect x="4" y="16" width="16" height="3" rx="1.5" />
              </svg>
            </button>
          </div>

          <select
            value={searchParams.get("sort") ?? ""}
            onChange={(e) => changeSort(e.target.value)}
            className="rounded-xl border border-[#dccab3] bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {materials.length === 0 ? (
        <EmptyState />
      ) : (
        <div className={view === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
          {materials.map((material, index) =>
            view === "grid" ? (
              <GridCard key={material.id} material={material} delay={index * 0.06} />
            ) : (
              <ListCard key={material.id} material={material} delay={index * 0.05} />
            )
          )}
        </div>
      )}
    </div>
  );
}

function GridCard({ material, delay }: { material: MaterialCard; delay: number }) {
  return (
    <article
      style={{ animationDelay: `${delay}s` }}
      className="animate-fade-in-up group flex min-h-[400px] flex-col overflow-hidden rounded-[2rem] border border-[#e4d4bf] bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-44 overflow-hidden bg-[#eadfce]">
        {material.imageUrl ? (
          <img
            src={material.imageUrl}
            alt={material.title}
            className="h-full w-full object-cover object-[center_42%] transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#efe4d3,#e5d4bd)] px-6 text-center text-sm font-semibold text-stone-600">
            Изображение не добавлено
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-[#d8a342]/30 bg-[#fff8e8]/90 px-3 py-1 text-xs font-extrabold text-[#9f661f] shadow-sm backdrop-blur">
          {material.genre.name}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2.5 flex flex-wrap gap-1.5 text-xs">
          <span className="rounded-full border border-[#3aa6a0]/20 bg-[#e7f7f5] px-2.5 py-1 font-bold text-[#247670]">
            {material.region.name}
          </span>

          <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 font-bold text-stone-700">
            {material.people.name}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-extrabold leading-tight text-stone-950">
          {material.title}
        </h3>

        <p className="mb-3 line-clamp-3 flex-1 text-sm leading-6 text-stone-600">
          {material.shortDescription}
        </p>

        {material.topics.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {material.topics.slice(0, 3).map(({ topic }) => (
              <span
                key={topic.id}
                className="rounded-full border border-[#eadbc7] bg-[#faf4eb] px-2.5 py-1 text-xs font-semibold text-stone-600"
              >
                {topic.name}
              </span>
            ))}
          </div>
        )}

        <Link
          href={`/materials/${material.id}`}
          className="mt-auto rounded-2xl bg-[#d8a342] px-4 py-2.5 text-center text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Открыть материал
        </Link>
      </div>
    </article>
  );
}

function ListCard({ material, delay }: { material: MaterialCard; delay: number }) {
  return (
    <article
      style={{ animationDelay: `${delay}s` }}
      className="animate-fade-in-up group flex flex-col gap-5 overflow-hidden rounded-[2rem] border border-[#e4d4bf] bg-white p-5 shadow-md transition hover:-translate-y-1 hover:shadow-xl sm:flex-row sm:items-center"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-[#eadfce] sm:h-32 sm:w-48">
        {material.imageUrl ? (
          <img
            src={material.imageUrl}
            alt={material.title}
            className="h-full w-full object-cover object-[center_42%] transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#efe4d3,#e5d4bd)] px-4 text-center text-xs font-semibold text-stone-600">
            Нет изображения
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-[#d8a342]/30 bg-[#fff8e8] px-3 py-1 font-extrabold text-[#9f661f]">
            {material.genre.name}
          </span>
          <span className="rounded-full border border-[#3aa6a0]/20 bg-[#e7f7f5] px-3 py-1 font-bold text-[#247670]">
            {material.region.name}
          </span>
          <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 font-bold text-stone-700">
            {material.people.name}
          </span>
        </div>

        <h3 className="mb-2 text-xl font-extrabold leading-tight text-stone-950">
          {material.title}
        </h3>

        <p className="line-clamp-2 text-sm leading-6 text-stone-600">
          {material.shortDescription}
        </p>
      </div>

      <Link
        href={`/materials/${material.id}`}
        className="shrink-0 rounded-2xl bg-[#d8a342] px-5 py-3 text-center text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b] sm:self-center"
      >
        Открыть
      </Link>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-[#e4d4bf] bg-white p-10 text-center shadow-md">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d8a342]/30 bg-[#fff5dc] text-2xl text-[#c78a24]">
        ?
      </div>

      <h3 className="mb-3 text-2xl font-extrabold text-stone-950">
        Материалы не найдены
      </h3>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        По выбранным параметрам нет опубликованных материалов. Попробуйте
        изменить фильтры или сбросить поиск.
      </p>

      <Link
        href="/library"
        className="inline-flex rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
      >
        Сбросить фильтры
      </Link>
    </div>
  );
}
