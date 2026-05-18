"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RegionItem = {
  id: number;
  name: string;
  description: string | null;
  materialsCount: number;
};

type MaterialItem = {
  id: number;
  title: string;
  shortDescription: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  region: {
    id: number;
    name: string;
  };
  people: {
    id: number;
    name: string;
  };
  genre: {
    id: number;
    name: string;
  };
  topics: {
    id: number;
    name: string;
  }[];
};

type MapClientProps = {
  regions: RegionItem[];
  materials: MaterialItem[];
};

export default function MapClient({ regions, materials }: MapClientProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    materials[0]?.id ?? null
  );

  const filteredMaterials = useMemo(() => {
    if (!selectedRegionId) {
      return materials;
    }

    return materials.filter(
      (material) => material.region.id === selectedRegionId
    );
  }, [materials, selectedRegionId]);

  const selectedRegion = useMemo(() => {
    if (!selectedRegionId) {
      return null;
    }

    return regions.find((region) => region.id === selectedRegionId) ?? null;
  }, [regions, selectedRegionId]);

  const selectedMaterial = useMemo(() => {
    return (
      filteredMaterials.find((material) => material.id === selectedMaterialId) ??
      filteredMaterials[0] ??
      null
    );
  }, [filteredMaterials, selectedMaterialId]);

  function handleSelectRegion(regionId: number | null) {
    setSelectedRegionId(regionId);

    const firstMaterial =
      regionId === null
        ? materials[0]
        : materials.find((material) => material.region.id === regionId);

    setSelectedMaterialId(firstMaterial?.id ?? null);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr_360px]">
      <aside className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Регионы</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Выберите регион, чтобы отфильтровать материалы на карте.
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleSelectRegion(null)}
            className={[
              "w-full rounded-2xl px-4 py-3 text-left text-sm transition",
              selectedRegionId === null
                ? "bg-amber-700 text-white shadow-sm"
                : "bg-stone-50 text-stone-800 hover:bg-stone-100",
            ].join(" ")}
          >
            <span className="block font-semibold">Все регионы</span>
            <span className="text-xs opacity-75">
              материалов: {materials.length}
            </span>
          </button>

          {regions.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => handleSelectRegion(region.id)}
              className={[
                "w-full rounded-2xl px-4 py-3 text-left text-sm transition",
                selectedRegionId === region.id
                  ? "bg-amber-700 text-white shadow-sm"
                  : "bg-stone-50 text-stone-800 hover:bg-stone-100",
              ].join(" ")}
            >
              <span className="block font-semibold">{region.name}</span>
              <span className="text-xs opacity-75">
                материалов: {region.materialsCount}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Карта материалов</h2>

            <p className="mt-1 text-sm leading-6 text-stone-600">
              {selectedRegion
                ? `Показаны материалы региона: ${selectedRegion.name}.`
                : "Показаны материалы всех регионов."}
            </p>
          </div>

          <div className="rounded-full bg-stone-100 px-4 py-2 text-sm text-stone-700">
            Найдено: {filteredMaterials.length}
          </div>
        </div>

        <div className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-stone-100 to-emerald-50">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-[8%] top-[12%] h-[62%] w-[82%] rounded-[58%_42%_50%_50%] border border-amber-200 bg-white/30" />
            <div className="absolute left-[16%] top-[22%] h-[46%] w-[66%] rounded-[48%_52%_45%_55%] border border-stone-300/70 bg-white/20" />
            <div className="absolute left-[25%] top-[34%] h-[26%] w-[44%] rounded-[50%] border border-amber-300/60 bg-amber-50/30" />
          </div>

          <div className="absolute left-5 top-5 rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm text-stone-700 shadow-sm backdrop-blur">
            <p className="font-semibold text-stone-900">Схематичная карта MVP</p>
            <p className="mt-1 text-xs text-stone-500">
              Точки рассчитаны по координатам материалов.
            </p>
          </div>

          <div className="absolute right-5 top-5 rounded-2xl border border-stone-200 bg-white/90 px-4 py-3 text-sm shadow-sm backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-700" />
              <span className="text-stone-700">Фольклорный материал</span>
            </div>
          </div>

          {filteredMaterials.map((material) => {
            const position = getMaterialPosition(material);
            const isSelected = selectedMaterial?.id === material.id;

            return (
              <button
                key={material.id}
                type="button"
                onClick={() => setSelectedMaterialId(material.id)}
                className={[
                  "absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 transition duration-200",
                  isSelected
                    ? "h-9 w-9 border-amber-950 bg-amber-600 shadow-xl"
                    : "h-7 w-7 border-white bg-amber-700 shadow-md hover:scale-125 hover:bg-amber-800",
              ].join(" ")}
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                title={material.title}
              >
                <span className="sr-only">{material.title}</span>
              </button>
            );
          })}

          {filteredMaterials.length === 0 && (
            <div className="absolute inset-x-5 bottom-5 rounded-[2rem] border border-stone-200 bg-white/90 p-6 text-center shadow-lg backdrop-blur">
              <h3 className="mb-2 text-2xl font-bold">
                Материалы не найдены
              </h3>
              <p className="text-stone-600">
                В выбранном регионе пока нет опубликованных материалов.
              </p>
            </div>
          )}

          {selectedMaterial && (
            <div className="absolute bottom-5 left-5 right-5 rounded-[2rem] border border-stone-200 bg-white/95 p-5 shadow-xl backdrop-blur">
              <div className="grid gap-4 md:grid-cols-[140px_1fr]">
                <div className="h-32 overflow-hidden rounded-2xl bg-stone-200">
                  {selectedMaterial.imageUrl ? (
                    <img
                      src={selectedMaterial.imageUrl}
                      alt={selectedMaterial.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-stone-200 text-xs text-stone-500">
                      Нет изображения
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                      {selectedMaterial.genre.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {selectedMaterial.region.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {selectedMaterial.people.name}
                    </span>
                  </div>

                  <h3 className="mb-2 text-2xl font-bold">
                    {selectedMaterial.title}
                  </h3>

                  {selectedMaterial.shortDescription && (
                    <p className="mb-4 line-clamp-2 text-sm leading-6 text-stone-700">
                      {selectedMaterial.shortDescription}
                    </p>
                  )}

                  <Link
                    href={`/materials/${selectedMaterial.id}`}
                    className="inline-flex rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                  >
                    Открыть материал
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-2xl font-bold">Материалы</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Список материалов, отображённых на карте.
          </p>
        </div>

        {filteredMaterials.length === 0 ? (
          <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
            В выбранном регионе пока нет опубликованных материалов.
          </p>
        ) : (
          <div className="max-h-[650px] space-y-3 overflow-y-auto pr-1">
            {filteredMaterials.map((material) => {
              const isSelected = selectedMaterial?.id === material.id;

              return (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => setSelectedMaterialId(material.id)}
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition",
                    isSelected
                      ? "border-amber-300 bg-amber-50 shadow-sm"
                      : "border-stone-200 bg-stone-50 hover:bg-stone-100",
                  ].join(" ")}
                >
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-2 py-1 text-stone-700">
                      {material.genre.name}
                    </span>

                    <span className="rounded-full bg-white px-2 py-1 text-stone-700">
                      {material.region.name}
                    </span>
                  </div>

                  <h3 className="mb-1 font-semibold">{material.title}</h3>

                  {material.shortDescription && (
                    <p className="line-clamp-2 text-sm leading-6 text-stone-600">
                      {material.shortDescription}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
}

function getMaterialPosition(material: MaterialItem) {
  if (material.latitude === null || material.longitude === null) {
    return {
      x: 50,
      y: 50,
    };
  }

  const minLon = 20;
  const maxLon = 180;
  const minLat = 40;
  const maxLat = 75;

  const x = ((material.longitude - minLon) / (maxLon - minLon)) * 100;
  const y = 100 - ((material.latitude - minLat) / (maxLat - minLat)) * 100;

  return {
    x: clamp(x, 8, 92),
    y: clamp(y, 12, 76),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
