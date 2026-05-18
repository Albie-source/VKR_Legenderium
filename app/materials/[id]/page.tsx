import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  addToFavoritesAction,
  removeFromFavoritesAction,
  requireLoginForFavoriteAction,
} from "./actions";

type MaterialPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MaterialPage({ params }: MaterialPageProps) {
  const { id } = await params;
  const materialId = Number(id);

  if (Number.isNaN(materialId)) {
    notFound();
  }

  const user = await getCurrentUser();

  const material = await prisma.material.findFirst({
    where: {
      id: materialId,
      status: "PUBLISHED",
    },
    include: {
      region: true,
      people: true,
      genre: true,
      source: true,
      topics: {
        include: {
          topic: true,
        },
      },
      tasks: true,
    },
  });

  if (!material) {
    notFound();
  }

  const favorite = user
    ? await prisma.favorite.findUnique({
        where: {
          userId_materialId: {
            userId: user.id,
            materialId: material.id,
          },
        },
      })
    : null;

  const isFavorite = Boolean(favorite);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <Link
            href="/library"
            className="mb-8 inline-flex rounded-xl border border-stone-300 bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:bg-stone-100"
          >
            ← Вернуться в библиотеку
          </Link>

          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-800">
                  {material.genre.name}
                </span>

                <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                  {material.region.name}
                </span>

                <span className="rounded-full bg-stone-100 px-3 py-1 text-stone-700">
                  {material.people.name}
                </span>
              </div>

              <h1 className="mb-5 text-5xl font-bold leading-tight">
                {material.title}
              </h1>

              {material.shortDescription && (
                <p className="max-w-3xl text-lg leading-8 text-stone-700">
                  {material.shortDescription}
                </p>
              )}

              {material.topics.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {material.topics.map(({ topic }) => (
                    <span
                      key={topic.id}
                      className="rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-sm text-amber-800 shadow-sm"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-xl">
              {material.imageUrl ? (
                <img
                  src={material.imageUrl}
                  alt={material.title}
                  className="h-[360px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[360px] items-center justify-center bg-gradient-to-br from-amber-100 via-stone-100 to-stone-200 text-stone-500">
                  Изображение не добавлено
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Текст
                </p>

                <h2 className="text-3xl font-bold">
                  Содержание материала
                </h2>
              </div>
            </div>

            {material.fullText ? (
              <div className="prose prose-stone max-w-none">
                <p className="whitespace-pre-line text-lg leading-9 text-stone-800">
                  {material.fullText}
                </p>
              </div>
            ) : (
              <p className="rounded-2xl bg-stone-50 p-5 text-stone-600">
                Полный текст пока не добавлен.
              </p>
            )}
          </section>

          {(material.audioUrl || material.videoUrl) && (
            <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                Медиа
              </p>

              <h2 className="mb-6 text-3xl font-bold">
                Мультимедийные материалы
              </h2>

              <div className="space-y-6">
                {material.audioUrl && (
                  <div className="rounded-2xl bg-stone-50 p-5">
                    <p className="mb-3 text-sm font-medium text-stone-700">
                      Аудиозапись
                    </p>

                    <audio controls className="w-full">
                      <source src={material.audioUrl} />
                      Ваш браузер не поддерживает аудио.
                    </audio>
                  </div>
                )}

                {material.videoUrl && (
                  <div className="rounded-2xl bg-stone-50 p-5">
                    <p className="mb-3 text-sm font-medium text-stone-700">
                      Видеоматериал
                    </p>

                    <video controls className="w-full rounded-xl">
                      <source src={material.videoUrl} />
                      Ваш браузер не поддерживает видео.
                    </video>
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-sm">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Источник
            </p>

            <h2 className="mb-6 text-3xl font-bold">
              Сведения о происхождении материала
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <SourceInfo title="Название" value={material.source.title} />

              {material.source.author && (
                <SourceInfo
                  title="Автор / составитель"
                  value={material.source.author}
                />
              )}

              {material.source.year && (
                <SourceInfo title="Год" value={String(material.source.year)} />
              )}

              {material.source.type && (
                <SourceInfo title="Тип источника" value={material.source.type} />
              )}
            </div>

            {material.source.url && (
              <Link
                href={material.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl border border-amber-300 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-50"
              >
                Открыть источник
              </Link>
            )}
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
              Избранное
            </p>

            <h2 className="mb-3 text-2xl font-semibold">
              {isFavorite ? "Материал сохранён" : "Сохранить материал"}
            </h2>

            <p className="mb-5 leading-7 text-stone-700">
              {isFavorite
                ? "Этот материал добавлен в ваш список избранного."
                : "Добавьте материал в избранное, чтобы быстро вернуться к нему позже."}
            </p>

            {user ? (
              isFavorite ? (
                <form action={removeFromFavoritesAction}>
                  <input type="hidden" name="materialId" value={material.id} />

                  <button
                    type="submit"
                    className="w-full rounded-xl border border-amber-300 bg-white px-5 py-3 font-medium text-amber-800 transition hover:bg-amber-100"
                  >
                    Удалить из избранного
                  </button>
                </form>
              ) : (
                <form action={addToFavoritesAction}>
                  <input type="hidden" name="materialId" value={material.id} />

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
                  >
                    Добавить в избранное
                  </button>
                </form>
              )
            ) : (
              <form action={requireLoginForFavoriteAction}>
                <input type="hidden" name="materialId" value={material.id} />

                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
                >
                  Войти, чтобы сохранить
                </button>
              </form>
            )}
          </section>
          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-semibold">
              Краткая карточка
            </h2>

            <div className="space-y-3">
              <InfoCard title="Регион" value={material.region.name} />
              <InfoCard title="Народ" value={material.people.name} />
              <InfoCard title="Жанр" value={material.genre.name} />

              {material.latitude && material.longitude && (
                <InfoCard
                  title="Координаты"
                  value={`${material.latitude}, ${material.longitude}`}
                />
              )}
            </div>
          </section>

          {material.tasks.length > 0 ? (
            <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                Задание
              </p>

              <h2 className="mb-3 text-2xl font-semibold">
                Проверь понимание материала
              </h2>

              <p className="mb-5 leading-7 text-stone-700">
                К этому материалу добавлено интерактивное задание. Его можно
                пройти после чтения текста.
              </p>

              <Link
                href={`/quests/${material.tasks[0].id}`}
                className="inline-flex w-full justify-center rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
              >
                Перейти к заданию
              </Link>
            </section>
          ) : (
            <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-2xl font-semibold">
                Задание не добавлено
              </h2>

              <p className="leading-7 text-stone-600">
                Для этого материала пока нет интерактивного задания.
              </p>
            </section>
          )}

          <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold">
              Навигация
            </h2>

            <div className="space-y-3">
              <Link
                href="/library"
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Все материалы
              </Link>

              <Link
                href={`/library?region=${material.regionId}`}
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Материалы этого региона
              </Link>

              <Link
                href={`/library?genre=${material.genreId}`}
                className="block rounded-xl border border-stone-300 px-4 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
              >
                Материалы этого жанра
              </Link>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function SourceInfo({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl bg-stone-50 p-4">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="font-medium text-stone-900">{value}</p>
    </div>
  );
}
