"use client";

import dynamic from "next/dynamic";

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
};

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[calc(100vh-135px)] items-center justify-center rounded-[2rem] border border-white/10 bg-white/8 text-[#cbbba7]">
      Загрузка интерактивной карты...
    </div>
  ),
});

export default function MapClient({ regions }: MapClientProps) {
  return <MapView regions={regions} />;
}
