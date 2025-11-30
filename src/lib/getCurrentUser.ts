// src/lib/getCurrentUser.ts

import { adminAuth } from "@/lib/firebaseAdmin";

export async function getCurrentUserId(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    console.error("❌ Token verify failed:", err);
    return null;
  }
}
