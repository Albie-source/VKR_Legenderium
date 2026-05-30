"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
} from "react-leaflet";

export type RouteStop = {
  id: number;
  title: string;
  shortDescription: string | null;
  imageUrl: string | null;
  latitude: number;
  longitude: number;
  genre: { name: string };
  isCompleted: boolean;
  stopNumber: number;
};

type GoalMapClientProps = {
  stops: RouteStop[];
  isAuthenticated: boolean;
};

export default function GoalMapClient({
  stops,
  isAuthenticated,
}: GoalMapClientProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const polylinePositions = stops.map(
    (s) => [s.latitude, s.longitude] as [number, number]
  );

  const center =
    stops.length > 0
      ? ([
          stops.reduce((sum, s) => sum + s.latitude, 0) / stops.length,
          stops.reduce((sum, s) => sum + s.longitude, 0) / stops.length,
        ] as [number, number])
      : ([62, 96] as [number, number]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="relative overflow-hidden rounded-[2rem] border border-stone-200 shadow-md">
        <MapContainer
          center={center}
          zoom={4}
          scrollWheelZoom
          className="h-[560px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {stops.length > 1 && (
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: "#d8a342",
                weight: 3,
                dashArray: "10 7",
                opacity: 0.8,
              }}
            />
          )}

          {stops.map((stop) => {
            const isHovered = hoveredId === stop.id;

            return (
              <CircleMarker
                key={stop.id}
                center={[stop.latitude, stop.longitude]}
                radius={isHovered ? 14 : 10}
                pathOptions={{
                  color: stop.isCompleted ? "#2f8f63" : "#d8a342",
                  weight: 3,
                  fillColor: stop.isCompleted ? "#2f8f63" : "#d8a342",
                  fillOpacity: 0.9,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredId(stop.id),
                  mouseout: () => setHoveredId(null),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <span className="font-bold">
                    {stop.stopNumber}. {stop.title}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="space-y-3">
        <div className="mb-4 flex items-center gap-4 text-sm">
          <span className="flex items-center gap-2 font-medium text-stone-600">
            <span className="inline-block h-3 w-3 rounded-full bg-[#d8a342]" />
            Не пройдено
          </span>
          <span className="flex items-center gap-2 font-medium text-stone-600">
            <span className="inline-block h-3 w-3 rounded-full bg-[#2f8f63]" />
            Выполнено
          </span>
        </div>

        <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
          {stops.map((stop) => (
            <Link
              key={stop.id}
              href={`/materials/${stop.id}`}
              onMouseEnter={() => setHoveredId(stop.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={[
                "flex items-start gap-4 rounded-[1.5rem] border p-4 transition hover:-translate-y-0.5 hover:shadow-md",
                hoveredId === stop.id
                  ? "border-[#d8a342] bg-amber-50"
                  : stop.isCompleted
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-stone-200 bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                  stop.isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white",
                ].join(" ")}
              >
                {stop.stopNumber}
              </div>

              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-stone-500">
                  {stop.genre.name}
                </p>
                <h4 className="mb-1 font-extrabold leading-tight text-stone-900">
                  {stop.title}
                </h4>
                {stop.shortDescription && (
                  <p className="line-clamp-2 text-xs leading-5 text-stone-600">
                    {stop.shortDescription}
                  </p>
                )}
                {stop.isCompleted && (
                  <p className="mt-1 text-xs font-bold text-emerald-700">
                    ✓ Задание выполнено
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {!isAuthenticated && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Link href="/login" className="font-bold underline">
              Войдите
            </Link>
            , чтобы отслеживать прогресс прохождения маршрута.
          </p>
        )}
      </div>
    </div>
  );
}
