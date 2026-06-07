"use client";

import React, { useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";

const CHARS_PER_PAGE = 460;

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

// react-pageflip ships TS types that mark every setting as required, even though
// the library applies sensible defaults at runtime — cast to bypass that mismatch.
const FlipBook = HTMLFlipBook as unknown as React.ForwardRefExoticComponent<
  Record<string, unknown> & React.RefAttributes<{ pageFlip(): PageFlipApi }>
>;

type PageFlipApi = {
  flipNext(): void;
  flipPrev(): void;
  flip(page: number): void;
  getCurrentPageIndex(): number;
};

const Leaf = React.forwardRef<HTMLDivElement, { pageIndex: number; total: number; children: React.ReactNode }>(
  ({ pageIndex, total, children }, ref) => (
    <div className="manuscript-leaf" ref={ref}>
      <div className="manuscript-leaf-inner">{children}</div>
      {total > 1 && <div className="manuscript-page-number">{pageIndex + 1} / {total}</div>}
    </div>
  ),
);
Leaf.displayName = "ManuscriptLeaf";

function PageContent({ page, isFirstPage }: { page: string; isFirstPage: boolean }) {
  const paragraphs = page.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const [first, ...rest] = paragraphs;

  return (
    <>
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
    </>
  );
}

export default function ManuscriptReader({ text }: { text: string }) {
  const pages = splitIntoPages(text);
  const total = pages.length;

  const [index, setIndex] = useState(0);
  const bookRef = useRef<{ pageFlip(): PageFlipApi } | null>(null);

  function goPrev() {
    bookRef.current?.pageFlip().flipPrev();
  }

  function goNext() {
    bookRef.current?.pageFlip().flipNext();
  }

  function goTo(target: number) {
    bookRef.current?.pageFlip().flip(target);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="manuscript-book">
      <div className="manuscript-flip-wrap">
        <FlipBook
          width={420}
          height={580}
          size="stretch"
          minWidth={280}
          maxWidth={480}
          minHeight={386}
          maxHeight={662}
          showCover={false}
          usePortrait
          drawShadow
          flippingTime={650}
          maxShadowOpacity={0.35}
          startZIndex={10}
          autoSize
          startPage={0}
          mobileScrollSupport
          clickEventForward
          useMouseEvents
          swipeDistance={30}
          showPageCorners
          disableFlipByClick={false}
          className="manuscript-flipbook"
          style={{}}
          renderOnlyPageLengthChange={false}
          ref={bookRef}
          onFlip={(e: { data: number }) => setIndex(e.data)}
        >
          {pages.map((page, i) => (
            <Leaf key={i} pageIndex={i} total={total}>
              <PageContent page={page} isFirstPage={i === 0} />
            </Leaf>
          ))}
        </FlipBook>
      </div>

      {total > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={index === 0}
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
            onClick={goNext}
            disabled={index >= total - 1}
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
