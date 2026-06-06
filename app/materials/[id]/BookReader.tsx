"use client";

import { useState, useRef, useEffect } from "react";

const CHARS_PER_PAGE = 900;

function splitIntoPages(text: string): string[] {
  const paragraphs = text.split(/\n+/).filter((p) => p.trim());
  if (paragraphs.length === 0) return [text.trim()];

  const pages: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const addition = current ? "\n\n" + para : para;
    if (current && current.length + addition.length > CHARS_PER_PAGE) {
      pages.push(current.trim());
      current = para;
    } else {
      current += addition;
    }
  }
  if (current.trim()) pages.push(current.trim());
  return pages.length > 0 ? pages : [text.trim()];
}

type FlipPhase = "idle" | "out-next" | "out-prev";

export default function BookReader({ text }: { text: string }) {
  const pages = splitIntoPages(text);
  const total = pages.length;
  const totalSpreads = Math.ceil(total / 2);

  const [spread, setSpread] = useState(0);
  const [phase, setPhase] = useState<FlipPhase>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function navigate(dir: "next" | "prev") {
    if (phase !== "idle") return;
    if (dir === "next" && spread >= totalSpreads - 1) return;
    if (dir === "prev" && spread <= 0) return;

    setPhase(dir === "next" ? "out-next" : "out-prev");
    timerRef.current = setTimeout(() => {
      setSpread((s) => (dir === "next" ? s + 1 : s - 1));
      setPhase("idle");
    }, 420);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const leftIdx = spread * 2;
  const rightIdx = spread * 2 + 1;
  const leftText = pages[leftIdx] ?? "";
  const rightText = pages[rightIdx] ?? null;

  const flipClass =
    phase === "out-next" ? "book-spread-flip-next"
    : phase === "out-prev" ? "book-spread-flip-prev"
    : "";

  if (total <= 1) {
    return (
      <div className="book-page-surface">
        <p className="whitespace-pre-line text-lg leading-9 text-stone-800">{text}</p>
      </div>
    );
  }

  const canPrev = spread > 0;
  const canNext = spread < totalSpreads - 1;

  return (
    <div className="book-reader-root" onKeyDown={() => {}}>
      {/* Open book */}
      <div className={`book-spread ${flipClass}`}>

        {/* Left page */}
        <div className="book-page book-page-left">
          <div className="book-lines-overlay" />
          <div className="mb-5 flex items-center gap-2">
            <div className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, rgba(180,107,31,0.3))" }} />
            <span style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(180,107,31,0.55)" }}>
              {leftIdx + 1}
            </span>
          </div>
          <p className="book-page-text">{leftText}</p>
          <div className="book-page-shadow-right" />
        </div>

        {/* Spine */}
        <div className="book-spine">
          <div className="book-spine-inner" />
        </div>

        {/* Right page */}
        <div className="book-page book-page-right">
          <div className="book-lines-overlay" />
          {rightText ? (
            <>
              <div className="mb-5 flex items-center gap-2">
                <span style={{ fontSize: "9px", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(180,107,31,0.55)" }}>
                  {rightIdx + 1}
                </span>
                <div className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, rgba(180,107,31,0.3))" }} />
              </div>
              <p className="book-page-text">{rightText}</p>
            </>
          ) : (
            <div className="book-page-blank">
              <svg viewBox="0 0 80 80" width="60" height="60" style={{ opacity: 0.12 }}>
                <circle cx="40" cy="40" r="30" stroke="#c8964a" strokeWidth="2" fill="none" />
                <path d="M28 40 L40 28 L52 40 L40 52 Z" stroke="#c8964a" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
          )}
          <div className="book-page-shadow-left" />
        </div>
      </div>

      {/* Page corner curl hint on right page */}
      {canNext && <div className="book-corner-hint" />}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("prev")}
          disabled={!canPrev || phase !== "idle"}
          className="book-nav-btn"
          style={!canPrev || phase !== "idle" ? { opacity: 0.35, pointerEvents: "none" } : {}}
        >
          <span>←</span> Назад
        </button>

        {/* Page dots */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#78716c" }}>
            {leftIdx + 1}–{Math.min(rightIdx + 1, total)} из {total}
          </span>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {Array.from({ length: totalSpreads }, (_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (phase !== "idle" || i === spread) return;
                  const dir = i > spread ? "next" : "prev";
                  setPhase(dir === "next" ? "out-next" : "out-prev");
                  timerRef.current = setTimeout(() => {
                    setSpread(i);
                    setPhase("idle");
                  }, 420);
                }}
                style={{
                  borderRadius: "9999px",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  width: i === spread ? "20px" : "8px",
                  height: "8px",
                  background: i === spread ? "#d8a342" : "#d6d3d1",
                }}
                aria-label={`Разворот ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("next")}
          disabled={!canNext || phase !== "idle"}
          className="book-nav-btn"
          style={!canNext || phase !== "idle" ? { opacity: 0.35, pointerEvents: "none" } : {}}
        >
          Вперёд <span>→</span>
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: "12px", fontSize: "11px", color: "#a8a29e" }}>
        Используйте стрелки ← → на клавиатуре
      </p>
    </div>
  );
}
