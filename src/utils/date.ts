// utils/date.ts

/**
 * 이벤트 시간을 브라우저 로컬 시간 기준으로 보여주고,
 * 원본 UTC 시간과 시차를 표시
 * @param date 이벤트 날짜 (string 또는 Date)
 * @param locale 브라우저 로케일, 기본 'en-GB'
 * @returns "원본UTC시간 (local: 로컬시간, ±Xh)" 형태 문자열
 */
export function formatEventTimeWithOffsetUTC(date: string | Date, locale: string = "en-GB"): string {
  const eventDate = new Date(date); // DB에서 UTC로 가져왔다는 전제
  if (isNaN(eventDate.getTime())) return "Invalid date";

  // UTC 기준
  const eventUtcStr = new Intl.DateTimeFormat(locale, {
    year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
    hour12: false, timeZone: "UTC"
  }).format(eventDate);

  // 로컬 시간
  const localTimeStr = new Intl.DateTimeFormat(locale, {
    hour: "2-digit", minute: "2-digit", hour12: false
  }).format(eventDate);

  // 시차 계산
  const diffHours = -eventDate.getTimezoneOffset() / 60;
  const offsetStr = diffHours >= 0 ? `+${diffHours}` : `${diffHours}`;

  return `${eventUtcStr} (local: ${localTimeStr}, ${offsetStr}h)`;
}

// src/utils/date.ts

/**
 * 댓글, 알림 등에 상대 시간 표시 ("1m ago", "3h ago", "2d ago")
 */
export function timeAgo(timestamp: number | null): string {
  if (!timestamp) return "Just now";
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

// src/utils/date.ts

/**
 * 서버(UTC) 기준 상대 시간 표시 ("1m ago", "3h ago", "2d ago")
 * Firestore의 ISO UTC 문자열을 그대로 입력받음
 */
export function timeAgoUTC(utcString: string | null): string {
  if (!utcString) return "Just now";
  const utcDate = new Date(utcString); // ISO 문자열 → UTC 날짜 객체
  if (isNaN(utcDate.getTime())) return "Invalid date";

  const diff = Date.now() - utcDate.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

// src/utils/date.ts

export function timeAgoModern(input: any): string {
  if (!input) return "Just now";

  let ts: number;

  if (input?._seconds) ts = input._seconds * 1000;
  else if (typeof input === "string") ts = new Date(input).getTime();
  else if (typeof input === "number") ts = input;
  else return "Just now";

  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;

  // 7일 이후는 월/일
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// ✅ 리스트용 짧은 시간 표시 (Songkick 스타일)
export function formatEventTimeShort(
  date: string | Date,
  locale: string = "en-GB"
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
