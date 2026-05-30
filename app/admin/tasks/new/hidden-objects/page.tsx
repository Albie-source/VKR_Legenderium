import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HiddenObjectsEditor from "./HiddenObjectsEditor";

export default async function NewHiddenObjectsTaskPage() {
  await requireAdmin();

  const materials = await prisma.material.findMany({
    include: { region: true, genre: true },
    orderBy: { title: "asc" },
  });

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/admin/tasks/new"
          className="mb-8 inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          ← Назад к выбору типа задания
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Тип задания: скрытые объекты
          </p>
          <h1 className="mb-4 text-4xl font-bold">Редактор скрытых объектов</h1>
          <p className="max-w-2xl text-stone-600">
            Загрузи иллюстрацию, кликни на неё в нужных местах — появятся маркеры.
            Задай название каждому объекту и подбери радиус зоны нажатия.
            Игрок должен найти все объекты, кликая по картинке.
          </p>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <HiddenObjectsEditor
            materials={materials.map((m) => ({
              id: m.id,
              title: m.title,
              regionName: m.region.name,
              genreName: m.genre.name,
            }))}
          />
        </div>
      </section>
    </main>
  );
}
