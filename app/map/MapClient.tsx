"use client";

import dynamic from "next/dynamic";
import type { MaterialStatus } from "@/lib/materialProgress";

export type RegionItem = {
  id: number;
  name: string;
  description: string | null;
  peoples: {
    id: number;
    name: string;
  }[];
  materials: MaterialItem[];
};

export type MaterialItem = {
  id: number;
  title: string;
  shortDescription: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  status: MaterialStatus | null;
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

export type GoalStop = {
  id: number;
  latitude: number;
  longitude: number;
};

type MapClientProps = {
  regions: RegionItem[];
  goalStops?: GoalStop[];
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[calc(100vh-135px)] items-center justify-center rounded-[2rem] border border-white/10 bg-white/8 text-[#cbbba7]">
      Загрузка интерактивной карты...
    </div>
  ),
});

export default function MapClient({ regions, goalStops }: MapClientProps) {
  return <MapView regions={regions} goalStops={goalStops} />;
}
