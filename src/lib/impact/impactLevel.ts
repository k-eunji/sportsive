//src/lib/impact/impactLevel.ts

export type ImpactLevel = "low" | "medium" | "high";

export function getImpactLevel(value: number): ImpactLevel {
  if (value < 1.5) return "low";
  if (value < 3.5) return "medium";
  return "high";
}


