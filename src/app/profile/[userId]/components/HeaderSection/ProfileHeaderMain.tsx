// src/app/profile/[userId]/components/HeaderSection/ProfileHeaderMain.tsx

'use client'

import { MapPin, Users } from 'lucide-react'
import UserAvatar from '@/components/UserAvatar'
import type { ProfileUser } from '@/types/user'
import ProfileLevelAndPoints from '@/components/profile/ProfileLevelAndPoints'


interface Props {
  profile: ProfileUser
  isMe: boolean
  sportTheme: string
  bannerImg: string
  themeColor: string
  relInfo: { label: string; color: string }
  isPending: boolean
  onSupport: () => void
  onShowLevelModal: () => void
}

export default function ProfileHeaderMain({
  profile,
  isMe,
  bannerImg,
  themeColor,
  relInfo,
  isPending,
  onSupport,
  onShowLevelModal,
}: Props) {
  return (
    <section className="relative overflow-hidden rounded-2xl shadow-xl border border-gray-200 bg-white">
      {/* 🎽 상단 팀 컬러 바 */}
      <div
        className="absolute top-0 left-0 w-full h-2 rounded-t-2xl"
        style={{ background: themeColor }}
      />

      {/* 🏟️ 배너 이미지 (반투명 오버레이) */}
      <div
        className="h-28 w-full bg-cover bg-center rounded-t-2xl"
        style={{
          backgroundImage: `url(${bannerImg})`,
          backgroundColor: `${themeColor}22`,
          backgroundBlendMode: 'multiply',
        }}
      />

      {/* ⚾ 콘텐츠 본문 */}
      <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 px-6 sm:px-10 pb-6 -mt-10">
        {/* 🧢 아바타 */}
        <div className="relative">
          <div
            className="absolute inset-0 blur-lg opacity-60 rounded-full"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${themeColor}, transparent 70%)`,
            }}
          />
          <div className="relative p-[4px] rounded-full bg-white shadow-md">
            <UserAvatar
              userId={profile.id}
              avatarUrl={profile.photoURL}
              name={profile.displayName}
              size={90}
              showName={false}
              linkToProfile={false}
            />
          </div>
        </div>

        {/* 🏅 정보 */}
        <div className="flex-1 text-center sm:text-left space-y-2">
          {/* 이름 */}
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {profile.displayName}
          </h1>

          {/* 레벨 & 포인트 */}
          <ProfileLevelAndPoints
            level={profile.level ?? 'Bronze'}
            points={profile.points ?? 0}
            isMe={isMe}
            userId={profile.id}
            onShowLevelModal={onShowLevelModal}
            className="justify-center sm:justify-start"
          />

          {/* 지역 / 종목 */}
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs text-gray-600">
            {profile.region && (
              <span className="flex items-center gap-1">
                <MapPin size={14} className="text-gray-500" /> {profile.region}
              </span>
            )}
            {(profile.sports?.length ? profile.sports : ['All Sports']).map((sport) => (
              <span
                key={sport}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide border"
                style={{
                  backgroundColor: `${themeColor}15`,
                  borderColor: `${themeColor}55`,
                  color: themeColor,
                }}
              >
                {sport}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="italic text-xs text-gray-500 max-w-xl mx-auto sm:mx-0 mt-2">
            {profile.bio || '“Play together. Support stronger.”'}
          </p>

          {/* 팬 / 서포터 */}
          <div className="flex justify-center sm:justify-start items-center gap-3 text-[11px] text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <Users size={13} /> {profile.teammatesCount} teammates
            </span>
            <span className="flex items-center gap-1">
              🫶 {profile.supportersCount} supporters
            </span>
          </div>

          {/* 버튼 영역 */}
          <div className="mt-3">
            {!isMe ? (
              <button
                onClick={onSupport}
                disabled={isPending}
                className="px-5 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full shadow-sm transition active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${relInfo.color}, ${themeColor})`,
                  color: 'white',
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? 'Updating...' : relInfo.label}
              </button>
            ) : (
              <a
                href="/profile/edit"
                className="px-5 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Edit Profile
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
