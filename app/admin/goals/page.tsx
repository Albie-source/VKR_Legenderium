import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGoalAction, toggleGoalActivityAction } from "./actions";

export default async function AdminGoalsPage() {
  await requireAdmin();

  const [goals, genres, topics, regions] = await Promise.all([
    prisma.goal.findMany({
      include: {
        genres: { include: { genre: true } },
        topics: { include: { topic: true } },
        region: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.topic.findMany({ orderBy: { name: "asc" } }),
    prisma.region.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Админ-панель
            </p>
            <h1 className="mb-3 text-4xl font-bold">Управление целями</h1>
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

        <div className="grid gap-6 lg:grid-cols-[460px_1fr]">
          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">Новая цель</h2>

            <form action={createGoalAction} className="space-y-5">
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
                  rows={3}
                  placeholder="Опишите цель"
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
                  defaultValue={5}
                  required
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <fieldset className="rounded-xl border border-stone-200 p-4">
                <legend className="px-1 text-sm font-medium text-stone-700">
                  Жанры * (выберите хотя бы один)
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {genres.map((genre) => (
                    <label
                      key={genre.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        name="genreIds"
                        value={genre.id}
                        className="accent-amber-700"
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="rounded-xl border border-stone-200 p-4">
                <legend className="px-1 text-sm font-medium text-stone-700">
                  Тематики (необязательно)
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {topics.map((topic) => (
                    <label
                      key={topic.id}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-stone-50"
                    >
                      <input
                        type="checkbox"
                        name="topicIds"
                        value={topic.id}
                        className="accent-amber-700"
                      />
                      {topic.name}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Регион (необязательно)
                </label>
                <select
                  name="regionId"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                >
                  <option value="">Любой регион</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
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
              <h2 className="text-2xl font-semibold">Список целей</h2>
            </div>

            {goals.length === 0 ? (
              <div className="p-8 text-stone-600">Цели пока не добавлены.</div>
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
                          {goal.genres.map(({ genre }) => (
                            <span
                              key={genre.id}
                              className="rounded-full bg-amber-100 px-3 py-1 text-amber-800"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {goal.topics.map(({ topic }) => (
                            <span
                              key={topic.id}
                              className="rounded-full bg-stone-100 px-3 py-1 text-stone-700"
                            >
                              {topic.name}
                            </span>
                          ))}
                          {goal.region && (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                              {goal.region.name}
                            </span>
                          )}
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

                      <div className="flex gap-2">
                        <Link
                          href={`/goals/${goal.id}`}
                          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                          Маршрут
                        </Link>

                        <form action={toggleGoalActivityAction}>
                          <input type="hidden" name="goalId" value={goal.id} />
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
                      <InfoBox title="Карточка-награда" value={goal.cardTitle} />
                      <InfoBox title="ID цели" value={String(goal.id)} />
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

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-xs text-stone-500">{title}</p>
      <p className="font-medium text-stone-900">{value}</p>
    </div>
  );
}
