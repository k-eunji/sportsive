// src/app/profile/[userId]/components/ActivitySummary.tsx

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, Users } from 'lucide-react'
import type { ProfileUser } from '@/types/user'

export default function ActivitySummary({ profile }: { profile: ProfileUser }) {
  const recent = [
    ...(profile.joinedMeetups || []).map((m) => ({ ...m, _source: 'joined' })),
    ...(profile.hostedMeetups || []).map((m) => ({ ...m, _source: 'hosted' })),
  ]
    .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime())
    .slice(0, 3)

  return (
    <section className="bg-background border border-border/40 rounded-2xl shadow-sm p-5">
      <h2 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
        🏅 Recent Matches & Meetups
      </h2>

      {recent.length === 0 ? (
        <p className="text-sm text-muted-foreground italic text-center py-6">
          No recent activity yet.
        </p>
      ) : (
        <div className="space-y-4">
          {recent.map((m: any, idx) => {
            const meetupId = m.id || m.meetupId || `unknown-${idx}`; // ✅ id 누락 방지 fallback
            return (
              <Link
                key={`${meetupId}-${m._source}`}
                href={`/meetups/${meetupId}`}
                className="flex gap-4 bg-background/80 border border-border rounded-xl p-3 shadow-sm hover:shadow-md hover:bg-accent/10 transition"
              >
                {/* 🖼️ Thumbnail */}
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

                  {/* ✅ 역할 뱃지 */}
                  <span
                    className={`absolute top-1 right-1 text-[10px] px-2 py-0.5 rounded-full font-medium shadow-sm ${
                      m._source === 'hosted'
                        ? 'bg-yellow-400 text-black'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {m._source === 'hosted' ? 'Host' : 'Joined'}
                  </span>
                </div>

                {/* ℹ️ Info */}
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="font-semibold text-foreground">{m.title}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar size={12} /> {new Date(m.datetime).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {m.location?.address || 'Online'}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <Users size={12} /> {m.participantsCount ?? 0} participants
                  </p>
                </div>
              </Link>
            );
          })}

        </div>
      )}
    </section>
  )
}
