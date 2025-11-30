// src/types/Match.ts

export interface Match {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  location: { lat: number; lng: number; address: string };
  free: boolean;
  price?: number;
  organizerId: string;
  attendees: string[];
  tags?: string[];
  teams?: string[]; // 🔹 여기 추가
}

export interface MatchEvent {
  id: string;
  date: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamId?: string | number;
  awayTeamId?: string | number;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  venue?: string;
  city?: string;
  region?: string;
  competition?: string;
  location?: { lat: number; lng: number };
}