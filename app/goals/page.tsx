import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function GoalsPage() {
  const goals = await prisma.goal.findMany({
    where: { isActive: true },
    include: {
      genres: { include: { genre: true } },
      topics: { include: { topic: true } },
      region: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRequiredMaterials = goals.reduce(
    (sum, goal) => sum + goal.requiredMaterialsCount,
    0
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Цели изучения
          </p>
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Тематические цели и коллекционные карточки
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Цели помогают изучать фольклор не случайно, а по смысловым
                маршрутам. Пользователь знакомится с материалами определённого
                жанра и тематики, выполняет задания и получает
                коллекционную карточку-награду.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <HeroStat title="Активных целей" value={goals.length} />
              <HeroStat title="Материалов в целях" value={totalRequiredMaterials} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Маршруты изучения</h2>
            <p className="mt-1 text-sm text-stone-600">
              Выберите цель и перейдите к тематическому маршруту на карте.
            </p>
          </div>
          <Link
            href="/library"
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Перейти в библиотеку
          </Link>
        </div>

        {goals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {goals.map((goal) => (
              <article
                key={goal.id}
                className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="grid min-h-[360px] gap-0 md:grid-cols-[1fr_240px]">
                  <div className="flex flex-col p-6">
                    <div className="mb-4 flex flex-wrap gap-2 text-xs">
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

                    <h3 className="mb-3 text-3xl font-bold leading-tight">
                      {goal.title}
                    </h3>

                    {goal.description && (
                      <p className="mb-5 line-clamp-4 leading-7 text-stone-700">
                        {goal.description}
                      </p>
                    )}

                    <div className="mb-5 grid gap-3 sm:grid-cols-2">
                      <InfoBox
                        title="Нужно изучить"
                        value={`${goal.requiredMaterialsCount} материал(ов)`}
                      />
                      <InfoBox title="Награда" value={goal.cardTitle} />
                    </div>

                    <div className="mt-auto">
                      <Link
                        href="/map"
                        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
                      >
                        Открыть маршрут на карте →
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 bg-amber-50 p-5 md:border-l md:border-t-0">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                      Карточка-награда
                    </p>
                    <div className="rounded-[1.5rem] border border-amber-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-stone-100 to-stone-200">
                        {goal.cardImageUrl ? (
                          <img
                            src={goal.cardImageUrl}
                            alt={goal.cardTitle}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="px-4 text-center text-sm text-stone-500">
                            Изображение карточки не добавлено
                          </div>
                        )}
                      </div>
                      <h4 className="text-center text-xl font-bold">
                        {goal.cardTitle}
                      </h4>
                      <p className="mt-2 text-center text-sm text-stone-500">
                        Коллекционная награда
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
          <ExplanationCard
            title="1. Выберите цель"
            text="Цель задаёт тематический маршрут: например, изучение легенд о духах или сказок о животных."
          />
          <ExplanationCard
            title="2. Пройдите маршрут"
            text="Откройте карту маршрута, читайте материалы и выполняйте задания в каждой точке."
          />
          <ExplanationCard
            title="3. Получите карточку"
            text="После выполнения всех условий цели пользователь получает коллекционную карточку-награду."
          />
        </div>
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function ExplanationCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-[2rem] border border-stone-200 bg-stone-50 p-6">
      <h3 className="mb-3 text-2xl font-semibold">{title}</h3>
      <p className="leading-7 text-stone-700">{text}</p>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ★
      </div>
      <h3 className="mb-3 text-2xl font-semibold">
        Активные цели пока не добавлены
      </h3>
      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Цели можно создать в административной панели. После публикации они
        появятся на этой странице.
      </p>
      <Link
        href="/library"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Перейти в библиотеку
      </Link>
    </div>
  );
}
