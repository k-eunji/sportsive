// src/app/live/[sport]/[liveId]/components/EmotionGraph.tsx

'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useEffect, useState } from 'react'
import { useUser } from '@/context/UserContext'

interface EmotionGraphProps {
  sport: string;      // 🔥 추가됨
  liveId: string;
}

type PieDataItem = {
  name: string
  emoji: string
  value: number
}

const COLORS_LIGHT = [
  '#22c55e',
  '#ef4444',
  '#facc15',
  '#3b82f6',
  '#dc2626',
  '#f97316',
  '#9333ea',
  '#fbbf24',
]
const COLORS_DARK = [
  '#16a34a',
  '#b91c1c',
  '#eab308',
  '#2563eb',
  '#991b1b',
  '#f97316',
  '#7e22ce',
  '#fbbf24',
]

const EMOJIS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😮', label: 'Surprised' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😂', label: 'Funny' },
  { emoji: '😱', label: 'Shocked' },
  { emoji: '🎉', label: 'Celebrate' },
]

type EmotionKey = (typeof EMOJIS)[number]['emoji']

export default function EmotionGraph({ sport, liveId }: EmotionGraphProps) {
  const { user, loading: userLoading } = useUser()

  const initialEmotions: Record<EmotionKey, number> = EMOJIS.reduce(
    (acc, e) => ({ ...acc, [e.emoji]: 0 }),
    {} as Record<EmotionKey, number>
  )

  const [emotions, setEmotions] = useState<Record<EmotionKey, number>>(initialEmotions)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!liveId || !sport) return

    async function fetchEmotions(initial = false) {
      try {
        if (initial) setLoading(true)

        const res = await fetch(
          `/api/live/${sport}/${liveId}/messages/reactions`
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data: Record<string, number> = await res.json()

        const newEmotions: Record<EmotionKey, number> = { ...initialEmotions }
        EMOJIS.forEach((e) => {
          newEmotions[e.emoji] = data[e.emoji] ?? 0
        })
        setEmotions(newEmotions)
      } catch (err) {
        console.error(err)
      } finally {
        if (initial) setLoading(false)
      }
    }

    fetchEmotions(true)
    const interval = setInterval(() => fetchEmotions(false), 4000)
    return () => clearInterval(interval)
  }, [sport, liveId])

  if (userLoading || !liveId || !sport) {
    return (
      <div className="border border-border rounded-xl bg-background shadow-sm p-4">
        <p className="text-muted-foreground text-sm text-center">
          Loading Live Emotion Chart...
        </p>
      </div>
    )
  }

  const data = EMOJIS.map((e) => ({
    name: e.label,
    emoji: e.emoji,
    value: emotions[e.emoji] || 0,
  })).filter((d) => d.value > 0)

  return (
    <div className="rounded-xl bg-background border border-border shadow-sm p-4">
      <h2 className="font-semibold mb-2 text-center text-foreground">
        Live Emotion Chart
      </h2>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading...</p>
      ) : data.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No reactions yet
        </div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                labelLine={false}
                isAnimationActive={false}
              >
                {data.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={
                      document.documentElement.classList.contains('dark')
                        ? COLORS_DARK[idx % COLORS_DARK.length]
                        : COLORS_LIGHT[idx % COLORS_LIGHT.length]
                    }
                  />
                ))}
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
