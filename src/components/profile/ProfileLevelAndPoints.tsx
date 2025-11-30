// src/components/profile/ProfileLevelAndPoints.tsx
'use client'

import { Trophy, Star } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  level: string | number
  points: number
  isMe?: boolean
  userId?: string
  onShowLevelModal?: () => void
  className?: string
}

export default function ProfileLevelAndPoints({
  level,
  points,
  isMe = false,
  userId,
  onShowLevelModal,
  className = '',
}: Props) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 text-sm text-white/85 tracking-wide',
        className
      )}
    >
      {/* 🏅 Level (본인만 클릭 가능) */}
      {isMe ? (
        <button
          onClick={onShowLevelModal}
          className="flex items-center gap-1 text-white/85 hover:text-yellow-300 transition-colors"
          title="View your level details"
        >
          <Trophy size={15} className="text-yellow-400" />
          <span>Level {level}</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 text-white/85">
          <Trophy size={15} className="text-yellow-400" />
          <span>Level {level}</span>
        </div>
      )}

      {/* 구분점 */}
      <span className="opacity-50">·</span>

      {/* ⭐ Points (UI 통일) */}
      {isMe && userId ? (
        <a
          href={`/profile/${userId}/points`}
          className="flex items-center gap-1 text-white/85 hover:text-yellow-300 transition-colors"
          title="View your point history"
        >
          <Star size={14} className="text-orange-300" />
          <span>{points ?? 0} pts</span>
        </a>
      ) : (
        <div className="flex items-center gap-1 text-white/85">
          <Star size={14} className="text-orange-300" />
          <span>{points ?? 0} pts</span>
        </div>
      )}
    </div>
  )
}
