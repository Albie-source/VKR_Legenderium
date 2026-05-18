import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const AUTH_COOKIE_NAME = "legendarium_user_id";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = Number(cookieStore.get(AUTH_COOKIE_NAME)?.value);

  if (Number.isNaN(userId)) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getAdminUser() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}

export async function requireAdmin() {
  const admin = await getAdminUser();

  if (!admin) {
    redirect("/login");
  }

  return admin;
}
