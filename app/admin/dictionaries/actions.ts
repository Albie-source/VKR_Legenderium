"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dictionaryEntrySchema, sourceSchema } from "@/lib/schemas";

export async function createRegionAction(formData: FormData) {
  await requireAdmin();

  const result = dictionaryEntrySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!result.success) return;

  await prisma.region.create({
    data: {
      name: result.data.name,
      description: result.data.description,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createPeopleAction(formData: FormData) {
  await requireAdmin();

  const result = dictionaryEntrySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!result.success) return;

  await prisma.people.create({
    data: {
      name: result.data.name,
      description: result.data.description,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createGenreAction(formData: FormData) {
  await requireAdmin();

  const result = dictionaryEntrySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!result.success) return;

  await prisma.genre.create({
    data: {
      name: result.data.name,
      description: result.data.description,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createTopicAction(formData: FormData) {
  await requireAdmin();

  const result = dictionaryEntrySchema.safeParse({
    name: formData.get("name") ?? "",
    description: formData.get("description") ?? "",
  });

  if (!result.success) return;

  await prisma.topic.create({
    data: {
      name: result.data.name,
      description: result.data.description,
    },
  });

  revalidatePath("/admin/dictionaries");
}

export async function createSourceAction(formData: FormData) {
  await requireAdmin();

  const result = sourceSchema.safeParse({
    title: formData.get("title") ?? "",
    author: formData.get("author") ?? "",
    year: formData.get("year") ?? "",
    type: formData.get("type") ?? "",
    url: formData.get("url") ?? "",
  });

  if (!result.success) return;

  const data = result.data;

  await prisma.source.create({
    data: {
      title: data.title,
      author: data.author,
      year: data.year,
      type: data.type,
      url: data.url,
    },
  });

  revalidatePath("/admin/dictionaries");
}
