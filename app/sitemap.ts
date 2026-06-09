import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/library`, changeFrequency: "daily", priority: 0.8 },
    { url: `${APP_URL}/map`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${APP_URL}/quests`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${APP_URL}/goals`, changeFrequency: "weekly", priority: 0.6 },
  ];

  let materials, goals, tasks;
  try {
    [materials, goals, tasks] = await Promise.all([
      prisma.material.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, updatedAt: true },
      }),
      prisma.goal.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true },
      }),
      prisma.interactiveTask.findMany({
        where: {
          OR: [{ material: { is: null } }, { material: { status: "PUBLISHED" } }],
        },
        select: { id: true, updatedAt: true },
      }),
    ]);
  } catch (err) {
    // БД недоступна (например, во время сборки) — отдаём только статические страницы
    console.error("sitemap: database unreachable, falling back to static pages", err);
    return staticPages;
  }

  const materialPages: MetadataRoute.Sitemap = materials.map((material) => ({
    url: `${APP_URL}/materials/${material.id}`,
    lastModified: material.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const goalPages: MetadataRoute.Sitemap = goals.map((goal) => ({
    url: `${APP_URL}/goals/${goal.id}`,
    lastModified: goal.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const taskPages: MetadataRoute.Sitemap = tasks.map((task) => ({
    url: `${APP_URL}/quests/${task.id}`,
    lastModified: task.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...materialPages, ...goalPages, ...taskPages];
}
