// src/lib/firebaseAdmin.ts

import "server-only";
import admin from "firebase-admin";

// 이미 초기화된 경우 재사용
if (!admin.apps.length) {
  if (!process.env.FIREBASE_PRIVATE_KEY_B64) {
    console.error("❌ Missing FIREBASE_PRIVATE_KEY_B64");
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY_B64
    ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf8")
    : undefined;

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized on Vercel");
}

// ---- 기존 export 유지 ----
export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;

