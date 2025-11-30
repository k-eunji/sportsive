// src/components/FollowList.tsx

import Link from "next/link";
import FollowButton from "./FollowButton";

export interface FollowUser {
  userId: string;
  authorNickname?: string | null;
  photoURL?: string | null;
  isFollowing?: boolean;
}

interface Props {
  users: FollowUser[];
  currentUserId?: string;
  isMe?: boolean;
  activeTab?: "followers" | "following";
  onToggleFollow?: (targetUserId: string) => void;
  onRemoveFollower?: (targetUser: FollowUser) => void;
  filledFollowing?: FollowUser[];
  myFollowing?: FollowUser[];
}

export default function FollowList({
  users,
  currentUserId,
  isMe,
  activeTab,
  onToggleFollow,
  onRemoveFollower = () => {},
  filledFollowing = [],
  myFollowing = [],
}: Props) {
  if (!users || users.length === 0)
    return <p className="text-gray-500 text-center py-2">No users</p>;

  return (
    <>
      {users.map((user) => {
        const nickname = user.authorNickname ?? user.userId ?? "Unknown";
        const firstLetter = nickname[0]?.toUpperCase() ?? "?";
        const isCurrentUser = currentUserId === user.userId;

        const isFollowing = myFollowing.some(f => f.userId === user.userId);

        return (
          <div
            key={user.userId}
            className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 w-full"
          >
            {/* ✅ 아바타 + 닉네임 클릭 시 authorNickname 기반 프로필 이동 */}
            <Link
              href={`/profile/${nickname}`}
              className="flex items-center gap-2 sm:gap-4 min-w-0 cursor-pointer hover:opacity-80 transition"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={nickname}
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs sm:text-sm md:text-lg font-bold text-gray-600 dark:text-gray-300 flex-shrink-0">
                  {firstLetter}
                </div>
              )}
              <span className="font-semibold text-xs sm:text-sm md:text-base truncate">
                {nickname}
              </span>
            </Link>

            {/* 버튼 영역 */}
            {!isCurrentUser && (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {isMe && activeTab === "followers" ? (
                  <FollowButton
                    isFollowing={true}
                    loading={false}
                    onToggle={() => onRemoveFollower(user)}
                    removeMode={true}
                  />
                ) : isMe && activeTab === "following" ? (
                  <FollowButton
                    isFollowing={true}
                    loading={false}
                    onToggle={() => onToggleFollow?.(user.userId)}
                  />
                ) : (
                  <FollowButton
                    isFollowing={isFollowing}
                    loading={false}
                    onToggle={() => onToggleFollow?.(user.userId)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
