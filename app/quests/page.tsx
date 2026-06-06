import { prisma } from "@/lib/prisma";
import MascotHint from "@/components/MascotHint";
import QuestsFilter from "./QuestsFilter";

export default async function QuestsPage() {
  const tasks = await prisma.interactiveTask.findMany({
    include: {
      material: {
        include: {
          region: true,
          genre: true,
          topics: {
            include: { topic: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="overflow-hidden bg-[#f4ecdf] pb-20">
      <MascotHint
        storageKey="hint_quests"
        message="Задания — это главный способ помочь мне восстановить архив! Каждый верный ответ считается как найденная страница. Выбери задание и начни!"
        mood="happy"
        delay={1500}
      />
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
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <QuestsFilter tasks={tasks} />
        )}
      </section>
    </main>
  );
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
