// src/app/profile/[userId]/components/HeaderSection/useProfileSupport.ts
'use client'

import { useState, useTransition } from 'react'
import type { ProfileUser } from '@/types/user'

export function useProfileSupport({
  currentUser,
  profile,
}: {
  currentUser: any
  profile: ProfileUser
}) {
  const [relationship, setRelationship] = useState(profile.relationship || 'NONE')
  const [isPending, startTransition] = useTransition()

  const handleSupport = async () => {
    if (!currentUser) return alert('Please log in first.')
    if (isPending) return

    const action =
      relationship === 'I_SUPPORT' || relationship === 'MUTUAL'
        ? 'UNSUPPORT'
        : 'SUPPORT'

    startTransition(async () => {
      const res = await fetch(`/api/users/${profile.id}/relationship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myId: currentUser.userId,
          action,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setRelationship(data.relationship)
      } else {
        console.error('Failed to update relationship')
      }
    })
  }

  return { relationship, isPending, handleSupport }
}
