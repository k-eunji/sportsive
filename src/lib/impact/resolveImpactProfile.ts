// src/lib/impact/resolveImpactProfile.ts

import { SPORT_IMPACT_PRESETS } from "./presets";
import { ImpactProfile } from "./types";

export function resolveImpactProfile(event: any): ImpactProfile {
  const key =
    typeof event.sport === "string"
      ? event.sport.replace(/\s+/g, "_").toLowerCase()
      : "unknown";

  return (
    SPORT_IMPACT_PRESETS[key] ?? {
      type: "fixed",
      phases: [
        { offset: -60, duration: 60, weight: 0.5 },
      ],
      confidence: "low",
    }
  );
}
