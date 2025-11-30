// ✅ src/lib/relationships.ts
// 유저 간 관계 상태 정의 및 UI 정보 반환 (UI는 영어 / 설명은 한글)

export type RelationshipStatus =
  | 'NONE'
  | 'I_SUPPORT'
  | 'MUTUAL'
  | 'TEAMMATE'

export interface RelationshipInfo {
  label: string // 버튼에 표시될 텍스트
  desc: string // 설명 (내부 참고용)
  color: string // UI 색상
}

export const RELATIONSHIP_STATUS: Record<
  RelationshipStatus,
  RelationshipInfo
> = {
  NONE: {
    label: '+ Support',
    desc: 'One-way support available',
    color: '#3B82F6', // blue
  },
  I_SUPPORT: {
    label: 'Supported',
    desc: 'Waiting for mutual support',
    color: '#60A5FA', // light blue
  },
  MUTUAL: {
    label: 'Mutual Support 💙',
    desc: 'Both users support each other',
    color: '#2563EB', // darker blue
  },
  TEAMMATE: {
    label: 'Teammate 🤝',
    desc: 'Working together, trusted relationship',
    color: '#16A34A', // green
  },
}

/**
 * 관계 상태를 받아서 UI용 정보 반환
 */
export function getRelationshipLabel(
  status: RelationshipStatus
): RelationshipInfo {
  return RELATIONSHIP_STATUS[status] || RELATIONSHIP_STATUS.NONE
}
