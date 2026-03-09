//src/lib/eventMarker.ts

import { normalizeSportKey } from "@/lib/normalizeSport";

export function getEventMarker(
  sport?: string,
  kind?: string,
  payload?: any
): string | null {
  const key = normalizeSportKey(sport);

  // 🐎 / 🎾 / 🎯 세션 계열
  if (kind === "session") {
    if (key === "horseracing") return "H";
    if (key === "tennis") return "T";
    if (key === "darts") return "D";
    return "S";
  }

  // 🥊 fight sports
  if (key === "fight") {
    const d = payload?.discipline;

    if (d === "mma") return "M";
    if (d === "boxing") return "X";
    if (d === "bareknuckle") return "K";

    return "F";
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