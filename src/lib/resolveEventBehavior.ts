// src/lib/resolveEventBehavior.ts

import type { Event } from "@/types";
import type { EventBehavior } from "@/lib/eventBehavior";

export function resolveEventBehavior(e: Event): EventBehavior {
  // 🏏 CRICKET
  if (e.sport === "cricket") {
    if (e.kind === "first_class") {
      return {
        timeModel: "day_span",
        showExactTime: false,
        hasClearEnd: false,
        movementProfile: "entry_peak",
      };
    }

    if (e.kind === "t20") {
      return {
        timeModel: "fixed",
        showExactTime: true,
        hasClearEnd: true,
        movementProfile: "entry_peak",
      };
    }
  }

  // 🎾 / 🎯 SESSION SPORTS
  if (e.kind === "session") {
    return {
      timeModel: "session",
      showExactTime: false,
      hasClearEnd: false,
      movementProfile: "steady",
    };
  }

  // ⚽ DEFAULT MATCH
  return {
    timeModel: "fixed",
    showExactTime: true,
    hasClearEnd: true,
    movementProfile: "entry_peak",
  };
}
