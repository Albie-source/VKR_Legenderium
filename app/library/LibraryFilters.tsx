"use client";

import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type FilterItem = { id: number; name: string };

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Build URL preserving all active params, overriding specified keys
  function buildUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams();

    const s = "search" in overrides
      ? overrides.search
      : (searchParams.get("search") ?? "");
    if (s.trim()) params.set("search", s.trim());

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
    const val = inputRef.current?.value ?? "";
    router.push(buildUrl({ search: val }));
  }

  const hasFilters =
    Boolean(searchParams.get("search")) ||
    Boolean(searchParams.get("region")) ||
    Boolean(searchParams.get("people")) ||
    Boolean(searchParams.get("genre")) ||
    Boolean(searchParams.get("topic"));

  return (
    <div className="space-y-3">
      {/* ── Search bar ── */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          key={searchParams.get("search") ?? ""}
          defaultValue={searchParams.get("search") ?? ""}
          onKeyDown={(e) => { if (e.key === "Enter") applySearch(); }}
          placeholder="Поиск по названию, описанию или тексту..."
          className="min-w-0 flex-1 rounded-2xl border border-[#dccab3] bg-white px-5 py-3.5 text-stone-800 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
        />
        <button
          type="button"
          onClick={applySearch}
          className="rounded-2xl bg-[#d8a342] px-6 py-3.5 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Найти
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/library")}
            className="rounded-2xl border border-stone-300 bg-white px-4 py-3.5 text-sm font-bold text-stone-600 shadow-sm transition hover:bg-stone-50"
          >
            Сбросить
          </button>
        )}
      </div>

      {/* ── Filter dropdowns ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
    </div>
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
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.15em] text-stone-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-2.5 text-sm text-stone-800 shadow-sm outline-none transition focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
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
