import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const YANDEX_TTS_URL =
  "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }

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

  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;
  const yandexKey = process.env.YANDEX_TTS_API_KEY;

  if (!elevenlabsKey && !yandexKey) {
    return NextResponse.json({ error: "TTS not configured" }, { status: 503 });
  }

  const audioBuffer = elevenlabsKey
    ? await synthesizeElevenLabs(truncated, elevenlabsKey)
    : await synthesizeYandex(truncated, yandexKey!);

  if (!audioBuffer) {
    return NextResponse.json({ error: "TTS service error" }, { status: 502 });
  }

  const audioBytes = Buffer.from(audioBuffer);

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

// ElevenLabs — neural, natural-sounding Russian
// Voice: "Liam" (pNInz6obpgDQGcFmaJgB) — deep, narrative male voice
// Model: eleven_multilingual_v2 — best for Russian
async function synthesizeElevenLabs(
  text: string,
  apiKey: string,
): Promise<ArrayBuffer | null> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.80,
          style: 0.35,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("ElevenLabs TTS error:", err);
    return null;
  }

  return response.arrayBuffer();
}

// Yandex SpeechKit v1 fallback
async function synthesizeYandex(
  text: string,
  apiKey: string,
): Promise<ArrayBuffer | null> {
  const body = new URLSearchParams({
    text,
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
    return null;
  }

  return response.arrayBuffer();
}
