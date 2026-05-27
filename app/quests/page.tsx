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

  return (
    <main className="overflow-hidden bg-[#f4ecdf] pb-20">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1f22] px-8 py-10 shadow-2xl shadow-black/25 md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative max-w-4xl">
              <p className="mb-4 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b]">
                Интерактивные задания
              </p>

              <h1 className="mb-5 text-5xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-6xl">
                Проверь понимание фольклорных материалов
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-[#d6c8b6]">
                Задания помогают закрепить содержание легенд, сказок, мифов и
                преданий. Каждое задание связано с конкретным материалом и
                проверяет понимание сюжета, образов и культурного контекста.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-950">
              Список заданий
            </h2>

            <p className="mt-2 text-sm leading-6 text-stone-600">
              Выберите задание и ответьте на вопрос по связанному
              фольклорному материалу.
            </p>
          </div>

          <span className="rounded-full border border-[#d8c3a5] bg-white px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
            Количество: {tasks.length}
          </span>
        </div>

        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="group flex min-h-[440px] flex-col overflow-hidden rounded-[2rem] border border-[#e4d4bf] bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden bg-[#eadfce]">
                  {task.material.imageUrl ? (
                    <img
                      src={task.material.imageUrl}
                      alt={task.material.title}
                      className="h-full w-full object-cover object-[center_42%] transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#efe4d3,#e5d4bd)] px-6 text-center text-sm font-semibold text-stone-600">
                      Изображение не добавлено
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                  <div className="absolute left-4 top-4 rounded-full border border-[#d8a342]/30 bg-[#fff8e8]/90 px-3 py-1 text-xs font-extrabold text-[#9f661f] shadow-sm backdrop-blur">
                    {formatTaskType(task.type)}
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border border-[#3aa6a0]/20 bg-[#e7f7f5] px-3 py-1 font-bold text-[#247670]">
                      {task.material.region.name}
                    </span>

                    <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 font-bold text-stone-700">
                      {task.material.genre.name}
                    </span>
                  </div>

                  <h3 className="mb-3 text-2xl font-extrabold leading-tight text-stone-950">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mb-4 line-clamp-3 text-sm leading-6 text-stone-600">
                      {task.description}
                    </p>
                  )}

                  <div className="mb-5 rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-4">
                    <p className="mb-1 text-sm font-semibold text-stone-500">
                      Материал
                    </p>

                    <p className="line-clamp-2 font-extrabold text-stone-950">
                      {task.material.title}
                    </p>
                  </div>

                  {task.material.topics.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2">
                      {task.material.topics.slice(0, 3).map(({ topic }) => (
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
                    href={`/quests/${task.id}`}
                    className="mt-auto rounded-2xl bg-[#d8a342] px-4 py-3 text-center text-sm font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                  >
                    Перейти к заданию
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

function formatTaskType(type: string) {
  const labels: Record<string, string> = {
    single_choice: "Выбор ответа",
    matching: "Сопоставление",
    ordering: "Порядок",
    text_input: "Ответ текстом",
  };

  return labels[type] ?? type;
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-[#e4d4bf] bg-white p-10 text-center shadow-md">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d8a342]/30 bg-[#fff5dc] text-2xl text-[#c78a24]">
        ?
      </div>

      <h3 className="mb-3 text-2xl font-extrabold text-stone-950">
        Задания не найдены
      </h3>

      <p className="mx-auto max-w-xl leading-7 text-stone-600">
        Пока нет опубликованных интерактивных заданий. Добавьте задания через
        seed или административный раздел.
      </p>
    </div>
  );
}
