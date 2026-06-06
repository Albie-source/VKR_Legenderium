"use client";

import { useRef, useState, useEffect } from "react";

function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) return "0:00";
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
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration);
    const onEnd = () => { setPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}); }
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
    if (audio) { audio.volume = v; if (v > 0 && muted) { audio.muted = false; setMuted(false); } }
    setVolume(v);
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8a342]/30 bg-[#07181c]">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-3.5">
        {/* Sound bars */}
        <div className={`sound-bars text-[#d8a342] ${playing ? "playing" : ""}`}>
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
          <div className="sound-bar" />
        </div>

        <span className="flex-1 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
          Аудиозапись
        </span>

        <span className="text-xs font-semibold tabular-nums text-white/40">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Mute */}
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

        {/* Play/pause */}
        <button
          onClick={togglePlay}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d8a342] text-[#06151a] shadow-md transition hover:bg-[#f0bd5b] active:scale-95"
        >
          {playing ? (
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

      {/* Seek bar */}
      <div
        className="group relative h-1 cursor-pointer bg-white/8 transition-all hover:h-2"
        onClick={seek}
      >
        <div
          className="h-full bg-gradient-to-r from-[#d8a342] to-[#f0bd5b] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
