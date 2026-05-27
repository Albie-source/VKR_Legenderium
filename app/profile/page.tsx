import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "../login/actions";

export default async function ProfilePage() {
  const user = await requireUser();

  const [favoritesCount, attempts, goalProgress, recentFavorites] =
    await Promise.all([
      prisma.favorite.count({
        where: {
          userId: user.id,
        },
      }),

      prisma.taskAttempt.findMany({
        where: {
          userId: user.id,
        },
        include: {
          task: {
            include: {
              material: {
                include: {
                  genre: true,
                  region: true,
                },
              },
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
        take: 8,
      }),

      prisma.goalProgress.findMany({
        where: {
          userId: user.id,
        },
        include: {
          goal: {
            include: {
              genre: true,
              topic: true,
            },
          },
        },
        orderBy: {
          completedAt: "desc",
        },
      }),

      prisma.favorite.findMany({
        where: {
          userId: user.id,
        },
        include: {
          material: {
            include: {
              genre: true,
              region: true,
              people: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      }),
    ]);

  const completedAttempts = attempts.filter((attempt) => attempt.isCompleted);
  const completedGoals = goalProgress.filter((progress) => progress.isCompleted);
  const collectedCards = goalProgress.filter(
    (progress) => progress.rewardReceived
  );

  const completionRate =
    attempts.length === 0
      ? 0
      : Math.round((completedAttempts.length / attempts.length) * 100);

  const goalsRate =
    goalProgress.length === 0
      ? 0
      : Math.round((completedGoals.length / goalProgress.length) * 100);

  return (
    <main className="overflow-hidden bg-[#f4ecdf] pb-20">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(216,163,66,0.12),transparent_24%),linear-gradient(180deg,#07181c_0%,#0b2428_100%)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1f22] p-8 shadow-2xl shadow-black/25 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="h-28 w-28 shrink-0 overflow-hidden rounded-[2rem] border border-[#d8a342]/35 bg-white/10 shadow-xl shadow-black/25">
                <img
                  src="/images/avatar.png"
                  alt="Аватар пользователя"
                  className="h-full w-full object-cover"
                />
              </div>

            <div className="flex-1">
              <p className="mb-3 inline-flex rounded-full border border-[#d8a342]/35 bg-[#d8a342]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.28em] text-[#f0bd5b]">
                Личный кабинет
              </p>

              <h1 className="mb-3 text-5xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-6xl">
                {user.name}
              </h1>

              <p className="text-lg leading-8 text-[#d6c8b6]">
                {user.email}
              </p>

              <form action={logoutAction} className="mt-5">
                <button
                  type="submit"
                  className="rounded-2xl border border-white/10 bg-white/8 px-5 py-3 text-sm font-extrabold !text-[#fff8e8] shadow-sm backdrop-blur transition hover:bg-white/14"
                >
                  Выйти из аккаунта
                </button>
              </form>
            </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pt-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-6 shadow-md md:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-stone-950">
                  Прогресс
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Общий результат по заданиям, целям и коллекционным карточкам.
                </p>
              </div>

              <AttemptsHoverCard attempts={attempts} />
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <ProgressMetric
                title="Успешность заданий"
                value={`${completionRate}%`}
                progress={completionRate}
              />

              <ProgressMetric
                title="Цели"
                value={`${completedGoals.length} из ${goalProgress.length}`}
                progress={goalsRate}
              />

              <ProgressMetric
                title="Карточки"
                value={String(collectedCards.length)}
                progress={collectedCards.length > 0 ? 100 : 0}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/profile/progress"
                className="rounded-2xl bg-[#d8a342] px-5 py-3 text-sm font-extrabold !text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
              >
                Открыть цели
              </Link>

              <Link
                href="/quests"
                className="rounded-2xl border border-[#d8a342]/45 bg-[#fff8e8] px-5 py-3 text-sm font-extrabold !text-[#8a5418] transition hover:bg-[#fff1cf]"
              >
                Перейти к заданиям
              </Link>
            </div>
          </section>

          <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-6 shadow-md md:p-7">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-stone-950">
                  Коллекция
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                  Карточки открываются после выполнения целей.
                </p>
              </div>

              <Link
                href="/profile/collection"
                className="rounded-2xl border border-[#d8a342]/45 bg-[#fff8e8] px-4 py-2 text-sm font-extrabold !text-[#8a5418] transition hover:bg-[#fff1cf]"
              >
                Открыть все
              </Link>
            </div>

            {collectedCards.length === 0 ? (
              <EmptyMini
                title="Карточки пока не получены"
                text="Выполняйте цели, чтобы открывать коллекционные карточки."
                href="/profile/progress"
                linkText="Посмотреть цели"
              />
            ) : (
              <div className="legendarium-card-carousel flex gap-5 overflow-x-auto pb-3">
                {collectedCards.map((progress) => (
                  <article
                    key={progress.id}
                    className="min-w-[260px] max-w-[260px] overflow-hidden rounded-[1.8rem] border border-[#eadbc7] bg-[#fbf7f1] shadow-sm"
                  >
                    <div className="h-40 overflow-hidden bg-[#eadfce]">
                      {progress.goal.cardImageUrl ? (
                        <img
                          src={progress.goal.cardImageUrl}
                          alt={progress.goal.cardTitle}
                          className="h-full w-full object-cover object-[center_42%]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center px-5 text-center text-sm text-stone-500">
                          Изображение карточки не добавлено
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#b46b1f]">
                        Карточка
                      </p>

                      <h3 className="mb-2 text-xl font-extrabold leading-tight text-stone-950">
                        {progress.goal.cardTitle}
                      </h3>

                      <p className="line-clamp-3 text-sm leading-6 text-stone-600">
                        {progress.goal.title}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-6 shadow-md">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-stone-950">
                  Избранное
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Сохранено материалов: {favoritesCount}
                </p>
              </div>

              <Link
                href="/profile/favorites"
                className="rounded-2xl border border-[#d8a342]/45 bg-[#fff8e8] px-4 py-2 text-sm font-extrabold !text-[#8a5418] transition hover:bg-[#fff1cf]"
              >
                Все
              </Link>
            </div>

            {recentFavorites.length === 0 ? (
              <EmptyMini
                title="Избранное пусто"
                text="Добавляйте материалы через страницу легенды или сказки."
                href="/library"
                linkText="В библиотеку"
              />
            ) : (
              <div className="legendarium-profile-favorites-scroll max-h-[720px] space-y-3 overflow-y-auto pr-2">
                {recentFavorites.map((favorite) => (
                  <article
                    key={favorite.id}
                    className="group relative rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-3 transition hover:-translate-y-0.5 hover:border-[#d8a342]/45 hover:bg-[#fff8e8]"
                  >
                    <form action={removeFavoriteFromProfileAction}>
                      <input
                        type="hidden"
                        name="materialId"
                        value={favorite.material.id}
                      />

                      <button
                        type="submit"
                        title="Удалить из избранного"
                        aria-label="Удалить из избранного"
                        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-[#d8a342]/45 bg-[#d8a342] text-xl font-black !text-[#06151a] shadow-lg shadow-black/15 transition hover:scale-105 hover:bg-[#f0bd5b]"
                      >
                        ♥
                      </button>
                    </form>

                    <Link href={`/materials/${favorite.material.id}`}>
                      <div className="mb-3 h-28 overflow-hidden rounded-xl bg-[#eadfce]">
                        {favorite.material.imageUrl ? (
                          <img
                            src={favorite.material.imageUrl}
                            alt={favorite.material.title}
                            className="h-full w-full object-cover object-[center_42%] transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-stone-500">
                            Нет фото
                          </div>
                        )}
                      </div>

                      <div className="mb-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border border-[#d8a342]/25 bg-[#fff4d8] px-3 py-1 font-bold text-[#8a5418]">
                          {favorite.material.genre.name}
                        </span>

                        <span className="rounded-full border border-[#3aa6a0]/20 bg-[#e7f7f5] px-3 py-1 font-bold text-[#247670]">
                          {favorite.material.region.name}
                        </span>
                      </div>

                      <h3 className="line-clamp-2 text-base font-extrabold leading-tight text-stone-950">
                        {favorite.material.title}
                      </h3>

                      <p className="mt-2 text-sm text-stone-600">
                        {favorite.material.people.name}
                      </p>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}

async function removeFavoriteFromProfileAction(formData: FormData) {
  "use server";

  const user = await requireUser();
  const materialId = Number(formData.get("materialId"));

  if (Number.isNaN(materialId)) {
    return;
  }

  await prisma.favorite.deleteMany({
    where: {
      userId: user.id,
      materialId,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/favorites");
}

function ProgressMetric({
  title,
  value,
  progress,
}: {
  title: string;
  value: string;
  progress: number;
}) {
  return (
    <div className="rounded-3xl border border-[#eadbc7] bg-[#fbf7f1] p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-stone-700">{title}</p>
        <p className="text-sm font-extrabold text-stone-950">{value}</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-[#eadbc7]">
        <div
          className="h-full rounded-full bg-[#d8a342]"
          style={{
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
          }}
        />
      </div>
    </div>
  );
}

function AttemptsHoverCard({
  attempts,
}: {
  attempts: {
    id: number;
    isCompleted: boolean;
    score: number;
    task: {
      title: string;
      material: {
        genre: {
          name: string;
        };
      };
    };
  }[];
}) {
  return (
    <div className="group relative">
      <Link
        href="/profile/attempts"
        className="inline-flex rounded-2xl border border-[#d8a342]/45 bg-[#fff8e8] px-4 py-2 text-sm font-extrabold !text-[#8a5418] transition hover:bg-[#fff1cf]"
      >
        История заданий
      </Link>

      <div className="pointer-events-none absolute right-0 top-12 z-30 w-[360px] translate-y-2 opacity-0 transition group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
        <div className="rounded-[1.5rem] border border-[#e4d4bf] bg-white p-4 shadow-2xl shadow-black/20">
          <h3 className="mb-3 text-lg font-extrabold text-stone-950">
            Последние попытки
          </h3>

          {attempts.length === 0 ? (
            <p className="text-sm leading-6 text-stone-600">
              История прохождения пока пуста.
            </p>
          ) : (
            <div className="space-y-2">
              {attempts.slice(0, 5).map((attempt) => (
                <div
                  key={attempt.id}
                  className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-3"
                >
                  <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    <StatusBadge isCompleted={attempt.isCompleted} />

                    <span className="rounded-full border border-stone-200 bg-white px-3 py-1 font-bold text-stone-700">
                      {attempt.task.material.genre.name}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm font-extrabold text-stone-950">
                    {attempt.task.title}
                  </p>

                  <p className="mt-1 text-xs text-stone-600">
                    Балл:{" "}
                    <span className="font-extrabold text-stone-950">
                      {attempt.score}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-xs text-stone-500">
            Нажмите, чтобы открыть полную историю.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ isCompleted }: { isCompleted: boolean }) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 font-extrabold",
        isCompleted
          ? "bg-emerald-100 text-emerald-800"
          : "bg-red-100 text-red-800",
      ].join(" ")}
    >
      {isCompleted ? "Успешно" : "Ошибка"}
    </span>
  );
}

function EmptyMini({
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
    <div className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5">
      <h3 className="mb-2 text-lg font-extrabold text-stone-950">{title}</h3>

      <p className="mb-4 text-sm leading-6 text-stone-600">{text}</p>

      <Link
        href={href}
        className="inline-flex rounded-2xl bg-[#d8a342] px-4 py-2 text-sm font-extrabold !text-[#06151a] transition hover:bg-[#f0bd5b]"
      >
        {linkText}
      </Link>
    </div>
  );
}
