import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import TaskClient from "./TaskClient";
import { saveTaskResultAction } from "./actions";

type QuestPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: QuestPageProps): Promise<Metadata> {
  const { id } = await params;
  const taskId = Number(id);
  if (Number.isNaN(taskId)) return {};

  const task = await prisma.interactiveTask.findFirst({
    where: {
      id: taskId,
      OR: [
        { material: { is: null } },
        { material: { status: "PUBLISHED" } },
      ],
    },
    select: { title: true, description: true },
  });

  if (!task) return {};

  return {
    title: `${task.title} — Легендариум`,
    description: task.description ?? undefined,
  };
}

export default async function QuestPage({ params }: QuestPageProps) {
  const { id } = await params;
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    notFound();
  }

  const task = await prisma.interactiveTask.findFirst({
    where: {
      id: taskId,
      OR: [
        { material: { is: null } },
        { material: { status: "PUBLISHED" } },
      ],
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
    <main className="overflow-hidden bg-[#0b1f22] pb-20">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
            <Link href="/" className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]">
              Главная
            </Link>
            <span className="text-[#d6c8b6]/30">›</span>
            <Link href="/quests" className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]">
              Задания
            </Link>
            <span className="text-[#d6c8b6]/30">›</span>
            <span className="max-w-[220px] truncate text-[#fff8e8]">{task.title}</span>
          </nav>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1f22] shadow-xl shadow-black/20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative grid gap-8 p-7 md:p-9 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-[#d8a342]/35 bg-[#d8a342]/12 px-3 py-1 font-black uppercase tracking-[0.12em] text-[#f0bd5b]">
                    {formatTaskType(task.type)}
                  </span>

                  {task.material && (
                    <span className="rounded-full border border-[#3aa6a0]/35 bg-[#3aa6a0]/12 px-3 py-1 font-bold text-[#9ee8e2]">
                      {task.material.region.name}
                    </span>
                  )}

                  {task.material && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-bold text-[#fff8e8]">
                      {task.material.genre.name}
                    </span>
                  )}

                  {task.difficulty && (
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-bold text-[#fff8e8]">
                      {formatDifficulty(task.difficulty)}
                    </span>
                  )}
                </div>

                <h1 className="mb-3 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-4xl">
                  {task.title}
                </h1>

                {task.description && (
                  <p className="max-w-3xl text-base leading-7 text-[#d6c8b6]">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="relative h-[300px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06151a] shadow-xl shadow-black/25">
                {task.material?.imageUrl ? (
                  <Image
                    src={task.material.imageUrl}
                    alt={task.material.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover object-[center_42%]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#10272b,#06151a)] px-6 text-center text-sm font-semibold text-[#cbbba7]">
                    Изображение не добавлено
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pt-10 lg:grid-cols-[1fr_360px]">
        <div>
          <TaskClient
            taskId={task.id}
            taskType={task.type}
            config={task.config}
            saveTaskResult={saveTaskResultAction}
          />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {task.material && (
            <section className="rounded-[1.75rem] border border-white/10 bg-[#0e2227] p-6 shadow-md">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
                Материал
              </p>

              <h2 className="mb-3 text-2xl font-extrabold text-[#fff8e8]">
                {task.material.title}
              </h2>

              {task.material.shortDescription && (
                <p className="mb-5 line-clamp-5 leading-7 text-[#d6c8b6]">
                  {task.material.shortDescription}
                </p>
              )}

              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#3aa6a0]/35 bg-[#3aa6a0]/12 px-3 py-1 text-xs font-bold text-[#9ee8e2]">
                  {task.material.people.name}
                </span>

                {task.material.topics.map(({ topic }) => (
                  <span
                    key={topic.id}
                    className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-[#d6c8b6]"
                  >
                    {topic.name}
                  </span>
                ))}
              </div>

              <Link
                href={`/materials/${task.material.id}`}
                className="inline-flex w-full justify-center rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
              >
                Открыть материал
              </Link>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-white/10 bg-[#0e2227] p-6 shadow-md">
            <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
              Подсказка
            </p>

            <h2 className="mb-3 text-2xl font-extrabold text-[#fff8e8]">
              Как проходить
            </h2>

            <p className="leading-7 text-[#d6c8b6]">
              Прочитайте вопрос, выберите один вариант ответа и нажмите кнопку
              проверки. После ответа появится результат и пояснение.
            </p>
          </section>
        </aside>
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
    visual_novel: "Визуальная новелла",
    hidden_objects: "Скрытые объекты",
    who_am_i: "Кто я?",
    memo: "Мемо",
    assemble_outfit: "Собери образ",
  };

  return labels[type] ?? type;
}

function formatDifficulty(difficulty: string) {
  const labels: Record<string, string> = {
    easy: "Лёгкое",
    medium: "Среднее",
    hard: "Сложное",
  };

  return labels[difficulty] ?? difficulty;
}
