// src/app/profile/[userId]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import type { ProfileUser } from '@/types/user'

// ✅ 구성 요소들
import ProfileHeader from './components/ProfileHeaderSports'
import ActivitySummary from './components/ActivitySummary'
import ProfileTabsSports from './components/ProfileTabsSports'

export default function UserProfileSports() {
  const params = useParams() as { userId: string }
  const userId = params.userId
  const { user: currentUser } = useUser()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${userId}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [userId])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground text-sm">
        Loading profile...
      </div>
    )

  if (!profile)
    return (
      <div className="flex justify-center items-center h-64 text-destructive text-sm">
        Failed to load profile.
      </div>
    )

  const isMe = currentUser?.userId === profile.id

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 bg-background text-foreground">
      <ProfileHeader profile={profile} isMe={isMe} />
      <ActivitySummary profile={profile} />
      <ProfileTabsSports profile={profile} />
    </main>
  )
}
