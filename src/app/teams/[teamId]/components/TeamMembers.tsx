//src/app/teams/[teamId]/components/TeamMembers.tsx

'use client'

import Link from 'next/link'
import UserAvatar from '@/components/UserAvatar'

export type TeamMember = {
  id: string
  displayName: string
  photoURL?: string | null
  role?: string | null
}

interface Props {
  members: TeamMember[]
}

export default function TeamMembers({ members }: Props) {
  if (!members || members.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No members yet.
      </p>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {members.map((m) => (
        <Link
          key={m.id}
          href={`/profile/${m.id}`}
          className="flex items-center gap-3 bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm hover:shadow-md transition"
        >
          {/* ✅ 여기서는 바깥에 Link가 있으니까, 중첩 a 태그 방지용으로 linkToProfile=false */}
          <UserAvatar
            userId={m.id}
            avatarUrl={m.photoURL || undefined}
            name={m.displayName}
            size={40}
            showName={false}
            linkToProfile={false}
          />
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {m.displayName}
            </p>
            {m.role && (
              <p className="text-xs text-gray-500">
                {m.role}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
