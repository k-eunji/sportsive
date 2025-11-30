// src/app/profile/[userId]/components/ProfileHeaderSports.tsx
'use client'

// ✅ 정확한 default import (중괄호 ❌)
import HeaderSection from './HeaderSection/index'

// 나머지 export 연결 유지
export * from './HeaderSection/ProfileHeaderMain'
export * from './HeaderSection/LevelModal'
export * from './HeaderSection/useProfileSupport'
export * from './HeaderSection/bannerUtils'

// ✅ default export 명시
export default HeaderSection
