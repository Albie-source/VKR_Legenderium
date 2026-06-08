import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateMaterialAction } from "./actions";
import MediaUploadField from "@/app/admin/materials/MediaUploadField";
import CoordPicker from "@/app/admin/materials/CoordPicker";

type EditMaterialPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMaterialPage({
  params,
}: EditMaterialPageProps) {
  await requireAdmin();

  const { id } = await params;
  const materialId = Number(id);

  if (Number.isNaN(materialId)) {
    notFound();
  }

  const [material, regions, peoples, genres, topics, sources, existingMaterials] =
    await Promise.all([
      prisma.material.findUnique({
        where: {
          id: materialId,
        },
        include: {
          topics: true,
        },
      }),

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

      prisma.material.findMany({
        where: {
          id: { not: materialId },
          latitude: { not: null },
          longitude: { not: null },
        },
        select: {
          id: true,
          title: true,
          latitude: true,
          longitude: true,
        },
        orderBy: {
          title: "asc",
        },
      }),
    ]);

  if (!material) {
    notFound();
  }

  const selectedTopicIds = new Set(
    material.topics.map((topic) => topic.topicId)
  );

  const updateMaterialWithId = updateMaterialAction.bind(null, material.id);

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-10 text-stone-900">
      <section className="mx-auto max-w-4xl">
        <Link
          href="/admin"
          className="mb-8 inline-flex rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
        >
          ← Вернуться в админ-панель
        </Link>

        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
            Редактирование
          </p>

          <h1 className="text-4xl font-bold">
            Редактирование фольклорного материала
          </h1>
        </div>

        <form
          action={updateMaterialWithId}
          className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Название *
            </label>

            <input
              name="title"
              required
              defaultValue={material.title}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Краткое описание
            </label>

            <textarea
              name="shortDescription"
              rows={3}
              defaultValue={material.shortDescription ?? ""}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Полный текст
            </label>

            <textarea
              name="fullText"
              rows={8}
              defaultValue={material.fullText ?? ""}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SelectField
              name="regionId"
              label="Регион *"
              items={regions}
              defaultValue={material.regionId}
            />

            <SelectField
              name="peopleId"
              label="Народ *"
              items={peoples}
              defaultValue={material.peopleId}
            />

            <SelectField
              name="genreId"
              label="Жанр *"
              items={genres}
              defaultValue={material.genreId}
            />

            <SelectField
              name="sourceId"
              label="Источник *"
              items={sources}
              defaultValue={material.sourceId}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-stone-700">
              Тематики
            </p>

            <div className="grid gap-2 rounded-2xl border border-stone-200 p-4 md:grid-cols-2">
              {topics.map((topic) => (
                <label
                  key={topic.id}
                  className="flex items-center gap-2 text-sm text-stone-700"
                >
                  <input
                    type="checkbox"
                    name="topicIds"
                    value={topic.id}
                    defaultChecked={selectedTopicIds.has(topic.id)}
                    className="h-4 w-4"
                  />
                  {topic.name}
                </label>
              ))}
            </div>
          </div>

          <CoordPicker
            defaultLatitude={material.latitude}
            defaultLongitude={material.longitude}
            existingMaterials={existingMaterials.map((m) => ({
              id: m.id,
              title: m.title,
              latitude: m.latitude as number,
              longitude: m.longitude as number,
            }))}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <MediaUploadField
              name="imageUrl"
              label="Изображение"
              accept="image/*"
              defaultValue={material.imageUrl ?? ""}
              placeholder="/images/example.jpg"
            />
            <MediaUploadField
              name="audioUrl"
              label="Аудио"
              accept="audio/*"
              defaultValue={material.audioUrl ?? ""}
              placeholder="/audio/example.mp3"
            />
            <MediaUploadField
              name="videoUrl"
              label="Видео"
              accept="video/*"
              defaultValue={material.videoUrl ?? ""}
              placeholder="/video/example.mp4"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-stone-700">
              Статус
            </label>

            <select
              name="status"
              defaultValue={material.status}
              className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
            >
              <option value="DRAFT">Черновик</option>
              <option value="PUBLISHED">Опубликован</option>
              <option value="ARCHIVED">Архивирован</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-amber-700 px-6 py-3 font-medium text-white transition hover:bg-amber-800"
            >
              Сохранить изменения
            </button>

            <Link
              href="/admin"
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Отмена
            </Link>

            <Link
              href={`/materials/${material.id}`}
              className="rounded-xl border border-stone-300 px-6 py-3 font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Открыть материал
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function SelectField({
  name,
  label,
  items,
  defaultValue,
}: {
  name: string;
  label: string;
  items: {
    id: number;
    name?: string;
    title?: string;
  }[];
  defaultValue: number | null;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>

      <select
        name={name}
        required
        defaultValue={defaultValue ?? ""}
        className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none transition focus:border-amber-700"
      >
        <option value="">Выберите значение</option>

        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name ?? item.title}
          </option>
        ))}
      </select>
    </div>
  );
}
