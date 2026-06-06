"use client";

import { useState, useRef, useEffect } from "react";

const CHARS_PER_PAGE = 1100;

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

type Phase = "idle" | "out" | "in";

export default function BookReader({ text }: { text: string }) {
  const pages = splitIntoPages(text);
  const total = pages.length;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function navigate(direction: "next" | "prev") {
    const next = direction === "next" ? index + 1 : index - 1;
    if (next < 0 || next >= total || phase !== "idle") return;

    setDir(direction);
    setPhase("out");

    timerRef.current = setTimeout(() => {
      setIndex(next);
      setPhase("in");
      timerRef.current = setTimeout(() => setPhase("idle"), 260);
    }, 260);
  }

  const animClass =
    phase === "out"
      ? dir === "next" ? "page-flip-out-next" : "page-flip-out-prev"
      : phase === "in"
        ? dir === "next" ? "page-flip-in-next" : "page-flip-in-prev"
        : "";

  if (total <= 1) {
    return (
      <div className="book-page-surface">
        <p className="whitespace-pre-line text-lg leading-9 text-stone-800">
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page */}
      <div className={`book-page-surface ${animClass}`}>
        {/* Decorative header */}
        <div className="mb-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8964a]/40 to-transparent" />
          <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b46b1f]/60">
            Страница {index + 1}
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#c8964a]/40 to-transparent" />
        </div>

        <p className="whitespace-pre-line text-lg leading-9 text-stone-800">
          {pages[index]}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("prev")}
          disabled={index === 0 || phase !== "idle"}
          className="flex items-center gap-2 rounded-2xl border border-[#dccab3] bg-white px-5 py-2.5 text-sm font-extrabold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a342] hover:text-[#9f661f] disabled:pointer-events-none disabled:opacity-35"
        >
          <span className="text-base leading-none">←</span>
          Назад
        </button>

        {/* Progress */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold text-stone-500">
            {index + 1} / {total}
          </span>
          <div className="flex items-center gap-1">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (phase !== "idle" || i === index) return;
                  navigate(i > index ? "next" : "prev");
                  // For direct jumps, just update index after a short delay
                  if (Math.abs(i - index) > 1) {
                    setDir(i > index ? "next" : "prev");
                    setPhase("out");
                    timerRef.current = setTimeout(() => {
                      setIndex(i);
                      setPhase("in");
                      timerRef.current = setTimeout(() => setPhase("idle"), 260);
                    }, 260);
                  }
                }}
                aria-label={`Перейти на страницу ${i + 1}`}
                className={[
                  "rounded-full transition-all duration-200",
                  i === index
                    ? "h-2 w-5 bg-[#d8a342]"
                    : "h-2 w-2 bg-stone-300 hover:bg-[#d8a342]/50",
                ].join(" ")}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate("next")}
          disabled={index >= total - 1 || phase !== "idle"}
          className="flex items-center gap-2 rounded-2xl border border-[#dccab3] bg-white px-5 py-2.5 text-sm font-extrabold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a342] hover:text-[#9f661f] disabled:pointer-events-none disabled:opacity-35"
        >
          Вперёд
          <span className="text-base leading-none">→</span>
        </button>
      </div>
    </div>
  );
}
