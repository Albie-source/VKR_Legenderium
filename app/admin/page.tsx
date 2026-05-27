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
    genresCount,
    topicsCount,
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
    prisma.genre.count(),
    prisma.topic.count(),
  ]);

  const totalMaterials =
    publishedMaterialsCount + draftMaterialsCount + archivedMaterialsCount;

  return (
    <main className="overflow-hidden bg-[#f4ecdf] pb-20">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1f22] p-8 shadow-2xl shadow-black/25 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative flex flex-wrap items-start justify-between gap-8">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b]">
                  Административная панель
                </p>

                <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-6xl">
                  Управление платформой
                </h1>

                <p className="max-w-2xl text-lg leading-8 text-[#d6c8b6]">
                  Управление фольклорными материалами, интерактивными заданиями,
                  целями обучения и справочниками.
                </p>

                <p className="mt-4 text-sm text-[#cbbba7]">
                  Администратор:{" "}
                  <span className="font-extrabold text-[#fff8e8]">
                    {admin.email}
                  </span>
                </p>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                >
                  Выйти
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Материалов"
            value={totalMaterials}
            text="Всего в базе данных"
          />

          <StatCard
            title="Опубликовано"
            value={publishedMaterialsCount}
            text="Доступны пользователям"
          />

          <StatCard
            title="Заданий"
            value={tasksCount}
            text="Интерактивные задания"
          />

          <StatCard title="Целей" value={goalsCount} text="Маршруты изучения" />
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <AdminSectionCard
            title="Материалы"
            text="Добавление, редактирование и архивация фольклорных материалов."
            href="/admin/materials"
            actionHref="/admin/materials/new"
            actionText="Добавить"
            accent
          />

          <AdminSectionCard
            title="Задания"
            text="Создание и настройка интерактивных заданий к материалам."
            href="/admin/tasks"
            actionHref="/admin/tasks/new"
            actionText="Создать"
          />

          <AdminSectionCard
            title="Цели"
            text="Маршруты изучения, прогресс и коллекционные карточки."
            href="/admin/goals"
            actionHref="/admin/goals"
            actionText="Открыть"
          />

          <AdminSectionCard
            title="Справочники"
            text={`Регионы: ${regionsCount}, народы: ${peoplesCount}, жанры: ${genresCount}, тематики: ${topicsCount}.`}
            href="/admin/dictionaries"
            actionHref="/admin/dictionaries"
            actionText="Управлять"
          />
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-[#e4d4bf] bg-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eadbc7] p-6">
            <div>
              <h2 className="text-2xl font-extrabold text-stone-950">
                Материалы
              </h2>

              <p className="mt-2 text-sm leading-6 text-stone-600">
                Все материалы платформы. Таблица прокручивается внутри блока и
                не растягивает страницу.
              </p>
            </div>

            <Link
              href="/admin/materials/new"
              className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
            >
              Добавить материал
            </Link>
          </div>

          {materials.length === 0 ? (
            <div className="p-8 text-stone-600">Материалы пока не добавлены.</div>
          ) : (
            <div className="legendarium-admin-materials-scroll max-h-[760px] overflow-auto">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#fbf7f1] text-sm text-stone-700 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-extrabold">Материал</th>
                    <th className="px-5 py-4 font-extrabold">Регион</th>
                    <th className="px-5 py-4 font-extrabold">Народ</th>
                    <th className="px-5 py-4 font-extrabold">Жанр</th>
                    <th className="px-5 py-4 font-extrabold">Статус</th>
                    <th className="px-5 py-4 font-extrabold">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="border-t border-[#eadbc7] align-top transition hover:bg-[#fbf7f1]"
                    >
                      <td className="px-5 py-4">
                        <div className="grid gap-3 sm:grid-cols-[72px_1fr]">
                          <div className="h-16 w-20 overflow-hidden rounded-xl bg-[#eadfce]">
                            {material.imageUrl ? (
                              <img
                                src={material.imageUrl}
                                alt={material.title}
                                className="h-full w-full object-cover object-[center_42%]"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-stone-500">
                                Нет фото
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-extrabold text-stone-950">
                              {material.title}
                            </p>

                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-stone-600">
                              {material.shortDescription}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-stone-700">
                        {material.region.name}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-stone-700">
                        {material.people.name}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-[#d8a342]/25 bg-[#fff4d8] px-3 py-1 text-xs font-extrabold text-[#8a5418]">
                          {material.genre.name}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={material.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/materials/${material.id}`}
                            className="rounded-xl border border-[#d8a342]/45 bg-[#fff8e8] px-3 py-2 text-center text-xs font-extrabold !text-[#8a5418] transition hover:bg-[#fff1cf]"
                          >
                            Открыть
                          </Link>

                          <Link
                            href={`/admin/materials/${material.id}/edit`}
                            className="rounded-xl border border-[#d8a342]/45 bg-white px-3 py-2 text-center text-xs font-extrabold !text-[#8a5418] transition hover:bg-[#fff8e8]"
                          >
                            Изменить
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
                                className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-extrabold text-red-700 transition hover:bg-red-100"
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
        </section>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
  text,
}: {
  title: string;
  value: number;
  text: string;
}) {
  return (
    <div className="rounded-[2rem] border border-[#e4d4bf] bg-white p-6 shadow-md">
      <p className="mb-2 text-sm font-bold text-stone-500">{title}</p>
      <p className="text-4xl font-extrabold text-stone-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function AdminSectionCard({
  title,
  text,
  href,
  actionHref,
  actionText,
  accent = false,
}: {
  title: string;
  text: string;
  href: string;
  actionHref: string;
  actionText: string;
  accent?: boolean;
}) {
  return (
    <section
      className={[
        "flex min-h-[220px] flex-col rounded-[2rem] border p-6 shadow-md transition hover:-translate-y-1 hover:shadow-xl",
        accent
          ? "border-[#d8a342]/35 bg-[#fff4d8]"
          : "border-[#e4d4bf] bg-white",
      ].join(" ")}
    >
      <h2 className="mb-3 text-2xl font-extrabold text-stone-950">{title}</h2>

      <p className="mb-5 flex-1 leading-7 text-stone-600">{text}</p>

      <div className="flex flex-wrap gap-2">
        <Link
          href={href}
          className="rounded-2xl border border-[#d8a342]/45 bg-white px-4 py-2 text-sm font-extrabold !text-[#8a5418] transition hover:bg-[#fff8e8]"
        >
          Открыть
        </Link>

        {actionHref !== href && (
          <Link
            href={actionHref}
            className="rounded-2xl bg-[#d8a342] px-4 py-2 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:bg-[#f0bd5b]"
          >
            {actionText}
          </Link>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    PUBLISHED: "Опубликован",
    DRAFT: "Черновик",
    ARCHIVED: "Архив",
  };

  const classNames: Record<string, string> = {
    PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-800",
    DRAFT: "border-amber-200 bg-amber-50 text-amber-800",
    ARCHIVED: "border-stone-200 bg-stone-100 text-stone-600",
  };

  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-xs font-extrabold",
        classNames[status] ?? "border-stone-200 bg-stone-100 text-stone-600",
      ].join(" ")}
    >
      {labels[status] ?? status}
    </span>
  );
}
