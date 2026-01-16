//src/app/live/LiveRoomView.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import ChatRoom from './[sport]/[liveId]/components/ChatRoom'
import EmotionGraph from './[sport]/[liveId]/components/EmotionGraph'
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

interface MatchLiveEvent {
  id: string;
  kind: "match";
  date: string;
  participants: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

interface SessionLiveEvent {
  id: string;
  kind: "session";
  date: string;
  participants: number;
  title: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
}

type LiveEvent = MatchLiveEvent | SessionLiveEvent;

export default function LiveRoomView({
  sport,
  liveId,
  variant = "overlay",
  onClose,
}: {
  sport: string;
  liveId: string;
  variant?: "overlay" | "page";
  onClose?: () => void;
}) {

  const [event, setEvent] = useState<LiveEvent | null>(null);
  const [status, setStatus] =
    useState<'Scheduled' | 'LIVE' | 'END'>('Scheduled');
  const [activeTab, setActiveTab] =
    useState<'chat' | 'timeline' | 'stats'>('chat');

  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const router = useRouter();


  // 1️⃣ 이벤트 로드
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

  // 2️⃣ LIVE 상태 계산
  useEffect(() => {
    if (!event) return;
    const now = new Date();

    if (event.kind === "session") {
      setStatus("LIVE");
      return;
    }

    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);

    if (now >= start && now <= end) setStatus("LIVE");
    else if (now > end) setStatus("END");
    else setStatus("Scheduled");
  }, [event]);

  // 3️⃣ presence 등록 / 해제
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

    setDoc(ref, { joinedAt: serverTimestamp() });

    return () => {
      deleteDoc(ref);
    };
  }, [sport, liveId]);

  // 4️⃣ participants 계산
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

  if (!event) return null;

  return (
    <main
      className={
        variant === "page"
        ? "fixed inset-0 z-[120] flex flex-col bg-background"
        : "fixed inset-x-0 bottom-0 z-[120] flex flex-col bg-background rounded-t-3xl max-h-[70vh] border-t shadow-lg"
      }
    >

      {/* HEADER */}
      <div className="shrink-0 border-b px-4 py-3 bg-background">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            {event.kind === "session" ? (
              <>
                <p className="text-sm font-semibold truncate">
                  🎾 {event.title}
                </p>
                {event.venue && (
                  <p className="text-xs text-muted-foreground truncate">
                    {event.venue}
                  </p>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2">
                {event.homeTeamLogo && (
                  <img src={event.homeTeamLogo} className="w-6 h-6 rounded-full" />
                )}
                <span className="text-sm font-semibold truncate">
                  {event.homeTeam} vs {event.awayTeam}
                </span>
                {event.awayTeamLogo && (
                  <img src={event.awayTeamLogo} className="w-6 h-6 rounded-full" />
                )}
              </div>
            )}
          </div>

          <div className="text-right text-xs">
            <p className={status === "LIVE" ? "text-red-600 font-semibold" : ""}>
              {status}
            </p>
            <p className="text-muted-foreground">
              {event.participants} chatting
            </p>
            {variant === "overlay" ? (
              <button
                onClick={onClose}
                className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="mt-1 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        <nav className="mt-3 flex gap-6 text-sm">
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
