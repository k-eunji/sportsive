
// src/lib/api/posts.ts
import { Post } from "@/types/post"; // Post 타입 가져오기

export type GetPostsParams = {
  limit?: number;
  lastId?: string;
  hashtag?: string;
  category?: string;
};

// Firestore 호출 예시
export async function getPosts(params: GetPostsParams): Promise<Post[]> {
  const { limit = 10 } = params;
  return []; // 임시 반환
}

// ✅ Post 타입도 export
export type { Post };
