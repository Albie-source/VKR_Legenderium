"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const CHARS_PER_PAGE_FALLBACK = 760;

function splitIntoParagraphs(text: string): string[] {
  const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.length > 0 ? paragraphs : [text.trim()];
}

function fallbackPaginate(paragraphs: string[]): number[][] {
  const pages: number[][] = [];
  let current: number[] = [];
  let len = 0;

  paragraphs.forEach((para, i) => {
    if (current.length && len + para.length > CHARS_PER_PAGE_FALLBACK) {
      pages.push(current);
      current = [i];
      len = para.length;
    } else {
      current.push(i);
      len += para.length;
    }
  });
  if (current.length) pages.push(current);
  return pages.length > 0 ? pages : [[0]];
}

function pagesEqual(a: number[][], b: number[][]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].length !== b[i].length) return false;
    for (let j = 0; j < a[i].length; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
}

type Phase = "idle" | "out" | "in";

export default function ManuscriptReader({ text }: { text: string }) {
  const paragraphs = splitIntoParagraphs(text);

  const [pages, setPages] = useState<number[][]>(() => fallbackPaginate(paragraphs));
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leafRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [contentWidth, setContentWidth] = useState<number>();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useIsomorphicLayoutEffect(() => {
    const leaf = leafRef.current;
    if (!leaf) return;

    function recompute() {
      if (!leaf) return;
      const style = window.getComputedStyle(leaf);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = leaf.clientHeight - paddingY;
      if (available <= 0) return;

      const width = leaf.clientWidth - paddingX;
      if (width !== contentWidth) {
        // Measurer needs to re-render at the correct width before block
        // heights can be trusted — bail out, the effect re-runs once it does.
        setContentWidth(width);
        return;
      }

      const next: number[][] = [];
      let current: number[] = [];
      let used = 0;

      for (let i = 0; i < paragraphs.length; i++) {
        const height = blockRefs.current[i]?.offsetHeight ?? 0;
        if (current.length && used + height > available) {
          next.push(current);
          current = [i];
          used = height;
        } else {
          current.push(i);
          used += height;
        }
      }
      if (current.length) next.push(current);

      const computed = next.length > 0 ? next : [[0]];
      setPages((prev) => (pagesEqual(prev, computed) ? prev : computed));
    }

    recompute();

    const observer = new ResizeObserver(recompute);
    observer.observe(leaf);
    return () => observer.disconnect();
  }, [text, contentWidth]);

  const total = pages.length;
  const currentIndex = Math.min(index, total - 1);

  function goTo(target: number) {
    if (phase !== "idle" || target < 0 || target >= total || target === currentIndex) return;

    setPhase("out");
    timerRef.current = setTimeout(() => {
      setIndex(target);
      setPhase("in");
      timerRef.current = setTimeout(() => setPhase("idle"), 400);
    }, 400);
  }

  function navigate(direction: "next" | "prev") {
    goTo(direction === "next" ? currentIndex + 1 : currentIndex - 1);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft") navigate("prev");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const fragmentClass =
    phase === "out" ? "manuscript-fragment-out"
    : phase === "in" ? "manuscript-fragment-in"
    : "";

  const currentIndices = pages[currentIndex] ?? [0];
  const [firstIdx, ...restIdx] = currentIndices;
  const isVeryFirstParagraph = firstIdx === 0;

  return (
    <div className="manuscript-book">
      <div className="manuscript-leaf-frame">
        <div ref={leafRef} className={`manuscript-leaf ${fragmentClass}`}>
          <div className="manuscript-leaf-inner">
            {isVeryFirstParagraph ? (
              <p className="manuscript-paragraph">
                <span className="manuscript-drop-cap">{paragraphs[firstIdx].charAt(0)}</span>
                {paragraphs[firstIdx].slice(1)}
              </p>
            ) : (
              <p className="manuscript-paragraph">{paragraphs[firstIdx]}</p>
            )}

            {restIdx.map((pIdx) => (
              <div key={pIdx}>
                <div className="manuscript-divider" aria-hidden>
                  <span className="manuscript-divider-line" />
                  <span className="manuscript-divider-glyph">❦</span>
                  <span className="manuscript-divider-line" />
                </div>
                <p className="manuscript-paragraph">{paragraphs[pIdx]}</p>
              </div>
            ))}
          </div>

          {total > 1 && <div className="manuscript-page-number">{currentIndex + 1} / {total}</div>}
        </div>
      </div>

      <div className="manuscript-measure" aria-hidden>
        <div className="manuscript-leaf-inner" style={{ width: contentWidth }}>
          {paragraphs.map((para, i) => (
            <div key={i} ref={(el) => { blockRefs.current[i] = el; }}>
              {i > 0 && (
                <div className="manuscript-divider" aria-hidden>
                  <span className="manuscript-divider-line" />
                  <span className="manuscript-divider-glyph">❦</span>
                  <span className="manuscript-divider-line" />
                </div>
              )}
              {i === 0 ? (
                <p className="manuscript-paragraph">
                  <span className="manuscript-drop-cap">{para.charAt(0)}</span>
                  {para.slice(1)}
                </p>
              ) : (
                <p className="manuscript-paragraph">{para}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("prev")}
            disabled={currentIndex === 0 || phase !== "idle"}
            className="flex items-center gap-2 rounded-2xl border border-[#dccab3] bg-white px-5 py-2.5 text-sm font-extrabold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-[#d8a342] hover:text-[#9f661f] disabled:pointer-events-none disabled:opacity-35"
          >
            <span className="text-base leading-none">←</span>
            Назад
          </button>

          <div className="flex items-center gap-1.5">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Фрагмент ${i + 1}`}
                className={[
                  "rounded-full transition-all duration-200",
                  i === currentIndex
                    ? "h-2 w-5 bg-[#d8a342]"
                    : "h-2 w-2 bg-stone-300 hover:bg-[#d8a342]/50",
                ].join(" ")}
              />
            ))}
          </div>

          <button
            onClick={() => navigate("next")}
            disabled={currentIndex >= total - 1 || phase !== "idle"}
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
