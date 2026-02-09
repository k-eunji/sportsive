// src/app/ops/anchor/types.ts
export type AnchorLocation = {
  id: string;
  label: string;        // "Old Trafford"
  type: "venue" | "custom" | "city";
  lat: number;
  lng: number;
  source: "suggested" | "user";
};
