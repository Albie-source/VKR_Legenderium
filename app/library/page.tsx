import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import LibraryFilters from "./LibraryFilters";

type LibraryPageProps = {
  searchParams: Promise<{
    search?: string;
    region?: string;
    people?: string;
    genre?: string;
    topic?: string;
  }>;
};

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const regionId = Number(params.region);
  const peopleId = Number(params.people);
  const genreId = Number(params.genre);
  const topicId = Number(params.topic);

  const where: Prisma.MaterialWhereInput = {
    status: "PUBLISHED",
  };

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        shortDescription: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        fullText: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (!Number.isNaN(regionId)) where.regionId = regionId;
  if (!Number.isNaN(peopleId)) where.peopleId = peopleId;
  if (!Number.isNaN(genreId)) where.genreId = genreId;

  if (!Number.isNaN(topicId)) {
    where.topics = {
      some: {
        topicId,
      },
    };
  }

  const [materials, regions, peoples, genres, topics] = await Promise.all([
    prisma.material.findMany({
      where,
      include: {
        region: true,
        people: true,
        genre: true,
        topics: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.region.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.people.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.topic.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const hasActiveFilters =
    search ||
    !Number.isNaN(regionId) ||
    !Number.isNaN(peopleId) ||
    !Number.isNaN(genreId) ||
    !Number.isNaN(topicId);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Библиотека
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Фольклорные материалы
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                В библиотеке собраны легенды, сказки, мифы и другие материалы,
                связанные с фольклором народов России. Используйте поиск и
                фильтры, чтобы изучать материалы по региону, народу, жанру и
                тематике.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat title="Найдено" value={materials.length} />
              <HeroStat title="Регионов" value={regions.length} />
              <HeroStat title="Народов" value={peoples.length} />
              <HeroStat title="Жанров" value={genres.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <LibraryFilters
          regions={regions}
          peoples={peoples}
          genres={genres}
          topics={topics}
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Материалы</h2>

            <p className="mt-1 text-sm text-stone-600">
              {hasActiveFilters
                ? "Показаны материалы, соответствующие выбранным параметрам."
                : "Показаны все опубликованные материалы платформы."}
            </p>
          </div>

          <span className="rounded-full bg-white px-4 py-2 text-sm text-stone-700 shadow-sm">
            Количество: {materials.length}
          </span>
        </div>

        {materials.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {materials.map((material) => (
              <article
                key={material.id}
                className="group flex min-h-[430px] flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-48 bg-stone-200">
                  {material.imageUrl ? (
                    <img
                      src={material.imageUrl}
                      alt={material.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-stone-200 text-sm text-stone-500">
                      Изображение не добавлено
                    </div>
                  )}

                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm backdrop-blur">
                    {material.genre.name}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {material.region.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {material.people.name}
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-semibold leading-tight">
                    {material.title}
                  </h3>

                  <p className="mb-4 line-clamp-4 flex-1 text-sm leading-6 text-stone-700">
                    {material.shortDescription}
                  </p>

                  {material.topics.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {material.topics.map(({ topic }) => (
                        <span
                          key={topic.id}
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/materials/${material.id}`}
                    className="mt-auto rounded-xl bg-amber-700 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-amber-800"
                  >
                    Открыть материал
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function HeroStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ?
      </div>

      <h3 className="mb-3 text-2xl font-semibold">
        Материалы не найдены
      </h3>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        По выбранным параметрам нет опубликованных материалов. Попробуйте
        изменить фильтры или сбросить поиск.
      </p>

      <Link
        href="/library"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Сбросить фильтры
      </Link>
    </div>
  );
}
