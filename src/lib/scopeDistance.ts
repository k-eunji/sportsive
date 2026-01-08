//src/lib/scopeDistance.ts

import type { ViewScope } from "@/app/components/home/RadiusFilter";

export function scopeToKm(scope: ViewScope): number {
  switch (scope) {
    case "nearby":
      return 5;      // 기존 3~5마일 대응
    case "city":
      return 30;     // 도시권
    case "country":
      return 500;    // 국가 단위
    case "global":
      return Infinity;
    default:
      return 5;
  }
}
