// src/app/live/[sport]/[liveId]/page.tsx

'use client'

import React, { useState, useEffect } from 'react'
import ChatRoom from './components/ChatRoom'
import EmotionGraph from './components/EmotionGraph'
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface LiveEvent {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  date: string;
  participants: number;  // ⭐ 반드시 추가!!!
}

export default function LiveRoomPage({ params }: { params: Promise<{ sport: string; liveId: string }> }) {
  const resolved = React.use(params);

  if (!resolved) {
    return <p className="text-center mt-20 text-lg">Loading…</p>;
  }

  const { sport, liveId } = resolved;

  const [event, setEvent] = useState<LiveEvent | null>(null)
  const [status, setStatus] = useState<'Scheduled' | 'LIVE' | 'END'>('Scheduled')
  const [activeTab, setActiveTab] = useState<'chat' | 'timeline' | 'stats'>('chat')
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/live/${sport}/${liveId}`)
      const data = await res.json()
      setEvent(data)
    }
    load()
  }, [sport, liveId])

  // 🔥 event.date 기준으로 경기가 LIVE/Scheduled/END 상태인지 계산
  useEffect(() => {
    if (!event) return;

    const startTime = new Date(event.date);
    const now = new Date();

    if (now >= startTime && now <= new Date(startTime.getTime() + 2 * 3600 * 1000)) {
      setStatus("LIVE");
    } else if (now > new Date(startTime.getTime() + 2 * 3600 * 1000)) {
      setStatus("END");
    } else {
      setStatus("Scheduled");
    }
  }, [event]);


  // 🔥 Firestore 실시간 참여자 업데이트
  useEffect(() => {
    if (!sport || !liveId) return;

    const ref = doc(db, "live_events", sport, "events", liveId);

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      setEvent((prev) =>
        prev
          ? { ...prev, participants: data.participants ?? 0 }
          : prev
      );
    });

    return () => unsubscribe();
  }, [sport, liveId]);


  useEffect(() => {
    if (!sport || !liveId) return;

    // +1
    fetch(`/api/live/${sport}/${liveId}/participants`, {
      method: "POST",
    });

    const leave = () => {
      navigator.sendBeacon(
        `/api/live/${sport}/${liveId}/participants`,
        JSON.stringify({ leave: true })
      );
    };

    window.addEventListener("beforeunload", leave);

    return () => {
      window.removeEventListener("beforeunload", leave);
      leave(); // React 내부 라우팅 시에도 -1
    };
  }, [sport, liveId]);

  if (!event) return <p className="text-center mt-20 text-lg">Loading…</p>

  return (
    /** 🔥 페이지 전체를 고정 */
    <main className="fixed inset-0 flex flex-col bg-background text-foreground">

      {/* TOP HEADER */}
      <div className="shrink-0 backdrop-blur-xl bg-background/50 border-b border-border px-4 py-3">
        <div className="flex justify-between items-center">

          {/* LEFT: TEAMS */}
          <div className="flex items-center gap-2 min-w-0"> {/* truncate key */}
            
            <img src={event.homeTeamLogo} className="w-6 h-6 rounded-full shrink-0" />

            <span className="font-semibold text-sm truncate max-w-[70px]">
              {event.homeTeam}
            </span>

            <span className="text-muted-foreground mx-1 shrink-0">vs</span>

            <span className="font-semibold text-sm truncate max-w-[70px]">
              {event.awayTeam}
            </span>

            <img src={event.awayTeamLogo} className="w-6 h-6 rounded-full shrink-0" />
          </div>

          {/* RIGHT: STATUS + LIVE BUTTON (VERTICAL) */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            
            {/* STATUS */}
            <span className="text-xs font-semibold text-red-500 flex items-center gap-1">
              {status === 'LIVE' && (
                <span className="size-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {status}
            </span>

              {/* 👇 여기 추가! 참여자 수 */}
              <span className="text-[11px] text-muted-foreground">
                {event.participants} chatting
              </span>


            {/* LIVE BUTTON */}
            <button
              onClick={() => router.push("/live")}
              className="text-base hover:opacity-70 transition leading-none"
              aria-label="Back to Live"
            >
              🗣️
            </button>
          </div>
        </div>

        {/* TABS */}
        <nav className="mt-3 flex gap-6 relative">
          {['chat', 'timeline', 'stats'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-1 text-sm relative ${
                activeTab === tab ? 'font-semibold text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.toUpperCase()}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"></span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chat' && (
          <ChatRoom
            sport={sport}
            liveId={liveId}
            matchStatus={status}
          />
        )}

        {activeTab === 'stats' && (
          <EmotionGraph sport={sport} liveId={liveId} />
        )}

        {activeTab === 'timeline' && (
          <div className="text-center text-muted-foreground mt-10">
            Timeline coming soon…
          </div>
        )}
      </div>
    </main>
  )
}
