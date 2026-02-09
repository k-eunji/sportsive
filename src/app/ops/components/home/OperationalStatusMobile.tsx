//src/app/ops/components/home/OperationalStatusMobile.tsx

"use client";

import type { PeakScope } from "@/types/infra";

type Props = {
  peak: { hour: number; count: number } | null;
  scope: PeakScope;
  dateLabel: string;
};

function formatScope(scope: PeakScope) {
  if (scope.type === "city") return scope.name;
  if (scope.type === "region") return scope.name;
  return "Portfolio-wide";
}

export default function OperationalStatusMobile({
  peak,
  scope,
  dateLabel,
}: Props) {
  if (!peak) return null;

  const label = `${peak.hour}:00–${peak.hour + 1}:00`;

  return (
    <div
      className="
        md:hidden
        fixed bottom-[88px]
        left-1/2 -translate-x-1/2
        z-40
        rounded-full
        bg-background/80 backdrop-blur
        ring-1 ring-border/40
        px-3 py-1.5
        text-xs font-medium
      "
    >
      Peak {label} · {peak.count}
    </div>
  );
}
