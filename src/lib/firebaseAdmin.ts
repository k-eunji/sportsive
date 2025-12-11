// src/lib/firebaseAdmin.ts

import "server-only";
import admin from "firebase-admin";

/**
 * FIREBASE_PRIVATE_KEY_B64는 빌드 시점에 없을 수 있음.
 * → 빌드를 깨지 않도록 throw 제거.
 */
function getServiceAccount() {
  const key = process.env.FIREBASE_PRIVATE_KEY_B64;

  if (!key) {
    // ❗ 여기서 throw 금지 (빌드 실패 예방)
    return null;
  }

  try {
    return JSON.parse(Buffer.from(key, "base64").toString("utf-8"));
  } catch (e) {
    console.error("❌ Failed to parse FIREBASE_PRIVATE_KEY_B64");
    return null;
  }
}

const serviceAccount = getServiceAccount();

// 최초 초기화만 허용
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized (SAFE)");
}

/**
 * ⭐⭐⭐ 너가 말한 이 부분은 절대 삭제되면 안 됨.
 *     그대로 유지해줘야 Firebase를 다른 파일에서 사용 가능함.
 */

export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;
