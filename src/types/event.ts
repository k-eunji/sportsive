// src/types/event.ts

import type { Location, Timestamp } from "./common";

export interface Event {
  id: string;
  
  title?: string;
  date: string;
  startDate?: string; // "2026-06-29"
  endDate?: string;  
  sport: 'football' | 'rugby' | 'tennis' | 'f1' | 'racing';
  kind: 'match' | 'session' | 'race' | 'round';
  description?: string;
  location: Location;
  venue?: string;
  price?: number;
  free: boolean;
  logo?: string;
  organizerId: string;
  attendees: string[];
  tags?: string[];
  homeTeam?: string;
  awayTeam?: string;
  payload?: Record<string, any>;

  // ⭐️ 여기 추가!!!
  homeTeamId?: string;
  awayTeamId?: string;

  status?: string;
  teams?: string[];
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  city?: string;
  region?: string;
  competition?: string;
  homepageUrl?: string;
  isPaid?: boolean;
  timeZone?: string;
}


export interface Meetup {
  id: string;
  eventId: string;
  hostId: string;
  participants: string[];
  title?: string;
  datetime: string; // ISO 문자열
  location?: {
    name?: string;
    address?: string;
    lat?: number;
    lng?: number;
    city?: string;      // ✅ 추가
    region?: string;    // ✅ 추가
  };
  event?: {
    homeTeam: string;
    awayTeam: string;
    homeTeamLogo?: string;
    awayTeamLogo?: string;
  };
  maxParticipants?: number; // 👈 추가
  teamType?: "home" | "away" | "neutral"; // 👈 추가
  teamId?: string;
  applicationDeadline?: string;  // 등록 마감일
  authorNickname?: string;        // 호스트 닉네임
  type?: "match_attendance" | "pub_gathering" | "online_game" | "pickup_sports" | "other"; // ✅ 추가
  onlineGameName?: string;
  onlineLink?: string;
  skillLevel?: "any" | "beginner" | "intermediate" | "advanced";
  sportType?: string; 
  fee?: number | "";
  ageLimit?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
  imageUrl?: string; 
  recurrence?: string;
  findUsNote?: string;
  purpose?: string;
  details?: string;    
  address?: string;
}

export interface MeetupWithEvent {
  id: string;
  datetime: string;
  location: {         // ✅ 여기가 올바르게 인터페이스 필드로 들어감
    name?: string;
    lat?: number;
    lng?: number;
    address?: string;
    city?: string;    // ✅ 추가
    region?: string;  // ✅ 추가
  };
  teamType: "home" | "away" | "neutral";
  participantsCount: number;
  participants?: string[];
  maxParticipants: number;
  userJoined: boolean;
  event?: Event | null;
  hostId: string;
  eventId?: string;
  participantsNicknames?: string[];
  pendingParticipantsNicknames?: string[];
  photos?: string[];
  game?: string;
  participantsAvatars?: string[];
  imageUrl?: string; // 썸네일 이미지 URL
  title: string; // 모임 제목
  type: "match_attendance" | "pub_gathering" | "online_game" | "pickup_sports" | "other"; // 모임 유형\
  applicationDeadline?: string;  // 등록 마감일
  authorNickname?: string;        // 호스트 닉네임
  city?: string; 
  onlineGameName?: string;
  onlineLink?: string;
  skillLevel?: "any" | "beginner" | "intermediate" | "advanced";
  sportType?: string; 
  fee?: number | "";
  ageLimit?: string;
  ageFrom: number | null; // ✅ 추가
  ageTo: number | null;  
  recurrence?: string;
  findUsNote?: string;
  purpose?: string;
  details?: string;

  upcomingEvents?: Event[]; // 🔥 MatchSelection에서 사용
  // ✅ 추가: 프론트에서 불러오는 상세 참가자 리스트
  participantsDetailed?: {
    id: string;
    name: string;
    avatar?: string;   
  }[];

  // ✅ 추가: 승인 대기 중 참가자 리스트 (호스트용)
  pendingParticipants?: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  reviewsOpen?: boolean
}

export type MeetupWithNicknames = MeetupWithEvent & {
  participantsNicknames?: { id: string; name: string; avatar?: string }[];
  pendingParticipantsNicknames?: { id: string; name: string; avatar?: string }[];
};

export interface MeetupWithRelated extends MeetupWithEvent {
  relatedMeetups?: MeetupWithEvent[];
}