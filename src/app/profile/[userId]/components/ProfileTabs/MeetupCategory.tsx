// src/app/profile/[userId]/components/ProfileTabs/MeetupCategory.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users } from 'lucide-react'

export default function MeetupCategory({
  title,
  meetups,
  type,
}: {
  title: string
  meetups: any[]
  type: 'hosted' | 'joined'
}) {
  const now = new Date()
  const ongoing = meetups.filter((m) => !m.datetime || new Date(m.datetime) >= now)
  const finished = meetups.filter((m) => m.datetime && new Date(m.datetime) < now)

  const [subTab, setSubTab] = useState<'ongoing' | 'finished'>('ongoing')
  const displayList = subTab === 'ongoing' ? ongoing : finished
  const isEmpty = displayList.length === 0

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground mb-3">
        {type === 'hosted' ? '🏆 ' : '🏃‍♂️ '}
        {title}
      </h3>

      {/* 🔹 Ongoing / Finished toggle */}
      <div className="flex gap-2">
        {['ongoing', 'finished'].map((tab) => {
          const active = subTab === tab
          return (
            <button
              key={tab}
              onClick={() => setSubTab(tab as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {tab === 'ongoing' ? 'On going' : 'Finished'} (
              {tab === 'ongoing' ? ongoing.length : finished.length})
            </button>
          )
        })}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-border bg-background/60 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {subTab === 'ongoing' ? 'No ongoing meetups' : 'No finished meetups'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {displayList.map((m) => (
            <Link
              key={`${m.id || 'no-id'}-${m.datetime || 'no-date'}-${Math.random()}`}
              href={`/meetups/${m.id}`}
              className="flex gap-3 bg-background border border-border rounded-xl p-3 hover:bg-accent/10 transition-shadow hover:shadow-sm"
            >

              {/* 🔸 Thumbnail or Emoji */}
              <div className="relative w-20 h-20 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden">
                {m.imageUrl && m.imageUrl.trim() !== '' && !m.imageUrl.startsWith('/images/') ? (
                  <Image
                    src={m.imageUrl}
                    alt={m.title}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover border border-border/40"
                  />
                ) : (
                  <span className="text-3xl">
                    {m.type === 'match_attendance'
                      ? '🏟️'
                      : m.type === 'pub_gathering'
                      ? '🍺'
                      : m.type === 'online_game'
                      ? '🎮'
                      : m.type === 'pickup_sports'
                      ? '🏐'
                      : '❓'}
                  </span>
                )}
              </div>

              {/* 🔸 Info */}
              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-medium text-foreground">{m.title}</h4>
                  {m.datetime && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar size={12} />{' '}
                      {new Date(m.datetime).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin size={12} /> {m.location?.address || 'Online'}
                  </p>
                </div>

                {typeof m.participantsCount === 'number' && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Users size={12} /> {m.participantsCount} participants
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
