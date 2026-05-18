import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TaskClient from "./TaskClient";

type QuestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function QuestPage({ params }: QuestPageProps) {
  const { id } = await params;
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    notFound();
  }

  const task = await prisma.interactiveTask.findUnique({
    where: {
      id: taskId,
    },
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
  });

  if (!task) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <Link
            href={`/materials/${task.material.id}`}
            className="mb-8 inline-flex rounded-xl border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            ← Вернуться к материалу
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
                Интерактивное задание
              </p>

              <h1 className="mb-5 text-5xl font-bold leading-tight">
                {task.title}
              </h1>

              {task.description && (
                <p className="max-w-3xl text-lg leading-8 text-stone-700">
                  {task.description}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-white/90 px-3 py-1 text-amber-800 shadow-sm">
                  {task.material.genre.name}
                </span>

                <span className="rounded-full bg-white/90 px-3 py-1 text-stone-700 shadow-sm">
                  {task.material.region.name}
                </span>

                <span className="rounded-full bg-white/90 px-3 py-1 text-stone-700 shadow-sm">
                  {task.material.people.name}
                </span>

                {task.difficulty && (
                  <span className="rounded-full bg-white/90 px-3 py-1 text-stone-700 shadow-sm">
                    Сложность: {task.difficulty}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-white/90 p-6 shadow-xl backdrop-blur">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Материал
              </p>

              <h2 className="mb-3 text-3xl font-bold">
                {task.material.title}
              </h2>

              {task.material.shortDescription && (
                <p className="mb-5 line-clamp-4 leading-7 text-stone-700">
                  {task.material.shortDescription}
                </p>
              )}

              {task.material.topics.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {task.material.topics.map(({ topic }) => (
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
                href={`/materials/${task.material.id}`}
                className="inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Открыть материал
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div>
          <TaskClient
            taskId={task.id}
            taskType={task.type}
            config={task.config}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">
              О задании
            </h2>

            <div className="space-y-3">
              <InfoCard title="Тип" value={task.type} />

              {task.difficulty && (
                <InfoCard title="Сложность" value={task.difficulty} />
              )}

              <InfoCard title="Материал" value={task.material.title} />
              <InfoCard title="Жанр" value={task.material.genre.name} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="mb-3 text-2xl font-semibold">
              Как проходить
            </h2>

            <p className="leading-7 text-stone-700">
              Сначала прочитайте вопрос, затем выберите один вариант ответа и
              нажмите кнопку проверки. После проверки появится правильный ответ
              и пояснение.
            </p>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">
              Навигация
            </h2>

            <div className="space-y-3">
              <Link
                href="/quests"
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Все задания
              </Link>

              <Link
                href={`/materials/${task.material.id}`}
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Вернуться к материалу
              </Link>

              <Link
                href="/library"
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Библиотека
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="font-semibold text-stone-900">{value}</p>
    </div>
  );
}
