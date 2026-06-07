"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FilterItem = { id: number; name: string };
type FilterKey = "region" | "people" | "genre" | "topic";

type LibraryFiltersProps = {
  regions: FilterItem[];
  peoples: FilterItem[];
  genres: FilterItem[];
  topics: FilterItem[];
};

const GROUPS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "region", label: "Регион", icon: "📍" },
  { key: "people", label: "Народ", icon: "👤" },
  { key: "genre", label: "Жанр", icon: "📖" },
  { key: "topic", label: "Тематика", icon: "✦" },
];

export default function LibraryFilters({
  regions,
  peoples,
  genres,
  topics,
}: LibraryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  const itemsByKey: Record<FilterKey, FilterItem[]> = {
    region: regions,
    people: peoples,
    genre: genres,
    topic: topics,
  };

  // Build URL preserving all active params, overriding specified keys
  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();

    const s = "search" in overrides
      ? overrides.search
      : (searchParams.get("search") ?? "");
    if (s.trim()) params.set("search", s.trim());

    for (const { key } of GROUPS) {
      const v = key in overrides ? overrides[key] : (searchParams.get(key) ?? "");
      if (v) params.set(key, v);
    }

    const sort = "sort" in overrides ? overrides.sort : (searchParams.get("sort") ?? "");
    if (sort) params.set("sort", sort);

    const qs = params.toString();
    return qs ? `/library?${qs}` : "/library";
  }

  function applySearch() {
    const val = inputRef.current?.value ?? "";
    router.push(buildUrl({ search: val }));
  }

  function selectedName(key: FilterKey): string | null {
    const id = searchParams.get(key);
    if (!id) return null;
    return itemsByKey[key].find((item) => String(item.id) === id)?.name ?? null;
  }

  const hasFilters =
    Boolean(searchParams.get("search")) ||
    GROUPS.some(({ key }) => Boolean(searchParams.get(key)));

  return (
    <div className="space-y-5 rounded-[1.75rem] border border-[#e4d4bf] bg-[#f8f0df] p-6 shadow-md">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          🔍
        </span>
        <input
          ref={inputRef}
          key={searchParams.get("search") ?? ""}
          defaultValue={searchParams.get("search") ?? ""}
          onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
          placeholder="Поиск по названию или ключевым словам"
          className="w-full rounded-2xl border border-[#dccab3] bg-white py-3 pl-11 pr-4 text-sm text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
        />
      </div>

      {GROUPS.map(({ key, label, icon }) => {
        const name = selectedName(key);
        return (
          <div key={key}>
            <label className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-800">
              <span aria-hidden>{icon}</span>
              {label}
            </label>

            {name && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#d8a342]/35 bg-[#fff8e8] px-3 py-1 text-xs font-bold text-[#9f661f]">
                {name}
                <button
                  type="button"
                  onClick={() => router.push(buildUrl({ [key]: "" }))}
                  aria-label={`Сбросить фильтр «${label}»`}
                  className="text-[#9f661f]/60 transition hover:text-[#9f661f]"
                >
                  ×
                </button>
              </span>
            )}

            <select
              value={searchParams.get(key) ?? ""}
              onChange={(e) => router.push(buildUrl({ [key]: e.target.value }))}
              className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
            >
              <option value="">{`Выберите ${label.toLowerCase()}`}</option>
              {itemsByKey[key].map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        );
      })}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.push("/library")}
          disabled={!hasFilters}
          className="flex-1 rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-sm font-bold text-stone-600 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Сбросить
        </button>
        <button
          type="button"
          onClick={applySearch}
          className="flex-1 rounded-2xl bg-[#d8a342] px-4 py-3 text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Применить
        </button>
      </div>
    </div>
  );
}
