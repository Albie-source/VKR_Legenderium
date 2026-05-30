import { prisma } from "@/lib/prisma";
import MapClient from "./MapClient";
import type { GoalStop } from "./MapClient";
import MascotHint from "@/components/MascotHint";

type MapPageProps = {
  searchParams: Promise<{ goal?: string }>;
};

export default async function MapPage({ searchParams }: MapPageProps) {
  const { goal: goalParam } = await searchParams;
  const goalId = goalParam ? Number(goalParam) : null;
  let goalStops: GoalStop[] = [];

  if (goalId && !Number.isNaN(goalId)) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        genres: true,
        topics: true,
        pinnedMaterials: {
          include: { material: { include: { genre: true } } },
        },
      },
    });

    if (goal) {
      type RawMat = { id: number; title: string; latitude: number | null; longitude: number | null };
      let mats: RawMat[];

      if (goal.pinnedMaterials.length > 0) {
        mats = goal.pinnedMaterials.map((pm) => pm.material);
      } else {
        const genreIds = goal.genres.map((g) => g.genreId);
        const topicIds = goal.topics.map((t) => t.topicId);
        mats = await prisma.material.findMany({
          where: {
            status: "PUBLISHED",
            ...(genreIds.length > 0 && { genreId: { in: genreIds } }),
            ...(topicIds.length > 0 && { topics: { some: { topicId: { in: topicIds } } } }),
            latitude: { not: null },
            longitude: { not: null },
          },
          select: { id: true, title: true, latitude: true, longitude: true },
          orderBy: { createdAt: "desc" },
          take: goal.requiredMaterialsCount * 3,
        });
      }

      const withCoords = mats.filter(
        (m): m is RawMat & { latitude: number; longitude: number } =>
          m.latitude != null && m.longitude != null
      );

      goalStops = orderByProximity(withCoords)
        .slice(0, goal.requiredMaterialsCount)
        .map((m) => ({ id: m.id, latitude: m.latitude, longitude: m.longitude }));
    }
  }

  const regions = await prisma.region.findMany({
    include: {
      materials: {
        where: {
          status: "PUBLISHED",
        },
        include: {
          people: true,
          genre: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
        orderBy: {
          title: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const preparedRegions = regions.map((region) => {
    const peoplesMap = new Map<number, string>();

    region.materials.forEach((material) => {
      peoplesMap.set(material.people.id, material.people.name);
    });

    return {
      id: region.id,
      name: region.name,
      description: region.description,
      peoples: Array.from(peoplesMap.entries()).map(([id, name]) => ({
        id,
        name,
      })),
      materials: region.materials.map((material) => ({
        id: material.id,
        title: material.title,
        shortDescription: material.shortDescription,
        latitude: material.latitude,
        longitude: material.longitude,
        imageUrl: material.imageUrl,
        people: {
          id: material.people.id,
          name: material.people.name,
        },
        genre: {
          id: material.genre.id,
          name: material.genre.name,
        },
        topics: material.topics.map(({ topic }) => ({
          id: topic.id,
          name: topic.name,
        })),
      })),
    };
  });

  return (
    <main className="legendarium-page overflow-hidden">
      <section className="mx-auto max-w-[1600px] px-6 py-6">
        <MapClient regions={preparedRegions} goalStops={goalStops} />
      </section>
      <MascotHint
        storageKey="hint_map"
        message="Нажми на любой регион на карте — и я расскажу, какие предания там хранятся. Именно с них мы начнём восстанавливать архив!"
        mood="excited"
      />
    </main>
  );
}

function orderByProximity<T extends { latitude: number; longitude: number }>(items: T[]): T[] {
  if (items.length <= 1) return [...items];
  const remaining = [...items];
  const startIdx = remaining.reduce(
    (minIdx, item, i) => (item.longitude < remaining[minIdx].longitude ? i : minIdx),
    0
  );
  const ordered: T[] = [remaining.splice(startIdx, 1)[0]];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const dx = remaining[i].longitude - last.longitude;
      const dy = remaining[i].latitude - last.latitude;
      const dist = dx * dx + dy * dy;
      if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }
    }
    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }
  return ordered;
}
