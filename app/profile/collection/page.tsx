import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function CollectionPage() {
  const user = await requireUser();

  const collectedCards = await prisma.goalProgress.findMany({
    where: {
      userId: user.id,
      rewardReceived: true,
    },
    include: {
      goal: {
        include: {
          genre: true,
          topic: true,
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <Link
            href="/profile"
            className="mb-8 inline-flex rounded-xl border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            ← Вернуться в профиль
          </Link>

          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Личный кабинет
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Моя коллекция
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Коллекционные карточки выдаются за выполнение целей. Они
                фиксируют завершённые тематические маршруты изучения фольклора.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <p className="mb-1 text-sm text-stone-500">Получено карточек</p>
              <p className="text-3xl font-bold text-stone-900">
                {collectedCards.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {collectedCards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {collectedCards.map((progress) => (
              <article
                key={progress.id}
                className="overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="bg-amber-50 p-5">
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                    Карточка-награда
                  </p>

                  <div className="rounded-[1.5rem] border border-amber-200 bg-white p-4 shadow-sm">
                    <div className="mb-4 flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-stone-100 to-stone-200">
                      {progress.goal.cardImageUrl ? (
                        <img
                          src={progress.goal.cardImageUrl}
                          alt={progress.goal.cardTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="px-4 text-center text-sm text-stone-500">
                          Изображение карточки не добавлено
                        </div>
                      )}
                    </div>

                    <h2 className="text-center text-2xl font-bold">
                      {progress.goal.cardTitle}
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      {progress.goal.genre.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {progress.goal.topic.name}
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-semibold">
                    {progress.goal.title}
                  </h3>

                  {progress.completedAt && (
                    <p className="text-sm text-stone-500">
                      Получено:{" "}
                      {new Intl.DateTimeFormat("ru-RU").format(
                        progress.completedAt
                      )}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ★
      </div>

      <h2 className="mb-3 text-2xl font-semibold">
        Коллекция пока пуста
      </h2>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Выполните цель, чтобы получить первую коллекционную карточку.
      </p>

      <Link
        href="/goals"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Перейти к целям
      </Link>
    </div>
  );
}
