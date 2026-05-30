"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "legendarium_cinema_done";

type Speaker = "miron" | "student";

type Beat = {
  scene: 1 | 2 | 3 | 4;
  speaker: Speaker;
  text: string;
  studentSprite: "curious" | "shocked" | "pledge" | "ready" | null;
  mironMood: "happy" | "sad";
};

const BEATS: Beat[] = [
  { scene: 1, speaker: "miron",   text: "Много лет я собирал это сокровище, мой юный друг. Каждый свиток — живая память народа. Легенды, сказания, обряды... всё, что передавалось из уст в уста тысячелетиями.", studentSprite: "curious", mironMood: "happy" },
  { scene: 1, speaker: "student", text: "Неужели столько? Со всей России?",                                                                                                                                           studentSprite: "curious", mironMood: "happy" },
  { scene: 1, speaker: "miron",   text: "Со всей огромной, необъятной России. Пока они здесь — они живы.",                                                                                                            studentSprite: "curious", mironMood: "happy" },
  { scene: 2, speaker: "miron",   text: "Нет! Закрой окна! Свитки!",                                                                                                                                                  studentSprite: "shocked", mironMood: "sad"   },
  { scene: 2, speaker: "student", text: "Я не успеваю! Их слишком много!",                                                                                                                                            studentSprite: "shocked", mironMood: "sad"   },
  { scene: 3, speaker: "miron",   text: "Всё... Ветер разнёс записи по всей стране. Голоса народов — рассеяны как пыль.",                                                                                             studentSprite: null,      mironMood: "sad"   },
  { scene: 3, speaker: "miron",   text: "Я слишком стар, чтобы объехать всю Россию в поисках утерянного...",                                                                                                          studentSprite: null,      mironMood: "sad"   },
  { scene: 4, speaker: "student", text: "Тогда это сделаю я. Объеду все регионы, найду каждую легенду — и оцифрую. Ни один ураган больше не уничтожит память народа.",                                               studentSprite: "pledge",  mironMood: "sad"   },
  { scene: 4, speaker: "miron",   text: "Но это... огромный путь...",                                                                                                                                                 studentSprite: "pledge",  mironMood: "sad"   },
  { scene: 4, speaker: "student", text: "Ты собирал эти истории всю жизнь. Я сохраню их навсегда.",                                                                                                                   studentSprite: "ready",   mironMood: "sad"   },
  { scene: 4, speaker: "miron",   text: "Тогда — в путь. Легендариум ждёт тебя.",                                                                                                                                     studentSprite: "ready",   mironMood: "happy" },
];

const SCENE_BG: Record<number, string> = {
  1: "/images/scene-library.png",
  2: "/images/scene-storm.png",
  3: "/images/scene-aftermath.png",
  4: "/images/scene-dawn.png",
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

type OnboardingCinemaProps = {
  autoStart?: boolean;
  onFinish?: () => void;
};

export default function OnboardingCinema({ autoStart = true, onFinish }: OnboardingCinemaProps) {
  const [beatIndex, setBeatIndex] = useState<number | null>(null);
  const [textVisible, setTextVisible] = useState(true);
  const [closing, setClosing] = useState(false);
  const [muted, setMuted] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Two-layer background crossfade
  const [baseBg, setBaseBg] = useState<number>(1);
  const [incomingBg, setIncomingBg] = useState<number | null>(null);

  // Audio refs
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const stormRef   = useRef<HTMLAudioElement | null>(null);
  const pageRef    = useRef<HTMLAudioElement | null>(null);
  const audioStarted = useRef(false);
  const mutedRef   = useRef(false);

  // Init audio elements once
  useEffect(() => {
    if (typeof window === "undefined") return;
    ambientRef.current = new Audio("/sounds/onboarding-ambient.mp3");
    ambientRef.current.loop = true;

    stormRef.current = new Audio("/sounds/onboarding-storm.mp3");
    stormRef.current.loop = true;
    stormRef.current.volume = 0;

    pageRef.current = new Audio("/sounds/onboarding-page.mp3");

    return () => {
      ambientRef.current?.pause();
      stormRef.current?.pause();
    };
  }, []);

  // Typewriter effect — runs on every beat change
  useEffect(() => {
    if (beatIndex === null) return;
    const fullText = BEATS[beatIndex].text;
    setDisplayedText("");
    if (typewriterRef.current) clearInterval(typewriterRef.current);
    let i = 0;
    typewriterRef.current = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) clearInterval(typewriterRef.current!);
    }, 28);
    return () => { if (typewriterRef.current) clearInterval(typewriterRef.current); };
  }, [beatIndex]);

  // Adjust volumes when scene changes or mute toggles
  useEffect(() => {
    if (!audioStarted.current) return;
    const isStorm = beatIndex !== null && BEATS[beatIndex]?.scene === 2;
    const m = mutedRef.current;
    if (ambientRef.current) ambientRef.current.volume = m ? 0 : (isStorm ? 0.12 : 0.38);
    if (stormRef.current)   stormRef.current.volume   = m ? 0 : (isStorm ? 0.52 : 0);
  }, [beatIndex, muted]);

  function startAudio() {
    if (audioStarted.current) return;
    audioStarted.current = true;
    if (!mutedRef.current) {
      ambientRef.current?.play().catch(() => {});
      stormRef.current?.play().catch(() => {});
    }
  }

  function playPage() {
    if (mutedRef.current || !pageRef.current) return;
    pageRef.current.currentTime = 0;
    pageRef.current.volume = 0.45;
    pageRef.current.play().catch(() => {});
  }

  function toggleMute() {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    const isStorm = beatIndex !== null && BEATS[beatIndex]?.scene === 2;
    if (ambientRef.current) ambientRef.current.volume = next ? 0 : (isStorm ? 0.12 : 0.38);
    if (stormRef.current)   stormRef.current.volume   = next ? 0 : (isStorm ? 0.52 : 0);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (autoStart && !localStorage.getItem(STORAGE_KEY)) {
      setTimeout(() => setBeatIndex(0), 700);
    }
  }, [autoStart]);

  // Crossfade background when scene changes
  useEffect(() => {
    if (beatIndex === null) return;
    const scene = BEATS[beatIndex].scene;
    if (scene === baseBg) return;

    setIncomingBg(scene);
    const t = setTimeout(() => {
      setBaseBg(scene);
      setIncomingBg(null);
    }, 420);
    return () => clearTimeout(t);
  }, [beatIndex, baseBg]);

  const finish = useCallback(() => {
    ambientRef.current?.pause();
    stormRef.current?.pause();
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setBeatIndex(null);
      setClosing(false);
      onFinish?.();
    }, 600);
  }, [onFinish]);

  const handleAdvance = useCallback(() => {
    if (beatIndex === null) return;
    startAudio();

    // If typewriter still running — skip to full text
    const fullText = BEATS[beatIndex].text;
    if (displayedText.length < fullText.length) {
      if (typewriterRef.current) clearInterval(typewriterRef.current);
      setDisplayedText(fullText);
      return;
    }

    playPage();
    if (beatIndex >= BEATS.length - 1) {
      finish();
      return;
    }
    setTextVisible(false);
    setTimeout(() => {
      setBeatIndex(beatIndex + 1);
      setTextVisible(true);
    }, 160);
  }, [beatIndex, displayedText, finish]); // eslint-disable-line react-hooks/exhaustive-deps

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
      {/* Base background — always visible, never unmounts */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${SCENE_BG[baseBg]})` }}
      />

      {/* Incoming background — fades in on top when scene changes */}
      {incomingBg !== null && (
        <div
          key={incomingBg}
          className="absolute inset-0 animate-fade-in bg-cover bg-center"
          style={{ backgroundImage: `url(${SCENE_BG[incomingBg]})` }}
        />
      )}

      {/* Bottom gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />

      {/* Scene title */}
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
              className="h-[44vh] max-h-[350px] w-auto object-contain"
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
            src={`/images/miron-${beat.mironMood}.png`}
            alt="Архивариус Мирон"
            className="h-[44vh] max-h-[350px] w-auto object-contain"
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
            className={[
              "min-h-[3.5rem] text-[15px] leading-7 text-[#f0e8dc] transition-opacity duration-150 md:text-base md:leading-8",
              textVisible ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            {displayedText}
          </p>

          <div className="mt-4 flex items-center justify-between gap-4">
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
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="cursor-pointer text-lg text-white/40 transition hover:text-white/70"
                aria-label={muted ? "Включить звук" : "Выключить звук"}
              >
                {muted ? "🔇" : "🔊"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); finish(); }}
                className="cursor-pointer text-xs text-white/40 transition hover:text-white/70"
              >
                Пропустить
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAdvance(); }}
                className="cursor-pointer rounded-xl bg-[#d8a342] px-5 py-2.5 text-sm font-extrabold text-[#06151a] transition hover:bg-[#f0bd5b] active:scale-95"
              >
                {isLast ? "В путь!" : "Далее"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
