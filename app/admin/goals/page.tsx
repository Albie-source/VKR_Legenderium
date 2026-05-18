import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createGoalAction,
  toggleGoalActivityAction,
} from "./actions";

export default async function AdminGoalsPage() {
  await requireAdmin();

  const [goals, genres, topics] = await Promise.all([
    prisma.goal.findMany({
      include: {
        genre: true,
        topic: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    }),

    prisma.topic.findMany({
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Админ-панель
            </p>

            <h1 className="mb-3 text-4xl font-bold">
              Управление целями
            </h1>

            <p className="max-w-3xl text-stone-700">
              Цели задают тематические маршруты изучения фольклора. После
              выполнения условий пользователь получает коллекционную
              карточку-награду.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              ← Назад в админ-панель
            </Link>

            <Link
              href="/goals"
              className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Открыть цели
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">
              Новая цель
            </h2>

            <form action={createGoalAction} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Название цели *
                </label>

                <input
                  name="title"
                  required
                  placeholder="Например: Знаток сказок о животных"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Описание
                </label>

                <textarea
                  name="description"
                  rows={4}
                  placeholder="Опишите, что нужно изучить для выполнения цели"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Количество материалов *
                </label>

                <input
                  name="requiredMaterialsCount"
                  type="number"
                  min={1}
                  defaultValue={1}
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  name="genreId"
                  label="Жанр *"
                  items={genres}
                />

                <SelectField
                  name="topicId"
                  label="Тематика *"
                  items={topics}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Название карточки-награды *
                </label>

                <input
                  name="cardTitle"
                  required
                  placeholder="Например: Хранитель тайги"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Изображение карточки URL
                </label>

                <input
                  name="cardImageUrl"
                  placeholder="/images/cards/example.png"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
              >
                Создать цель
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-200 p-6">
              <h2 className="text-2xl font-semibold">
                Список целей
              </h2>
            </div>

            {goals.length === 0 ? (
              <div className="p-8 text-stone-600">
                Цели пока не добавлены.
              </div>
            ) : (
              <div className="divide-y divide-stone-200">
                {goals.map((goal) => (
                  <article key={goal.id} className="p-6">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="mb-2 text-xl font-semibold">
                          {goal.title}
                        </h3>

                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                            {goal.genre.name}
                          </span>

                          <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                            {goal.topic.name}
                          </span>

                          <span
                            className={[
                              "rounded-full px-3 py-1",
                              goal.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-stone-100 text-stone-600",
                            ].join(" ")}
                          >
                            {goal.isActive ? "Активна" : "Отключена"}
                          </span>
                        </div>
                      </div>

                      <form action={toggleGoalActivityAction}>
                        <input
                          type="hidden"
                          name="goalId"
                          value={goal.id}
                        />
                        <input
                          type="hidden"
                          name="isActive"
                          value={String(goal.isActive)}
                        />

                        <button
                          type="submit"
                          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                          {goal.isActive ? "Отключить" : "Включить"}
                        </button>
                      </form>
                    </div>

                    {goal.description && (
                      <p className="mb-4 leading-7 text-stone-700">
                        {goal.description}
                      </p>
                    )}

                    <div className="grid gap-3 md:grid-cols-3">
                      <InfoBox
                        title="Материалов для выполнения"
                        value={String(goal.requiredMaterialsCount)}
                      />
                      <InfoBox
                        title="Карточка-награда"
                        value={goal.cardTitle}
                      />
                      <InfoBox
                        title="ID цели"
                        value={String(goal.id)}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function SelectField({
  name,
  label,
  items,
}: {
  name: string;
  label: string;
  items: {
    id: number;
    name: string;
  }[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>

      <select
        name={name}
        required
        className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
      >
        <option value="">Выберите</option>

        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-xs text-stone-500">{title}</p>
      <p className="font-medium text-stone-900">{value}</p>
    </div>
  );
}
