"use client";

import { useEffect, useState } from "react";
import Mascot from "./Mascot";

const STORAGE_KEY = "legendarium_onboarding_done";

type Step = {
  message: string;
  mood: "happy" | "thinking" | "excited" | "sad" | "neutral";
  highlightId?: string;
  actionLabel: string;
};

const STEPS: Step[] = [
  {
    message:
      "Приветствую тебя, путник! Я — Мирон, архивариус. Всю жизнь я собирал легенды и предания народов России. Но однажды ураган унёс мои записи по всему свету...",
    mood: "sad",
    actionLabel: "Что случилось?",
  },
  {
    message:
      "Теперь мне нужна твоя помощь. Отправляйся в путь по регионам, читай легенды, выполняй задания — и вместе мы восстановим великий архив!",
    mood: "excited",
    actionLabel: "Я готов помочь!",
  },
  {
    message:
      "Начни с карты — здесь отмечены все регионы, где живут легенды. Нажми на любой регион, чтобы узнать его предания.",
    mood: "thinking",
    highlightId: "nav-map",
    actionLabel: "Понятно, дальше",
  },
  {
    message:
      "В библиотеке собраны все материалы: легенды, сказки, мифы и обряды. Ищи по народу, региону или теме.",
    mood: "neutral",
    highlightId: "nav-library",
    actionLabel: "Понятно, дальше",
  },
  {
    message:
      "Задания помогут проверить, насколько хорошо ты запомнил прочитанное. За верные ответы я буду считать страницы архива восстановленными!",
    mood: "happy",
    highlightId: "nav-quests",
    actionLabel: "Понятно, дальше",
  },
  {
    message:
      "В профиле ты увидишь свой прогресс и коллекционные карточки. Ну что — в путь? Архив сам себя не восстановит!",
    mood: "excited",
    highlightId: "nav-profile",
    actionLabel: "Начать путь!",
  },
];

export default function OnboardingTour() {
  const [step, setStep] = useState<number | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      setTimeout(() => setStep(0), 800);
    }
  }, []);

  // Highlight nav item
  useEffect(() => {
    if (step === null) return;
    const currentStep = STEPS[step];
    if (!currentStep?.highlightId) return;

    const el = document.getElementById(currentStep.highlightId);
    if (el) {
      el.classList.add("onboarding-highlight");
      return () => el.classList.remove("onboarding-highlight");
    }
  }, [step]);

  function handleNext() {
    if (step === null) return;
    if (step >= STEPS.length - 1) {
      finish();
    } else {
      setStep(step + 1);
    }
  }

  function finish() {
    setClosing(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "1");
      setStep(null);
      setClosing(false);
    }, 400);
  }

  if (step === null) return null;

  const current = STEPS[step];

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/55 backdrop-blur-sm transition-opacity duration-400",
          closing ? "opacity-0" : "opacity-100",
        ].join(" ")}
        onClick={finish}
      />

      {/* Full-body illustration on first step */}
      {step === 0 && (
        <div
          className={[
            "fixed bottom-0 left-48 z-50 pointer-events-none transition-all duration-500",
            closing ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0",
          ].join(" ")}
        >
          <img
            src="/images/miron-full.png"
            alt="Архивариус Мирон"
            className="h-[420px] w-auto drop-shadow-2xl"
          />
        </div>
      )}

      {/* Mascot panel */}
      <div
        className={[
          "fixed bottom-6 left-6 z-50 pointer-events-none transition-all duration-400",
          closing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
        ].join(" ")}
      >
        <div className="pointer-events-auto">
          {/* Step dots */}
          <div className="mb-3 ml-[76px] flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={[
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-5 bg-[#d8a342]"
                    : i < step
                      ? "w-1.5 bg-[#d8a342]/50"
                      : "w-1.5 bg-white/20",
                ].join(" ")}
              />
            ))}
          </div>

          <Mascot
            message={current.message}
            mood={current.mood}
            showClose
            onClose={finish}
            action={{
              label: current.actionLabel,
              onClick: handleNext,
            }}
            secondaryAction={
              step > 0
                ? { label: "Пропустить", onClick: finish }
                : undefined
            }
          />
        </div>
      </div>
    </>
  );
}
