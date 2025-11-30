// src/app/meetups/[meetupId]/components/MeetupEventCard.tsx

"use client";

import { useState } from "react";
import type { Event } from "@/types/event";
import MatchSelection from "@/app/meetups/components/form/MatchSelection";

interface Props {
  event: Event;
  meetupId?: string;
  isHost?: boolean;
  upcomingEvents?: Event[];
  teamType?: "home" | "away" | "neutral";
}

export default function MeetupEventCard({
  event,
  meetupId,
  isHost = false,
  upcomingEvents = [],
  teamType,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(event);
  const [cheerTeam, setCheerTeam] = useState<"home" | "away" | "neutral">(
    teamType || "neutral"
  );
  const [loading, setLoading] = useState(false);

  /** SAVE */
  const handleSave = async () => {
    if (!meetupId || !selectedEvent) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/meetups/${meetupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          event: selectedEvent,
          teamType: cheerTeam,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Match info updated!");
      setEditMode(false);
    } catch {
      alert("Failed to update match info");
    } finally {
      setLoading(false);
    }
  };

  /** VIEW MODE UI */
  const viewMode = (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          MATCH INFO
        </h3>

        {isHost && (
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* Teams (enhanced visual layout) */}
      <div className="flex flex-col items-center mb-6">

        {/* Logos */}
        <div className="flex items-center justify-center gap-8 mb-3">
          {selectedEvent?.homeTeamLogo && (
            <img
              src={selectedEvent.homeTeamLogo}
              alt="home"
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
          )}

          {/* VS Badge */}
          <div className="px-3 py-1 bg-muted rounded-full text-xs font-semibold text-muted-foreground">
            VS
          </div>

          {selectedEvent?.awayTeamLogo && (
            <img
              src={selectedEvent.awayTeamLogo}
              alt="away"
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
          )}
        </div>

        {/* Team Names */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="max-w-[100px] text-center truncate">
            {selectedEvent?.homeTeam}
          </span>

          <span className="text-muted-foreground/70"></span>

          <span className="max-w-[100px] text-center truncate">
            {selectedEvent?.awayTeam}
          </span>
        </div>
      </div>

      {/* Flat field list */}
      <div className="space-y-4 text-sm">
        {/* Venue */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Venue</span>
          <span className="font-medium text-foreground">
            {selectedEvent?.venue || "TBA"}
          </span>
        </div>

        {/* Kick-off */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Kick-off</span>
          <span className="font-medium text-foreground">
            {selectedEvent?.date
              ? new Date(selectedEvent.date).toLocaleString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })
              : "TBA"}
          </span>
        </div>

        {/* Ticket */}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Ticket</span>
          <span className="font-medium text-foreground">
            {selectedEvent?.price
              ? `£${selectedEvent.price}`
              : selectedEvent?.free
              ? "Free"
              : "N/A"}
          </span>
        </div>

        {/* Cheering For */}
        {cheerTeam && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cheering For</span>
            <span className="font-medium text-foreground">
              {cheerTeam === "home"
                ? selectedEvent?.homeTeam
                : cheerTeam === "away"
                ? selectedEvent?.awayTeam
                : "Neutral"}
            </span>
          </div>
        )}
      </div>
    </>
  );

  /** EDIT MODE */
  const editUI = (
    <>
      <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide">
        EDIT MATCH INFO
      </h3>

      <MatchSelection
        form={{ selectedEvent, setSelectedEvent, cheerTeam, setCheerTeam }}
        upcomingEvents={upcomingEvents}
      />

      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={() => setEditMode(false)}
          className="text-sm text-muted-foreground hover:underline"
          disabled={loading}
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-1.5 bg-primary text-white rounded-full text-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </>
  );

  /** RETURN — completely flat style */
  return (
    <section className="w-full pt-4 pb-10 border-t border-border mt-10">
      {editMode ? editUI : viewMode}
    </section>
  );
}
