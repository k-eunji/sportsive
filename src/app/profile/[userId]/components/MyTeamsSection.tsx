// src/app/profile/[userId]/components/MyTeamsSection.tsx

'use client'

import Link from 'next/link'
import type { UserTeamSummary } from '@/types/user'
import { Users, Star } from 'lucide-react'

// ✅ 타입 확장 (시각용)
interface DemoTeam extends UserTeamSummary {
  logo?: string
  members?: number
  rating?: number
}

interface Props {
  teams?: DemoTeam[]
}

export default function MyTeamsSection({ teams }: Props) {
  // 🧩 더미 데이터 (시각용)
  const demoTeams =
    !teams || teams.length === 0
      ? [
          {
            id: 'demo1',
            name: 'Seoul City FC',
            logo: '/demo/demo-team1.png',
            role: 'Striker',
            members: 24,
            rating: 4.8,
          },
          {
            id: 'demo2',
            name: 'Busan Mariners',
            logo: '/demo/demo-team2.png',
            role: 'Fan',
            members: 312,
            rating: 4.6,
          },
        ]
      : teams

  return (
    <section className="bg-background border border-border/40 rounded-2xl shadow-sm p-5">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        🧢 My Squads & Fan Clubs
      </h2>

      <div className="flex flex-col gap-3">
        {demoTeams.map((team) => (
          <Link
            key={team.id}
            href={`/teams/${team.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border bg-background/80 hover:bg-accent/10 hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <img
                src={team.logo || '/default-team.png'}
                alt={team.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {team.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users size={12} /> {team.members ?? 0} members
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{team.role || 'Member'}</p>
              <p className="flex items-center justify-end gap-1 text-yellow-400">
                <Star size={12} fill="currentColor" />
                {team.rating?.toFixed(1) ?? '—'}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ⚠️ 데모 데이터 표시 */}
      {!teams?.length && (
        <p className="text-[11px] text-muted-foreground/70 italic text-right mt-2">
          Demo teams for visual reference — remove later
        </p>
      )}
    </section>
  )
}
