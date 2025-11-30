// FILE: functions/src/momvoteScheduler.ts

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * 1) 경기 시작 후 자동 MOMVote 생성
 */
export const autoCreateMOMVote = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "UTC",
  },
  async () => {
    logger.log("⏱ Running autoCreateMOMVote");

    const teamsSnap = await db.collection("teams").get();

    for (const teamDoc of teamsSnap.docs) {
      const teamId = teamDoc.id;

      // 경기 정보 가져오기
      const eventsRes = await fetch(
        `https://your-domain.com/api/events/england/football`
      ).then((r) => r.json());

      const now = Date.now();
      const today = new Date().toISOString().slice(0, 10);

      const todayMatch = eventsRes.matches.find((m: any) =>
        m.date.startsWith(today)
      );

      if (!todayMatch) continue;

      const kickoff = new Date(todayMatch.kickoff || todayMatch.date).getTime();
      if (now < kickoff) continue;

      // 이미 생성되어 있나 확인
      const exist = await db
        .collection("teams")
        .doc(teamId)
        .collection("fanZone")
        .where("type", "==", "momvote")
        .where("data.matchId", "==", todayMatch.id)
        .get();

      if (!exist.empty) continue;

      logger.log(`🔥 Creating MOMVote for ${teamId}`);

      const ref = db
        .collection("teams")
        .doc(teamId)
        .collection("fanZone")
        .doc();

      await ref.set({
        id: ref.id,
        type: "momvote",
        createdAt: new Date().toISOString(),
        reactions: { likes: 0, comments: 0, participants: 0 },
        data: {
          title: `MOM vs ${todayMatch.opponent}`,
          matchId: todayMatch.id,
          opponent: todayMatch.opponent,
          kickoff: todayMatch.kickoff,
          createdBy: "system",
          expiresAt: today + "T23:59:59Z",
          locked: false,
          candidates:
            todayMatch.players?.map((p: any) => ({
              playerId: p.id,
              playerName: p.name,
              playerImage: p.photo,
              reason: "",
              votes: 0,
            })) ?? [],
        },
      });
    }
  }
);

/**
 * 2) 하루 지나면 자동 종료 & 기록 저장
 */
export const autoCloseMOMVote = onSchedule(
  {
    schedule: "every 10 minutes",
    timeZone: "UTC",
  },
  async () => {
    logger.log("⏱ Running autoCloseMOMVote");

    const teamsSnap = await db.collection("teams").get();

    for (const teamDoc of teamsSnap.docs) {
      const teamId = teamDoc.id;

      const snap = await db
        .collection("teams")
        .doc(teamId)
        .collection("fanZone")
        .where("type", "==", "momvote")
        .get();

      for (const doc of snap.docs) {
        const m = doc.data() as any;
        if (m.data.locked) continue;

        const expired = Date.now() > new Date(m.data.expiresAt).getTime();
        if (!expired) continue;

        const winner = [...m.data.candidates].sort(
          (a, b) => b.votes - a.votes
        )[0];

        await db
          .collection("teams")
          .doc(teamId)
          .collection("matchHistory")
          .doc(m.data.matchId)
          .set({
            matchId: m.data.matchId,
            opponent: m.data.opponent,
            kickoff: m.data.kickoff,
            mom: winner,
            totalVotes: m.reactions.participants,
            closedAt: new Date().toISOString(),
          });

        await doc.ref.update({
          "data.locked": true,
        });
      }
    }
  }
);
