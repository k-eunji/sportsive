// src/lib/firebaseAdmin.ts

import "server-only";
import admin from "firebase-admin";

// ✅ Vercel + 로컬 공용: JSON 통째로 쓰는 방식
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT env var is missing");
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized");
}

export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;
