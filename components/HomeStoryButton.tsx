"use client";

import { useEffect, useState } from "react";

const CINEMA_KEY = "legendarium_cinema_done";

export default function HomeStoryButton() {
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    setSeen(Boolean(localStorage.getItem(CINEMA_KEY)));
  }, []);

  // Don't render until localStorage is read (avoids hydration mismatch)
  if (seen === null) return null;

  function handleClick() {
    localStorage.removeItem(CINEMA_KEY);
    localStorage.removeItem("legendarium_onboarding_done");
    window.dispatchEvent(new CustomEvent("legendarium:rewatch"));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-2xl border border-[#d8a342]/40 bg-[#d8a342]/12 px-5 py-3 text-sm font-extrabold text-[#f0bd5b] backdrop-blur transition hover:bg-[#d8a342]/22 hover:-translate-y-0.5"
    >
      📜 Пролог
    </button>
  );
}
