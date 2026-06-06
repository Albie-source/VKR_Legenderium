"use client";

import { useRef, useState, useEffect } from "react";

function formatTime(sec: number): string {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => { setPlaying(false); setCurrentTime(0); };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("loadedmetadata", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("loadedmetadata", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  }

  function toggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }

  function changeVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    const v = Number(e.target.value);
    if (audio) audio.volume = v;
    setVolume(v);
    if (v > 0 && muted) {
      if (audio) audio.muted = false;
      setMuted(false);
    }
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#d8a342]/30 bg-[#07181c]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Top label */}
      <div className="flex items-center gap-3 border-b border-white/8 px-5 py-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#d8a342]/25 bg-[#d8a342]/10 text-[#d8a342]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M12 3a9 9 0 1 1 0 18A9 9 0 0 1 12 3Zm-1 5.25v5.5l4.5-2.75-4.5-2.75Z" />
          </svg>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
          Аудиозапись
        </span>
        <span className="ml-auto text-xs font-semibold text-white/30">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Seek bar */}
      <div
        className="group relative h-1.5 cursor-pointer bg-white/8 transition hover:h-2.5"
        onClick={seek}
        aria-label="Перемотка"
      >
        <div
          className="h-full bg-gradient-to-r from-[#d8a342] to-[#f0bd5b] transition-all"
          style={{ width: `${progress}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-[#d8a342] bg-[#07181c] opacity-0 shadow-md transition group-hover:opacity-100"
          style={{ left: `${progress}%`, transform: `translateX(-50%) translateY(-50%)` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Play/pause */}
        <button
          onClick={togglePlay}
          aria-label={playing ? "Пауза" : "Воспроизвести"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d8a342] text-[#06151a] shadow-md transition hover:bg-[#f0bd5b] active:scale-95"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <rect x="6" y="5" width="4" height="14" rx="1.5" />
              <rect x="14" y="5" width="4" height="14" rx="1.5" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M8 5.14v14l11-7-11-7Z" />
            </svg>
          )}
        </button>

        {/* Volume icon + slider */}
        <button
          onClick={toggleMute}
          aria-label={muted || volume === 0 ? "Включить звук" : "Выключить звук"}
          className="flex h-8 w-8 shrink-0 items-center justify-center text-white/50 transition hover:text-[#d8a342]"
        >
          {muted || volume === 0 ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5">
              <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L21 19.94a.75.75 0 1 1-1.06 1.06l-3.92-3.92A7.5 7.5 0 0 1 12 18.5c-.9 0-1.62-.73-1.62-1.62V7.12L3.72 4.78a.75.75 0 0 1 0-1.06ZM13 5.5v6.38l-1.5-1.5V5.5h1.5ZM9 9.88V16.88c-.83 0-1.5-.67-1.5-1.5v-4.5c0-.83.67-1.5 1.5-1.5Z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.061Z" />
            </svg>
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.02}
          value={muted ? 0 : volume}
          onChange={changeVolume}
          aria-label="Громкость"
          className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#d8a342]"
        />
      </div>
    </div>
  );
}
