"use client";

import dynamic from "next/dynamic";
import type { RouteStop } from "./GoalMapClient";

const GoalMapClient = dynamic(() => import("./GoalMapClient"), { ssr: false });

export default function GoalMapWrapper(props: {
  stops: RouteStop[];
  isAuthenticated: boolean;
}) {
  return <GoalMapClient {...props} />;
}
