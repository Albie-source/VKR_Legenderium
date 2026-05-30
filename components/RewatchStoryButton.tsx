"use client";

import { useRouter } from "next/navigation";

export default function RewatchStoryButton() {
  const router = useRouter();

  function handleClick() {
    localStorage.removeItem("legendarium_cinema_done");
    localStorage.removeItem("legendarium_onboarding_done");
    window.dispatchEvent(new CustomEvent("legendarium:rewatch"));
    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-2xl border border-[#d8a342]/30 bg-[#d8a342]/10 px-4 py-2.5 text-sm font-bold text-[#f0bd5b] transition hover:bg-[#d8a342]/20"
    >
      <span>📜</span>
      Пересмотреть историю
    </button>
  );
}
