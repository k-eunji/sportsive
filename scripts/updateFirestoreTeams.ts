// scripts/updateFirestoreTeams.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// __dirname 생성 (ESM용)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// team logos import
import { teamLogoMapById } from "../src/data/teamLogos.ts";

// ❗ 경로 직접 만들기
const serviceAccountPath = path.join(process.cwd(), "serviceAccountKey.json");

// ❗ JSON 파일 직접 읽기 (동적 import 금지!)
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// Firebase Admin 초기화
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function updateFirestoreTeamLogos() {
  console.log("🔥 Updating Firestore team logos ...");

  for (const [id, logo] of Object.entries(teamLogoMapById)) {
    await db.collection("teams").doc(id).update({
      logo,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✓ Updated Firestore team #${id} → ${logo}`);
  }

  console.log("🎉 Completed!");
}

updateFirestoreTeamLogos().catch(console.error);
