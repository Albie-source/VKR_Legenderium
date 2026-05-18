import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [materialsCount, regionsCount, tasksCount, goalsCount] =
    await Promise.all([
      prisma.material.count({
        where: {
          status: "PUBLISHED",
        },
      }),
      prisma.region.count(),
      prisma.interactiveTask.count(),
      prisma.goal.count({
        where: {
          isActive: true,
        },
      }),
    ]);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.18),transparent_35%)]" />

        <div className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
              Фольклор народов России
            </p>

            <h1 className="mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
              Легендариум
            </h1>

            <p className="mb-8 max-w-2xl text-xl leading-9 text-stone-700">
              Интерактивная образовательная платформа для изучения легенд,
              сказок, мифов, обрядов и культурных традиций народов России.
            </p>

            <div className="mb-10 flex flex-wrap gap-4">
              <Link
                href="/map"
                className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white shadow-sm transition hover:bg-amber-800"
              >
                Открыть карту
              </Link>

              <Link
                href="/library"
                className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-medium transition hover:bg-stone-100"
              >
                Перейти в библиотеку
              </Link>

              <Link
                href="/goals"
                className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-medium transition hover:bg-stone-100"
              >
                Цели изучения
              </Link>
            </div>

            <div className="grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="материалов" value={materialsCount} />
              <StatCard label="регионов" value={regionsCount} />
              <StatCard label="заданий" value={tasksCount} />
              <StatCard label="целей" value={goalsCount} />
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-stone-200 bg-white/85 p-5 shadow-xl backdrop-blur">
              <div className="mb-5 rounded-[1.5rem] bg-gradient-to-br from-amber-100 via-stone-100 to-stone-200 p-6">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                  Интерактивный маршрут
                </p>

                <h2 className="mb-4 text-3xl font-bold">
                  Изучай фольклор через карту, материалы и задания
                </h2>

                <p className="leading-7 text-stone-700">
                  Пользователь выбирает регион, открывает фольклорный материал,
                  изучает его содержание и выполняет интерактивное задание.
                </p>
              </div>

              <div className="space-y-3">
                <RouteItem number="01" title="Выбери регион на карте" />
                <RouteItem number="02" title="Открой карточку материала" />
                <RouteItem number="03" title="Пройди интерактивное задание" />
                <RouteItem number="04" title="Собирай цели и карточки" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Возможности платформы
          </p>

          <h2 className="mb-4 text-4xl font-bold">
            Что можно делать в «Легендариуме»
          </h2>

          <p className="leading-8 text-stone-700">
            Платформа объединяет каталог материалов, территориальную навигацию,
            интерактивные задания, цели изучения и административные инструменты
            для управления контентом.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Интерактивная карта"
            text="Материалы можно изучать через регионы и географическую привязку."
            href="/map"
            linkText="Открыть карту"
          />

          <FeatureCard
            title="Библиотека"
            text="Каталог поддерживает поиск и фильтрацию по региону, народу, жанру и тематике."
            href="/library"
            linkText="Перейти в библиотеку"
          />

          <FeatureCard
            title="Задания"
            text="Интерактивные задания помогают проверить понимание фольклорного материала."
            href="/quests"
            linkText="Пройти задания"
          />

          <FeatureCard
            title="Цели изучения"
            text="Тематические цели превращают изучение материалов в последовательный маршрут."
            href="/goals"
            linkText="Смотреть цели"
          />
        </div>
      </section>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Для администратора
            </p>

            <h2 className="mb-4 text-4xl font-bold">
              Управление материалами и заданиями
            </h2>

            <p className="mb-6 leading-8 text-stone-700">
              Административная часть позволяет добавлять и редактировать
              фольклорные материалы, управлять справочниками, создавать задания
              и настраивать цели изучения.
            </p>

            <Link
              href="/admin"
              className="inline-flex rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Перейти в админ-панель
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AdminFeature title="Материалы" text="Добавление, редактирование и архивация записей." />
            <AdminFeature title="Справочники" text="Управление регионами, народами, жанрами, тематиками и источниками." />
            <AdminFeature title="Задания" text="Создание заданий с выбором одного правильного ответа." />
            <AdminFeature title="Цели" text="Настройка тематических целей и карточек-наград." />
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-stone-900">{value}</p>
      <p className="text-sm text-stone-600">{label}</p>
    </div>
  );
}

function RouteItem({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-sm font-bold text-white">
        {number}
      </span>

      <p className="font-medium text-stone-800">{title}</p>
    </div>
  );
}

function FeatureCard({
  title,
  text,
  href,
  linkText,
}: {
  title: string;
  text: string;
  href: string;
  linkText: string;
}) {
  return (
    <article className="flex min-h-[260px] flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <h3 className="mb-3 text-2xl font-semibold">{title}</h3>

      <p className="mb-6 leading-7 text-stone-700">{text}</p>

      <Link
        href={href}
        className="mt-auto inline-flex font-medium text-amber-800 underline-offset-4 hover:underline"
      >
        {linkText}
      </Link>
    </article>
  );
}

function AdminFeature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="leading-7 text-stone-700">{text}</p>
    </div>
  );
}
