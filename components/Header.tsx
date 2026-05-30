import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const user = await getCurrentUser();

  let goals: Awaited<ReturnType<typeof prisma.goal.findMany>> = [];
  if (user) {
    try {
      goals = await prisma.goal.findMany({
        where: { isActive: true },
        include: {
          genres: { include: { genre: true } },
          topics: { include: { topic: true } },
          progress: { where: { userId: user.id } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      goals = [];
    }
  }

  const preparedGoals = goals.map((goal) => {
    const progress = goal.progress[0];

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      requiredMaterialsCount: goal.requiredMaterialsCount,
      currentProgress: progress?.currentProgress ?? 0,
      isCompleted: progress?.isCompleted ?? false,
      rewardReceived: progress?.rewardReceived ?? false,
      cardTitle: goal.cardTitle,
      genreNames: goal.genres.map((g) => g.genre.name),
      topicNames: goal.topics.map((t) => t.topic.name),
    };
  });

  return (
    <HeaderClient
      user={
        user
          ? { name: user.name, email: user.email, role: user.role }
          : null
      }
      goals={preparedGoals}
    />
  );
}
