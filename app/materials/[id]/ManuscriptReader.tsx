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
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [contentWidth, setContentWidth] = useState<number>();

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useIsomorphicLayoutEffect(() => {
    const body = bodyRef.current;
    if (!body) return;

    function recompute() {
      if (!body) return;
      const style = window.getComputedStyle(body);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = body.clientHeight - paddingY;
      if (available <= 0) return;

      const width = body.clientWidth - paddingX;
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

    // Шрифты Manrope/Playfair грузятся асинхронно: при первом расчёте страниц
    // высота параграфов могла быть измерена с системным шрифтом-заменителем.
    // Как только браузер подгрузит и применит настоящий шрифт, пересчитываем
    // разбивку заново — иначе часть текста останется обрезанной контейнером.
    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) recompute();
      });
    }

    const observer = new ResizeObserver(recompute);
    observer.observe(body);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text, contentWidth]);

  const total = pages.length;
  const currentIndex = Math.min(index, total - 1);

  function goTo(target: number) {
    if (phase !== "idle" || target < 0 || target >= total || target === currentIndex) return;

    setPhase("out");
    timerRef.current = setTimeout(() => {
      setIndex(target);
      setPhase("in");
      timerRef.current = setTimeout(() => setPhase("idle"), 250);
    }, 200);
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

  const fadeClass =
    phase === "out" ? "manuscript-fade-out"
    : phase === "in" ? "manuscript-fade-in"
    : "";

  const currentIndices = pages[currentIndex] ?? [0];

  return (
    <div className="manuscript-card">
      {total > 1 && (
        <p className="manuscript-card-label">
          Страница <span>{currentIndex + 1}</span> из {total}
        </p>
      )}

      <div ref={bodyRef} className={`manuscript-card-body ${fadeClass}`}>
        {currentIndices.map((pIdx) => (
          <p key={pIdx} className="manuscript-paragraph">{paragraphs[pIdx]}</p>
        ))}
      </div>

      <div className="manuscript-measure" aria-hidden>
        <div style={{ width: contentWidth }}>
          {paragraphs.map((para, i) => (
            <p
              key={i}
              ref={(el) => { blockRefs.current[i] = el; }}
              className="manuscript-paragraph"
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("prev")}
            disabled={currentIndex === 0 || phase !== "idle"}
            className="manuscript-nav-button"
          >
            <span aria-hidden>←</span>
            Предыдущая
          </button>

          <button
            onClick={() => navigate("next")}
            disabled={currentIndex >= total - 1 || phase !== "idle"}
            className="manuscript-nav-button"
          >
            Следующая
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
