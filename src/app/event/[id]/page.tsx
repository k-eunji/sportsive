// src/app/event/[id]/page.tsx

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import type { Event } from "@/types";
import { track } from "@/lib/track";

import { buildEventDetailVM } from "@/lib/eventDetailVM";
import {
  buildNearbyToday,
  buildMoreThisWeekend,
} from "@/lib/events/nearby";
import { getEventTimeState } from "@/lib/eventTime";
import EventPageTracker from "@/app/components/tracking/EventPageTracker";
import TicketButton from "@/app/components/TicketButton";

/* =========================
   TYPES
========================= */

type NearbyItem = {
  id: string | number;
  title: string;
  timeLabel: string;
  city: string;
  status?: "LIVE" | "SOON" | "UPCOMING";
};

/* =========================
   METADATA
========================= */

export async function generateMetadata() {
  return {
    title: "Event detail | Sportsive",
  };
}

/* =========================
   DATA FETCH
========================= */

async function fetchEvent(id: string): Promise<{
  event: Event;
  events: Event[];
} | null> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return null;

  const protocol =
    process.env.NODE_ENV === "development"
      ? "http"
      : "https";

  const res = await fetch(
    `${protocol}://${host}/api/events?window=180d`,
    { cache: "no-store" }
  );


  if (!res.ok) return null;

  const data = await res.json();
  const events: Event[] = data.events ?? [];

  const event = events.find(
    (e: any) => String(e.id) === String(id)
  );

  if (!event) return null;

  return { event, events };
}

/* =========================
   PAGE
========================= */

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;   // 🔥 반드시 await

  const result = await fetchEvent(id);
  if (!result) return notFound();

  const { event, events } = result;

  const e = buildEventDetailVM(event);

  const nearbyToday = buildNearbyToday(events, event);
  const moreThisWeekend = buildMoreThisWeekend(events, event);

  const destination = `${e.lat},${e.lng}`;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${destination}&z=15&output=embed`;
  const mapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;

  const ticketHref =
    e.officialUrl
      ? `/api/go/ticket` +
        `?eventId=${id}` +
        `&sport=${event.sport ?? ""}` +
        `&city=${event.city ?? ""}` +
        `&source=event_page` +
        `&target=${encodeURIComponent(e.officialUrl)}`
      : null;

  /* =========================
     UI HELPERS
  ========================= */

  const statusBadge = (s: "LIVE" | "SOON" | "UPCOMING") => {
    const cls =
      s === "LIVE"
        ? "bg-red-500/15 text-red-700"
        : s === "SOON"
        ? "bg-amber-500/15 text-amber-800"
        : "bg-muted/60 text-muted-foreground";

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}
      >
        {s}
      </span>
    );
  };

  const Row = ({ item }: { item: NearbyItem }) => {
    return (
      <Link
        href={`/event/${item.id}`}
        className="
          block
          -mx-2 px-2
          hover:bg-muted/40
          transition
        "
      >

        <div className="flex items-start justify-between gap-3 py-3">
          <div className="min-w-0">
            <p className="font-medium leading-tight truncate">
              {item.title}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.timeLabel} · {item.city}
            </p>
          </div>

          {item.status && (
            <div className="shrink-0">
              {statusBadge(item.status)}
            </div>
          )}
        </div>
      </Link>
    );
  };

  /* =========================
     RENDER
  ========================= */

  return (
    <main className="min-h-screen bg-background">
      <EventPageTracker
        eventId={String(id)}
        sport={event.sport}
        city={event.city}
      />
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
        {/* HERO */}
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {statusBadge(e.status)}
            {e.league && (
              <span className="text-xs font-semibold text-muted-foreground">
                {e.league}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            {e.title}
          </h1>

          <p className="text-sm text-muted-foreground">
            {e.dateText} · {e.timeText}
          </p>

          <p className="text-sm font-medium">{e.city}</p>
        </header>

        {/* WHEN / WHERE */}
        <section className="mt-8 rounded-3xl ring-1 ring-border/50 bg-background/60 backdrop-blur p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Date & Time
              </p>
              <p className="mt-2 font-semibold">{e.dateText}</p>
              <p className="text-sm text-muted-foreground">
                {e.timeText}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Location
              </p>
              <p className="mt-2 font-semibold">{e.venue}</p>
              <p className="text-sm text-muted-foreground">
                {e.addressLine}
              </p>
            </div>
          </div>
        </section>

        {/* MAP + CTA */}
        <section className="mt-6 rounded-3xl overflow-hidden ring-1 ring-border/50 bg-background">
          <div className="aspect-[16/10] w-full bg-muted/30">
            <iframe
              title="map"
              src={mapsEmbedUrl}
              className="w-full h-full"
              loading="lazy"
            />
          </div>

          <div className="p-5 grid gap-2 sm:grid-cols-2">
            <a
              href={mapsDirUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-2xl bg-foreground text-background py-3 text-sm font-semibold"
            >
              Get directions
            </a>

            {ticketHref && (
              <TicketButton
                href={ticketHref}
                eventId={String(id)}
                sport={event.sport}
                city={event.city}
                isPaid={e.isPaid}
              />
            )}
          </div>
        </section>

        {/* NEARBY TODAY */}
        {nearbyToday.length > 0 && (
          <section className="mt-10">
            <h2 className="text-sm font-semibold">
              Nearby today
            </h2>
            <div className="mt-3 rounded-2xl ring-1 ring-border/50 bg-background/60 backdrop-blur px-4 divide-y">
              {nearbyToday.map((ev) => (
                <Row
                  key={ev.id}
                  item={{
                    id: ev.id,
                    title: ev.title ?? "Event",
                    timeLabel: new Date(ev.date).toLocaleTimeString(
                      "en-GB",
                      { hour: "2-digit", minute: "2-digit" }
                    ),
                    city: ev.city ?? "",
                    status: getEventTimeState(ev) as any,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {/* MORE THIS WEEKEND */}
        {moreThisWeekend.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold">
              More this weekend
            </h2>
            <div className="mt-3 rounded-2xl ring-1 ring-border/50 bg-background/60 backdrop-blur px-4 divide-y">
              {moreThisWeekend.map((ev) => (
                <Row
                  key={ev.id}
                  item={{
                    id: ev.id,
                    title: ev.title ?? "Event",
                    timeLabel: new Date(ev.date).toLocaleTimeString(
                      "en-GB",
                      { hour: "2-digit", minute: "2-digit" }
                    ),
                    city: ev.city ?? "",
                    status: getEventTimeState(ev) as any,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
