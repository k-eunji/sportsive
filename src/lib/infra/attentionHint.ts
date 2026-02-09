// src/lib/infra/attentionHint.ts

import type { AttentionLevel } from "./attentionLevel";

export function getAttentionHint(level: AttentionLevel): string {
  switch (level) {
    case "high":
      return "This window may require additional coordination and on-site readiness.";
    case "medium":
      return "Increased activity expected. Monitor overlapping starts.";
    case "low":
    default:
      return "Activity within normal operating range.";
  }
}
