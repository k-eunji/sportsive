// src/lib/meetups.ts

import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { doc, setDoc } from "firebase/firestore"; // ✅ updateDoc → setDoc 변경
import { db as firebaseDb } from "@/lib/firebase";
import type { Meetup } from "@/types/event";

const DB_FILE = path.join(process.cwd(), "sportsive.db");

/**
 * ✅ 클라이언트/로컬 환경용 Meetup 생성
 * SQLite → Firestore 양쪽에 저장
 */
export async function createMeetup(meetup: Partial<Meetup>): Promise<string> {
  const db = await open({ filename: DB_FILE, driver: sqlite3.Database });

  try {
    // 1️⃣ SQLite에 로컬 저장
    const result = await db.run(
      `INSERT INTO meetups (event_id, host_id, title, datetime, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        meetup.eventId ?? null,
        meetup.hostId ?? "",
        meetup.title ?? "",
        meetup.datetime ?? new Date().toISOString(),
        meetup.location?.lat ?? 0,
        meetup.location?.lng ?? 0,
      ]
    );

    const meetupId = String((result as any).lastID);
    if (!meetupId) throw new Error("❌ Failed to create meetup locally.");

    // 2️⃣ Firestore에 동일 문서 생성
    const ref = doc(firebaseDb, "meetups", meetupId);
    await setDoc(ref, {
      ...meetup,
      id: meetupId,
      participants: [],
      pendingParticipants: [],
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ [Client] Meetup created: ${meetupId}`);
    return meetupId;
  } catch (err) {
    console.error("❌ [Client] createMeetup error:", err);
    throw err;
  } finally {
    await db.close();
  }
}
