// src/app/profile/[userId]/components/ProfileTabsSports.tsx

// src/app/profile/[userId]/components/ProfileTabsSports.tsx

'use client'

import { useState } from 'react'
import type { ProfileUser } from '@/types/user'

// ✅ 기존 탭 컴포넌트
import MeetupsTab from './ProfileTabs/MeetupsTab'
import ReviewsTab from './ProfileTabs/ReviewsTab'
import AboutTab from './ProfileTabs/AboutTab'

// ✅ 추가: 커뮤니티 피드 통합
import FeedList from '@/app/community/components/FeedList'
import FeedFilterBar from '@/app/community/components/FeedFilterBar'

export default function ProfileTabsSports({ profile }: { profile: ProfileUser }) {
  const [tab, setTab] = useState<'meetups' | 'reviews' | 'about' | 'community'>('meetups')

  const tabs = [
    { id: 'meetups', label: '🏟️ Meetups' },
    { id: 'reviews', label: '💬 Reviews' },
    { id: 'community', label: '🌐 Community' }, // ✅ 새 탭 추가
    { id: 'about', label: 'ℹ️ About' },
  ] as const

  return (
    <section className="bg-background border border-border/40 rounded-2xl shadow-sm p-5">
      {/* 🧭 Tabs */}
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

      {/* 🏟️ Meetups Tab */}
      {tab === 'meetups' && (
        <MeetupsTab
          hosted={profile.hostedMeetups || []}
          joined={profile.joinedMeetups || []}
        />
      )}

      {/* 💬 Reviews Tab */}
      {tab === 'reviews' && <ReviewsTab reviews={profile.reviews || []} />}

      {/* 🌐 Community Tab — 커뮤니티 통합 */}
      {tab === 'community' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {(profile as any)?.authorNickname ||
              (profile as any)?.displayName ||
              'User'}
            ’s Community Activity
          </h3>

          <FeedFilterBar />
          <FeedList filter={{ user: profile.id }} />
        </div>
      )}

      {/* ℹ️ About Tab */}
      {tab === 'about' && <AboutTab bio={profile.bio} />}
    </section>
  )
}
