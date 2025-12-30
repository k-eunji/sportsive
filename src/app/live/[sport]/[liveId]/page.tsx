// src/app/live/[sport]/[liveId]/page.tsx

'use client'

import React, { useState, useEffect, useRef } from 'react'
import ChatRoom from './components/ChatRoom'
import EmotionGraph from './components/EmotionGraph'
import {
  doc,
  onSnapshot,
  collection,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  date: string;
  participants: number;
}

export default function LiveRoomPage({
  params,
}: {
  params: Promise<{ sport: string; liveId: string }>
}) {
  const resolved = React.use(params);
  if (!resolved) return <p className="text-center mt-20">Loading…</p>;

  const { sport, liveId } = resolved;
  const router = useRouter();

  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [status, setStatus] =
    useState<'Scheduled' | 'LIVE' | 'END'>('Scheduled');
  const [activeTab, setActiveTab] =
    useState<'chat' | 'timeline' | 'stats'>('chat');

  // 🔑 sessionId (게스트/로그인 공통)
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // 1️⃣ 기본 이벤트 로드 (participants는 서버 계산)
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/live/${sport}/${liveId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setEvent(data);
    };
    load();
  }, [sport, liveId]);

  // 2️⃣ LIVE / END 상태 계산
  useEffect(() => {
    if (!event) return;
    const start = new Date(event.date);
    const now = new Date();
    const end = new Date(start.getTime() + 2 * 3600 * 1000);

    if (now >= start && now <= end) setStatus("LIVE");
    else if (now > end) setStatus("END");
    else setStatus("Scheduled");
  }, [event]);

  // 3️⃣ presence 등록 / 해제 (🔥 핵심)
  useEffect(() => {
    const ref = doc(
      db,
      "live_events",
      sport,
      "events",
      liveId,
      "presence",
      sessionIdRef.current
    );

    setDoc(ref, {
      joinedAt: serverTimestamp(),
    });

    return () => {
      deleteDoc(ref);
    };
  }, [sport, liveId]);

  // 4️⃣ participants 실시간 계산 (presence count)
  useEffect(() => {
    const presenceRef = collection(
      db,
      "live_events",
      sport,
      "events",
      liveId,
      "presence"
    );

    const unsub = onSnapshot(presenceRef, (snap) => {
      setEvent((prev) =>
        prev ? { ...prev, participants: snap.size } : prev
      );
    });

    return () => unsub();
  }, [sport, liveId]);

  if (!event) return <p className="text-center mt-20">Loading…</p>;

  return (
    <main className="fixed inset-0 flex flex-col bg-background text-foreground">

      {/* HEADER */}
      <div className="shrink-0 border-b px-4 py-3">
        <div className="flex justify-between items-center">

          <div className="flex items-center gap-2">
            <img src={event.homeTeamLogo} className="w-6 h-6 rounded-full" />
            <span className="font-semibold text-sm">{event.homeTeam}</span>
            <span className="mx-1">vs</span>
            <span className="font-semibold text-sm">{event.awayTeam}</span>
            <img src={event.awayTeamLogo} className="w-6 h-6 rounded-full" />
          </div>

          <div className="flex flex-col items-end text-xs">
            <span className="text-red-500 font-semibold">
              {status}
            </span>
            <span className="text-muted-foreground">
              {event.participants} chatting
            </span>
            <button onClick={() => router.push("/live")}>🗣️</button>
          </div>
        </div>

        {/* TABS */}
        <nav className="mt-3 flex gap-6">
          {['chat', 'timeline', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={activeTab === tab ? 'font-semibold' : ''}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <ChatRoom sport={sport} liveId={liveId} matchStatus={status} />
        )}
        {activeTab === 'stats' && (
          <EmotionGraph sport={sport} liveId={liveId} />
        )}
        {activeTab === 'timeline' && (
          <div className="text-center mt-10 text-muted-foreground">
            Timeline coming soon…
          </div>
        )}
      </div>
    </main>
  );
}
