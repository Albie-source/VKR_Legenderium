import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const user = await getCurrentUser();

  const goals = user
    ? await prisma.goal.findMany({
        where: {
          isActive: true,
        },
        include: {
          genre: true,
          topic: true,
          progress: {
            where: {
              userId: user.id,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    : [];

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
      genreName: goal.genre.name,
      topicName: goal.topic.name,
    };
  });

  return (
    <HeaderClient
      user={
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
            }
          : null
      }
      goals={preparedGoals}
    />
  );
}
