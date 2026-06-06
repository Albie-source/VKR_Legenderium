import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const YANDEX_TTS_URL =
  "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";

export async function POST(req: NextRequest) {
  const apiKey = process.env.YANDEX_TTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

  // Yandex SpeechKit limits: 5000 chars per request
  const truncated = text.slice(0, 5000);
  const textHash = crypto.createHash("sha256").update(truncated).digest("hex");

  // Return cached audio if available
  const cached = await prisma.ttsCache.findUnique({ where: { textHash } });
  if (cached) {
    return new NextResponse(cached.audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
      },
    });
  }

  const body = new URLSearchParams({
    text: truncated,
    lang: "ru-RU",
    voice: "zahar",
    speed: "0.85",
    emotion: "good",
    format: "mp3",
    sampleRateHertz: "48000",
  });

  const response = await fetch(YANDEX_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Yandex TTS error:", err);
    return NextResponse.json({ error: "TTS service error" }, { status: 502 });
  }

  const audioBuffer = await response.arrayBuffer();
  const audioBytes = Buffer.from(audioBuffer);

  // Save to cache (fire-and-forget — don't block the response)
  prisma.ttsCache.create({ data: { textHash, audio: audioBytes } }).catch(
    (err) => console.error("TTS cache write failed:", err),
  );

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
    },
  });
}
