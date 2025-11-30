// src/lib/api/hidePost.ts
import axios from "axios";

// ✅ 특정 포스트 숨기기
export async function hidePost(userId: string, postId: string) {
  try {
    await axios.post("/api/posts/hide", { userId, postId });
  } catch (err) {
    console.error("Failed to hide post", err);
  }
}

// ✅ 특정 포스트 숨김 해제
export async function unhidePost(userId: string, postId: string) {
  try {
    await axios.post("/api/posts/unhide", { userId, postId });
  } catch (err) {
    console.error("Failed to unhide post", err);
  }
}

// ✅ 사용자가 숨긴 포스트 ID 목록 가져오기
export async function getHiddenPosts(userId: string): Promise<string[]> {
  try {
    const res = await axios.get("/api/posts/hidden", { params: { userId } });
    return res.data.hiddenPostIds || [];
  } catch (err) {
    console.error("Failed to fetch hidden posts", err);
    return [];
  }
}
