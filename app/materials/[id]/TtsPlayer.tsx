"use client";

import { useEffect, useRef, useState } from "react";

const AMBIENT_SRC = "/sounds/ambient-fire.mp3";
const AMBIENT_VOLUME = 0.18;
const VIS_BAR_COUNT = 7;

type State = "idle" | "loading" | "playing" | "paused" | "error";

export default function TtsPlayer({ text }: { text: string }) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
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
      audioRef.current = audio;

      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      });
      audio.addEventListener("ended", () => {
        ambientPause();
        setState("idle");
        setProgress(0);
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

  function stop() {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
    ambientPause();
    setState("idle");
    setProgress(0);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  }

  const isPlaying = state === "playing";
  const isLoading = state === "loading";
  const isActive = state === "playing" || state === "paused";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[#d8a342]/30 bg-[#07181c] p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
          Озвучка
        </span>
        {state === "error" && (
          <span className="text-[11px] font-semibold text-red-400">Ошибка озвучки</span>
        )}
      </div>

      {/* Player "screen" — animated equalizer */}
      <div className={`tts-screen aspect-square w-full p-4 ${isPlaying ? "playing" : ""}`}>
        {Array.from({ length: VIS_BAR_COUNT }).map((_, i) => (
          <div key={i} className="tts-vis-bar" />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="group relative h-1.5 cursor-pointer rounded-full bg-white/8 transition-all hover:h-2"
        onClick={seek}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#d8a342] to-[#f0bd5b] transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {isActive && (
          <button
            onClick={stop}
            title="Стоп"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/60 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        )}

        <button
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? "Пауза" : "Слушать"}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8a342] text-[#06151a] shadow-md transition hover:bg-[#f0bd5b] active:scale-95 disabled:opacity-50"
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
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5.14v14l11-7-11-7Z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
