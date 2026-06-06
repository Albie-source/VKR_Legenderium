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
    if (!audio) {
      loadAndPlay();
      return;
    }
    if (state === "playing") {
      audio.pause();
      setState("paused");
    } else {
      audio.play().then(() => setState("playing")).catch(() => setState("error"));
    }
  }

  function stop() {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setState("idle");
    setProgress(0);
  }

  const isLoading = state === "loading";

  return (
    <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#d8a342]/30 bg-[#07181c] px-5 py-4">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d8a342]/25 bg-[#d8a342]/10 text-[#d8a342]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9Zm0 1.5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm-1 4a.75.75 0 0 1 .375.102l4 2.5a.75.75 0 0 1 0 1.296l-4 2.5A.75.75 0 0 1 10 14.25v-5a.75.75 0 0 1 .75-.75Z" />
        </svg>
      </div>

      {/* Label + progress bar */}
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#d8a342]">
          Аудио-прочтение
        </p>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-[#d8a342] transition-all duration-300"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      {/* Play / Pause */}
      <button
        onClick={togglePlay}
        disabled={isLoading}
        title={state === "playing" ? "Пауза" : "Слушать"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[#fff8e8] transition hover:border-[#d8a342]/50 hover:bg-[#d8a342]/15 disabled:opacity-50"
      >
        {isLoading ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 animate-spin">
            <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
            <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
          </svg>
        ) : state === "playing" ? (
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

      {/* Stop */}
      {(state === "playing" || state === "paused") && (
        <button
          onClick={stop}
          title="Стоп"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-[#fff8e8] transition hover:border-red-500/40 hover:bg-red-500/10"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <rect x="5" y="5" width="14" height="14" rx="2" />
          </svg>
        </button>
      )}

      {state === "error" && (
        <span className="text-xs text-red-400">Ошибка озвучки</span>
      )}
    </div>
  );
}
