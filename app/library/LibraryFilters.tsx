"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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
  const [regionId, setRegionId] = useState(searchParams.get("region") ?? "");
  const [peopleId, setPeopleId] = useState(searchParams.get("people") ?? "");
  const [genreId, setGenreId] = useState(searchParams.get("genre") ?? "");
  const [topicId, setTopicId] = useState(searchParams.get("topic") ?? "");

  function applyFilters() {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (regionId) params.set("region", regionId);
    if (peopleId) params.set("people", peopleId);
    if (genreId) params.set("genre", genreId);
    if (topicId) params.set("topic", topicId);

    const queryString = params.toString();

    router.push(queryString ? `/library?${queryString}` : "/library");
  }

  function resetFilters() {
    setSearch("");
    setRegionId("");
    setPeopleId("");
    setGenreId("");
    setTopicId("");

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
        <div>
          <label className="mb-2 block text-sm font-bold text-stone-800">
            Поиск
          </label>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applyFilters();
              }
            }}
            placeholder="Например: дух, огонь, охотник"
            className="w-full rounded-2xl border border-[#dccab3] bg-white px-4 py-3 text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-[#d8a342] focus:ring-2 focus:ring-[#f3dfb1]"
          />
        </div>

        <FilterSelect
          label="Регион"
          value={regionId}
          onChange={setRegionId}
          items={regions}
        />

        <FilterSelect
          label="Народ"
          value={peopleId}
          onChange={setPeopleId}
          items={peoples}
        />

        <FilterSelect
          label="Жанр"
          value={genreId}
          onChange={setGenreId}
          items={genres}
        />

        <FilterSelect
          label="Тематика"
          value={topicId}
          onChange={setTopicId}
          items={topics}
        />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={applyFilters}
          className="rounded-2xl bg-[#d8a342] px-6 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
        >
          Применить фильтры
        </button>
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
        onChange={(event) => onChange(event.target.value)}
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
