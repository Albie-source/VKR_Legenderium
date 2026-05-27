import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTaskAction } from "./actions";

type EditTaskPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type SingleChoiceConfig = {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string | null;
};

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  await requireAdmin();

  const { id } = await params;
  const taskId = Number(id);

  if (Number.isNaN(taskId)) {
    notFound();
  }

  const [task, materials] = await Promise.all([
    prisma.interactiveTask.findUnique({
      where: {
        id: taskId,
      },
      include: {
        material: true,
      },
    }),

    prisma.material.findMany({
      include: {
        region: true,
        people: true,
        genre: true,
      },
      orderBy: {
        title: "asc",
      },
    }),
  ]);

  if (!task) {
    notFound();
  }

  const config = task.config as SingleChoiceConfig;
  const options = config.options ?? [];

  const updateTaskWithId = updateTaskAction.bind(null, task.id);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/admin/tasks"
          className="mb-8 inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          ← Вернуться к заданиям
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Редактирование задания
          </p>

          <h1 className="mb-4 text-4xl font-bold">
            Изменение интерактивного задания
          </h1>

          <p className="max-w-3xl text-stone-700">
            Здесь можно изменить материал, вопрос, варианты ответа, правильный
            ответ, пояснение и сложность задания.
          </p>
        </div>

        <form
          action={updateTaskWithId}
          className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Материал *
            </label>

            <select
              name="materialId"
              required
              defaultValue={task.materialId}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            >
              <option value="">Выберите материал</option>

              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.title} — {material.genre.name},{" "}
                  {material.region.name}
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
              defaultValue={task.title}
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
              defaultValue={task.description ?? ""}
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
              defaultValue={config.question ?? ""}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <section className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <h2 className="mb-4 text-xl font-semibold">Варианты ответа</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <AnswerInput
                name="option1"
                label="Вариант 1 *"
                defaultValue={options[0] ?? ""}
              />
              <AnswerInput
                name="option2"
                label="Вариант 2 *"
                defaultValue={options[1] ?? ""}
              />
              <AnswerInput
                name="option3"
                label="Вариант 3"
                defaultValue={options[2] ?? ""}
              />
              <AnswerInput
                name="option4"
                label="Вариант 4"
                defaultValue={options[3] ?? ""}
              />
            </div>

            <p className="mt-3 text-sm text-stone-600">
              Значение правильного ответа должно полностью совпадать с одним из
              вариантов.
            </p>
          </section>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Правильный ответ *
            </label>

            <input
              name="correctAnswer"
              required
              defaultValue={config.correctAnswer ?? ""}
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
              defaultValue={config.explanation ?? ""}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Сложность
            </label>

            <select
              name="difficulty"
              defaultValue={task.difficulty ?? "easy"}
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
              Сохранить изменения
            </button>

            <Link
              href="/admin/tasks"
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Отмена
            </Link>

            <Link
              href={`/quests/${task.id}`}
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Открыть задание
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function AnswerInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>

      <input
        name={name}
        defaultValue={defaultValue}
        placeholder="Введите вариант ответа"
        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-amber-700"
      />
    </div>
  );
}
