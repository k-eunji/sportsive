// fillCreatedAt.ts
import admin from "firebase-admin";

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // 또는 서비스 계정 키 JSON 사용
  });
}

const db = admin.firestore();

async function fillCreatedAt() {
  try {
    const matchesRef = db.collection("matches");
    const snapshot = await matchesRef.get();

    let updatedCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.createdAt) {
        console.log(`Updating doc ${doc.id}...`);
        doc.ref.update({ createdAt: admin.firestore.FieldValue.serverTimestamp() });
        updatedCount++;
      }
    });

    console.log(`Updated ${updatedCount} documents.`);
  } catch (err) {
    console.error("Error updating documents:", err);
  }
}

// 실행
fillCreatedAt().then(() => process.exit());
