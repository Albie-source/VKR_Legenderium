import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createGenreAction,
  createPeopleAction,
  createRegionAction,
  createSourceAction,
  createTopicAction,
} from "./actions";

export default async function DictionariesPage() {
  await requireAdmin();

  const [regions, peoples, genres, topics, sources] = await Promise.all([
    prisma.region.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.people.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.topic.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.source.findMany({
      orderBy: {
        title: "asc",
      },
    }),
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
              Управление справочниками
            </h1>

            <p className="max-w-3xl text-stone-700">
              В этом разделе можно добавлять регионы, народы, жанры, тематики и
              источники, которые затем используются при создании фольклорных
              материалов.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-stone-300 px-5 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
          >
            ← Назад в админ-панель
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <DictionaryBlock
            title="Регионы"
            description="Территориальная привязка фольклорных материалов."
            items={regions.map((region) => ({
              id: region.id,
              title: region.name,
              subtitle: region.description,
            }))}
            action={createRegionAction}
            namePlaceholder="Например: Республика Бурятия"
          />

          <DictionaryBlock
            title="Народы"
            description="Этнокультурная принадлежность материалов."
            items={peoples.map((people) => ({
              id: people.id,
              title: people.name,
              subtitle: people.description,
            }))}
            action={createPeopleAction}
            namePlaceholder="Например: Буряты"
          />

          <DictionaryBlock
            title="Жанры"
            description="Жанровая классификация фольклора."
            items={genres.map((genre) => ({
              id: genre.id,
              title: genre.name,
              subtitle: genre.description,
            }))}
            action={createGenreAction}
            namePlaceholder="Например: Предание"
          />

          <DictionaryBlock
            title="Тематики"
            description="Смысловые признаки материалов."
            items={topics.map((topic) => ({
              id: topic.id,
              title: topic.name,
              subtitle: topic.description,
            }))}
            action={createTopicAction}
            namePlaceholder="Например: Герои"
          />

          <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="mb-5">
              <h2 className="mb-2 text-2xl font-semibold">Источники</h2>
              <p className="text-sm leading-6 text-stone-600">
                Источник фиксирует происхождение фольклорного материала:
                сборник, сайт, архив или учебную подборку.
              </p>
            </div>

            <form
              action={createSourceAction}
              className="mb-6 grid gap-4 rounded-2xl bg-stone-50 p-4 md:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Название источника *
                </label>

                <input
                  name="title"
                  required
                  placeholder="Например: Сказки народов России"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Автор / составитель
                </label>

                <input
                  name="author"
                  placeholder="Например: Иванов И.И."
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Год
                </label>

                <input
                  name="year"
                  type="number"
                  placeholder="2026"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Тип источника
                </label>

                <input
                  name="type"
                  placeholder="книга / сайт / архив"
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-stone-700">
                  Ссылка
                </label>

                <input
                  name="url"
                  placeholder="https://..."
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
                >
                  Добавить источник
                </button>
              </div>
            </form>

            {sources.length === 0 ? (
              <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                Источники пока не добавлены.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
                  >
                    <h3 className="font-semibold">{source.title}</h3>

                    <div className="mt-2 space-y-1 text-sm text-stone-600">
                      {source.author && <p>Автор: {source.author}</p>}
                      {source.year && <p>Год: {source.year}</p>}
                      {source.type && <p>Тип: {source.type}</p>}
                      {source.url && (
                        <p className="break-all">Ссылка: {source.url}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function DictionaryBlock({
  title,
  description,
  items,
  action,
  namePlaceholder,
}: {
  title: string;
  description: string;
  items: {
    id: number;
    title: string;
    subtitle: string | null;
  }[];
  action: (formData: FormData) => Promise<void>;
  namePlaceholder: string;
}) {
  return (
    <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="mb-2 text-2xl font-semibold">{title}</h2>
        <p className="text-sm leading-6 text-stone-600">{description}</p>
      </div>

      <form action={action} className="mb-6 space-y-4 rounded-2xl bg-stone-50 p-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Название *
          </label>

          <input
            name="name"
            required
            placeholder={namePlaceholder}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            Описание
          </label>

          <textarea
            name="description"
            rows={3}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-amber-700 px-5 py-3 font-medium text-white transition hover:bg-amber-800"
        >
          Добавить
        </button>
      </form>

      {items.length === 0 ? (
        <p className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
          Записей пока нет.
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
            >
              <h3 className="font-semibold">{item.title}</h3>

              {item.subtitle && (
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {item.subtitle}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
