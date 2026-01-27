//src/lib/entryReason.ts

export type EntryReason =
  | "direct"
  | "share"
  | "map_check"
  | "status_check";

export function detectEntryReason(): EntryReason {
  if (typeof window === "undefined") return "direct";

  const params = new URLSearchParams(window.location.search);

  // 1️⃣ 공유 링크
  if (params.get("eventId")) {
    return "share";
  }

  // 2️⃣ 이전 방문 기록이 있고, 바로 맵 화면
  const ref = document.referrer;
  if (!ref) {
    return "map_check";
  }

  // 3️⃣ 그 외 → 그냥 확인
  return "status_check";
}
