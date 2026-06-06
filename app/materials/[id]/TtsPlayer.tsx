"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "loading" | "playing" | "paused" | "error";

export default function TtsPlayer({ text }: { text: string }) {
  const [state, setState] = useState<State>("idle");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

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
        setState("idle");
        setProgress(0);
      });

      await audio.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) { loadAndPlay(); return; }
    if (state === "playing") {
      audio.pause();
      setState("paused");
    } else {
      audio.play().then(() => setState("playing")).catch(() => setState("error"));
    }
  }

  function stop() {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.currentTime = 0; }
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
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#d8a342]/30 bg-[#07181c]">
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Sound bars */}
        <div className={`sound-bars text-[#d8a342] ${isPlaying ? "playing" : ""}`}>
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
        </div>

        <span className="flex-1 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
          Озвучка текста
        </span>

        {state === "error" && (
          <span className="text-xs text-red-400">Ошибка озвучки</span>
        )}

        {/* Stop */}
        {isActive && (
          <button
            onClick={stop}
            title="Стоп"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/60 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
              <rect x="5" y="5" width="14" height="14" rx="2" />
            </svg>
          </button>
        )}

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          disabled={isLoading}
          title={isPlaying ? "Пауза" : "Слушать"}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8a342] text-[#06151a] shadow-md transition hover:bg-[#f0bd5b] active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 animate-spin">
              <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
              <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
            </svg>
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M8 5.14v14l11-7-11-7Z" />
            </svg>
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="group relative h-1 cursor-pointer bg-white/8 transition-all hover:h-2"
        onClick={seek}
      >
        <div
          className="h-full bg-gradient-to-r from-[#d8a342] to-[#f0bd5b] transition-all duration-300"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  );
}
