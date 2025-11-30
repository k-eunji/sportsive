// src/lib/api/checkNickname.ts

import axios from "axios";

export const checkNicknameExists = async (nickname: string) => {
  try {
    const res = await axios.get("/api/checkNickname", { params: { nickname } });
    return { exists: res.data.exists };
  } catch (err) {
    console.error("Failed to check nickname", err);
    return { exists: false };
  }
};
