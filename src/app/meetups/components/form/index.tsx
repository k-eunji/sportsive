// src/app/meetups/components/form/index.tsx

"use client";

/**
 * ✅ Next.js 15 + Tailwind 4 환경용 폼 컴포넌트 인덱스
 * - 모든 폼 하위 컴포넌트를 중앙 관리
 * - IDE 자동완성과 import 정리 일관성 확보
 */

export { default as MeetupTypeSelect } from "./MeetupTypeSelect";
export { default as MatchSelection } from "./MatchSelection";
export { default as OnlineGameFields } from "./OnlineGameFields";
export { default as VenueFields } from "./VenueFields";
export { default as ParticipantsFields } from "./ParticipantsFields";
export { default as ExtraFields } from "./ExtraFields";
export { MeetupImageSelector } from "./MeetupImageSelector"; // ✅ explicit named export 유지
