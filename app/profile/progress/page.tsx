import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProgressPage() {
  const user = await requireUser();

  const goals = await prisma.goal.findMany({
    where: {
      isActive: true,
    },
    include: {
      genre: true,
      topic: true,
      progress: {
        where: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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

          <h1 className="mb-5 text-5xl font-bold leading-tight">
            Прогресс целей
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-stone-700">
            Здесь отображается выполнение тематических целей. Прогресс
            обновляется после успешного прохождения заданий.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {goals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {goals.map((goal) => {
              const progress = goal.progress[0];
              const currentProgress = progress?.currentProgress ?? 0;
              const percent = Math.min(
                Math.round(
                  (currentProgress / goal.requiredMaterialsCount) * 100
                ),
                100
              );

              return (
                <article
                  key={goal.id}
                  className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      {goal.genre.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {goal.topic.name}
                    </span>

                    {progress?.isCompleted && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-green-800">
                        Выполнена
                      </span>
                    )}
                  </div>

                  <h2 className="mb-3 text-3xl font-bold">{goal.title}</h2>

                  {goal.description && (
                    <p className="mb-5 leading-7 text-stone-700">
                      {goal.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="mb-2 flex justify-between text-sm text-stone-600">
                      <span>
                        {currentProgress} из {goal.requiredMaterialsCount}
                      </span>
                      <span>{percent}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                      <div
                        className="h-full rounded-full bg-amber-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/library?genre=${goal.genreId}&topic=${goal.topicId}`}
                      className="rounded-xl bg-amber-700 px-5 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
                    >
                      Перейти к материалам
                    </Link>

                    {progress?.rewardReceived && (
                      <Link
                        href="/profile/collection"
                        className="rounded-xl border border-amber-300 px-5 py-3 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
                      >
                        Открыть карточку
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <h2 className="mb-3 text-2xl font-semibold">
        Активные цели пока не добавлены
      </h2>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Когда администратор создаст цели, они появятся на этой странице.
      </p>

      <Link
        href="/goals"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Открыть цели
      </Link>
    </div>
  );
}
