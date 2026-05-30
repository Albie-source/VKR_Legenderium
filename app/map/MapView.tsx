"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import type { Feature, GeoJsonObject, Geometry } from "geojson";
import type { Layer, Map as LeafletMap } from "leaflet";
import type { MaterialItem, RegionItem } from "./MapClient";

type LayerWithInternals = Layer & {
  getBounds?: () => import("leaflet").LatLngBounds;
  _map?: LeafletMap;
};

type MapViewProps = {
  regions: RegionItem[];
};

type RegionFeatureProperties = {
  shapeName?: string;
  name?: string;
  NAME_1?: string;
  region?: string;
  subject?: string;
  NAME?: string;
};

const DEFAULT_REGION_STYLE = {
  color: "#2f6f96",
  weight: 1.2,
  fillColor: "#3aa6a0",
  fillOpacity: 0.14,
};

const SELECTED_REGION_STYLE = {
  color: "#d8a342",
  weight: 2.6,
  fillColor: "#d8a342",
  fillOpacity: 0.38,
};

const REGION_NAME_MAP: Record<string, string> = {
  "Adygea": "Республика Адыгея",
  "Altai Krai": "Алтайский край",
  "Altai Republic": "Республика Алтай",
  "Amur Oblast": "Амурская область",
  "Arkhangelsk Oblast": "Архангельская область",
  "Astrakhan Oblast": "Астраханская область",
  "Bashkortostan": "Республика Башкортостан",
  "Belgorod Oblast": "Белгородская область",
  "Bryansk Oblast": "Брянская область",
  "Buryatia": "Республика Бурятия",
  "Chechnya": "Чеченская Республика",
  "Chelyabinsk Oblast": "Челябинская область",
  "Chukotka Autonomous Okrug": "Чукотский автономный округ",
  "Chuvashia": "Чувашская Республика",
  "Dagestan": "Республика Дагестан",
  "Ingushetia": "Республика Ингушетия",
  "Irkutsk Oblast": "Иркутская область",
  "Ivanovo Oblast": "Ивановская область",
  "Jewish Autonomous Oblast": "Еврейская автономная область",
  "Kabardino-Balkaria": "Кабардино-Балкарская Республика",
  "Kaliningrad Oblast": "Калининградская область",
  "Kalmykia": "Республика Калмыкия",
  "Kaluga Oblast": "Калужская область",
  "Kamchatka Krai": "Камчатский край",
  "Karachay-Cherkessia": "Карачаево-Черкесская Республика",
  "Karelia": "Республика Карелия",
  "Kemerovo Oblast": "Кемеровская область",
  "Khabarovsk Krai": "Хабаровский край",
  "Khakassia": "Республика Хакасия",

  "Khanty-Mansi Autonomous Okrug": "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug": "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug - Ugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug – Ugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Okrug - Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Okrug – Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Okrug-Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug - Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug – Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk Autonomous Okrug-Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Area": "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Area - Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi Autonomous Area – Yugra":
    "Ханты-Мансийский автономный округ",
  "Khanty-Mansi AO": "Ханты-Мансийский автономный округ",
  "Khanty-Mansiysk AO": "Ханты-Мансийский автономный округ",

  "Kirov Oblast": "Кировская область",
  "Komi": "Республика Коми",
  "Komi Republic": "Республика Коми",
  "Republic Komi": "Республика Коми",
  "Kostroma Oblast": "Костромская область",
  "Krasnodar Krai": "Краснодарский край",
  "Krasnoyarsk Krai": "Красноярский край",
  "Kurgan Oblast": "Курганская область",
  "Kursk Oblast": "Курская область",
  "Leningrad Oblast": "Ленинградская область",
  "Lipetsk Oblast": "Липецкая область",
  "Magadan Oblast": "Магаданская область",
  "Mari El": "Республика Марий Эл",
  "Mordovia": "Республика Мордовия",
  "Moscow": "Москва",
  "Moscow Oblast": "Московская область",
  "Murmansk Oblast": "Мурманская область",
  "Nenets Autonomous Okrug": "Ненецкий автономный округ",
  "Nizhny Novgorod Oblast": "Нижегородская область",
  "North Ossetia-Alania": "Республика Северная Осетия — Алания",
  "Novgorod Oblast": "Новгородская область",
  "Novosibirsk Oblast": "Новосибирская область",
  "Omsk Oblast": "Омская область",
  "Orenburg Oblast": "Оренбургская область",
  "Oryol Oblast": "Орловская область",
  "Penza Oblast": "Пензенская область",
  "Perm Krai": "Пермский край",
  "Primorsky Krai": "Приморский край",
  "Pskov Oblast": "Псковская область",
  "Rostov Oblast": "Ростовская область",
  "Ryazan Oblast": "Рязанская область",
  "Sakha Republic": "Республика Саха (Якутия)",
  "Sakhalin Oblast": "Сахалинская область",
  "Samara Oblast": "Самарская область",
  "Saratov Oblast": "Саратовская область",
  "Smolensk Oblast": "Смоленская область",
  "Stavropol Krai": "Ставропольский край",
  "Sverdlovsk Oblast": "Свердловская область",
  "Tambov Oblast": "Тамбовская область",
  "Tatarstan": "Республика Татарстан",
  "Tomsk Oblast": "Томская область",
  "Tula Oblast": "Тульская область",
  "Tuva": "Республика Тыва",
  "Tver Oblast": "Тверская область",
  "Tyumen Oblast": "Тюменская область",
  "Udmurtia": "Удмуртская Республика",
  "Ulyanovsk Oblast": "Ульяновская область",
  "Vladimir Oblast": "Владимирская область",
  "Volgograd Oblast": "Волгоградская область",
  "Vologda Oblast": "Вологодская область",
  "Voronezh Oblast": "Воронежская область",
  "Yamalo-Nenets Autonomous Okrug": "Ямало-Ненецкий автономный округ",
  "Yamalo-Nenets Autonomous Area": "Ямало-Ненецкий автономный округ",
  "Yaroslavl Oblast": "Ярославская область",
  "Zabaykalsky Krai": "Забайкальский край",

  "Republic of Adygea": "Республика Адыгея",
  "Republic of Altai": "Республика Алтай",
  "Republic of Bashkortostan": "Республика Башкортостан",
  "Republic of Buryatia": "Республика Бурятия",
  "Republic of Chechnya": "Чеченская Республика",
  "Republic of Chuvashia": "Чувашская Республика",
  "Chuvash Republic": "Чувашская Республика",
  "Republic of Dagestan": "Республика Дагестан",
  "Republic of Ingushetia": "Республика Ингушетия",
  "Republic of Kalmykia": "Республика Калмыкия",
  "Republic of Karelia": "Республика Карелия",
  "Republic of Khakassia": "Республика Хакасия",
  "Republic of Komi": "Республика Коми",
  "Republic of Mari El": "Республика Марий Эл",
  "Republic of Mordovia": "Республика Мордовия",
  "Republic of North Ossetia-Alania":
    "Республика Северная Осетия — Алания",
  "Republic of Tatarstan": "Республика Татарстан",
  "Republic of Tuva": "Республика Тыва",
  "Republic of Udmurtia": "Удмуртская Республика",
  "Udmurt Republic": "Удмуртская Республика",
  "Sakha": "Республика Саха (Якутия)",
  "Yakutia": "Республика Саха (Якутия)",
  "Republic of Sakha": "Республика Саха (Якутия)",
  "Sakha (Yakutia) Republic": "Республика Саха (Якутия)",
  "Kemerovo Oblast - Kuzbass": "Кемеровская область",
  "Kemerovo Oblast-Kuzbass": "Кемеровская область",
  "Zabaykalsky": "Забайкальский край",
  "Transbaikal Krai": "Забайкальский край",
  "Trans-Baikal Krai": "Забайкальский край",
};

const REGION_NAME_NORMALIZED_MAP = new Map(
  Object.entries(REGION_NAME_MAP).map(([key, value]) => [
    normalizeExternalRegionName(key),
    value,
  ])
);

export default function MapView({ regions }: MapViewProps) {
  const router = useRouter();

  const [geoJson, setGeoJson] = useState<GeoJsonObject | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedFeatureName, setSelectedFeatureName] = useState<string | null>(null);
  const [hoveredMaterialId, setHoveredMaterialId] = useState<number | null>(
    null
  );

  useEffect(() => {
    fetch("/maps/russia-regions-light.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Light GeoJSON not found");
        }

        return response.json();
      })
      .then((data) => setGeoJson(data))
      .catch(() => {
        fetch("/maps/russia-regions.geojson")
          .then((response) => response.json())
          .then((data) => setGeoJson(data))
          .catch(() => setGeoJson(null));
      });
  }, []);

  const selectedRegion = useMemo(() => {
    return regions.find((region) => region.id === selectedRegionId) ?? null;
  }, [regions, selectedRegionId]);

  const selectedMaterials = selectedRegion?.materials ?? [];

  const regionsByNormalizedName = useMemo(() => {
    const map = new Map<string, RegionItem>();

    regions.forEach((region) => {
      map.set(normalizeRegionName(region.name), region);
    });

    return map;
  }, [regions]);

  const selectRegionByName = useCallback(
    (regionNameFromMap: string) => {
      const dbRegionName = mapRegionNameToDbName(regionNameFromMap);
      const normalizedClickedName = normalizeRegionName(dbRegionName);

      const foundRegion =
        regionsByNormalizedName.get(normalizedClickedName) ??
        regions.find((region) =>
          normalizeRegionName(region.name).includes(normalizedClickedName)
        ) ??
        regions.find((region) =>
          normalizedClickedName.includes(normalizeRegionName(region.name))
        );

      setSelectedRegionId(foundRegion ? foundRegion.id : null);

      return foundRegion ?? null;
    },
    [regions, regionsByNormalizedName]
  );

  const regionStyle = useCallback(
    (feature?: GeoJsonObject) => {
      if (feature && selectedFeatureName) {
        const name = getFeatureRegionName(
          feature as Feature<Geometry, RegionFeatureProperties>
        );
        if (name === selectedFeatureName) return SELECTED_REGION_STYLE;
      }
      return DEFAULT_REGION_STYLE;
    },
    [selectedFeatureName]
  );

  return (
    <div className="grid min-h-[calc(100vh-135px)] gap-5 xl:grid-cols-[1fr_420px]">
      <section className="relative overflow-hidden rounded-[2.4rem] border border-[#d8a342]/18 bg-[#09181c] shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_18%_18%,rgba(58,166,160,0.16),transparent_24%),radial-gradient(circle_at_82%_72%,rgba(216,163,66,0.12),transparent_28%)]" />

        <MapContainer
          center={[62, 96]}
          zoom={3}
          minZoom={3}
          maxZoom={8}
          scrollWheelZoom
          preferCanvas
          className="relative z-[2] h-[calc(100vh-135px)] min-h-[690px] w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png"
          />

          <MapStartPosition />

          {geoJson && (
            <GeoJSON
              data={geoJson}
              style={regionStyle}
              onEachFeature={(feature, layer) => {
                const typedFeature = feature as Feature<
                  Geometry,
                  RegionFeatureProperties
                >;

                const regionNameFromMap = getFeatureRegionName(typedFeature);
                const displayName = mapRegionNameToDbName(regionNameFromMap);

                layer.bindTooltip(displayName, {
                  sticky: true,
                  direction: "top",
                  className: "legendarium-map-tooltip",
                });

                layer.on({
                  click: () => {
                    setHoveredMaterialId(null);
                    setSelectedFeatureName(regionNameFromMap);
                    selectRegionByName(regionNameFromMap);

                    const bounds = (layer as LayerWithInternals).getBounds?.();
                    const map = (layer as LayerWithInternals)._map;

                    if (bounds && map) {
                      map.fitBounds(bounds, {
                        padding: [80, 80],
                        maxZoom: 5,
                        animate: true,
                        duration: 0.25,
                      });
                    }
                  },
                });
              }}
            />
          )}

          {selectedMaterials.map((material) => {
            if (material.latitude === null || material.longitude === null) {
              return null;
            }

            const isHovered = hoveredMaterialId === material.id;

            return (
              <CircleMarker
                key={material.id}
                center={[material.latitude, material.longitude]}
                radius={isHovered ? 12 : 8}
                pathOptions={{
                  color: isHovered ? "#fff8e8" : "#06151a",
                  weight: isHovered ? 3 : 2,
                  fillColor: isHovered ? "#f0bd5b" : "#d8a342",
                  fillOpacity: 0.95,
                }}
                eventHandlers={{
                  mouseover: () => setHoveredMaterialId(material.id),
                  mouseout: () => setHoveredMaterialId(null),
                  click: () => router.push(`/materials/${material.id}`),
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -8]}
                  opacity={1}
                  className="legendarium-material-tooltip"
                >
                  <MaterialTooltip material={material} />
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {!geoJson && (
          <div className="absolute inset-x-6 bottom-6 z-[30] rounded-[1.5rem] border border-[#d8a342]/30 bg-[#d8a342]/12 p-5 text-sm leading-6 text-[#fff8e8] shadow-lg backdrop-blur-xl">
            Файл карты регионов не найден. Проверь путь:
            <span className="font-extrabold text-[#d8a342]">
              {" "}
              public/maps/russia-regions.geojson
            </span>
          </div>
        )}
      </section>

      <aside className="flex h-[calc(100vh-135px)] min-h-[690px] flex-col overflow-hidden rounded-[2.4rem] border border-[#d8a342]/16 bg-[#10272b]/88 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        {selectedRegion ? (
          <>
            <div className="mb-6 border-b border-white/10 pb-5">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.25em] text-[#d8a342]">
                Выбранный регион
              </p>

              <h2 className="mb-3 text-3xl font-extrabold text-[#fff8e8]">
                {selectedRegion.name}
              </h2>

              {selectedRegion.description && (
                <p className="leading-7 text-[#cbbba7]">
                  {selectedRegion.description}
                </p>
              )}
            </div>

            <section className="mb-6">
              <h3 className="mb-3 text-xl font-extrabold text-[#fff8e8]">
                Народы региона
              </h3>

              {selectedRegion.peoples.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-[#cbbba7]">
                  В этом регионе народы пока не указаны.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedRegion.peoples.map((people) => (
                    <span
                      key={people.id}
                      className="rounded-full border border-[#3aa6a0]/40 bg-[#3aa6a0]/14 px-4 py-2 text-sm font-extrabold text-[#9ee8e2]"
                    >
                      {people.name}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold text-[#fff8e8]">
                  Материалы региона
                </h3>

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm font-extrabold text-[#fff8e8]">
                  {selectedMaterials.length}
                </span>
              </div>

              {selectedMaterials.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/8 p-4 text-sm text-[#cbbba7]">
                  В этом регионе пока нет опубликованных материалов.
                </p>
              ) : (
                <div className="legendarium-region-materials-scroll min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
                  {selectedMaterials.map((material) => (
                    <Link
                      key={material.id}
                      href={`/materials/${material.id}`}
                      className={[
                        "block rounded-3xl border p-4 transition hover:-translate-y-0.5",
                        hoveredMaterialId === material.id
                          ? "border-[#d8a342]/60 bg-[#d8a342]/12"
                          : "border-white/10 bg-white/8 hover:border-[#d8a342]/40 hover:bg-white/12",
                      ].join(" ")}
                      onMouseEnter={() => setHoveredMaterialId(material.id)}
                      onMouseLeave={() => setHoveredMaterialId(null)}
                    >
                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        <span className="badge-genre">{material.genre.name}</span>

                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-extrabold text-[#fff8e8]">
                          {material.people.name}
                        </span>
                      </div>

                      <h4 className="mb-2 text-lg font-extrabold text-[#fff8e8]">
                        {material.title}
                      </h4>

                      {material.shortDescription && (
                        <p className="line-clamp-3 text-sm leading-6 text-[#cbbba7]">
                          {material.shortDescription}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <div className="flex h-full items-center justify-center rounded-[2rem] border border-white/10 bg-white/8 p-8 text-center">
            <div>
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d8a342]/30 bg-[#d8a342]/12 text-2xl text-[#d8a342]">
                ⌖
              </div>

              <h2 className="mb-3 text-2xl font-extrabold text-[#fff8e8]">
                Регион не выбран
              </h2>

              <p className="leading-7 text-[#cbbba7]">
                Нажмите на регион на карте, чтобы увидеть народы и материалы.
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function MapStartPosition() {
  const map = useMap();

  useEffect(() => {
    map.setView([62, 96], 3);
  }, [map]);

  return null;
}

function MaterialTooltip({ material }: { material: MaterialItem }) {
  return (
    <div className="w-[300px] max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#06151a]/96 p-4 text-[#fff8e8] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="mb-3 flex min-w-0 gap-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/10">
          {material.imageUrl ? (
            <img
              src={material.imageUrl}
              alt={material.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-[#cbbba7]">
              Нет изображения
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 truncate text-xs font-extrabold uppercase tracking-[0.16em] text-[#d8a342]">
            {material.genre.name}
          </p>

          <h3 className="line-clamp-2 break-words text-base font-extrabold leading-5 text-[#fff8e8]">
            {material.title}
          </h3>
        </div>
      </div>

      {material.shortDescription && (
        <p className="line-clamp-3 break-words text-sm leading-5 text-[#cbbba7]">
          {material.shortDescription}
        </p>
      )}
    </div>
  );
}

function getFeatureRegionName(
  feature: Feature<Geometry, RegionFeatureProperties>
) {
  return (
    feature.properties?.shapeName ??
    feature.properties?.name ??
    feature.properties?.NAME_1 ??
    feature.properties?.region ??
    feature.properties?.subject ??
    feature.properties?.NAME ??
    "Регион"
  );
}

function mapRegionNameToDbName(regionNameFromMap: string) {
  return (
    REGION_NAME_MAP[regionNameFromMap] ??
    REGION_NAME_NORMALIZED_MAP.get(
      normalizeExternalRegionName(regionNameFromMap)
    ) ??
    regionNameFromMap
  );
}

function normalizeExternalRegionName(value: string) {
  return value
    .toLowerCase()
    .replace("ё", "е")
    .replace(/[–—-]/g, " ")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRegionName(value: string) {
  return value
    .toLowerCase()
    .replace("ё", "е")
    .replace("область", "")
    .replace("край", "")
    .replace("республика", "")
    .replace("автономный округ", "")
    .replace("автономная область", "")
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
