// src/types/post.ts

export type Post = {
  id: string;
  userId?: string;
  authorNickname: string;
  authorPhotoURL?: string;
  createdAt: string;
  updatedAt?: string;
  content: string;
  mediaURL?: string;
  mediaType?: "image" | "video";
  likeCount: number;
  commentCount: number;
  hashtags: string[];
  category: string;
  likedBy?: string[];
  viewCount?: number;
};
