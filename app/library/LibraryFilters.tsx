"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type FilterItem = {
  id: number;
  name: string;
};

type LibraryFiltersProps = {
  regions: FilterItem[];
  peoples: FilterItem[];
  genres: FilterItem[];
  topics: FilterItem[];
};

export default function LibraryFilters({
  regions,
  peoples,
  genres,
  topics,
}: LibraryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  // Sync search input when URL changes (e.g. browser back/forward)
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();

    const s = "search" in overrides ? overrides.search : search.trim();
    if (s) params.set("search", s);

    const r = "region" in overrides ? overrides.region : (searchParams.get("region") ?? "");
    if (r) params.set("region", r);

    const p = "people" in overrides ? overrides.people : (searchParams.get("people") ?? "");
    if (p) params.set("people", p);

    const g = "genre" in overrides ? overrides.genre : (searchParams.get("genre") ?? "");
    if (g) params.set("genre", g);

    const t = "topic" in overrides ? overrides.topic : (searchParams.get("topic") ?? "");
    if (t) params.set("topic", t);

    const qs = params.toString();
    return qs ? `/library?${qs}` : "/library";
  }

  function applySearch() {
    router.push(buildUrl({}));
  }

  function resetFilters() {
    setSearch("");
    router.push("/library");
  }

  return (
    <section className="rounded-[2rem] border border-[#e4d4bf] bg-[#fbf7f1] p-6 shadow-md md:p-7">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900">
            Поиск и фильтрация
          </h2>

          <p className="mt-2 text-sm leading-6 text-stone-600">
            Найдите материал по названию, региону, народу, жанру или тематике.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
        >
          Сбросить
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        {/* Search — apply on Enter or button click */}
        <div>
          <label className="mb-2 block text-sm font-bold text-stone-800">
            Поиск
          </label>

          <div className="flex gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applySearch();
              }}
              placeholder="Например: дух, огонь, охотник"
              className="min-w-0 flex-1 rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
            />
            <button
              type="button"
              onClick={applySearch}
              className="rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-600 transition hover:border-[#d8a342] hover:text-[#9f661f]"
              aria-label="Найти"
            >
              ↵
            </button>
          </div>
        </div>

        {/* Dropdowns — auto-apply on change */}
        <FilterSelect
          label="Регион"
          value={searchParams.get("region") ?? ""}
          onChange={(v) => router.push(buildUrl({ region: v }))}
          items={regions}
        />

        <FilterSelect
          label="Народ"
          value={searchParams.get("people") ?? ""}
          onChange={(v) => router.push(buildUrl({ people: v }))}
          items={peoples}
        />

        <FilterSelect
          label="Жанр"
          value={searchParams.get("genre") ?? ""}
          onChange={(v) => router.push(buildUrl({ genre: v }))}
          items={genres}
        />

        <FilterSelect
          label="Тематика"
          value={searchParams.get("topic") ?? ""}
          onChange={(v) => router.push(buildUrl({ topic: v }))}
          items={topics}
        />
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  items,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: FilterItem[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-stone-800">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-800 outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
      >
        <option value="">Все</option>

        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
