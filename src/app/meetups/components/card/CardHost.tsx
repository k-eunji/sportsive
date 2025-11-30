// src/app/meetups/components/card/CardHost.tsx
"use client";

import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";

export default function CardHost({ hostId }: { hostId: string }) {
  const [host, setHost] = useState<{
    displayName: string;
    photoURL?: string;
  } | null>(null);

  useEffect(() => {
    if (!hostId) return;

    (async () => {
      try {
        const res = await fetch(`/api/users/${hostId}`);
        if (res.ok) setHost(await res.json());
      } catch (err) {
        console.error("❌ Failed to fetch host:", err);
      }
    })();
  }, [hostId]);

  if (!host) {
    return (
      <div className="flex items-center gap-2 mb-1 opacity-40">
        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse" />
        <span className="text-[11px] text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-1">
      <UserAvatar
        userId={hostId}
        name={host.displayName}
        avatarUrl={host.photoURL}
        size={20}
        showName={false}
        linkToProfile={true}
      />
      <span className="text-[11px] text-gray-500 dark:text-gray-400">
        Host: {host.displayName}
      </span>
    </div>
  );
}
