import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskAction } from "./actions";

export default async function NewTaskPage() {
  await requireAdmin();

  const materials = await prisma.material.findMany({
    include: {
      region: true,
      people: true,
      genre: true,
    },
    orderBy: {
      title: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="mb-8 inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          ← Вернуться в админ-панель
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Интерактивное задание
          </p>

          <h1 className="mb-4 text-4xl font-bold">
            Добавление задания к материалу
          </h1>

          <p className="max-w-3xl text-stone-700">
            Выберите тип задания. Ниже — форма для задания с выбором ответа.
            Для других типов воспользуйтесь специализированными редакторами.
          </p>
        </div>

        {/* Task type selector */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-amber-700 bg-amber-50 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Активный тип</p>
            <p className="text-lg font-bold text-stone-900">Выбор ответа</p>
            <p className="mt-1 text-sm text-stone-600">Один правильный вариант из нескольких</p>
          </div>
          <Link
            href="/admin/tasks/new/hidden-objects"
            className="rounded-2xl border border-stone-300 bg-white p-4 transition hover:border-amber-700 hover:bg-amber-50"
          >
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-stone-500">Другой тип →</p>
            <p className="text-lg font-bold text-stone-900">Скрытые объекты</p>
            <p className="mt-1 text-sm text-stone-600">Кликни на картинку, найди все предметы</p>
          </Link>
        </div>

        <form
          action={createTaskAction}
          className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Материал *
            </label>

            <select
              name="materialId"
              required
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            >
              <option value="">Выберите материал</option>

              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.title} — {material.genre.name}, {material.region.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Название задания *
            </label>

            <input
              name="title"
              required
              placeholder="Например: Проверь знание легенды"
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
              placeholder="Краткая инструкция для пользователя"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Вопрос *
            </label>

            <textarea
              name="question"
              rows={3}
              required
              placeholder="Например: Кому дух тайги помогал найти дорогу домой?"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="mb-4 text-xl font-semibold">Варианты ответа</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <AnswerInput name="option1" label="Вариант 1 *" />
              <AnswerInput name="option2" label="Вариант 2 *" />
              <AnswerInput name="option3" label="Вариант 3" />
              <AnswerInput name="option4" label="Вариант 4" />
            </div>

            <p className="mt-3 text-sm text-stone-600">
              Для MVP достаточно минимум двух вариантов ответа. Значение
              правильного ответа должно полностью совпадать с одним из вариантов.
            </p>
          </section>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Правильный ответ *
            </label>

            <input
              name="correctAnswer"
              required
              placeholder="Скопируйте сюда один из вариантов ответа"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Пояснение к ответу
            </label>

            <textarea
              name="explanation"
              rows={3}
              placeholder="Например: В легенде дух помогает тому, кто бережно относится к лесу."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Сложность
            </label>

            <select
              name="difficulty"
              defaultValue="easy"
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            >
              <option value="easy">easy</option>
              <option value="medium">medium</option>
              <option value="hard">hard</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Сохранить задание
            </button>

            <Link
              href="/admin"
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Отмена
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function AnswerInput({ name, label }: { name: string; label: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>

      <input
        name={name}
        placeholder="Введите вариант ответа"
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-700"
      />
    </div>
  );
}
