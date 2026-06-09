"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import OnboardingCinema from "./OnboardingCinema";
import OnboardingTour from "./OnboardingTour";

const CINEMA_KEY = "legendarium_cinema_done";
const TOUR_KEY = "legendarium_onboarding_done";

type Phase = "cinema" | "tour" | "done";

const emptySubscribe = () => () => {};

function readStoredPhase(): Phase {
  if (localStorage.getItem(TOUR_KEY)) return "done";
  if (localStorage.getItem(CINEMA_KEY)) return "tour";
  return "cinema";
}

export default function OnboardingFlow() {
  // null on the server / during hydration, then derived from localStorage
  const storedPhase = useSyncExternalStore<Phase | null>(
    emptySubscribe,
    readStoredPhase,
    () => null,
  );
  const [override, setOverride] = useState<Phase | null>(null);
  const phase = override ?? storedPhase;

  useEffect(() => {
    const handleRewatch = () => setOverride("cinema");
    window.addEventListener("legendarium:rewatch", handleRewatch);
    return () => window.removeEventListener("legendarium:rewatch", handleRewatch);
  }, []);

  function onCinemaDone() {
    localStorage.setItem(CINEMA_KEY, "1");
    setTimeout(() => setOverride("tour"), 300);
  }

  function onTourDone() {
    setOverride("done");
  }

  if (phase === "cinema") {
    return <OnboardingCinema autoStart onFinish={onCinemaDone} />;
  }

  if (phase === "tour") {
    return <OnboardingTour autoStart={false} onFinish={onTourDone} />;
  }

  return null;
}
