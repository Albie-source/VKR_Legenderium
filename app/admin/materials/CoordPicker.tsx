"use client";

import React, { useEffect, useRef, useState } from "react";

type ExistingMaterial = {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
};

type Props = {
  defaultLatitude?: number | null;
  defaultLongitude?: number | null;
  existingMaterials?: ExistingMaterial[];
};

export default function CoordPicker({ defaultLatitude, defaultLongitude, existingMaterials = [] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

  const [lat, setLat] = useState<number | "">(defaultLatitude ?? "");
  const [lng, setLng] = useState<number | "">(defaultLongitude ?? "");

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: defaultLatitude && defaultLongitude
          ? [defaultLatitude, defaultLongitude]
          : [62, 95],
        zoom: defaultLatitude && defaultLongitude ? 8 : 4,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap © CARTO",
        maxZoom: 19,
      }).addTo(map);

      // Точки уже добавленных легенд — чтобы не поставить новую слишком близко к существующей
      for (const material of existingMaterials) {
        L.circleMarker([material.latitude, material.longitude], {
          radius: 7,
          color: "#7c8a9a",
          weight: 2,
          fillColor: "#cfd6df",
          fillOpacity: 0.85,
        })
          .addTo(map)
          .bindTooltip(material.title, { direction: "top", offset: [0, -6] });
      }

      const icon = L.divIcon({
        className: "",
        html: `<div style="width:20px;height:20px;border-radius:50%;background:#d8a342;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      if (defaultLatitude && defaultLongitude) {
        const marker = L.marker([defaultLatitude, defaultLongitude], { icon }).addTo(map);
        markerRef.current = marker;
      }

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        const rounded = (n: number) => Math.round(n * 10000) / 10000;

        setLat(rounded(clickLat));
        setLng(rounded(clickLng));

        if (markerRef.current) {
          markerRef.current.setLatLng([clickLat, clickLng]);
        } else {
          const marker = L.marker([clickLat, clickLng], { icon }).addTo(map);
          markerRef.current = marker;
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-stone-700">
        Координаты на карте
        <span className="ml-2 text-xs text-stone-400">— кликните на карту, чтобы выбрать точку</span>
      </p>

      {existingMaterials.length > 0 && (
        <p className="mb-2 flex items-center gap-2 text-xs text-stone-500">
          <span className="inline-block h-3 w-3 rounded-full border-2 border-[#7c8a9a] bg-[#cfd6df]" />
          серые точки — уже добавленные легенды ({existingMaterials.length}); наведите на точку, чтобы увидеть название
        </p>
      )}

      <div
        ref={mapRef}
        className="h-72 w-full overflow-hidden rounded-xl border border-stone-300"
        style={{ zIndex: 0 }}
      />

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">Широта</label>
          <input
            name="latitude"
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="62.0000"
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-stone-500">Долгота</label>
          <input
            name="longitude"
            type="number"
            step="any"
            value={lng}
            onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="95.0000"
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none transition focus:border-amber-700"
          />
        </div>
      </div>

      {lat !== "" && lng !== "" && (
        <p className="mt-2 text-xs text-stone-400">
          Выбрано: {lat}, {lng}
        </p>
      )}
    </div>
  );
}
