// src/app/meetups/[meetupId]/components/ParticipantsList.tsx

"use client";

import Link from "next/link";

interface ParticipantsListProps {
  participants: { name: string; avatar?: string; id: string }[];
  pending: { name: string; avatar?: string; id: string }[];
  isHost: boolean;
  onApprove: (userId: string) => void;
}

export default function ParticipantsList({
  participants,
  pending,
  isHost,
  onApprove,
}: ParticipantsListProps) {
  return (
    <div className="space-y-6">

      {/* Participants */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">
          PARTICIPANTS
        </h3>

        {participants.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
            {participants.map((p) => (
              <Link
                key={p.id}
                href={`/profile/${p.id}`}
                className="flex flex-col items-center text-sm"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">
                      {p.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                <span className="truncate mt-1 text-center text-xs text-muted-foreground w-full">
                  {p.name}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No participants yet.</p>
        )}
      </div>

      {/* Pending */}
      {isHost && pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 tracking-wide">
            PENDING APPROVAL
          </h3>

          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center border border-border p-2.5 rounded-md"
              >
                <Link
                  href={`/profile/${p.id}`}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                    {p.avatar ? (
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        {p.name?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-foreground font-medium">{p.name}</span>
                </Link>

                <button
                  onClick={() => onApprove(p.id)}
                  className="px-3 py-1 text-xs rounded-full bg-primary text-white hover:bg-primary/90 transition"
                >
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
