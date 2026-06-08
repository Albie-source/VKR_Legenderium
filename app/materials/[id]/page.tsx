import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { markMaterialDiscovered, statusFromProgress } from "@/lib/materialProgress";
import {
  addToFavoritesAction,
  removeFromFavoritesAction,
  requireLoginForFavoriteAction,
} from "./actions";
import TtsPlayer from "./TtsPlayer";
import ManuscriptReader from "./ManuscriptReader";
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

  let materialStatus: ReturnType<typeof statusFromProgress> = "undiscovered";

  if (user) {
    await markMaterialDiscovered(user.id, material.id);

    const progress = await prisma.materialProgress.findUnique({
      where: { userId_materialId: { userId: user.id, materialId: material.id } },
      select: { discoveredAt: true, restoredAt: true },
    });

    materialStatus = statusFromProgress(progress);
  }

  const sourceLabel = material.source
    ? [
        material.source.author && `${material.source.author}.`,
        material.source.title,
        material.source.year && `${material.source.year}`,
        material.source.type && `(${material.source.type})`,
      ]
        .filter(Boolean)
        .join(" ")
    : null;

  return (
    <main className="bg-[#0b1f22] pb-20">
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-8">
            <div>
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

              <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-[#d8a342]/35 bg-[#d8a342]/12 px-3 py-1 font-black uppercase tracking-[0.12em] text-[#f0bd5b]">
                  {material.genre.name}
                </span>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 font-bold text-[#d6c8b6]">
                  {material.region.name} · {material.people.name}
                </span>

                {materialStatus === "restored" && (
                  <span className="rounded-full border border-[#6fcf97]/40 bg-[#6fcf97]/12 px-3 py-1 font-black uppercase tracking-[0.12em] text-[#9ee8c0]">
                    ✓ Фрагмент восстановлен
                  </span>
                )}

                {materialStatus === "discovered" && (
                  <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 font-black uppercase tracking-[0.12em] text-[#d6c8b6]">
                    Фрагмент найден · ожидает восстановления
                  </span>
                )}
              </div>

              <h1 className="mb-3 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-[#fff8e8] md:text-5xl">
                {material.title}
              </h1>

              {material.shortDescription && (
                <p className="max-w-3xl text-lg leading-8 text-[#d6c8b6]">
                  {material.shortDescription}
                </p>
              )}
            </div>

            {process.env.YANDEX_TTS_API_KEY && material.fullText && (
              <TtsPlayer text={material.fullText} />
            )}

            {material.fullText ? (
              <ManuscriptReader text={material.fullText} />
            ) : (
              <p className="rounded-[1.75rem] border border-[#e4d4bf] bg-[#f8f0df] p-7 text-stone-700 shadow-md md:p-8">
                Полный текст пока не добавлен.
              </p>
            )}

            {material.tasks.length > 0 && (
              <section className="flex flex-col gap-5 rounded-[1.75rem] border border-[#d8a342]/35 bg-[#0e2227] p-6 shadow-md sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="mb-1 text-xl font-extrabold text-[#fff8e8]">
                    {materialStatus === "restored"
                      ? "Проверка Архивариуса пройдена"
                      : "Проверка Архивариуса"}
                  </h2>
                  <p className="text-sm leading-6 text-[#d6c8b6]">
                    {materialStatus === "restored"
                      ? "Ты прошёл проверку — фрагмент полностью восстановлен и занял своё место в архиве."
                      : "Ты нашёл фрагмент. Пройди задание Архивариуса, чтобы он считался по-настоящему восстановленным и занял своё место в архиве."}
                  </p>
                </div>

                <Link
                  href={`/quests/${material.tasks[0].id}`}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#d8a342] px-5 py-3 font-extrabold text-[#06151a] shadow-md transition hover:-translate-y-0.5 hover:bg-[#f0bd5b]"
                >
                  {materialStatus === "restored" ? "Пройти ещё раз" : "Пройти проверку"}
                  <span aria-hidden>→</span>
                </Link>
              </section>
            )}

            {(material.audioUrl || material.videoUrl) && (
              <section className="rounded-[1.75rem] border border-[#e4d4bf] bg-white p-7 shadow-md md:p-8">
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

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="relative h-[420px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#06151a] shadow-xl shadow-black/25 lg:h-[520px]">
              {material.imageUrl ? (
                <Image
                  src={material.imageUrl}
                  alt={material.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_35%_25%,rgba(216,163,66,0.18),transparent_28%),linear-gradient(135deg,#10272b,#06151a)] px-6 text-center text-sm font-semibold text-[#cbbba7]">
                  Изображение не добавлено
                </div>
              )}
            </div>

            <section className="rounded-[1.75rem] border border-white/10 bg-[#0e2227] p-6 shadow-md">
              <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
                О материале
              </h2>

              <dl className="space-y-3.5 text-sm">
                <InfoRow icon={<PinIcon />} label="Регион" value={material.region.name} />
                <InfoRow icon={<PeopleIcon />} label="Народ" value={material.people.name} />
                <InfoRow icon={<BookIcon />} label="Жанр" value={material.genre.name} />
                {sourceLabel && (
                  <InfoRow
                    icon={<DocIcon />}
                    label="Источник"
                    value={
                      material.source?.url ? (
                        <Link
                          href={material.source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 transition hover:text-[#f0bd5b]"
                        >
                          {sourceLabel}
                        </Link>
                      ) : (
                        sourceLabel
                      )
                    }
                  />
                )}
              </dl>
            </section>

            {material.topics.length > 0 && (
              <section className="rounded-[1.75rem] border border-white/10 bg-[#0e2227] p-6 shadow-md">
                <h2 className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
                  Темы и мотивы
                </h2>

                <div className="flex flex-wrap gap-2">
                  {material.topics.map(({ topic }) => (
                    <span
                      key={topic.id}
                      className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-sm font-semibold text-[#fff8e8]"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <FavoriteButton
              materialId={material.id}
              isFavorite={isFavorite}
              isLoggedIn={Boolean(user)}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-[#d8a342]">
        {icon}
      </span>
      <span>
        <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-[#d6c8b6]/55">
          {label}
        </span>
        <span className="block font-semibold text-[#fff8e8]">{value}</span>
      </span>
    </div>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path d="M12 21s-7-7.5-7-12a7 7 0 1 1 14 0c0 4.5-7 12-7 12Z" />
      <circle cx="12" cy="9" r="2.4" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M15.5 12.2c2.4.4 4 2 4 4.8" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path d="M4 5.5c0-.8.7-1.5 1.5-1.5H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4" />
      <path d="M9 13h6M9 16.5h6" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className="h-4 w-4"
    >
      <path d="m12 3.5 2.6 5.5 6 .8-4.3 4.3 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.8l6-.8 2.6-5.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function FavoriteButton({
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
    <form action={action}>
      <input type="hidden" name="materialId" value={materialId} />

      <button
        type="submit"
        className={[
          "flex w-full items-center justify-center gap-2 rounded-2xl border px-5 py-3 text-sm font-extrabold shadow-md transition hover:-translate-y-0.5",
          isFavorite
            ? "border-[#d8a342]/50 bg-[#d8a342]/15 text-[#f0bd5b]"
            : "border-white/10 bg-white/5 text-[#fff8e8] hover:bg-white/8",
        ].join(" ")}
      >
        <StarIcon filled={isFavorite} />
        {!isLoggedIn
          ? "Войти, чтобы добавить в избранное"
          : isFavorite
            ? "В избранном"
            : "В избранное"}
      </button>
    </form>
  );
}
