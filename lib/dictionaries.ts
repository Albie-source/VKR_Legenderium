import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// Справочники (регионы, народы, жанры, темы) меняются администратором
// раз в недели, а запрашиваются на каждый визит в библиотеку/карту —
// держим их в кэше Next.js, чтобы не дёргать БД на каждый запрос.
const DICTIONARY_REVALIDATE_SECONDS = 300;

export const getRegions = unstable_cache(
  () => prisma.region.findMany({ orderBy: { name: "asc" } }),
  ["dictionary-regions"],
  { revalidate: DICTIONARY_REVALIDATE_SECONDS, tags: ["dictionaries"] },
);

export const getPeoples = unstable_cache(
  () => prisma.people.findMany({ orderBy: { name: "asc" } }),
  ["dictionary-peoples"],
  { revalidate: DICTIONARY_REVALIDATE_SECONDS, tags: ["dictionaries"] },
);

export const getGenres = unstable_cache(
  () => prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ["dictionary-genres"],
  { revalidate: DICTIONARY_REVALIDATE_SECONDS, tags: ["dictionaries"] },
);

export const getTopics = unstable_cache(
  () => prisma.topic.findMany({ orderBy: { name: "asc" } }),
  ["dictionary-topics"],
  { revalidate: DICTIONARY_REVALIDATE_SECONDS, tags: ["dictionaries"] },
);
