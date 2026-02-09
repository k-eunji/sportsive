//src/lib/impact/types.ts

export type ImpactConfidence = "high" | "medium" | "low";

/**
 * 경기 시작 시각 기준으로
 * 사람들이 실제로 이동하는 구간
 */
export type MobilityPhase = {
  offset: number;    // 경기 시작 기준 분 (음수 = 시작 전, 양수 = 종료 후)
  duration: number;  // 영향 지속 시간 (분)
  weight: number;    // 상대 강도
};

export type ImpactType =
  | "fixed"    // 시작/종료가 비교적 명확 (축구, 럭비, 농구)
  | "session"  // 세션 기반, 유입/유출 지속 (테니스, 다트)
  | "block";   // 시간대만 존재 (경마)

export type ImpactProfile = {
  type: ImpactType;

  // fixed / session
  phases?: MobilityPhase[];

  // block 전용
  window?: {
    startHour: number;
    endHour: number;
  };

  confidence: ImpactConfidence;
};
