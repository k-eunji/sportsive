//src/lib/infra/operationalSignal.ts

import type { PeakScope } from "@/types/infra";

type PeakBucket = {
  hour: number;
  count: number;
};

function formatScope(scope: PeakScope) {
  if (scope.type === "city") return `${scope.name} area`;
  if (scope.type === "region") return `${scope.name} footprint`;
  return "Portfolio-wide";
}

export function buildOperationalSignal({
  peak,
  scope,
  dateLabel,
}: {
  peak: PeakBucket | null;
  scope: PeakScope;
  dateLabel: string;
}): string | null {
  if (!peak) return null;

  const from = `${peak.hour}:00`;
  const to = `${peak.hour + 1}:00`;
  const area = formatScope(scope);

  if (area === "Portfolio-wide") {
    return `Peak concurrent event activity expected between ${from}–${to} across Portfolio-wide ${dateLabel === "Today" ? "today" : `on ${dateLabel}`}.`;
  }

  return `High concurrent concurrent starts expected between ${from}–${to} in ${area} ${dateLabel === "Today" ? "today" : `on ${dateLabel}`}.`;
}
