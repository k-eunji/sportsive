//src/types/feed.ts

export type FeedType =
  | "post"
  | "meetup"
  | "match"
  | "live"
  | "teamUpdate"
  | "relationship";

export interface FeedItem {
  id: string;
  type: FeedType;
  userId: string;
  userName: string;
  createdAt: string;
  content?: string;
  teamId?: string;
  teamName?: string;
  media?: string[];
  location?: { name: string; lat?: number; lng?: number };
  meta?: {
    participants?: string[];
    comments?: number;     
    likes?: number;
    status?: "upcoming" | "live" | "ended";
  };
}
