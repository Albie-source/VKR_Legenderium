"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "legendarium_onboarding_done";

type Speaker = "miron" | "student";

type Beat = {
  scene: 1 | 2 | 3 | 4;
  speaker: Speaker;
  text: string;
  studentSprite: "curious" | "shocked" | "pledge" | "ready" | null;
  mironSprite: "happy" | "sad";
};

const BEATS: Beat[] = [
  {
    scene: 1,
    speaker: "miron",
    text: "Много лет я собирал это сокровище, мой юный друг. Каждый свиток — живая память народа. Легенды, сказания, обряды... всё, что передавалось из уст в уста тысячелетиями.",
    studentSprite: "curious",
    mironSprite: "happy",
  },
  {
    scene: 1,
    speaker: "student",
    text: "Неужели столько? Со всей России?",
    studentSprite: "curious",
    mironSprite: "happy",
  },
  {
    scene: 1,
    speaker: "miron",
    text: "Со всей огромной, необъятной России. Пока они здесь — они живы.",
    studentSprite: "curious",
    mironSprite: "happy",
  },
  {
    scene: 2,
    speaker: "miron",
    text: "Нет! Закрой окна! Свитки!",
    studentSprite: "shocked",
    mironSprite: "sad",
  },
  {
    scene: 2,
    speaker: "student",
    text: "Я не успеваю! Их слишком много!",
    studentSprite: "shocked",
    mironSprite: "sad",
  },
  {
    scene: 3,
    speaker: "miron",
    text: "Всё... Ветер разнёс записи по всей стране. Голоса народов — рассеяны как пыль.",
    studentSprite: null,
    mironSprite: "sad",
  },
  {
    scene: 3,
    speaker: "miron",
    text: "Я слишком стар, чтобы объехать всю Россию в поисках утерянного...",
    studentSprite: null,
    mironSprite: "sad",
  },
  {
    scene: 4,
    speaker: "student",
    text: "Тогда это сделаю я. Объеду все регионы, найду каждую легенду — и оцифрую. Ни один ураган больше не уничтожит память народа.",
    studentSprite: "pledge",
    mironSprite: "sad",
  },
  {
    scene: 4,
    speaker: "miron",
    text: "Но это... огромный путь...",
    studentSprite: "pledge",
    mironSprite: "sad",
  },
  {
    scene: 4,
    speaker: "student",
    text: "Ты собирал эти истории всю жизнь. Я сохраню их навсегда.",
    studentSprite: "ready",
    mironSprite: "sad",
  },
  {
    scene: 4,
    speaker: "miron",
    text: "Тогда — в путь. Легендариум ждёт тебя.",
    studentSprite: "ready",
    mironSprite: "happy",
  },
];

const SCENE_BG: Record<number, string> = {
  1: "/images/scene-library.jpg",
  2: "/images/scene-storm.jpg",
  3: "/images/scene-aftermath.jpg",
  4: "/images/scene-dawn.jpg",
};

const SCENE_TITLES: Record<number, string> = {
  1: "Великий архив",
  2: "Ураган",
  3: "Пустые полки",
  4: "Клятва",
};

const STUDENT_SPRITE: Record<string, string> = {
  curious: "/images/student-curious.png",
  shocked: "/images/student-shocked.png",
  pledge: "/images/student-pledge.png",
  ready: "/images/student-ready.png",
};

const MIRON_SPRITE: Record<string, string> = {
  happy: "/images/miron-happy.png",
  sad: "/images/miron-sad.png",
};

export default function OnboardingCinema() {
  const [beatIndex, setBeatIndex] = useState<number | null>(null);
  const [textVisible, setTextVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setBeatIndex(0), 700);
    }
  }, []);

  const finish = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setBeatIndex(null);
      setClosing(false);
    }, 600);
  }, []);

  const handleAdvance = useCallback(() => {
    setBeatIndex((cur) => {
      if (cur === null) return null;
      if (cur >= BEATS.length - 1) {
        finish();
        return cur;
      }
      setTextVisible(false);
      setTimeout(() => {
        setBeatIndex((c) => (c !== null ? c + 1 : null));
        setTextVisible(true);
      }, 160);
      return cur;
    });
  }, [finish]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleAdvance();
      }
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleAdvance, finish]);

  if (beatIndex === null) return null;

  const beat = BEATS[beatIndex];
  const prevScene = beatIndex > 0 ? BEATS[beatIndex - 1].scene : null;
  const sceneChanged = prevScene !== beat.scene;
  const isLast = beatIndex >= BEATS.length - 1;

  const speakerLabel = beat.speaker === "miron" ? "Архивариус Мирон" : "Ученик";
  const speakerColor = beat.speaker === "miron" ? "#d8a342" : "#3aa6a0";

  const studentActive = beat.speaker === "student";
  const mironActive = beat.speaker === "miron";

  return (
    <div
      className={[
        "fixed inset-0 z-50 cursor-pointer select-none transition-opacity duration-500",
        closing ? "opacity-0" : "opacity-100",
      ].join(" ")}
      onClick={handleAdvance}
    >
      {/* Background — key triggers fade-in on scene change */}
      <div
        key={`bg-${beat.scene}`}
        className="absolute inset-0 animate-fade-in bg-cover bg-center"
        style={{ backgroundImage: `url(${SCENE_BG[beat.scene]})` }}
      />

      {/* Bottom gradient for readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />

      {/* Scene title — fades in on new scene */}
      {sceneChanged && (
        <div
          key={`title-${beat.scene}`}
          className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 animate-fade-in-up"
        >
          <span className="rounded-full border border-white/25 bg-black/55 px-6 py-2.5 text-xs font-black uppercase tracking-[0.3em] text-white/65 backdrop-blur-sm">
            {SCENE_TITLES[beat.scene]}
          </span>
        </div>
      )}

      {/* Characters */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[148px] flex items-end justify-between px-6 sm:px-16 md:px-24">
        {/* Student — left */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: beat.studentSprite ? 1 : 0,
            filter: studentActive
              ? "brightness(1.08) drop-shadow(0 0 28px rgba(58,166,160,0.55))"
              : "brightness(0.4) saturate(0.45)",
            transform: studentActive
              ? "scale(1.04) translateY(-10px)"
              : "scale(1) translateY(0)",
          }}
        >
          {beat.studentSprite && (
            <img
              src={STUDENT_SPRITE[beat.studentSprite]}
              alt="Ученик"
              className="h-[50vh] max-h-[400px] w-auto object-contain"
            />
          )}
        </div>

        {/* Miron — right */}
        <div
          className="transition-all duration-500"
          style={{
            filter: mironActive
              ? "brightness(1.08) drop-shadow(0 0 28px rgba(216,163,66,0.55))"
              : "brightness(0.4) saturate(0.45)",
            transform: mironActive
              ? "scale(1.04) translateY(-10px)"
              : "scale(1) translateY(0)",
          }}
        >
          <img
            src={MIRON_SPRITE[beat.mironSprite]}
            alt="Архивариус Мирон"
            className="h-[50vh] max-h-[400px] w-auto object-contain"
          />
        </div>
      </div>

      {/* Dialog box */}
      <div
        className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-6 sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/15 bg-black/82 px-6 py-5 shadow-2xl backdrop-blur-lg">
          <p
            className="mb-2 text-xs font-black uppercase tracking-[0.26em]"
            style={{ color: speakerColor }}
          >
            {speakerLabel}
          </p>

          <p
            key={`text-${beatIndex}`}
            className={[
              "min-h-[3.5rem] text-[15px] leading-7 text-[#f0e8dc] transition-opacity duration-150 md:text-base md:leading-8",
              textVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            {beat.text}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
            {/* Scene progress */}
            <div className="flex items-center gap-1.5">
              {([1, 2, 3, 4] as const).map((s) => (
                <div
                  key={s}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: beat.scene === s ? "2rem" : "0.625rem",
                    background:
                      beat.scene > s
                        ? "rgba(216,163,66,0.4)"
                        : beat.scene === s
                          ? "#d8a342"
                          : "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  finish();
                }}
                className="cursor-pointer text-xs text-white/40 transition hover:text-white/70"
              >
                Пропустить
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isLast) {
                    finish();
                  } else {
                    setTextVisible(false);
                    setTimeout(() => {
                      setBeatIndex((cur) => (cur !== null ? cur + 1 : null));
                      setTextVisible(true);
                    }, 160);
                  }
                }}
                className="cursor-pointer rounded-xl bg-[#d8a342] px-5 py-2.5 text-sm font-extrabold text-[#06151a] transition hover:bg-[#f0bd5b] active:scale-95"
              >
                {isLast ? "В путь!" : "Далее →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
