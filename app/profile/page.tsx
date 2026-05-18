import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "../login/actions";

export default async function ProfilePage() {
  const user = await requireUser();

  const [favoritesCount, progressCount, completedGoalsCount, cardsCount] =
    await Promise.all([
      prisma.favorite.count({
        where: {
          userId: user.id,
        },
      }),

      prisma.goalProgress.count({
        where: {
          userId: user.id,
        },
      }),

      prisma.goalProgress.count({
        where: {
          userId: user.id,
          isCompleted: true,
        },
      }),

      prisma.goalProgress.count({
        where: {
          userId: user.id,
          rewardReceived: true,
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Личный кабинет
          </p>

          <h1 className="mb-5 text-5xl font-bold leading-tight">
            {user.name}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-stone-700">
            Здесь отображаются персональные данные пользователя, избранные
            материалы, прогресс целей и коллекционные карточки.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard title="Избранное" value={favoritesCount} />
          <StatCard title="Цели в работе" value={progressCount} />
          <StatCard title="Выполнено целей" value={completedGoalsCount} />
          <StatCard title="Карточек получено" value={cardsCount} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">
              Данные аккаунта
            </h2>

            <div className="space-y-3">
              <InfoBox title="Имя" value={user.name} />
              <InfoBox title="Email" value={user.email} />
              <InfoBox
                title="Роль"
                value={user.role === "ADMIN" ? "Администратор" : "Пользователь"}
              />
            </div>

            <form action={logoutAction} className="mt-6">
              <button
                type="submit"
                className="w-full rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Выйти из аккаунта
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">
              Персональные разделы
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <ProfileLink
                title="Избранные материалы"
                text="Сохранённые пользователем фольклорные материалы."
                href="/profile/favorites"
              />

              <ProfileLink
                title="Прогресс целей"
                text="Состояние выполнения тематических маршрутов."
                href="/goals"
              />

              <ProfileLink
                title="Коллекционные карточки"
                text="Награды, полученные за завершение целей."
                href="/profile/collection"
              />

              {user.role === "ADMIN" && (
                <ProfileLink
                  title="Админ-панель"
                  text="Управление материалами, заданиями, целями и справочниками."
                  href="/admin"
                />
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function InfoBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function ProfileLink({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-stone-200 bg-stone-50 p-5 transition hover:-translate-y-1 hover:bg-amber-50 hover:shadow-sm"
    >
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="leading-7 text-stone-700">{text}</p>
    </Link>
  );
}
