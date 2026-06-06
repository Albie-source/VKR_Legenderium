import Link from "next/link";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import LibraryFilters from "./LibraryFilters";
import LibraryPagination from "./LibraryPagination";
import MascotHint from "@/components/MascotHint";

const PAGE_SIZE = 12;
const TRGM_THRESHOLD = 0.3;

type LibraryPageProps = {
  searchParams: Promise<{
    search?: string;
    region?: string;
    people?: string;
    genre?: string;
    topic?: string;
    page?: string;
  }>;
};

async function trigramSearch(
  search: string,
  regionId: number,
  peopleId: number,
  genreId: number,
  topicId: number,
): Promise<number[]> {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`m.status = 'PUBLISHED'`,
    Prisma.sql`(
      word_similarity(${search}, m.title) > ${TRGM_THRESHOLD}
      OR word_similarity(${search}, COALESCE(m."shortDescription", '')) > ${TRGM_THRESHOLD}
      OR word_similarity(${search}, COALESCE(m."fullText", '')) > ${TRGM_THRESHOLD}
      OR word_similarity(${search}, r.name) > ${TRGM_THRESHOLD}
      OR word_similarity(${search}, p.name) > ${TRGM_THRESHOLD}
      OR word_similarity(${search}, g.name) > ${TRGM_THRESHOLD}
    )`,
  ];

  if (!Number.isNaN(regionId))
    conditions.push(Prisma.sql`m."regionId" = ${regionId}`);
  if (!Number.isNaN(peopleId))
    conditions.push(Prisma.sql`m."peopleId" = ${peopleId}`);
  if (!Number.isNaN(genreId))
    conditions.push(Prisma.sql`m."genreId" = ${genreId}`);
  if (!Number.isNaN(topicId))
    conditions.push(
      Prisma.sql`EXISTS (
        SELECT 1 FROM material_topics mt
        WHERE mt."materialId" = m.id AND mt."topicId" = ${topicId}
      )`,
    );

  const rows = await prisma.$queryRaw<{ id: bigint }[]>(
    Prisma.sql`
      SELECT DISTINCT m.id,
        GREATEST(
          word_similarity(${search}, m.title),
          word_similarity(${search}, COALESCE(m."shortDescription", '')),
          word_similarity(${search}, r.name),
          word_similarity(${search}, p.name),
          word_similarity(${search}, g.name)
        ) AS score
      FROM materials m
      JOIN regions r ON m."regionId" = r.id
      JOIN peoples p ON m."peopleId" = p.id
      JOIN genres  g ON m."genreId"  = g.id
      WHERE ${Prisma.join(conditions, " AND ")}
      ORDER BY score DESC
    `,
  );

  return rows.map((r) => Number(r.id));
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;

  const search = params.search?.trim() ?? "";
  const regionId = params.region ? Number(params.region) : NaN;
  const peopleId = params.people ? Number(params.people) : NaN;
  const genreId = params.genre ? Number(params.genre) : NaN;
  const topicId = params.topic ? Number(params.topic) : NaN;
  const currentPage = Math.max(1, Number(params.page) || 1);

  // --- Trigram search path ---
  let trgmIds: number[] | null = null;
  if (search) {
    trgmIds = await trigramSearch(search, regionId, peopleId, genreId, topicId);
  }

  // --- Build Prisma where ---
  const where: Prisma.MaterialWhereInput = { status: "PUBLISHED" };

  if (trgmIds !== null) {
    // Pagination is done by slicing the sorted ID array
    const skip = (currentPage - 1) * PAGE_SIZE;
    const pageIds = trgmIds.slice(skip, skip + PAGE_SIZE);
    where.id = { in: pageIds };
  } else {
    if (!Number.isNaN(regionId)) where.regionId = regionId;
    if (!Number.isNaN(peopleId)) where.peopleId = peopleId;
    if (!Number.isNaN(genreId)) where.genreId = genreId;
    if (!Number.isNaN(topicId)) where.topics = { some: { topicId } };
  }

  const materialQuery = trgmIds !== null
    ? prisma.material.findMany({
        where,
        include: {
          region: true,
          people: true,
          genre: true,
          topics: { include: { topic: true } },
        },
      })
    : prisma.material.findMany({
        where,
        include: {
          region: true,
          people: true,
          genre: true,
          topics: { include: { topic: true } },
        },
        orderBy: { createdAt: "desc" },
        take: PAGE_SIZE,
        skip: (currentPage - 1) * PAGE_SIZE,
      });

  const [materials, rawCount, regions, peoples, genres, topics] =
    await Promise.all([
      materialQuery,
      trgmIds !== null
        ? Promise.resolve(trgmIds.length)
        : prisma.material.count({ where }),
      prisma.region.findMany({ orderBy: { name: "asc" } }),
      prisma.people.findMany({ orderBy: { name: "asc" } }),
      prisma.genre.findMany({ orderBy: { name: "asc" } }),
      prisma.topic.findMany({ orderBy: { name: "asc" } }),
    ]);

  // Restore relevance order (Prisma doesn't guarantee IN-clause order)
  if (trgmIds !== null) {
    const skip = (currentPage - 1) * PAGE_SIZE;
    const pageIds = trgmIds.slice(skip, skip + PAGE_SIZE);
    const order = new Map(pageIds.map((id, i) => [id, i]));
    materials.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  }

  const totalCount = rawCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const hasActiveFilters =
    Boolean(search) ||
    !Number.isNaN(regionId) ||
    !Number.isNaN(peopleId) ||
    !Number.isNaN(genreId) ||
    !Number.isNaN(topicId);

  return (
    <main className="overflow-hidden bg-[#f4ecdf] pb-20">
      <MascotHint
        storageKey="hint_library"
        message="Используй фильтры сверху, чтобы найти легенды нужного народа или региона. Каждый прочитанный материал приближает нас к восстановлению архива!"
        mood="thinking"
      />
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1f22] px-8 py-10 shadow-2xl shadow-black/25 md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative max-w-4xl">
              <p className="mb-4 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b]">
                Библиотека
              </p>

              <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-6xl">
                Фольклорные материалы
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-[#d6c8b6]">
                В библиотеке собраны легенды, сказки, мифы и другие материалы,
                связанные с фольклором народов России. Используйте поиск и
                фильтры, чтобы изучать материалы по региону, народу, жанру и
                тематике.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <Suspense fallback={null}>
          <LibraryFilters
            regions={regions}
            peoples={peoples}
            genres={genres}
            topics={topics}
          />
        </Suspense>

        <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-950">
              Материалы
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              {hasActiveFilters
                ? "Показаны материалы, соответствующие выбранным параметрам."
                : "Показаны все опубликованные материалы платформы."}
            </p>
          </div>

          <span className="rounded-full border border-[#d8c3a5] bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
            Всего: {totalCount}
          </span>
        </div>

        {materials.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {materials.map((material, index) => (
                <article
                  key={material.id}
                  style={{ animationDelay: `${index * 0.06}s` }}
                  className="animate-fade-in-up group flex min-h-[460px] flex-col overflow-hidden rounded-[2rem] border border-[#e4d4bf] bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden bg-[#eadfce]">
                    {material.imageUrl ? (
                      <img
                        src={material.imageUrl}
                        alt={material.title}
                        className="h-full w-full object-cover object-[center_42%] transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#efe4d3,#e5d4bd)] px-6 text-center text-sm font-semibold text-stone-600">
                        Изображение не добавлено
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-[#d8a342]/30 bg-[#fff8e8]/90 px-3 py-1 text-xs font-extrabold text-[#9f661f] shadow-sm backdrop-blur">
                      {material.genre.name}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-[#3aa6a0]/20 bg-[#e7f7f5] px-3 py-1 font-bold text-[#247670]">
                        {material.region.name}
                      </span>

                      <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 font-bold text-stone-700">
                        {material.people.name}
                      </span>
                    </div>

                    <h3 className="mb-3 text-2xl font-extrabold leading-tight text-stone-950">
                      {material.title}
                    </h3>

                    <p className="mb-4 line-clamp-4 flex-1 text-sm leading-6 text-stone-600">
                      {material.shortDescription}
                    </p>

                    {material.topics.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {material.topics.map(({ topic }) => (
                          <span
                            key={topic.id}
                            className="rounded-full border border-[#eadbc7] bg-[#faf4eb] px-3 py-1 text-xs font-semibold text-stone-600"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <Link
                      href={`/materials/${material.id}`}
                      className="mt-auto rounded-2xl bg-[#d8a342] px-4 py-3 text-center text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                    >
                      Открыть материал
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <Suspense fallback={null}>
              <LibraryPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </Suspense>
          </>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-[#e4d4bf] bg-white p-10 text-center shadow-md">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d8a342]/30 bg-[#fff5dc] text-2xl text-[#c78a24]">
        ?
      </div>

      <h3 className="mb-3 text-2xl font-extrabold text-stone-950">
        Материалы не найдены
      </h3>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        По выбранным параметрам нет опубликованных материалов. Попробуйте
        изменить фильтры или сбросить поиск.
      </p>

      <Link
        href="/library"
        className="inline-flex rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
      >
        Сбросить фильтры
      </Link>
    </div>
  );
}
