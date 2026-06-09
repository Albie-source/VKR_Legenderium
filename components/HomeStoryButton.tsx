"use client";

import { useSyncExternalStore } from "react";

const CINEMA_KEY = "legendarium_cinema_done";

const emptySubscribe = () => () => {};

export default function HomeStoryButton() {
  // Render only on the client (avoids hydration mismatch)
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;

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
