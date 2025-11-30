// src/lib/utils/getNickname.ts
import axios from "axios";

// ✅ userId로 닉네임 가져오기
export async function getNicknameByUserId(uid: string): Promise<string> {
  try {
    const res = await axios.get("/api/getNickname", { params: { uid } });
    return typeof res.data.authorNickname === "string" ? res.data.authorNickname : "Anonymous";
  } catch (err) {
    console.error("Failed to fetch nickname", err);
    return "Anonymous";
  }
}
