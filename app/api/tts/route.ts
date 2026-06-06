import { NextRequest, NextResponse } from "next/server";

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

  const body = new URLSearchParams({
    text: truncated,
    lang: "ru-RU",
    voice: "zahar",   // мужской, глубокий — подходит для сказаний
    speed: "0.85",    // чуть медленнее для атмосферы
    emotion: "good",  // тёплая интонация
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

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
