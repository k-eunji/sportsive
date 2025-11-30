// ✅ src/lib/teamRelationships.ts

export type TeamRelationshipStatus =
  | 'NONE'
  | 'FAN'
  | 'MEMBER'
  | 'MANAGER'

export interface TeamRelationshipInfo {
  label: string
  desc: string
  color: string
}

export const TEAM_RELATIONSHIP_STATUS: Record<
  TeamRelationshipStatus,
  TeamRelationshipInfo
> = {
  NONE: {
    label: '+ Join Team',
    desc: 'You are not following or part of this team',
    color: '#3B82F6',
  },
  FAN: {
    label: 'Fan ❤️',
    desc: 'You are supporting this team',
    color: '#EF4444',
  },
  MEMBER: {
    label: 'Team Member 💪',
    desc: 'You are part of the official team group',
    color: '#16A34A',
  },
  MANAGER: {
    label: 'Manager 🧢',
    desc: 'You manage this team page',
    color: '#F59E0B',
  },
}

export function getTeamRelationshipLabel(
  status: TeamRelationshipStatus
): TeamRelationshipInfo {
  return TEAM_RELATIONSHIP_STATUS[status] || TEAM_RELATIONSHIP_STATUS.NONE
}
