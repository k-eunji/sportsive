//src/utils/dateRangeGuard.ts

export function isWithinAllowedRange(dateStr: string) {
  const input = new Date(dateStr);
  const today = new Date();

  // 시간 제거
  today.setHours(0, 0, 0, 0);

  const pastLimit = new Date(today);
  pastLimit.setDate(today.getDate() - 90);

  const futureLimit = new Date(today);
  futureLimit.setDate(today.getDate() + 90); // 🔥 14 → 90

  return input >= pastLimit && input <= futureLimit;
}