import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  addToFavoritesAction,
  removeFromFavoritesAction,
  requireLoginForFavoriteAction,
} from "./actions";
import TtsPlayer from "./TtsPlayer";
import BookReader from "./BookReader";
import AudioPlayer from "./AudioPlayer";

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
    <main className="overflow-hidden bg-[linear-gradient(180deg,#07181c_0%,#0b2428_28%,#f4ecdf_28%,#f4ecdf_100%)] pb-20">
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm font-semibold">
          <Link
            href="/"
            className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]"
          >
            Главная
          </Link>
          <span className="text-[#d6c8b6]/30">›</span>
          <Link
            href="/library"
            className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]"
          >
            Библиотека
          </Link>
          <span className="text-[#d6c8b6]/30">›</span>
          <Link
            href={`/library?genre=${material.genreId}`}
            className="text-[#d6c8b6]/60 transition hover:text-[#fff8e8]"
          >
            {material.genre.name}
          </Link>
          <span className="text-[#d6c8b6]/30">›</span>
          <span className="max-w-[220px] truncate text-[#fff8e8]">
            {material.title}
          </span>
        </nav>

        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0b1f22] shadow-2xl shadow-black/25">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(58,166,160,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(216,163,66,0.14),transparent_24%),radial-gradient(circle_at_70%_88%,rgba(47,143,99,0.10),transparent_28%)]" />

          <div className="relative grid gap-8 p-8 md:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="animate-fade-in-up">
              <div className="mb-5 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[#d8a342]/35 bg-[#d8a342]/12 px-3 py-1 font-black uppercase tracking-[0.12em] text-[#f0bd5b]">
                  {material.genre.name}
                </span>

                <span className="rounded-full border border-[#3aa6a0]/35 bg-[#3aa6a0]/12 px-3 py-1 font-bold text-[#9ee8e2]">
                  {material.region.name}
                </span>

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 font-bold text-[#fff8e8]">
                  {material.people.name}
                </span>
              </div>

              <div className="mb-5 flex items-start gap-4">
                <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-6xl">
                  {material.title}
                </h1>

                <FavoriteIconButton
                  materialId={material.id}
                  isFavorite={isFavorite}
                  isLoggedIn={Boolean(user)}
                />
              </div>

              {material.shortDescription && (
                <p className="max-w-3xl text-lg leading-8 text-[#d6c8b6]">
                  {material.shortDescription}
                </p>
              )}

              {material.topics.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-2">
                  {material.topics.map(({ topic }) => (
                    <span
                      key={topic.id}
                      className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm font-semibold text-[#fff8e8]"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#06151a] shadow-2xl shadow-black/25">
              {material.imageUrl ? (
                <img
                  src={material.imageUrl}
                  alt={material.title}
                  className="h-[380px] w-full object-cover"
                />
              ) : (
                <div className="flex h-[380px] items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#10272b,#06151a)] px-6 text-center text-sm font-semibold text-[#cbbba7]">
                  Изображение не добавлено
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        className={[
          "mx-auto max-w-7xl px-6 pt-10",
          material.tasks.length > 0
            ? "grid gap-8 lg:grid-cols-[1fr_340px]"
            : "",
        ].join(" ")}
      >
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
            <div className="mb-7">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">
                Текст
              </p>

              <h2 className="text-3xl font-extrabold text-stone-950">
                Содержание материала
              </h2>
            </div>

            {process.env.YANDEX_TTS_API_KEY && material.fullText && (
              <TtsPlayer text={material.fullText} />
            )}

            {material.fullText ? (
              <BookReader text={material.fullText} />
            ) : (
              <p className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5 text-stone-700">
                Полный текст пока не добавлен.
              </p>
            )}

            {material.source && (
              <p className="mt-6 border-t border-[#eadbc7] pt-4 text-sm text-stone-500">
                <span className="font-semibold text-stone-700">Источник: </span>
                {material.source.author && `${material.source.author}. `}
                {material.source.title}
                {material.source.year && `, ${material.source.year}`}
                {material.source.type && ` (${material.source.type})`}
                {material.source.url && (
                  <>
                    {" · "}
                    <Link
                      href={material.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#b46b1f] underline underline-offset-2 transition hover:text-[#9f661f]"
                    >
                      Открыть
                    </Link>
                  </>
                )}
              </p>
            )}
          </section>

          {(material.audioUrl || material.videoUrl) && (
            <section className="rounded-[2rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.25em] text-[#b46b1f]">
                Медиа
              </p>

              <h2 className="mb-6 text-3xl font-extrabold text-stone-950">
                Мультимедийные материалы
              </h2>

              <div className="space-y-6">
                {material.audioUrl && (
                  <AudioPlayer src={material.audioUrl} />
                )}

                {material.videoUrl && (
                  <div className="rounded-2xl border border-[#eadbc7] bg-[#fbf7f1] p-5">
                    <p className="mb-3 text-sm font-bold text-stone-800">
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

        </div>

        {material.tasks.length > 0 && (
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-[2rem] border border-[#d8a342]/35 bg-[#fff4d8] p-6 shadow-md">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.2em] text-[#b46b1f]">
                Задание
              </p>

              <h2 className="mb-3 text-2xl font-extrabold text-stone-950">
                Проверь понимание материала
              </h2>

              <p className="mb-5 leading-7 text-stone-700">
                К этому материалу добавлено интерактивное задание. Его можно
                пройти после чтения текста.
              </p>

              <Link
                href={`/quests/${material.tasks[0].id}`}
                className="inline-flex w-full justify-center rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
              >
                Перейти к заданию
              </Link>
            </section>
          </aside>
        )}
      </section>
    </main>
  );
}

function FavoriteIconButton({
  materialId,
  isFavorite,
  isLoggedIn,
}: {
  materialId: number;
  isFavorite: boolean;
  isLoggedIn: boolean;
}) {
  const action = !isLoggedIn
    ? requireLoginForFavoriteAction
    : isFavorite
      ? removeFromFavoritesAction
      : addToFavoritesAction;

  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="materialId" value={materialId} />

      <button
        type="submit"
        title={
          !isLoggedIn
            ? "Войти, чтобы добавить в избранное"
            : isFavorite
              ? "Удалить из избранного"
              : "Добавить в избранное"
        }
        aria-label={
          !isLoggedIn
            ? "Войти, чтобы добавить в избранное"
            : isFavorite
              ? "Удалить из избранного"
              : "Добавить в избранное"
        }
        className={[
          "flex h-14 w-14 items-center justify-center rounded-2xl border text-2xl shadow-lg transition hover:-translate-y-0.5",
          isFavorite
            ? "border-[#d8a342]/50 bg-[#d8a342] text-[#06151a] shadow-[#d8a342]/25"
            : "border-white/15 bg-white/10 text-[#fff8e8] shadow-black/20 backdrop-blur hover:bg-white/16",
        ].join(" ")}
      >
        {isFavorite ? "♥" : "♡"}
      </button>
    </form>
  );
}


