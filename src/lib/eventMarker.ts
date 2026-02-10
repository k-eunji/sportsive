//src/lib/eventMarker.ts

import { normalizeSportKey } from "@/lib/normalizeSport";

export function getEventMarker(
  sport?: string,
  kind?: string
): string | null {
  const key = normalizeSportKey(sport);

  // 🐎 / 🎾 / 🎯 세션 계열
  if (kind === "session") {
    if (key === "horseracing") return "H";
    if (key === "tennis") return "T";
    if (key === "darts") return "D";
    return "S";
  }

  // ⚽️ 팀 스포츠
  switch (key) {
    case "football":
      return "F";
    case "rugby":
      return "R";
    case "basketball":
      return "B";
    case "cricket":
      return "C";      
    default:
      return null;
  }
}
