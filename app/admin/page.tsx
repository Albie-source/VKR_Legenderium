import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { archiveMaterialAction } from "./actions";
import { logoutAction } from "../login/actions";

export default async function AdminPage() {
  const admin = await requireAdmin();

  const [
    materials,
    publishedMaterialsCount,
    draftMaterialsCount,
    archivedMaterialsCount,
    tasksCount,
    goalsCount,
    regionsCount,
    peoplesCount,
  ] = await Promise.all([
    prisma.material.findMany({
      include: {
        region: true,
        people: true,
        genre: true,
        source: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.material.count({
      where: {
        status: "PUBLISHED",
      },
    }),

    prisma.material.count({
      where: {
        status: "DRAFT",
      },
    }),

    prisma.material.count({
      where: {
        status: "ARCHIVED",
      },
    }),

    prisma.interactiveTask.count(),

    prisma.goal.count(),

    prisma.region.count(),

    prisma.people.count(),
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
              Панель управления платформой
            </h1>

            <p className="text-stone-700">
              Вы вошли как:{" "}
              <span className="font-medium text-stone-900">{admin.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/library"
              className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              В библиотеку
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Опубликовано"
            value={publishedMaterialsCount}
            description="Материалы, доступные пользователям"
          />

          <StatCard
            title="Черновики"
            value={draftMaterialsCount}
            description="Материалы, пока скрытые от пользователей"
          />

          <StatCard
            title="В архиве"
            value={archivedMaterialsCount}
            description="Материалы, исключённые из публичного просмотра"
          />

          <StatCard
            title="Задания"
            value={tasksCount}
            description="Интерактивные задания платформы"
          />
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <AdminSectionCard
            title="Материалы"
            text="Добавление и редактирование фольклорных материалов."
            href="/admin/materials/new"
            linkText="Добавить материал"
            accent
          />

          <AdminSectionCard
            title="Задания"
            text="Создание и управление интерактивными заданиями."
            href="/admin/tasks"
            linkText="Управление заданиями"
          />

          <AdminSectionCard
            title="Цели"
            text="Настройка тематических целей и карточек-наград."
            href="/admin/goals"
            linkText="Управление целями"
          />

          <AdminSectionCard
            title="Справочники"
            text="Регионы, народы, жанры, тематики и источники."
            href="/admin/dictionaries"
            linkText="Открыть справочники"
          />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-2xl font-semibold">
              Состав справочников
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <SmallInfo title="Регионов" value={regionsCount} />
              <SmallInfo title="Народов" value={peoplesCount} />
              <SmallInfo title="Целей" value={goalsCount} />
              <SmallInfo title="Всего материалов" value={materials.length} />
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="mb-3 text-2xl font-semibold">
              Быстрые действия
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/materials/new"
                className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
              >
                Новый материал
              </Link>

              <Link
                href="/admin/tasks/new"
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Новое задание
              </Link>

              <Link
                href="/admin/goals"
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Новая цель
              </Link>

              <Link
                href="/admin/dictionaries"
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
              >
                Добавить справочник
              </Link>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 p-5">
            <div>
              <h2 className="text-2xl font-semibold">
                Фольклорные материалы
              </h2>

              <p className="mt-1 text-sm text-stone-600">
                Последние добавленные материалы и действия администратора.
              </p>
            </div>

            <Link
              href="/admin/materials/new"
              className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              Добавить материал
            </Link>
          </div>

          {materials.length === 0 ? (
            <div className="p-8 text-stone-600">
              Материалы пока не добавлены.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] border-collapse text-left">
                <thead className="bg-stone-100 text-sm text-stone-700">
                  <tr>
                    <th className="px-5 py-4">Название</th>
                    <th className="px-5 py-4">Регион</th>
                    <th className="px-5 py-4">Народ</th>
                    <th className="px-5 py-4">Жанр</th>
                    <th className="px-5 py-4">Статус</th>
                    <th className="px-5 py-4">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-t border-stone-200 align-top"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">{material.title}</p>

                        <p className="mt-1 line-clamp-2 text-sm text-stone-600">
                          {material.shortDescription}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {material.region.name}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {material.people.name}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {material.genre.name}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={material.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/materials/${material.id}`}
                            className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                          >
                            Открыть
                          </Link>

                          <Link
                            href={`/admin/materials/${material.id}/edit`}
                            className="rounded-xl border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
                          >
                            Редактировать
                          </Link>

                          {material.status !== "ARCHIVED" && (
                            <form action={archiveMaterialAction}>
                              <input
                                type="hidden"
                                name="materialId"
                                value={material.id}
                              />

                              <button
                                type="submit"
                                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                              >
                                В архив
                              </button>
                            </form>
                          )}
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

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="mb-2 text-sm text-stone-500">{title}</p>
      <p className="mb-2 text-3xl font-bold text-stone-900">{value}</p>
      <p className="text-sm leading-6 text-stone-600">{description}</p>
    </div>
  );
}

function AdminSectionCard({
  title,
  text,
  href,
  linkText,
  accent = false,
}: {
  title: string;
  text: string;
  href: string;
  linkText: string;
  accent?: boolean;
}) {
  return (
    <article
      className={[
        "flex min-h-[220px] flex-col rounded-3xl border p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md",
        accent
          ? "border-amber-200 bg-amber-50"
          : "border-stone-200 bg-white",
      ].join(" ")}
    >
      <h2 className="mb-3 text-2xl font-semibold">{title}</h2>

      <p className="mb-5 leading-7 text-stone-700">{text}</p>

      <Link
        href={href}
        className={[
          "mt-auto inline-flex font-medium underline-offset-4 hover:underline",
          accent ? "text-amber-800" : "text-stone-800",
        ].join(" ")}
      >
        {linkText}
      </Link>
    </article>
  );
}

function SmallInfo({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const classes =
    status === "PUBLISHED"
      ? "bg-green-100 text-green-800"
      : status === "DRAFT"
        ? "bg-amber-100 text-amber-800"
        : "bg-stone-100 text-stone-600";

  const label =
    status === "PUBLISHED"
      ? "Опубликован"
      : status === "DRAFT"
        ? "Черновик"
        : "Архив";

  return (
    <span className={`rounded-full px-3 py-1 text-xs ${classes}`}>
      {label}
    </span>
  );
}
