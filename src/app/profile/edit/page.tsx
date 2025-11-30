// src/app/profile/edit/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import type { ProfileUser } from '@/types/user'
import EditProfileForm from './components/EditProfileForm'

export default function EditProfilePage() {
  const { user } = useUser()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/users/${user.userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground text-sm">
        Loading your profile...
      </div>
    )

  if (!profile)
    return (
      <div className="flex justify-center items-center h-64 text-destructive text-sm">
        Failed to load profile data.
      </div>
    )

  const handleSave = async (updated: Partial<ProfileUser>) => {
    try {
      const res = await fetch(`/api/users/${user?.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      if (res.ok) router.push(`/profile/${user?.userId}`)
      else console.error('Failed to update profile')
    } catch (err) {
      console.error('Profile update error:', err)
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold text-foreground mb-4">
        Edit Profile
      </h1>
      <EditProfileForm profile={profile} onSave={handleSave} />
    </main>
  )
}
