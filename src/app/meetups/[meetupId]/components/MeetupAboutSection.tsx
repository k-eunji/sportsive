// src/app/meetups/[meetupId]/components/MeetupAboutSection.tsx

"use client";

import { useState } from "react";
import type { MeetupWithEvent } from "@/types/event";
import { useUser } from "@/context/UserContext";

export default function MeetupAboutSection({ meetup }: { meetup: MeetupWithEvent }) {
  const { user } = useUser();
  const [editMode, setEditMode] = useState(false);
  const [purpose, setPurpose] = useState(meetup.purpose || "");
  const [details, setDetails] = useState(meetup.details || "");
  const [loading, setLoading] = useState(false);

  const isHost =
    !!user &&
    (user.userId === meetup.hostId || meetup.hostId?.includes(user.userId));

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetups/${meetup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose, details }),
      });

      if (!res.ok) throw new Error("Failed");
      alert("Saved!");
      setEditMode(false);
    } catch {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full pt-4 pb-6 border-t border-border">
      {/* TITLE + EDIT BUTTON */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm font-semibold text-foreground tracking-wide flex items-center gap-1">
          ℹ️ About this Meetup
        </h2>

        {isHost && !editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      {/* EDIT MODE */}
      {editMode ? (
        <div className="space-y-6">
          {/* Purpose */}
          <div>
            <label
              htmlFor="purpose"
              className="text-sm text-muted-foreground block mb-1"
            >
              Purpose
            </label>

            <textarea
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={3}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* Details */}
          <div>
            <label
              htmlFor="details"
              className="text-sm text-muted-foreground block mb-1"
            >
              Details
            </label>

            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setEditMode(false);
                setPurpose(meetup.purpose || "");
                setDetails(meetup.details || "");
              }}
              className="text-sm text-muted-foreground hover:underline"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-primary text-white rounded-full text-sm disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="space-y-8 text-sm">
          {/* PURPOSE */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Purpose
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {purpose.trim() || "No purpose provided."}
            </p>
          </div>

          {/* DETAILS */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              Details
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {details.trim() || "No details provided."}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

