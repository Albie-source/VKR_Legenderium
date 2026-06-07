"use client";

import { useEffect, useRef, useState } from "react";

const AMBIENT_SRC = "/sounds/ambient-fire.mp3";
const AMBIENT_VOLUME = 0.18;
const BAR_COUNT = 40;
const SKIP_SECONDS = 10;
const RATES = [0.75, 1, 1.25, 1.5];

type State = "idle" | "loading" | "playing" | "paused" | "error";

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Deterministic pseudo-waveform so the bar pattern is stable across renders.
function barHeight(i: number): number {
  return 28 + 52 * Math.abs(Math.sin(i * 0.7) * Math.cos(i * 0.35));
}

export default function TtsPlayer({ text }: { text: string }) {
  const [state, setState] = useState<State>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const ambient = new Audio(AMBIENT_SRC);
    ambient.loop = true;
    ambient.volume = AMBIENT_VOLUME;
    ambientRef.current = ambient;

    return () => {
      audioRef.current?.pause();
      ambient.pause();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  function ambientPlay() {
    ambientRef.current?.play().catch(() => {});
  }

  function ambientPause() {
    ambientRef.current?.pause();
  }

  async function loadAndPlay() {
    setState("loading");
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("tts fetch failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audio.playbackRate = rate;
      audio.volume = muted ? 0 : volume;
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
      audio.addEventListener("durationchange", () => setDuration(audio.duration));
      audio.addEventListener("ended", () => {
        ambientPause();
        setState("idle");
        setCurrentTime(0);
      });

      ambientPlay();
      await audio.play();
      setState("playing");
    } catch {
      ambientPause();
      setState("error");
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) { loadAndPlay(); return; }
    if (state === "playing") {
      audio.pause();
      ambientPause();
      setState("paused");
    } else {
      ambientPlay();
      audio.play().then(() => setState("playing")).catch(() => setState("error"));
    }
  }

  function skip(delta: number) {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    audio.currentTime = Math.min(Math.max(audio.currentTime + delta, 0), audio.duration);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    audio.currentTime = fraction * audio.duration;
  }

  function changeRate(next: number) {
    setRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function toggleMute() {
    const audio = audioRef.current;
    const next = !muted;
    setMuted(next);
    if (audio) audio.muted = next;
  }

  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = Number(e.target.value);
    setVolume(v);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = v;
      if (v > 0 && muted) { audio.muted = false; setMuted(false); }
    }
  }

  const isPlaying = state === "playing";
  const isLoading = state === "loading";
  const isActive = state === "playing" || state === "paused";
  const progress = duration ? currentTime / duration : 0;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#d8a342]/25 bg-[#0e2227] px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={() => skip(-SKIP_SECONDS)}
          disabled={!isActive}
          title="Назад на 10 секунд"
          className="tts-skip-button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
            <path d="M15.5 5.5 8 12l7.5 6.5z" />
          </svg>
          10
        </button>

        <button
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? "Пауза" : "Слушать"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#d8a342] text-[#06151a] shadow-md transition hover:bg-[#f0bd5b] active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 translate-x-0.5">
              <path d="M8 5.14v14l11-7-11-7Z" />
            </svg>
          )}
        </button>

        <button
          onClick={() => skip(SKIP_SECONDS)}
          disabled={!isActive}
          title="Вперёд на 10 секунд"
          className="tts-skip-button"
        >
          10
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
            <path d="m8.5 5.5 7.5 6.5-7.5 6.5z" />
          </svg>
        </button>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="font-black uppercase tracking-[0.2em] text-[#d8a342]">
            Озвучка легенды
          </span>
          {state === "error" && (
            <span className="font-semibold text-red-400">Ошибка озвучки</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums text-white/40">
            {formatTime(currentTime)}
          </span>

          <div className={`tts-bar-track ${isPlaying ? "playing" : ""}`} onClick={seek}>
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <span
                key={i}
                className={`tts-bar ${i / BAR_COUNT < progress ? "played" : ""}`}
                style={{ height: `${barHeight(i)}%`, "--bar-delay": `${(i % 7) * 0.09}s` } as React.CSSProperties}
              />
            ))}
          </div>

          <span className="w-9 shrink-0 text-xs font-semibold tabular-nums text-white/40">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 text-xs font-bold text-white/50">
          {RATES.map((r) => (
            <button
              key={r}
              onClick={() => changeRate(r)}
              className={`rounded-lg px-2 py-1 transition ${
                rate === r ? "bg-[#d8a342] text-[#06151a]" : "hover:text-[#fff8e8]"
              }`}
            >
              {r}×
            </button>
          ))}
        </div>

        <button onClick={toggleMute} className="text-white/40 transition hover:text-[#d8a342]">
          {muted || volume === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L19.5 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L19.5 10.94l-1.72-1.72Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            </svg>
          )}
        </button>

        <input
          type="range" min={0} max={1} step={0.02}
          value={muted ? 0 : volume}
          onChange={changeVolume}
          className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#d8a342]"
        />
      </div>
    </div>
  );
}
