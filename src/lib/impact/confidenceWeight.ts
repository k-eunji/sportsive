//src/lib/impact/confidenceWeight.ts

import { ImpactConfidence } from "./types";

export function confidenceWeight(c: ImpactConfidence): number {
  switch (c) {
    case "high":
      return 1;
    case "medium":
      return 0.8;
    case "low":
      return 0.6;
    default:
      return 1;
  }
}

