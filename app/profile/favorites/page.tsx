import Image from "next/image";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { removeFromFavoritesAction } from "@/app/materials/[id]/actions";

export default async function FavoritesPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: {
      userId: user.id,
    },
    include: {
      material: {
        include: {
          region: true,
          people: true,
          genre: true,
          topics: {
            include: {
              topic: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <Link
            href="/profile"
            className="mb-8 inline-flex rounded-xl border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            ← Вернуться в профиль
          </Link>

          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Личный кабинет
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Избранные материалы
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Здесь собраны фольклорные материалы, которые вы добавили в
                избранное. Это позволяет быстро возвращаться к интересным
                легендам, сказкам, мифам и обрядам.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat title="В избранном" value={favorites.length} />
              <HeroStat title="Пользователь" value={user.name} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Сохранённые материалы</h2>

            <p className="mt-1 text-sm text-stone-600">
              Материалы отсортированы по дате добавления в избранное.
            </p>
          </div>

          <Link
            href="/library"
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            Перейти в библиотеку
          </Link>
        </div>

        {favorites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => {
              const material = favorite.material;

              return (
                <article
                  key={favorite.id}
                  className="group flex min-h-[430px] flex-col overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-48 bg-stone-200">
                    {material.imageUrl ? (
                      <Image
                        src={material.imageUrl}
                        alt={material.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-amber-100 to-stone-200 text-sm text-stone-500">
                        Изображение не добавлено
                      </div>
                    )}

                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-amber-800 shadow-sm backdrop-blur">
                      {material.genre.name}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                        {material.region.name}
                      </span>

                      <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                        {material.people.name}
                      </span>
                    </div>

                    <h3 className="mb-3 text-2xl font-semibold leading-tight">
                      {material.title}
                    </h3>

                    <p className="mb-4 line-clamp-4 flex-1 text-sm leading-6 text-stone-700">
                      {material.shortDescription}
                    </p>

                    {material.topics.length > 0 && (
                      <div className="mb-5 flex flex-wrap gap-2">
                        {material.topics.map(({ topic }) => (
                          <span
                            key={topic.id}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-800"
                          >
                            {topic.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap gap-3">
                      <Link
                        href={`/materials/${material.id}`}
                        className="rounded-xl bg-amber-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-800"
                      >
                        Открыть материал
                      </Link>

                      <form action={removeFromFavoritesAction}>
                        <input
                          type="hidden"
                          name="materialId"
                          value={material.id}
                        />

                        <button
                          type="submit"
                          className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                        >
                          Удалить
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function HeroStat({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-2xl">
        ★
      </div>

      <h3 className="mb-3 text-2xl font-semibold">
        В избранном пока ничего нет
      </h3>

      <p className="mx-auto mb-6 max-w-xl leading-7 text-stone-600">
        Откройте материал в библиотеке и нажмите кнопку «Добавить в
        избранное», чтобы он появился на этой странице.
      </p>

      <Link
        href="/library"
        className="inline-flex rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
      >
        Перейти в библиотеку
      </Link>
    </div>
  );
}
