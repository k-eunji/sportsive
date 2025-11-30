// src/app/meetups/[meetupId]/components/MeetupHostCard.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import UserAvatar from "@/components/UserAvatar";

interface Host {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}

export default function MeetupHostCard({ hostId }: { hostId: string }) {
  const [host, setHost] = useState<Host | null>(null);

  useEffect(() => {
    if (!hostId) return;
    (async () => {
      try {
        const res = await fetch(`/api/users/${hostId}`);
        if (res.ok) setHost(await res.json());
      } catch (err) {
        console.error("Failed to fetch host:", err);
      }
    })();
  }, [hostId]);

  /* ===========================
      SKELETON (플랫 스타일)
  ============================*/
  if (!host) {
    return (
      <section className="w-full pt-4 pb-6 border-t border-border mt-6">

        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </div>
      </section>
    );
  }

  /* ===========================
            VIEW
  ============================*/
  return (
    <section className="w-full pt-4 pb-6 border-t border-border mt-6">

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground tracking-wide mb-4">
        HOST
      </h3>

      {/* Host info */}
      <Link
        href={`/profile/${host.id}`}
        className="flex items-center gap-3 group"
      >
        <UserAvatar
          userId={host.id}
          avatarUrl={host.photoURL}
          name={host.displayName}
          size={48}
          showName={false}
          linkToProfile={false}
        />

        <span className="text-base font-medium text-foreground group-hover:text-primary group-hover:underline transition-colors">
          {host.displayName}
        </span>
      </Link>

      {/* Bio */}
      {host.bio && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {host.bio}
        </p>
      )}
    </section>
  );
}
