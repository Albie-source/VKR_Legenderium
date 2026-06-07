import Link from "next/link";
import { Suspense } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import LibraryFilters from "./LibraryFilters";
import LibraryResults from "./LibraryResults";
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
    sort?: string;
    page?: string;
  }>;
};

const ORDER_BY: Record<string, Prisma.MaterialOrderByWithRelationInput> = {
  title_asc: { title: "asc" },
  title_desc: { title: "desc" },
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
        word_similarity(${search}, m.title) AS title_score,
        GREATEST(
          word_similarity(${search}, COALESCE(m."shortDescription", '')),
          word_similarity(${search}, r.name),
          word_similarity(${search}, p.name),
          word_similarity(${search}, g.name)
        ) AS other_score
      FROM materials m
      JOIN regions r ON m."regionId" = r.id
      JOIN peoples p ON m."peopleId" = p.id
      JOIN genres  g ON m."genreId"  = g.id
      WHERE ${Prisma.join(conditions, " AND ")}
      ORDER BY title_score DESC, other_score DESC
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
  const sort = params.sort ?? "";
  const currentPage = Math.max(1, Number(params.page) || 1);

  const orderBy = ORDER_BY[sort] ?? { createdAt: "desc" as const };

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
        orderBy,
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

  return (
    <main className="overflow-hidden bg-[#0b1f22] pb-20">
      <MascotHint
        storageKey="hint_library"
        message="Используй фильтры сверху, чтобы найти легенды нужного народа или региона. Каждый прочитанный материал приближает нас к восстановлению архива!"
        mood="thinking"
      />

      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-[96rem] px-6 py-8">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
            <Link href="/" className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]">
              Главная
            </Link>
            <span className="text-[#d6c8b6]/30">›</span>
            <span className="text-[#fff8e8]">Библиотека</span>
          </nav>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1f22] px-7 py-7 shadow-xl shadow-black/20 md:px-9 md:py-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative max-w-3xl">
              <p className="mb-3 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b]">
                Библиотека
              </p>

              <h1 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-4xl">
                Фольклорные материалы
              </h1>

              <p className="max-w-2xl text-base leading-7 text-[#d6c8b6]">
                Легенды, сказки, мифы и другие материалы, связанные с
                фольклором народов России. Используйте поиск и фильтры слева,
                чтобы изучать материалы по региону, народу, жанру и тематике.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[96rem] px-6 pt-10">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:items-start">
          <Suspense fallback={null}>
            <LibraryFilters
              regions={regions}
              peoples={peoples}
              genres={genres}
              topics={topics}
            />
          </Suspense>

          <div className="min-w-0">
            <Suspense fallback={null}>
              <LibraryResults materials={materials} totalCount={totalCount} />
            </Suspense>

            <Suspense fallback={null}>
              <LibraryPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  );
}
