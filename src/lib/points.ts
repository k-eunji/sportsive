// ✅ src/lib/points.ts
// 행동별 포인트 정의 및 계산 유틸

export const ACTION_POINTS = {
  HOST_MEETUP: 200, // 밋업 주최
  JOIN_MEETUP: 50, // 밋업 참가
  WRITE_REVIEW: 20, // 경기 후기 작성
  LIVE_CHAT: 5, // 라이브 채팅 참여
  RECEIVE_LIKE: 2, // 좋아요 받음
  ADD_FAN: 3, // 팬 추가
  REPORTED: -20, // 신고 당함
} as const

export type ActionType = keyof typeof ACTION_POINTS

// ✅ 사람이 읽을 수 있는 설명 추가
export const ACTION_DESCRIPTIONS: Record<ActionType, string> = {
  HOST_MEETUP: "🏆 Hosted a meetup",
  JOIN_MEETUP: "🤝 Joined a meetup",
  WRITE_REVIEW: "📝 Wrote a review",
  LIVE_CHAT: "💬 Participated in live chat",
  RECEIVE_LIKE: "⭐ Received a like",
  ADD_FAN: "🙌 Gained a fan",
  REPORTED: "🚫 Reported by another user",
}

/** 특정 행동에 대한 포인트 반환 */
export function getActionPoint(action: ActionType): number {
  return ACTION_POINTS[action] ?? 0
}

/** 여러 행동을 한 번에 적용해 총합 계산 */
export function calculateTotalPoints(actions: ActionType[]): number {
  return actions.reduce((acc, action) => acc + getActionPoint(action), 0)
}
