// src/lib/firebaseAdmin.ts

import "server-only";
import admin from "firebase-admin";

// ✅ base64 환경변수 필수
if (!process.env.FIREBASE_PRIVATE_KEY_B64) {
  throw new Error("FIREBASE_PRIVATE_KEY_B64 is missing");
}

// ✅ base64 → JSON
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf-8")
);

// ✅ ✅ ✅ 핵심: 중복 초기화 완전 차단
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized (SAFE)");
}

// ✅ ✅ ✅ 여기서는 app 넘기지 않는다 (최신 firebase-admin 규칙)
export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;
