// src/lib/meetups.ts

import { supabase } from "../lib/supabaseServer";
import { doc, setDoc } from "firebase/firestore";
import { db as firebaseDb } from "@/lib/firebase";
import type { Meetup } from "@/types/event";

/**
 * ✅ Meetup 생성
 * Supabase → Firestore
 */
export async function createMeetup(
  meetup: Partial<Meetup>
): Promise<string> {
  try {
    // ──────────────────────────
    // 1️⃣ Supabase에 meetup 생성 (id 확보)
    // ──────────────────────────
    const { data, error } = await supabase
      .from("meetups")
      .insert({
        event_id: meetup.eventId ?? null,
        host_id: meetup.hostId ?? "",
        title: meetup.title ?? "",
        datetime: meetup.datetime ?? new Date().toISOString(),
        lat: meetup.location?.lat ?? 0,
        lng: meetup.location?.lng ?? 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("❌ supabase createMeetup error:", error);
      throw new Error("Failed to create meetup");
    }

    const meetupId = String(data.id);

    // ──────────────────────────
    // 2️⃣ Firestore에 동일 id로 문서 생성
    // ──────────────────────────
    const ref = doc(firebaseDb, "meetups", meetupId);

    await setDoc(ref, {
      ...meetup,
      id: meetupId,
      participants: [],
      pendingParticipants: [],
      createdAt: new Date().toISOString(),
    });

    console.log(`✅ Meetup created: ${meetupId}`);
    return meetupId;
  } catch (err) {
    console.error("❌ createMeetup error:", err);
    throw err;
  }
}
