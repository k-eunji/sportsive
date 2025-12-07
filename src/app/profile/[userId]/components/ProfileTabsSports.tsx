// src/app/profile/[userId]/components/ProfileTabsSports.tsx

'use client'

import { useState } from 'react'
import type { ProfileUser } from '@/types/user'

// 기존 탭 컴포넌트
import MeetupsTab from './ProfileTabs/MeetupsTab'
import ReviewsTab from './ProfileTabs/ReviewsTab'
import AboutTab from './ProfileTabs/AboutTab'

export default function ProfileTabsSports({ profile }: { profile: ProfileUser }) {
  const [tab, setTab] = useState<'meetups' | 'reviews' | 'about'>('meetups')

  const tabs = [
    { id: 'meetups', label: '🏟️ Meetups' },
    { id: 'reviews', label: '💬 Reviews' },
    { id: 'about', label: 'ℹ️ About' },
  ] as const

  return (
    <section className="bg-background border border-border/40 rounded-2xl shadow-sm p-5">
      {/* Tabs */}
      <div className="flex justify-around border-b border-border mb-5 overflow-x-auto">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            className={`pb-2 font-semibold capitalize transition-colors whitespace-nowrap ${
              tab === id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab(id as typeof tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'meetups' && (
        <MeetupsTab
          hosted={profile.hostedMeetups || []}
          joined={profile.joinedMeetups || []}
        />
      )}

      {tab === 'reviews' && <ReviewsTab reviews={profile.reviews || []} />}

      {tab === 'about' && <AboutTab bio={profile.bio} />}
    </section>
  )
}
