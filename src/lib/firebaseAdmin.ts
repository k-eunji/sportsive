import "server-only";
import admin from "firebase-admin";

if (!admin.apps.length) {
  let serviceAccount: any = {};

  if (process.env.FIREBASE_PRIVATE_KEY_B64) {
    const decoded = Buffer.from(process.env.FIREBASE_PRIVATE_KEY_B64, "base64").toString("utf8");
    serviceAccount = JSON.parse(decoded); // JSON 전체를 decode
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id ?? process.env.FIREBASE_PROJECT_ID,
      clientEmail: serviceAccount.client_email ?? process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: serviceAccount.private_key, // ⬅ 여기!
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  console.log("🔥 Firebase Admin initialized");
}

export const adminDb = admin.firestore();
export const db = adminDb;
export const adminDB = adminDb;
export const adminAuth = admin.auth();

export default admin;
