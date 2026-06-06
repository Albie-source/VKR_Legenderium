import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_PREFIXES = ["image/", "audio/", "video/"];

export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Неверный запрос" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Файл не выбран" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (максимум 50 МБ)" },
      { status: 400 }
    );
  }

  const isAllowed = ALLOWED_PREFIXES.some((prefix) =>
    file.type.startsWith(prefix)
  );
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Недопустимый тип файла" },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name).toLowerCase().slice(0, 10);
  const safeExt = /^\.[a-z0-9]+$/.test(ext) ? ext : "";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);
  } catch (err) {
    console.error("File upload error:", err);
    return NextResponse.json({ error: "Не удалось сохранить файл" }, { status: 500 });
  }

  return NextResponse.json({ url: `/uploads/${filename}` });
}
