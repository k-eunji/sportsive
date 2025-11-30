// src/lib/firebaseAdmin.ts

import "server-only";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// ---- Firebase Admin 초기화 (싱글톤) ----
if (!admin.apps.length) {
  let serviceAccountPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./serviceAccountKey.json";

  const fullPath = path.resolve(process.cwd(), serviceAccountPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`🚫 Firebase service account file not found: ${fullPath}`);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(fullPath, "utf8"));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized"); // ← 이제 딱 한 번만 찍힘
} else {
  console.log("♻️ Firebase Admin reused from admin.apps");
}

// ---- 기존 export 패턴 유지 (절대 삭제 금지) ----
export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;
