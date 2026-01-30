// src/lib/listRow.ts (새 파일 하나 만들어도 되고, page.tsx 안에 넣어도 됨)
import type { Event } from "@/types";

function getAnchorDate(e: any): Date | null {
  const raw = e.date ?? e.utcDate ?? e.startDate ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function formatRowTimePrefix(e: Event): string | null {
  const ev: any = e;

  // session은 "시각 prefix"가 아니라 "타이틀 옆 (…)"로 처리
  if (ev.kind === "session") return null;

  const d = getAnchorDate(ev);
  if (!d) return null;

  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

/** 타이틀 오른쪽에 붙일 괄호 라벨: (Afternoon) / (19:00) 등 */
export function getTitleBracket(e: Event): string | null {
  const ev: any = e;
  if (ev.kind !== "session") return null;

  // 1) Horse racing session: payload.sessionTime = Afternoon / Evening / Floodlit
  if (ev.sport === "horse-racing") {
    const t = ev.payload?.sessionTime;
    return t ? String(t) : null;
  }

  // 2) Tennis / Darts session: payload.typicalStartTime = "11:30" / "19:00"
  const t = ev.payload?.typicalStartTime;
  if (t) return String(t);

  return null;
}
