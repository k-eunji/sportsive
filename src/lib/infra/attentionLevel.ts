//src/lib/infra/attentionLevel.ts

import type { PeakScope } from "@/types/infra";

export type AttentionLevel = "low" | "medium" | "high";

export function getAttentionLevel(
  count: number,
  scope: PeakScope
): AttentionLevel {
  const isCity = scope.type === "city";

  if (isCity) {
    if (count <= 2) return "low";
    if (count <= 4) return "medium";
    return "high";
  }

  // region or all
  if (count <= 4) return "low";
  if (count <= 7) return "medium";
  return "high";
}
