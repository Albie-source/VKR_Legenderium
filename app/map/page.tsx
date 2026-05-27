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

  const preparedRegions = regions.map((region) => {
    const peoplesMap = new Map<number, string>();

    region.materials.forEach((material) => {
      peoplesMap.set(material.people.id, material.people.name);
    });

    return {
      id: region.id,
      name: region.name,
      description: region.description,
      peoples: Array.from(peoplesMap.entries()).map(([id, name]) => ({
        id,
        name,
      })),
      materials: region.materials.map((material) => ({
        id: material.id,
        title: material.title,
        shortDescription: material.shortDescription,
        latitude: material.latitude,
        longitude: material.longitude,
        imageUrl: material.imageUrl,
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
      })),
    };
  });

  return (
    <main className="legendarium-page overflow-hidden">
      <section className="mx-auto max-w-[1600px] px-6 py-6">
        <MapClient regions={preparedRegions} />
      </section>
    </main>
  );
}
