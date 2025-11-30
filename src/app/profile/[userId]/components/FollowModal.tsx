// src/app/profile/[userId]/components/FollowModal.tsx

'use client'

import { useState, useEffect } from 'react'
import FollowList, { FollowUser } from '@/components/FollowList'
import axios from 'axios'

interface Props {
  isOpen: boolean
  onClose: () => void
  followers: FollowUser[]
  following: FollowUser[]
  isMe?: boolean
  onToggleFollow?: (targetUserId: string) => void
  onRemoveFollower?: (targetUser: FollowUser) => void
  initialTab?: 'followers' | 'following'
  userId: string
  myFollowing?: FollowUser[]
}

export default function FollowModal({
  isOpen,
  onClose,
  followers,
  following,
  isMe,
  onToggleFollow,
  onRemoveFollower = () => {},
  initialTab = 'following',
  userId,
  myFollowing = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialTab)
  const [followersList, setFollowersList] = useState<FollowUser[]>([])
  const [followingList, setFollowingList] = useState<FollowUser[]>([])

  useEffect(() => {
    if (!isOpen) return
    setActiveTab(initialTab)
    setFollowersList(followers)
    setFollowingList(following)
  }, [isOpen, followers, following, initialTab])

  const handleToggleFollowLocal = (targetUserId: string) => {
    onToggleFollow?.(targetUserId)
    setFollowingList((prev) =>
      prev.some((u) => u.userId === targetUserId)
        ? prev.filter((u) => u.userId !== targetUserId)
        : [...prev, { userId: targetUserId, nickname: targetUserId } as FollowUser]
    )
  }

  const handleRemoveFollowerLocal = (targetUser: FollowUser) => {
    onRemoveFollower(targetUser)
    setFollowersList((prev) => prev.filter((u) => u.userId !== targetUser.userId))
    axios
      .post(`/api/users/${userId}/removeFollower`, {
        targetUserId: targetUser.userId,
      })
      .catch((err) => console.error('Remove follower failed:', err))
  }

  const currentList = activeTab === 'following' ? followingList : followersList

  if (!currentList)
    return (
      <p className="text-center py-4 text-muted-foreground text-sm">
        Loading users...
      </p>
    )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md p-5 relative shadow-lg max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground text-lg transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* 탭 */}
        <div className="flex justify-around mb-4 border-b border-border text-sm sm:text-base">
          <button
            className={`px-3 py-2 font-semibold transition-colors ${
              activeTab === 'followers'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({followersList.length})
          </button>
          <button
            className={`px-3 py-2 font-semibold transition-colors ${
              activeTab === 'following'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following ({followingList.length})
          </button>
        </div>

        {/* 리스트 */}
        <div className="max-h-[70vh] overflow-y-auto">
          <FollowList
            users={currentList}
            currentUserId={undefined}
            isMe={isMe}
            activeTab={activeTab}
            onToggleFollow={handleToggleFollowLocal}
            onRemoveFollower={handleRemoveFollowerLocal}
            filledFollowing={followingList}
            myFollowing={myFollowing}
          />
        </div>
      </div>
    </div>
  )
}
