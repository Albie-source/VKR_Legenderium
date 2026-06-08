import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import type { RouteStop } from "./GoalMapClient";
import GoalMapWrapper from "./GoalMapWrapper";

type GoalPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: GoalPageProps): Promise<Metadata> {
  const { id } = await params;
  const goalId = Number(id);
  if (Number.isNaN(goalId)) return {};

  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    select: { title: true, description: true, cardImageUrl: true, isActive: true },
  });

  if (!goal || !goal.isActive) return {};

  const description = goal.description ?? undefined;

  return {
    title: `${goal.title} — Легендариум`,
    description,
    openGraph: {
      title: goal.title,
      description,
      images: goal.cardImageUrl ? [{ url: goal.cardImageUrl }] : undefined,
    },
  };
}

export default async function GoalPage({ params }: GoalPageProps) {
  const { id } = await params;
  const goalId = Number(id);

  if (Number.isNaN(goalId)) notFound();

  const [goal, user] = await Promise.all([
    prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        genres: { include: { genre: true } },
        topics: { include: { topic: true } },
        region: true,
        pinnedMaterials: {
          include: {
            material: { include: { genre: true } },
          },
        },
      },
    }),
    getCurrentUser(),
  ]);

  if (!goal || !goal.isActive) notFound();

  type RawMaterial = {
    id: number;
    title: string;
    shortDescription: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
    genre: { name: string };
  };

  let routeMaterials: RawMaterial[];

  if (goal.pinnedMaterials.length > 0) {
    routeMaterials = goal.pinnedMaterials.map((pm) => pm.material);
  } else {
    const genreIds = goal.genres.map((g) => g.genreId);
    const topicIds = goal.topics.map((t) => t.topicId);

    routeMaterials = await prisma.material.findMany({
      where: {
        status: "PUBLISHED",
        ...(genreIds.length > 0 && { genreId: { in: genreIds } }),
        ...(topicIds.length > 0 && {
          topics: { some: { topicId: { in: topicIds } } },
        }),
        ...(goal.regionId && { regionId: goal.regionId }),
        latitude: { not: null },
        longitude: { not: null },
      },
      include: { genre: true },
      orderBy: { createdAt: "desc" },
      take: goal.requiredMaterialsCount * 3,
    });
  }

  const withCoords = routeMaterials.filter(
    (m): m is RawMaterial & { latitude: number; longitude: number } =>
      m.latitude != null && m.longitude != null
  );

  const ordered = orderByProximity(withCoords).slice(
    0,
    goal.requiredMaterialsCount
  );

  const completedMaterialIds = new Set<number>();

  if (user && ordered.length > 0) {
    const tasks = await prisma.interactiveTask.findMany({
      where: { materialId: { in: ordered.map((m) => m.id) } },
      include: {
        attempts: {
          where: { userId: user.id, isCompleted: true },
          take: 1,
        },
      },
    });

    tasks
      .filter((t) => t.attempts.length > 0)
      .forEach((t) => { if (t.materialId !== null) completedMaterialIds.add(t.materialId); });
  }

  const stops: RouteStop[] = ordered.map((material, index) => ({
    id: material.id,
    title: material.title,
    shortDescription: material.shortDescription,
    imageUrl: material.imageUrl,
    latitude: material.latitude,
    longitude: material.longitude,
    genre: material.genre,
    isCompleted: completedMaterialIds.has(material.id),
    stopNumber: index + 1,
  }));

  const completedCount = stops.filter((s) => s.isCompleted).length;
  const progressPercent =
    goal.requiredMaterialsCount > 0
      ? Math.round((completedCount / goal.requiredMaterialsCount) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-stone-50 pb-20 text-stone-900">
      <section className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link
            href="/goals"
            className="mb-6 inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
          >
            ← Все цели
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex flex-wrap gap-2 text-xs">
                {goal.genres.map(({ genre }) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800"
                  >
                    {genre.name}
                  </span>
                ))}
                {goal.topics.map(({ topic }) => (
                  <span
                    key={topic.id}
                    className="rounded-full bg-stone-100 px-3 py-1 text-stone-700"
                  >
                    {topic.name}
                  </span>
                ))}
                {goal.region && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                    {goal.region.name}
                  </span>
                )}
              </div>

              <h1 className="mb-3 text-4xl font-bold leading-tight">
                {goal.title}
              </h1>

              {goal.description && (
                <p className="mb-5 max-w-2xl leading-7 text-stone-600">
                  {goal.description}
                </p>
              )}

              {user && (
                <div className="max-w-sm">
                  <div className="mb-2 flex justify-between text-sm font-semibold text-stone-600">
                    <span>
                      {completedCount} из {goal.requiredMaterialsCount} точек
                    </span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-amber-700">
                Награда
              </p>
              {goal.cardImageUrl && (
                <Image
                  src={goal.cardImageUrl}
                  alt={goal.cardTitle}
                  width={96}
                  height={96}
                  className="mx-auto mb-3 h-24 w-24 rounded-2xl object-cover"
                />
              )}
              <p className="font-bold text-stone-900">{goal.cardTitle}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-8">
        {stops.length === 0 ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center">
            <p className="text-stone-600">
              Нет материалов с координатами для отображения маршрута.
              <br />
              Добавьте координаты к материалам в разделе администрирования.
            </p>
          </div>
        ) : (
          <GoalMapWrapper stops={stops} isAuthenticated={Boolean(user)} />
        )}
      </section>
    </main>
  );
}

function orderByProximity<T extends { latitude: number; longitude: number }>(
  items: T[]
): T[] {
  if (items.length <= 1) return [...items];

  const remaining = [...items];
  const startIdx = remaining.reduce(
    (minIdx, item, i) =>
      item.longitude < remaining[minIdx].longitude ? i : minIdx,
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
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return ordered;
}
