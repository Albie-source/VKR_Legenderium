import { prisma } from "@/lib/prisma";
import MapClient from "./MapClient";

export default async function MapPage() {
  const regions = await prisma.region.findMany({
    include: {
      materials: {
        where: {
          status: "PUBLISHED",
        },
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
        orderBy: {
          title: "asc",
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  const materials = await prisma.material.findMany({
    where: {
      status: "PUBLISHED",
    },
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
    orderBy: {
      title: "asc",
    },
  });

  const preparedRegions = regions.map((region) => ({
    id: region.id,
    name: region.name,
    description: region.description,
    materialsCount: region.materials.length,
  }));

  const preparedMaterials = materials.map((material) => ({
    id: material.id,
    title: material.title,
    shortDescription: material.shortDescription,
    latitude: material.latitude,
    longitude: material.longitude,
    imageUrl: material.imageUrl,
    region: {
      id: material.region.id,
      name: material.region.name,
    },
    people: {
      id: material.people.id,
      name: material.people.name,
    },
    genre: {
      id: material.genre.id,
      name: material.genre.name,
    },
    topics: material.topics.map(({ topic }) => ({
      id: topic.id,
      name: topic.name,
    })),
  }));

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900">
      <section className="relative overflow-hidden border-b border-stone-200 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(180,83,9,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(120,113,108,0.14),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-800">
            Интерактивная карта
          </p>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <h1 className="mb-5 text-5xl font-bold leading-tight">
                Фольклор народов России на карте
              </h1>

              <p className="max-w-3xl text-lg leading-8 text-stone-700">
                Карта помогает изучать фольклорные материалы через
                территориальную привязку. Выберите регион или точку на карте,
                чтобы открыть связанные легенды, сказки и мифы.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <HeroStat title="Материалов" value={materials.length} />
              <HeroStat title="Регионов" value={regions.length} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <MapClient regions={preparedRegions} materials={preparedMaterials} />
      </section>
    </main>
  );
}

function HeroStat({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="mb-1 text-sm text-stone-500">{title}</p>
      <p className="text-3xl font-bold text-stone-900">{value}</p>
    </div>
  );
}
