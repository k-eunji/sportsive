// ✅ src/lib/levels.ts
// 포인트 구간에 따른 레벨 계산 로직 (UI는 영어, 설명은 한글)

export interface LevelInfo {
  name: string // 레벨 이름 (UI용)
  min: number // 최소 포인트
  max: number // 최대 포인트
  desc: string // 설명 (내부 참고용)
  color: string // UI 표시 색상
}

export const LEVELS: LevelInfo[] = [
  {
    name: 'Rookie',
    min: 0,
    max: 999,
    desc: 'Entry-level user (first activities)',
    color: '#9CA3AF', // gray
  },
  {
    name: 'Bronze',
    min: 1000,
    max: 2499,
    desc: 'Active member (joined several meetups)',
    color: '#CD7F32', // bronze
  },
  {
    name: 'Silver',
    min: 2500,
    max: 4999,
    desc: 'Core contributor (reviews & live chats)',
    color: '#C0C0C0', // silver
  },
  {
    name: 'Gold',
    min: 5000,
    max: 8999,
    desc: 'Community leader (hosts events often)',
    color: '#FFD700', // gold
  },
  {
    name: 'Pro',
    min: 9000,
    max: Infinity,
    desc: 'Top-level member (high activity & trust)',
    color: '#1E90FF', // blue
  },
]

/**
 * 포인트 기준으로 현재 레벨을 반환
 */
export function getLevel(points: number) {
  return (
    LEVELS.find((level) => points >= level.min && points <= level.max) ||
    LEVELS[0]
  )
}

/**
 * 다음 레벨까지 필요한 포인트 계산
 */
export function getPointsToNextLevel(points: number): number | null {
  const current = getLevel(points)
  const currentIndex = LEVELS.findIndex((l) => l.name === current.name)
  const next = LEVELS[currentIndex + 1]
  return next ? next.min - points : null
}
