// src/app/profile/[userId]/components/HeaderSection/bannerUtils.ts

import type { ProfileUser } from '@/types/user'

export function getBannerTheme(profile: ProfileUser) {
  const sportTheme = profile.sports?.[0]?.toLowerCase() || 'soccer'
  const bannerImg =
    sportTheme === 'soccer'
      ? '/demo/soccer-stadium-banner.jpg'
      : sportTheme === 'basketball'
      ? '/demo/basketball-court-banner.jpg'
      : sportTheme === 'baseball'
      ? '/demo/baseball-field-banner.jpg'
      : '/demo/default-sports-banner.jpg'

  const themeColor =
    sportTheme === 'soccer'
      ? '#007bff'
      : sportTheme === 'basketball'
      ? '#ff6b00'
      : sportTheme === 'baseball'
      ? '#004b23'
      : '#3b82f6'

  return { sportTheme, bannerImg, themeColor }
}
