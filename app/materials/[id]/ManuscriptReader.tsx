"use client";

import { useState, useRef, useEffect } from "react";

const CHARS_PER_PAGE = 760;

function splitIntoPages(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (paragraphs.length === 0) return [text.trim()];

  const pages: string[] = [];
  let current: string[] = [];
  let len = 0;

  for (const para of paragraphs) {
    if (current.length && len + para.length > CHARS_PER_PAGE) {
      pages.push(current.join("\n\n"));
      current = [para];
      len = para.length;
    } else {
      current.push(para);
      len += para.length;
    }
  }
  if (current.length) pages.push(current.join("\n\n"));
  return pages.length > 0 ? pages : [text.trim()];
}

type Phase = "idle" | "out" | "in";

export default function ManuscriptReader({ text }: { text: string }) {
  const pages = splitIntoPages(text);
  const total = pages.length;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  function goTo(target: number, direction: "next" | "prev") {
    if (phase !== "idle" || target < 0 || target >= total || target === index) return;

    setDir(direction);
    setPhase("out");
    timerRef.current = setTimeout(() => {
      setIndex(target);
      setPhase("in");
      timerRef.current = setTimeout(() => setPhase("idle"), 280);
    }, 280);
  }

  function navigate(direction: "next" | "prev") {
    goTo(direction === "next" ? index + 1 : index - 1, direction);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const flipClass =
    phase === "out" ? (dir === "next" ? "manuscript-flip-out-next" : "manuscript-flip-out-prev")
    : phase === "in" ? (dir === "next" ? "manuscript-flip-in-next" : "manuscript-flip-in-prev")
    : "";

  const paragraphs = pages[index].split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const [first, ...rest] = paragraphs;
  const isFirstPage = index === 0;

  return (
    <div className="manuscript-book">
      <div className={`manuscript-leaf ${flipClass}`}>
        <div className="manuscript-leaf-inner">
          {isFirstPage ? (
            <p className="manuscript-paragraph">
              <span className="manuscript-drop-cap">{first.charAt(0)}</span>
              {first.slice(1)}
            </p>
          ) : (
            <p className="manuscript-paragraph">{first}</p>
          )}

          {rest.map((para, i) => (
            <div key={i}>
              <div className="manuscript-divider" aria-hidden>
                <span className="manuscript-divider-line" />
                <span className="manuscript-divider-glyph">❦</span>
                <span className="manuscript-divider-line" />
              </div>
              <p className="manuscript-paragraph">{para}</p>
            </div>
          ))}
        </div>

        {total > 1 && <div className="manuscript-page-number">{index + 1} / {total}</div>}
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("prev")}
            disabled={index === 0 || phase !== "idle"}
            className="flex items-center gap-2 rounded-2xl border border-[#dccab3] bg-white px-5 py-2.5 text-sm font-extrabold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a342] hover:text-[#9f661f] disabled:pointer-events-none disabled:opacity-35"
          >
            <span className="text-base leading-none">←</span>
            Назад
          </button>

          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > index ? "next" : "prev")}
                aria-label={`Страница ${i + 1}`}
                className={[
                  "rounded-full transition-all duration-200",
                  i === index
                    ? "h-2 w-5 bg-[#d8a342]"
                    : "h-2 w-2 bg-stone-300 hover:bg-[#d8a342]/50",
                ].join(" ")}
              />
            ))}
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
      )}
    </div>
  );
}
