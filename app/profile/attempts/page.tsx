import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AttemptsPage() {
  const user = await requireUser();

  const attempts = await prisma.taskAttempt.findMany({
    where: {
      userId: user.id,
    },
    include: {
      task: {
        include: {
          material: {
            include: {
              region: true,
              people: true,
              genre: true,
            },
          },
        },
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  const successfulAttempts = attempts.filter((attempt) => attempt.isCompleted);
  const failedAttempts = attempts.filter((attempt) => !attempt.isCompleted);

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
                История прохождения заданий
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Здесь отображаются попытки прохождения интерактивных заданий:
                успешность, балл, дата прохождения и связанный фольклорный
                материал.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <HeroStat title="Всего" value={attempts.length} />
              <HeroStat title="Успешно" value={successfulAttempts.length} />
              <HeroStat title="Ошибок" value={failedAttempts.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {attempts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-6">
              <h2 className="text-3xl font-bold">Попытки</h2>
              <p className="mt-1 text-sm text-stone-600">
                Последние прохождения отображаются первыми.
              </p>
            </div>

            <div className="divide-y divide-stone-200">
              {attempts.map((attempt) => (
                <article key={attempt.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                      <div className="mb-3 flex flex-wrap gap-2 text-xs">
                        <StatusBadge isCompleted={attempt.isCompleted} />

                        <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                          {attempt.task.material.genre.name}
                        </span>

                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                          {attempt.task.material.region.name}
                        </span>

                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                          {attempt.task.material.people.name}
                        </span>
                      </div>

                      <h3 className="mb-2 text-2xl font-semibold">
                        {attempt.task.title}
                      </h3>

                      <p className="mb-3 text-stone-700">
                        Материал:{" "}
                        <Link
                          href={`/materials/${attempt.task.material.id}`}
                          className="font-medium text-amber-800 underline-offset-4 hover:underline"
                        >
                          {attempt.task.material.title}
                        </Link>
                      </p>

                      <p className="text-sm text-stone-500">
                        Дата прохождения:{" "}
                        {new Intl.DateTimeFormat("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(attempt.completedAt)}
                      </p>
                    </div>

                    <div className="min-w-[140px] rounded-2xl bg-stone-50 p-4 text-center">
                      <p className="mb-1 text-sm text-stone-500">Балл</p>
                      <p className="text-3xl font-bold text-stone-900">
                        {attempt.score}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/quests/${attempt.task.id}`}
                      className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
                    >
                      Пройти ещё раз
                    </Link>

                    <Link
                      href={`/materials/${attempt.task.material.id}`}
                      className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                    >
                      Открыть материал
                    </Link>
                  </div>
                </article>
              ))}
            </div>
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

function StatusBadge({ isCompleted }: { isCompleted: boolean }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 font-medium",
        isCompleted
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800",
      ].join(" ")}
    >
      {isCompleted ? "Успешно" : "Ошибка"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ?
      </div>

      <h2 className="mb-3 text-2xl font-semibold">
        История пока пуста
      </h2>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Пройдите интерактивное задание, чтобы первая попытка появилась в
        истории.
      </p>

      <Link
        href="/quests"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Перейти к заданиям
      </Link>
    </div>
  );
}
