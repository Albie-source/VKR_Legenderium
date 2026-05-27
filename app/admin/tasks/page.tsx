import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteTaskAction } from "./actions";

export default async function AdminTasksPage() {
  await requireAdmin();

  const tasks = await prisma.interactiveTask.findMany({
    include: {
      material: {
        include: {
          region: true,
          people: true,
          genre: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Админ-панель
            </p>

            <h1 className="mb-3 text-4xl font-bold">
              Управление интерактивными заданиями
            </h1>

            <p className="max-w-3xl text-stone-700">
              В этом разделе отображаются задания, связанные с фольклорными
              материалами. Администратор может открыть задание, добавить новое
              или удалить лишнюю запись.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/tasks/new"
              className="rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Добавить задание
            </Link>

            <Link
              href="/admin"
              className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              ← Назад в админ-панель
            </Link>

            <Link
              href="/quests"
              className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Открыть задания
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-200 p-5">
            <h2 className="text-2xl font-semibold">Список заданий</h2>
          </div>

          {tasks.length === 0 ? (
            <div className="p-8 text-stone-600">
              Интерактивные задания пока не добавлены.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="bg-stone-100 text-sm text-stone-700">
                  <tr>
                    <th className="px-5 py-4">Задание</th>
                    <th className="px-5 py-4">Материал</th>
                    <th className="px-5 py-4">Тип</th>
                    <th className="px-5 py-4">Сложность</th>
                    <th className="px-5 py-4">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="border-t border-stone-200 align-top"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{task.title}</p>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">
                            {task.description}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <Link
                          href={`/materials/${task.material.id}`}
                          className="font-medium text-stone-900 underline-offset-4 hover:text-amber-800 hover:underline"
                        >
                          {task.material.title}
                        </Link>

                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">
                            {task.material.genre.name}
                          </span>

                          <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-700">
                            {task.material.region.name}
                          </span>

                          <span className="rounded-full bg-stone-100 px-2 py-1 text-stone-700">
                            {task.material.people.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                          {task.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {task.difficulty ? (
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                            {task.difficulty}
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/quests/${task.id}`}
                            className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                          >
                            Открыть
                          </Link>

                          <Link
                            href={`/admin/tasks/${task.id}/edit`}
                            className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
                          >
                            Редактировать
                          </Link>

                          <Link
                            href={`/materials/${task.material.id}`}
                            className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                          >
                            Материал
                          </Link>

                          <form action={deleteTaskAction}>
                            <input type="hidden" name="taskId" value={task.id} />

                            <button
                              type="submit"
                              className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                            >
                              Удалить
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
