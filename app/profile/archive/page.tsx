import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MascotHint from "@/components/MascotHint";

const ARCHIVE_MILESTONES = [
  {
    threshold: 1,
    message:
      "Первый фрагмент уже стоит на полке архива! Это начало большой коллекции — Архивариус гордится тобой.",
  },
  {
    threshold: 5,
    message:
      "Пять восстановленных фрагментов! Полка архива заметно пополнилась — продолжай искать новые легенды.",
  },
  {
    threshold: 10,
    message:
      "Десять легенд возвращены из забвения! Архив постепенно превращается в настоящую библиотеку народов России.",
  },
  {
    threshold: 25,
    message:
      "Двадцать пять восстановленных фрагментов — невероятный вклад в архив! Мирон уверен: впереди ещё много находок.",
  },
];

function getArchiveMilestone(restoredCount: number) {
  for (let i = ARCHIVE_MILESTONES.length - 1; i >= 0; i -= 1) {
    if (restoredCount >= ARCHIVE_MILESTONES[i].threshold) return ARCHIVE_MILESTONES[i];
  }
  return null;
}

export default async function ArchivePage() {
  const user = await requireUser();

  const [restoredEntries, totalPublished] = await Promise.all([
    prisma.materialProgress.findMany({
      where: {
        userId: user.id,
        restoredAt: { not: null },
      },
      include: {
        material: {
          include: {
            genre: true,
            region: true,
            people: true,
          },
        },
      },
      orderBy: {
        restoredAt: "desc",
      },
    }),

    prisma.material.count({ where: { status: "PUBLISHED" } }),
  ]);

  const milestone = getArchiveMilestone(restoredEntries.length);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      {milestone && (
        <MascotHint
          storageKey={`hint_archive_milestone_${milestone.threshold}`}
          message={milestone.message}
          mood="excited"
          delay={900}
        />
      )}

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
                Мой архив
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Каждая восстановленная легенда занимает своё место на полке.
                Архивариус Мирон ведёт учёт всех фрагментов, которые вам
                удалось вернуть из забвения.
              </p>
            </div>

            <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
              <p className="mb-1 text-sm text-stone-500">Восстановлено фрагментов</p>
              <p className="text-3xl font-bold text-stone-900">
                {restoredEntries.length}
                <span className="text-lg font-medium text-stone-500"> из {totalPublished}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {restoredEntries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restoredEntries.map((entry) => (
              <article
                key={entry.id}
                className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  {entry.material.imageUrl ? (
                    <Image
                      src={entry.material.imageUrl}
                      alt={entry.material.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-[center_42%]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-5 text-center text-sm text-stone-500">
                      Изображение не добавлено
                    </div>
                  )}

                  <div className="absolute right-4 top-4 rounded-full border border-emerald-200 bg-emerald-50/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-emerald-700 shadow-sm backdrop-blur">
                    ✓ Восстановлено
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                      {entry.material.genre.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {entry.material.region.name}
                    </span>

                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {entry.material.people.name}
                    </span>
                  </div>

                  <h2 className="mb-3 text-2xl font-semibold">
                    {entry.material.title}
                  </h2>

                  {entry.restoredAt && (
                    <p className="mb-4 text-sm text-stone-500">
                      Восстановлено:{" "}
                      {new Intl.DateTimeFormat("ru-RU").format(entry.restoredAt)}
                    </p>
                  )}

                  <Link
                    href={`/materials/${entry.material.id}`}
                    className="inline-flex rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
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

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ◆
      </div>

      <h2 className="mb-3 text-2xl font-semibold">
        Полка архива пока пуста
      </h2>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Найдите фрагмент легенды и пройдите проверку Архивариуса, чтобы
        восстановить его и поставить на полку архива.
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
