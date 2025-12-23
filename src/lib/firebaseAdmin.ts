// src/lib/firebaseAdmin.ts
import "server-only";
import admin from "firebase-admin";

const globalForFirebase = global as any;

if (!globalForFirebase._firebaseAdminApp) {
  const key = process.env.FIREBASE_PRIVATE_KEY_B64;
  if (!key) throw new Error("Missing FIREBASE_PRIVATE_KEY_B64");

  const serviceAccount = JSON.parse(
    Buffer.from(key, "base64").toString("utf8")
  );

  console.log("🔥 ADMIN PROJECT ID:", serviceAccount.project_id);

  serviceAccount.private_key =
    serviceAccount.private_key.replace(/\\n/g, "\n");

  globalForFirebase._firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: serviceAccount.project_id,
      clientEmail: serviceAccount.client_email,
      privateKey: serviceAccount.private_key,
    }),
    storageBucket: "sportsive-c12e0.firebasestorage.app",
  });

  // 🔥🔥 여기부터 추가 (중요)
  admin
    .firestore()
    .listCollections()
    .then((cols) => {
      console.log(
        "🔥 ADMIN sees collections:",
        cols.map((c) => c.id)
      );
    })
    .catch((err) => {
      console.error("🔥 ADMIN listCollections error:", err);
    });
  // 🔥🔥 여기까지
}

const app = globalForFirebase._firebaseAdminApp;

export const adminDb = admin.firestore(app);
export const adminAuth = admin.auth(app);
