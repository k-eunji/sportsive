// src/lib/postUtils.ts
import axios from "axios";

// ✅ Increment post view count
export const incrementViewCount = async (postId: string) => {
  try {
    await axios.post("/api/posts/incrementView", { postId });
  } catch (err) {
    console.error("Failed to increment views:", err);
  }
};
