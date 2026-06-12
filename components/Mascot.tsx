"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type MascotMood = "happy" | "thinking" | "excited" | "sad" | "neutral";

type MascotProps = {
  message: string;
  mood?: MascotMood;
  onClose?: () => void;
  showClose?: boolean;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
};

export default function Mascot({
  message,
  mood = "neutral",
  onClose,
  showClose = false,
  action,
  secondaryAction,
}: MascotProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const moodImage: Record<MascotMood, string> = {
    happy: "/images/miron-happy.png",
    thinking: "/images/miron-sad.png",
    excited: "/images/miron-happy.png",
    sad: "/images/miron-sad.png",
    neutral: "/images/miron-happy.png",
  };

  return (
    <div
      className={[
        "pointer-events-auto flex max-w-[calc(100vw-3rem)] items-end gap-3 transition-all duration-500 sm:max-w-sm",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
      ].join(" ")}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#d8a342]/60 bg-[#0b1f22] shadow-lg shadow-black/30">
          <Image
            src={moodImage[mood]}
            alt="Архивариус Мирон"
            fill
            sizes="64px"
            className="object-cover object-top"
          />
        </div>
        {/* Online dot */}
        <span className="absolute bottom-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-[#0b1f22] bg-emerald-400" />
      </div>

      {/* Bubble */}
      <div className="relative flex-1 rounded-[1.5rem] rounded-bl-sm border border-[#d8a342]/25 bg-[#0e2428] px-5 py-4 shadow-xl shadow-black/30">
        {/* Name */}
        <p className="mb-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#d8a342]">
          Архивариус Мирон
        </p>

        {/* Text */}
        <p className="text-sm leading-6 text-[#e8ddd0]">{message}</p>

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {action && (
              <button
                type="button"
                onClick={action.onClick}
                className="rounded-xl bg-[#d8a342] px-4 py-2 text-xs font-extrabold text-[#06151a] transition hover:bg-[#f0bd5b]"
              >
                {action.label}
              </button>
            )}
            {secondaryAction && (
              <button
                type="button"
                onClick={secondaryAction.onClick}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-[#cbbba7] transition hover:border-white/25 hover:text-[#fff8e8]"
              >
                {secondaryAction.label}
              </button>
            )}
          </div>
        )}

        {/* Close */}
        {showClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-[#9f9183] transition hover:bg-white/10 hover:text-[#fff8e8]"
            aria-label="Закрыть"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
