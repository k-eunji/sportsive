// FILE: scripts/deleteMomVotes.ts
import admin from "firebase-admin";
import fs from "fs";
import path from "path";

// 🔥 JSON 파일 직접 읽기 (ESM 문제 해결)
const serviceAccountPath = path.resolve("serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// 이미 초기화되어 있다면 에러가 날 수 있으므로 try/catch
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (e) {
  // ignore
}

const db = admin.firestore();

async function deleteMomVotes(teamId: string) {
  const snap = await db
    .collection("teams")
    .doc(teamId)
    .collection("fanZone")
    .where("type", "==", "momvote")
    .get();

  console.log(`Found ${snap.size} MOM Vote docs`);

  if (snap.empty) {
    console.log("Nothing to delete.");
    return;
  }

  const batch = db.batch();

  snap.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();
  console.log("🔥 All MOM Vote documents deleted.");
}

const teamId = process.argv[2];

if (!teamId) {
  console.error("❌ Usage: npm run delete-mom TEAM_ID");
  process.exit(1);
}

deleteMomVotes(teamId);
