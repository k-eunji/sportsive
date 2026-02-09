// src/types/infra.ts

export type PeakScope =
  | { type: "all" }
  | { type: "region"; name: string }
  | { type: "city"; name: string };
