// src/utils/migratePosts.ts
import axios from "axios";

export async function migratePosts() {
  try {
    // 기존 posts 전체 가져오기
    const res = await axios.get("/api/posts/legacy");
    const oldPosts = res.data.posts; // [{ id, userId, ... }]

    for (const post of oldPosts) {
      const { id: postId, userId, ...postData } = post;
      if (!userId) continue;

      // users/{userId}/posts/{postId} 경로로 마이그레이션
      await axios.post("/api/posts/migrate", {
        postId,
        userId,
        postData,
      });

      console.log(`✅ Migrated post ${postId} to users/${userId}/posts/${postId}`);
    }
  } catch (err) {
    console.error("Failed to migrate posts:", err);
  }
}
