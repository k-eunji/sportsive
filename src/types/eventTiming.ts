//✅ /src/types/eventTiming.ts

/**
 * 이 파일의 철학
 * --------------------------------------------------
 * ❌ 정확한 경기 시간
 * ⭕ 사람들이 공간에 "들어오고 / 머물고 / 빠져나가는" 패턴
 *
 * - 모든 시간은 "추정"
 * - 설명 가능해야 함 (B2B)
 * - 종목 / 세션 / 하루 단위 모두 표현 가능
 */

/* =========================
   공통 단계 정의
========================= */

export type CrowdPhase =
  | "PRE_INBOUND"    // 도착 시작
  | "PEAK_INBOUND"   // 유입 피크
  | "LIVE"           // 체류
  | "PEAK_OUTBOUND"  // 이탈 피크
  | "POST_OUTBOUND"; // 잔류 소멸

export type ConfidenceLevel = "low" | "medium" | "high";

/* =========================
   단일 타이밍 모델
========================= */

export interface TimingWindow {
  /**
   * 기준 시작 시각 (UTC ISO)
   * - 경기 시작
   * - 세션 시작
   */
  startTimeUtc: string;

  /**
   * (선택) 기준 종료 시각
   * - 세션형은 undefined 가능
   */
  endTimeUtc?: string;

  /**
   * 사람들이 도착하기 시작하는 시점 (분 단위 offset)
   */
  inboundStartOffsetMin: number;

  /**
   * 유입 피크
   */
  inboundPeakOffsetMin: {
    from: number;
    to: number;
  };

  /**
   * 주요 체류 구간
   * - 하프타임 / 연장전 / 지연 포함
   */
  liveWindowOffsetMin: {
    from: number;
    to: number;
  };

  /**
   * 이탈 피크
   */
  outboundPeakOffsetMin: {
    from: number;
    to: number;
  };

  /**
   * 완전 소멸까지
   */
  postOutboundOffsetMin: number;

  /**
   * 신뢰도
   */
  confidence: ConfidenceLevel;

  /**
   * B2B 설명용
   */
  rationale: string;
}

/* =========================
   세션 단위 모델
========================= */

export interface EventSessionTiming {
  sessionId: string; // "afternoon", "evening", "night", "day"
  label: string;     // 사용자 노출용
  timing: TimingWindow;
}

/* =========================
   🏟 종목 기본 패턴 (핵심)
========================= */

export interface SportTimingProfile {
  sport:
    | "football"
    | "rugby"
    | "basketball"
    | "tennis"
    | "darts"
    | "horse-racing";

  /**
   * 단일 경기 종목 기본값
   */
  matchTiming?: Omit<TimingWindow, "startTimeUtc" | "endTimeUtc">;

  /**
   * 세션 기반 종목 기본 세션들
   * (경마 / 다트 / 테니스)
   */
  defaultSessions?: {
    sessionId: string;
    label: string;

    /**
     * 기준 시작 시각 (보통 현지 기준, 파싱용)
     */
    typicalStartTime: string; // "11:00", "19:00"

    /**
     * 평균 지속 시간 (분)
     * → 엔드타임 모를 때 사용
     */
    typicalDurationMin: number;

    timingPattern: Omit<TimingWindow, "startTimeUtc" | "endTimeUtc">;
  }[];

  /**
   * 종목 전체 설명 (B2B)
   */
  notes: string;
}

/* =========================
   이벤트 단위 오버라이드
========================= */

export interface EventTimingModel {
  eventId: string;

  sport: SportTimingProfile["sport"];

  kind: "match" | "session" | "tournament";

  /**
   * 종목 기본값을 덮어쓰는 경우
   */
  defaultTimingOverride?: TimingWindow;

  /**
   * 종목 세션을 덮어쓰는 경우
   */
  sessionOverrides?: EventSessionTiming[];

  notes?: string;
}
