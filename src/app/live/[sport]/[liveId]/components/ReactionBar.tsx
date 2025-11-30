// src/app/live/[sport]/[liveId]/components/ReactionBar.tsx

'use client'

import { useUser } from '@/context/UserContext'

interface Props {
  sport: string
  liveId: string
  onReact?: (emoji: string) => void
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '🎉']

export default function ReactionBar({ sport, liveId, onReact }: Props) {
  const { user } = useUser()

  const sendReaction = async (emoji: string) => {
    if (!user) return

    // 화면에 떠오르는 이모지 애니메이션
    onReact?.(emoji)

    // Firestore POST 요청
    await fetch(`/api/live/${sport}/${liveId}/messages/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.userId,
        type: emoji
      })
    })
  }

  return (
    <div className="flex gap-3 backdrop-blur-xl bg-black/20 text-xl px-5 py-2 rounded-full shadow-lg">
      {EMOJIS.map((e) => (
        <button
          key={e}
          onClick={() => sendReaction(e)}
          className="hover:scale-125 transition-transform"
        >
          {e}
        </button>
      ))}
    </div>
  )
}
