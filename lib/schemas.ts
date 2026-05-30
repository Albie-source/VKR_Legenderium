import { z } from "zod";

function coerceId() {
  return z.coerce.number().int().positive();
}

function optionalStr() {
  return z
    .string()
    .nullable()
    .optional()
    .transform((v) => v?.trim() || null);
}

function optionalNum(min: number, max: number) {
  return z.preprocess(
    (v) => (String(v ?? "").trim() === "" ? null : Number(v)),
    z.number().min(min).max(max).nullable().optional()
  );
}

export const loginSchema = z.object({
  email: z.string().min(1).max(254),
  password: z.string().min(1).max(1024),
  next: z.string().max(2000).default(""),
});

export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(254),
  password: z.string().min(6).max(1024),
});

export const materialSchema = z.object({
  title: z.string().min(1).max(500),
  shortDescription: optionalStr(),
  fullText: optionalStr(),
  regionId: coerceId(),
  peopleId: coerceId(),
  genreId: coerceId(),
  sourceId: coerceId(),
  latitude: optionalNum(-90, 90),
  longitude: optionalNum(-180, 180),
  imageUrl: optionalStr(),
  audioUrl: optionalStr(),
  videoUrl: optionalStr(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
});

export const taskSchema = z.object({
  materialId: coerceId(),
  title: z.string().min(1).max(500),
  description: optionalStr(),
  question: z.string().min(1).max(2000),
  option1: z.string().min(1).max(500),
  option2: z.string().min(1).max(500),
  option3: optionalStr(),
  option4: optionalStr(),
  correctAnswer: z.string().min(1).max(500),
  explanation: optionalStr(),
  difficulty: optionalStr(),
});

export const goalSchema = z.object({
  title: z.string().min(1).max(500),
  description: optionalStr(),
  requiredMaterialsCount: z.coerce.number().int().positive().max(1000),
  cardTitle: z.string().min(1).max(500),
  cardImageUrl: optionalStr(),
  genreId: coerceId(),
  topicId: coerceId(),
});

export const dictionaryEntrySchema = z.object({
  name: z.string().min(1).max(500),
  description: optionalStr(),
});

export const sourceSchema = z.object({
  title: z.string().min(1).max(500),
  author: optionalStr(),
  year: optionalNum(0, 2100),
  type: optionalStr(),
  url: optionalStr(),
});
