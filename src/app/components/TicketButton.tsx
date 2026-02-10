// src/app/components/TicketButton.tsx
"use client";

import { track } from "@/lib/track";

type Props = {
  href: string;
  eventId: string;
  sport?: string;
  city?: string;
  isPaid?: boolean;
};

export default function TicketButton({
  href,
  eventId,
  sport,
  city,
  isPaid,
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => {
        track("ticket_click_intent", {
          event_id: eventId,
          sport,
          city,
          source: "event_page",
        });
      }}
      className="inline-flex items-center justify-center rounded-2xl border py-3 text-sm font-semibold"
    >
      {isPaid ? "Buy official tickets" : "View official event info"}
    </a>
  );
}
