"use client";

import { useEffect, useState } from "react";
import OnboardingCinema from "./OnboardingCinema";
import OnboardingTour from "./OnboardingTour";

const CINEMA_KEY = "legendarium_cinema_done";
const TOUR_KEY = "legendarium_onboarding_done";

type Phase = "cinema" | "tour" | "done";

export default function OnboardingFlow() {
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) {
      setPhase("done");
    } else if (localStorage.getItem(CINEMA_KEY)) {
      setPhase("tour");
    } else {
      setPhase("cinema");
    }

    const handleRewatch = () => setPhase("cinema");
    window.addEventListener("legendarium:rewatch", handleRewatch);
    return () => window.removeEventListener("legendarium:rewatch", handleRewatch);
  }, []);

  function onCinemaDone() {
    localStorage.setItem(CINEMA_KEY, "1");
    setTimeout(() => setPhase("tour"), 300);
  }

  function onTourDone() {
    setPhase("done");
  }

  if (phase === "cinema") {
    return <OnboardingCinema autoStart onFinish={onCinemaDone} />;
  }

  if (phase === "tour") {
    return <OnboardingTour autoStart={false} onFinish={onTourDone} />;
  }

  return null;
}
