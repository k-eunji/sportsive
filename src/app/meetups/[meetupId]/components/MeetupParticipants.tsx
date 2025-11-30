// src/app/meetups/[meetupId]/components/MeetupParticipants.tsx

"use client";

import { useState } from "react";
import ParticipantsList from "./ParticipantsList";
import type { MeetupWithEvent } from "@/types/event";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function MeetupParticipants({
  meetup,
  isHost = false,
}: {
  meetup: MeetupWithEvent;
  isHost?: boolean;
}) {
  const participants = meetup.participantsDetailed ?? [];
  const count = participants.length;
  const [open, setOpen] = useState(false);

  // max 5 for preview avatar row
  const visibleParticipants = participants.slice(0, 5);

  return (
    <section className="w-full pt-4 pb-6 border-t border-border mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          PARTICIPANTS
        </h2>

        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(true)}
          >
            View all ({count})
          </Button>
        )}
      </div>

      {/* Preview row */}
      <div className="flex items-center gap-3">
        {/* Avatar group */}
        {count > 0 && (
          <div className="flex -space-x-2">
            {visibleParticipants.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.id}`}
                className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-muted-foreground text-sm font-semibold overflow-hidden hover:opacity-80 transition"
                title={p.name}
              >
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{p.name?.[0]?.toUpperCase() ?? "?"}</span>
                )}
              </Link>
            ))}
          </div>
        )}

        <span className="text-sm font-medium text-muted-foreground">
          {count === 0
            ? "No attendees yet"
            : `${count} attendee${count > 1 ? "s" : ""}`}
        </span>
      </div>

      {/* Host-only management */}
      {isHost && (
        <div className="mt-6">
          <ParticipantsList
            participants={participants}
            pending={meetup.pendingParticipants ?? []}
            isHost={isHost}
            onApprove={(userId) => console.log("approve", userId)}
          />
        </div>
      )}

      {/* Modal list */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All Participants ({count})</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <ParticipantsList
              participants={participants}
              pending={[]}
              isHost={false}
              onApprove={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
