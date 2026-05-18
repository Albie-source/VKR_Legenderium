import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function QuestsPage() {
  const tasks = await prisma.interactiveTask.findMany({
    include: {
      material: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const singleChoiceCount = tasks.filter(
    (task) => task.type === "single_choice"
  ).length;

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Интерактивные задания
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Задания по фольклорным материалам
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Задания помогают закрепить содержание легенд, сказок, мифов и
                других фольклорных материалов. Каждое задание связано с
                конкретным материалом и проверяет понимание текста или
                культурного контекста.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat title="Всего заданий" value={tasks.length} />
              <HeroStat title="Выбор ответа" value={singleChoiceCount} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Список заданий</h2>

            <p className="mt-1 text-sm text-stone-600">
              Выберите задание, прочитайте вопрос и проверьте свой ответ.
            </p>
          </div>

          <Link
            href="/library"
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Перейти в библиотеку
          </Link>
        </div>

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="group flex min-h-[390px] flex-col rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                    {task.material.genre.name}
                  </span>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                    {task.material.region.name}
                  </span>

                  <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                    {task.material.people.name}
                  </span>

                  {task.difficulty && (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                      {task.difficulty}
                    </span>
                  )}
                </div>

                <h3 className="mb-3 text-2xl font-semibold leading-tight">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="mb-5 line-clamp-3 leading-7 text-stone-700">
                    {task.description}
                  </p>
                )}

                <div className="mb-5 rounded-2xl bg-stone-50 p-4">
                  <p className="mb-1 text-sm text-stone-500">Материал</p>

                  <Link
                    href={`/materials/${task.material.id}`}
                    className="font-medium text-stone-900 underline-offset-4 hover:text-amber-800 hover:underline"
                  >
                    {task.material.title}
                  </Link>

                  {task.material.topics.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.material.topics.map(({ topic }) => (
                        <span
                          key={topic.id}
                          className="rounded-full border border-amber-200 bg-white px-2 py-1 text-xs text-amber-800"
                        >
                          {topic.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-5 rounded-2xl border border-stone-200 p-4">
                  <p className="mb-1 text-sm text-stone-500">Тип задания</p>
                  <p className="font-medium text-stone-900">
                    {getTaskTypeLabel(task.type)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap gap-3">
                  <Link
                    href={`/quests/${task.id}`}
                    className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
                  >
                    Пройти задание
                  </Link>

                  <Link
                    href={`/materials/${task.material.id}`}
                    className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
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
        Задания пока не добавлены
      </h3>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Интерактивные задания можно создать в административной панели и
        привязать к фольклорным материалам.
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

function getTaskTypeLabel(type: string) {
  if (type === "single_choice") {
    return "Выбор одного правильного ответа";
  }

  return type;
}
