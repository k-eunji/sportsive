// src/app/community/components/RightSidebar.tsx

"use client";

import { useEffect, useState } from "react";

export default function RightSidebar({ mode = "all" }: { mode?: string }) {
  const [friends, setFriends] = useState<any[]>([]);
  const [topFans, setTopFans] = useState<any[]>([]);
  const [live, setLive] = useState<any[]>([]);
  const [meetups, setMeetups] = useState<any[]>([]);

  // 🔥 커뮤니티 API 제거 → fetch도 제거 → 빈 배열로 초기화
  useEffect(() => {
    setFriends([]);
    setTopFans([]);
    setLive([]);
    setMeetups([]);
  }, []);

  const renderBlocks = () => {
    switch (mode) {
      case "meetup":
        return (
          <>
            <NearMeetups meetups={meetups} />
            <FriendActivity friends={friends} />
            <TopFans fans={topFans} />
          </>
        );
      case "live":
        return (
          <>
            <LiveMatches live={live} />
            <NearMeetups meetups={meetups} />
            <TopFans fans={topFans} />
          </>
        );
      case "relationship":
        return (
          <>
            <FriendActivity friends={friends} />
            <TopFans fans={topFans} />
          </>
        );
      default:
        return (
          <>
            <NearMeetups meetups={meetups} />
            <LiveMatches live={live} />
            <FriendActivity friends={friends} />
            <TopFans fans={topFans} />
          </>
        );
    }
  };

  return <aside className="space-y-6">{renderBlocks()}</aside>;
}

/* ────────────────────────────────
 * 🔸 서브 컴포넌트들
 * ──────────────────────────────── */
function NearMeetups({ meetups }: { meetups: any[] }) {
  return (
    <section className="border rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h3 className="font-semibold mb-3">📍 Nearby Meetups</h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {meetups.map((m) => (
          <li key={m.id} className="flex justify-between items-center">
            <span>{m.title}</span>
            <button className="text-xs text-blue-600 hover:underline">
              Join
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LiveMatches({ live }: { live: any[] }) {
  return (
    <section className="border rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h3 className="font-semibold mb-3">🔴 Live Matches</h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {live.map((l) => (
          <li key={l.id}>
            • {l.title} –{" "}
            <span className="text-red-500">{l.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function FriendActivity({ friends }: { friends: any[] }) {
  return (
    <section className="border rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h3 className="font-semibold mb-3">👥 Friend Activity</h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {friends.map((f) => (
          <li key={f.id}>
            <span className="font-medium">{f.name}</span> {f.action}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TopFans({ fans }: { fans: any[] }) {
  return (
    <section className="border rounded-xl bg-white dark:bg-gray-900 p-4 shadow-sm">
      <h3 className="font-semibold mb-3">🏆 Top Fans</h3>
      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
        {fans.map((f) => (
          <li key={f.rank}>
            {f.rank}️⃣ {f.name} — {f.points} pts
          </li>
        ))}
      </ul>
    </section>
  );
}
