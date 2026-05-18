"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createRegionAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.region.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createPeopleAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.people.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createGenreAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.genre.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createTopicAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return;
  }

  await prisma.topic.create({
    data: {
      name,
      description: description || null,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createSourceAction(formData: FormData) {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim();
  const yearValue = String(formData.get("year") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();

  if (!title) {
    return;
  }

  await prisma.source.create({
    data: {
      title,
      author: author || null,
      year: yearValue ? Number(yearValue) : null,
      type: type || null,
      url: url || null,
    },
  });

  revalidatePath("/admin/dictionaries");
}
