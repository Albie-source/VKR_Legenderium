"use client";

import { useEffect, useState } from "react";
import Mascot, { type MascotMood } from "./Mascot";

type MascotHintProps = {
  storageKey: string;
  message: string;
  mood?: MascotMood;
  delay?: number;
};

export default function MascotHint({
  storageKey,
  message,
  mood = "neutral",
  delay = 1200,
}: MascotHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Не показывать, если онбординг ещё не пройден
    const onboardingDone = localStorage.getItem("legendarium_onboarding_done");
    if (!onboardingDone) return;

    const dismissed = localStorage.getItem(storageKey);
    if (dismissed) return;

    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [storageKey, delay]);

  function handleClose() {
    localStorage.setItem(storageKey, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-30 pointer-events-none">
      <div className="pointer-events-auto">
        <Mascot
          message={message}
          mood={mood}
          showClose
          onClose={handleClose}
          action={{ label: "Понятно!", onClick: handleClose }}
        />
      </div>
    </div>
  );
}
