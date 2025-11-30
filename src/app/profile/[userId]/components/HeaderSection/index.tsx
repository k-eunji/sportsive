// src/app/profile/[userId]/components/HeaderSection/index.tsx

'use client'

import { useState } from 'react'
import { useUser } from '@/context/UserContext'
import type { ProfileUser } from '@/types/user'
import { getRelationshipLabel } from '@/lib/relationships'
import { useProfileSupport } from './useProfileSupport'
import { getBannerTheme } from './bannerUtils'
import ProfileHeaderMain from './ProfileHeaderMain'
import LevelModal from './LevelModal'

export default function ProfileHeaderSports({
  profile,
  isMe,
}: {
  profile: ProfileUser
  isMe: boolean
}) {
  const { user: currentUser } = useUser()
  const [showLevelModal, setShowLevelModal] = useState(false)

  const { relationship, isPending, handleSupport } = useProfileSupport({
    currentUser,
    profile,
  })

  const relInfo = getRelationshipLabel(relationship as any)
  const { sportTheme, bannerImg, themeColor } = getBannerTheme(profile)

  return (
    <>
      <ProfileHeaderMain
        profile={profile}
        isMe={isMe}
        sportTheme={sportTheme}
        bannerImg={bannerImg}
        themeColor={themeColor}
        relInfo={relInfo}
        isPending={isPending}
        onSupport={handleSupport}
        onShowLevelModal={() => setShowLevelModal(true)}
      />
      <LevelModal open={showLevelModal} onClose={() => setShowLevelModal(false)} />
    </>
  )
}
