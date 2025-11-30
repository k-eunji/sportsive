// src/utils/migrateComments.ts
import axios from "axios";

export async function migrateCommentsFillNicknames() {
  try {
    // authorNickname이 없는 댓글 조회
    const res = await axios.get("/api/comments/missingNicknames");
    const comments = res.data.comments; // [{ id, userId }]

    const promises = comments.map(async (comment: { id: string; userId: string }) => {
      // userId로 닉네임 가져오기
      const userRes = await axios.get("/api/getNickname", { params: { uid: comment.userId } });
      const nickname = userRes.data.authorNickname || "Anonymous";

      // 댓글 업데이트
      await axios.post("/api/comments/updateNickname", {
        commentId: comment.id,
        authorNickname: nickname,
      });
    });

    await Promise.all(promises);
    console.log("Migration for comments authorNickname done!");
  } catch (err) {
    console.error("Failed to migrate comments:", err);
  }
}
