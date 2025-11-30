//src/utils/parseDate.ts

export function parseDateSafe(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN);

  // 이미 ISO 형태면 바로 Date 생성
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;

  // 만약 공백이나 이상한 문자열 → 강제 치환
  try {
    return new Date(dateStr.replace(" ", "T"));
  } catch (_) {
    return new Date(NaN);
  }
}

