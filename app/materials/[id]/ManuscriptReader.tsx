"use client";

import { useEffect, useRef, useState } from "react";

function splitParagraphs(text: string): string[] {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}

export default function ManuscriptReader({ text }: { text: string }) {
  const paragraphs = splitParagraphs(text);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onScroll() {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height - viewportH;

      if (total <= 0) {
        setProgress(1);
        return;
      }

      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(scrolled / total);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (paragraphs.length === 0) return null;

  const [first, ...rest] = paragraphs;
  const firstLetter = first.charAt(0);
  const restOfFirst = first.slice(1);

  return (
    <div className="manuscript-reader" ref={containerRef}>
      <div className="manuscript-progress-track">
        <div
          className="manuscript-progress-fill"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>

      <div className="manuscript-page">
        <p className="manuscript-paragraph">
          <span className="manuscript-drop-cap">{firstLetter}</span>
          {restOfFirst}
        </p>

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
    </div>
  );
}
