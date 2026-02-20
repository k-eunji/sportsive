//src/lib/risk/computeFullRisk.ts

import { buildHistoryFromEvents } from "./buildHistory";
import { RISK_MODEL } from "./config";

export type RiskEvent = {
  id: string;
  date?: string;
  startDate?: string;
  utcDate?: string;
  startTime?: string;
  location?: { lat: number; lng: number };
};

function percentileRank(value: number, history: number[]) {
  if (!history.length) return 0;

  const sorted = [...history].sort((a, b) => a - b);
  const below = sorted.filter(v => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

function extractDate(e: RiskEvent) {
  return (e.date ?? e.startDate ?? e.utcDate)?.slice(0, 10);
}

function buildTimeOverlap(
  events: RiskEvent[],
  targetDate: string,
  windowHours: number
) {
  const sameDay = events.filter(e => extractDate(e) === targetDate);

  if (!sameDay.length) return 0;

  const parsed = sameDay
    .filter(e => e.startTime)
    .map(e => new Date(`${targetDate}T${e.startTime}`));

  let overlap = 0;

  for (let i = 0; i < parsed.length; i++) {
    for (let j = i + 1; j < parsed.length; j++) {
      const diff =
        Math.abs(parsed[i].getTime() - parsed[j].getTime()) /
        (1000 * 60 * 60);

      if (diff <= windowHours) overlap++;
    }
  }

  return overlap;
}

export function computeFullRiskForDate({
  events,
  targetDate,
  anchorLocation
}: {
  events: RiskEvent[];
  targetDate: string;
  anchorLocation: { lat: number; lng: number } | null;
}) {

  // anchor 없으면 리스크 계산 안함
  if (!anchorLocation) {
    return {
      peakConcurrent: 0,
      percentile: 0,
      baseScore: 0,
      spatialOverlap: 0,
      timeOverlap: 0,
      finalScore: 0,
      history: []
    };
  }

  // 🔥 중요:
  // 이미 RiskClient에서 지도 bounds로 필터된 events가 넘어옴
  // 따라서 여기서는 거리 계산 안함

  const history = buildHistoryFromEvents(events);

  const dayEvents = events.filter(
    e => extractDate(e) === targetDate
  );

  const peakConcurrent = dayEvents.length;

  const percentile = percentileRank(peakConcurrent, history);

  const baseScore = Math.min(
    Math.round(percentile * RISK_MODEL.BASE_PERCENTILE_WEIGHT),
    100
  );

  // 지도에 보이는 이벤트 수 자체를 spatialOverlap로 사용
  const spatialOverlap = dayEvents.length;

  const timeOverlap = buildTimeOverlap(
    events,
    targetDate,
    RISK_MODEL.TIME_WINDOW_HOURS
  );

  const finalScore = Math.min(
    baseScore +
      spatialOverlap * RISK_MODEL.SPATIAL_WEIGHT +
      timeOverlap * RISK_MODEL.TIME_WEIGHT,
    100
  );

  return {
    peakConcurrent,
    percentile,
    baseScore,
    spatialOverlap,
    timeOverlap,
    finalScore,
    history
  };
}