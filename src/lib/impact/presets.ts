//src/lib/impact/presets.ts

import { ImpactProfile } from "./types";

export const SPORT_IMPACT_PRESETS: Record<string, ImpactProfile> = {
  football: {
    type: "fixed",
    phases: [
      // 경기 시작 전 유입
      { offset: -90, duration: 60, weight: 1.0 },
      // 경기 종료 전/후 이탈
      { offset: 85, duration: 50, weight: 0.8 },
    ],
    confidence: "high",
  },

  rugby: {
    type: "fixed",
    phases: [
      { offset: -90, duration: 60, weight: 1.0 },
      { offset: 90, duration: 55, weight: 0.8 },
    ],
    confidence: "high",
  },

  basketball: {
    type: "fixed",
    phases: [
      { offset: -50, duration: 40, weight: 0.9 },
      { offset: 65, duration: 35, weight: 0.7 },
    ],
    confidence: "medium",
  },

  tennis: {
    type: "session",
    phases: [
      // 하루 종일 조금씩 유입/유출
      { offset: -180, duration: 360, weight: 0.3 },
    ],
    confidence: "low",
  },

  darts: {
    type: "session",
    phases: [
      { offset: -120, duration: 240, weight: 0.35 },
    ],
    confidence: "low",
  },

  horse_racing: {
    type: "block",
    window: {
      startHour: 11,
      endHour: 17,
    },
    confidence: "medium",
  },
};
