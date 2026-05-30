import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const [materialsCount, peoplesCount, tasksCount] = await Promise.all([
    prisma.material.count({
      where: {
        status: "PUBLISHED",
      },
    }),
    prisma.people.count(),
    prisma.interactiveTask.count(),
  ]);

  return (
    <main className="legendarium-page overflow-hidden pb-20">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <div
          className="relative min-h-[620px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-cover shadow-2xl shadow-black/35"
          style={{
            backgroundImage: "url('/images/hero-bg-dark.png')",
            backgroundPosition: "center right",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#06151a]/96 via-[#06151a]/72 to-[#06151a]/18" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#02080a]/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(58,166,160,0.14),transparent_24%),radial-gradient(circle_at_72%_80%,rgba(216,163,66,0.12),transparent_28%)]" />

          <div className="relative z-10 flex min-h-[620px] items-center px-8 py-12 md:px-12 md:py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="animate-fade-in-up mb-6 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/12 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b] backdrop-blur">
                Фольклор народов России
              </p>

              <h1 className="animate-fade-in-up delay-100 mb-6 text-6xl font-extrabold leading-[0.95] tracking-tight text-[#fff8e8] drop-shadow-lg md:text-7xl">
                Легендариум
              </h1>

              <p className="animate-fade-in-up delay-150 mb-9 max-w-2xl text-lg leading-9 text-[#d9c9b6] drop-shadow md:text-xl">
                Интерактивная образовательная платформа для изучения легенд,
                сказок, мифов, обрядов и культурных традиций народов России
                через карту, библиотеку и интерактивные задания.
              </p>

              <div className="animate-fade-in-up delay-200 mb-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/map"
                  className="rounded-2xl bg-[#d8a342] px-7 py-4 text-base font-extrabold !text-[#06151a] shadow-lg shadow-[#d8a342]/30 transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                >
                  Открыть карту
                </Link>

                <Link
                  href="/library"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold !text-[#fff8e8] backdrop-blur transition hover:bg-white/18"
                >
                  Библиотека
                </Link>

                <Link
                  href="/quests"
                  className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-extrabold !text-[#fff8e8] backdrop-blur transition hover:bg-white/18"
                >
                  Задания
                </Link>
              </div>

              <div className="animate-fade-in-up delay-300 grid max-w-2xl gap-4 sm:grid-cols-3">
                <HeroStatCard value={materialsCount} label="материалов" />
                <HeroStatCard value={peoplesCount} label="народов" />
                <HeroStatCard value={tasksCount} label="заданий" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="animate-fade-in-up mb-10 max-w-3xl">
          <p className="mb-4 text-sm font-black uppercase tracking-[0.32em] text-[#d8a342]">
            Возможности платформы
          </p>

          <h2 className="mb-5 text-4xl font-extrabold leading-tight text-[#fff8e8] md:text-5xl">
            Что можно делать в «Легендариуме»
          </h2>

          <p className="text-lg leading-8 text-[#cbbba7]">
            Платформа объединяет карту, каталог фольклорных материалов,
            интерактивные задания и персональный прогресс пользователя.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="animate-fade-in-up delay-100">
            <FeatureCard
              href="/map"
              icon="⌖"
              title="Интерактивная карта"
              text="Изучайте фольклор через регионы России, территориальную привязку и точки материалов."
              action="Открыть карту"
              color="from-[#2f8f63] to-[#3aa6a0]"
            />
          </div>

          <div className="animate-fade-in-up delay-200">
            <FeatureCard
              href="/library"
              icon="◫"
              title="Библиотека"
              text="Ищите материалы по региону, народу, жанру и тематике. Сохраняйте понравившееся."
              action="Перейти в библиотеку"
              color="from-[#3aa6a0] to-[#2f6f96]"
            />
          </div>

          <div className="animate-fade-in-up delay-300">
            <FeatureCard
              href="/quests"
              icon="?"
              title="Задания"
              text="Проверяйте понимание легенд и сказок через интерактивные задания с результатами."
              action="Пройти задания"
              color="from-[#7352d6] to-[#3aa6a0]"
            />
          </div>

          <div className="animate-fade-in-up delay-400">
            <FeatureCard
              href="/profile"
              icon="✦"
              title="Личный маршрут"
              text="Следите за прогрессом, избранным и коллекционными карточками в профиле."
              action="Открыть профиль"
              color="from-[#d8a342] to-[#2f8f63]"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroStatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-lg shadow-black/20 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/14">
      <p className="mb-1 text-4xl font-extrabold text-[#fff8e8]">{value}</p>
      <p className="text-sm font-semibold text-[#d9c9b6]">{label}</p>
    </div>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  text,
  action,
  color,
}: {
  href: string;
  icon: string;
  title: string;
  text: string;
  action: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[350px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/8 p-7 shadow-lg shadow-black/20 backdrop-blur transition hover:-translate-y-1 hover:bg-white/12 hover:shadow-xl"
    >
      <div
        className={`mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${color} text-3xl text-white shadow-lg transition group-hover:scale-105`}
      >
        {icon}
      </div>

      <h3 className="mb-4 text-2xl font-extrabold leading-tight text-[#fff8e8]">
        {title}
      </h3>

      <p className="mb-8 leading-8 text-[#cbbba7]">{text}</p>

      <span className="mt-auto inline-flex font-extrabold text-[#d8a342] transition group-hover:translate-x-1 group-hover:text-[#f0bd5b]">
        {action} →
      </span>
    </Link>
  );
}
