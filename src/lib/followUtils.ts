// src/lib/followUtils.ts
import axios from "axios";

// ✅ Follow a user
export async function followUser(currentUid: string, targetUid: string) {
  try {
    await axios.post("/api/follow", { currentUid, targetUid });
  } catch (err) {
    console.error("Failed to follow user:", err);
    throw err;
  }
}

// ✅ Unfollow a user
export async function unfollowUser(currentUid: string, targetUid: string) {
  try {
    await axios.post("/api/unfollow", { currentUid, targetUid });
  } catch (err) {
    console.error("Failed to unfollow user:", err);
    throw err;
  }
}

// ✅ Check if current user is following target user
export async function isFollowing(currentUid: string, targetUid: string): Promise<boolean> {
  try {
    const res = await axios.get("/api/isFollowing", {
      params: { currentUid, targetUid },
    });
    return res.data.isFollowing;
  } catch (err) {
    console.error("Failed to check following status:", err);
    return false;
  }
}
