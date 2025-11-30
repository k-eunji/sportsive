//src/types/user.ts

import type { MeetupWithEvent } from "./event";

export type CustomUser = {
  uid: string;
  userId: string;
  authorNickname: string;
  displayName?: string | null;
  email?: string | null;
  token?: string;
};

// ✅ 프로필 페이지 전용 유저 타입
export type ProfileUser = {
  id: string;
  displayName: string;
  bio?: string;
  region?: string;
  sports?: string[];
  hostedMeetups?: MeetupWithEvent[];  // ✅ 공통 타입 사용
  joinedMeetups?: MeetupWithEvent[];  // ✅ 공통 타입 사용
  reviews?: Review[];
  photoURL?: string;
  teams?: UserTeamSummary[];
  level?: "Bronze" | "Silver" | "Gold";
  points?: number;
  relationship?: 'NONE' | 'I_SUPPORT' | 'MUTUAL' | 'TEAMMATE'
  teammatesCount?: number;   // 함께하는 팀원 수
  supportersCount?: number;  // 나를 서포트하는 사람 수
  favoriteTeam?: {
    id: string
    name: string
  }
  participationCount?: number
  meetupCount?: number
};

// ✅ 간단한 서브 타입들
export type Review = {
  id: string;
  reviewer: string;
  rating: number;
  comment: string;
};

export type UserTeamSummary = {
  id: string;
  name: string;
  logo?: string | null;
  role?: string | null;
};
