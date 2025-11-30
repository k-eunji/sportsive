// src/app/meetups/[meetupId]/components/MeetupInfoCard.tsx

"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";
import type { MeetupWithEvent } from "@/types/event";

import {
  CommonFields,
  TeamCheerFields,
  OnlineGameFields,
  PickupSportsFields,
} from "./MeetupInfoCardParts";

import toast from "react-hot-toast";

export default function MeetupInfoCard({ meetup }: { meetup: MeetupWithEvent }) {
  const { user } = useUser();
  const isHost =
    !!user &&
    (user.uid === meetup.hostId || meetup.hostId?.includes(user.uid));

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fee, setFee] = useState(meetup.fee || "");
  const [ageLimit, setAgeLimit] = useState(meetup.ageLimit || "");
  const [ageFrom, setAgeFrom] = useState(meetup.ageFrom || "");
  const [ageTo, setAgeTo] = useState(meetup.ageTo || "");
  const [skillLevel, setSkillLevel] = useState(meetup.skillLevel || "");
  const [sportType, setSportType] = useState(meetup.sportType || "");
  const [onlineGameName, setOnlineGameName] = useState(
    meetup.onlineGameName || ""
  );
  const [onlineLink, setOnlineLink] = useState(meetup.onlineLink || "");

  const handleSave = async () => {
    setLoading(true);

    try {
      const body: any = { fee, ageLimit, skillLevel, sportType };

      if (ageLimit === "Custom") Object.assign(body, { ageFrom, ageTo });
      if (meetup.type === "online_game")
        Object.assign(body, { onlineGameName, onlineLink });

      const res = await fetch(`/api/meetups/${meetup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();

      toast.success("Saved!");
      setEditMode(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Format for summary tags
  const date = new Date(meetup.datetime).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const time = new Date(meetup.datetime).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const summaryFee =
    !fee || fee === "0"
      ? "Free"
      : String(fee).startsWith("£")
      ? String(fee)
      : `£${fee}`;


  return (
    <section className="w-full pt-4 pb-4">

      {/* =============================================================== */}
      {/*                       SUMMARY BADGE STRIP                       */}
      {/* =============================================================== */}

      <div className="flex flex-wrap gap-2 mb-6">
        {/* Type */}
        <span className="px-3 py-[5px] bg-muted rounded-full text-xs flex items-center gap-1">
          {meetup.type === "match_attendance" && "🏟️"}
          {meetup.type === "pub_gathering" && "🍺"}
          {meetup.type === "online_game" && "🎮"}
          {meetup.type === "pickup_sports" && "🏐"}
          {meetup.type.replace("_", " ")}
        </span>

        {/* Date & Time */}
        <span className="px-3 py-[5px] bg-muted rounded-full text-xs flex items-center gap-1">
          📅 {date} · {time}
        </span>

        {/* Fee */}
        <span className="px-3 py-[5px] bg-muted rounded-full text-xs flex items-center gap-1">
          💷 {summaryFee}
        </span>

        {/* Age */}
        <span className="px-3 py-[5px] bg-muted rounded-full text-xs flex items-center gap-1">
          👥 {ageLimit === "Custom" ? `${ageFrom}–${ageTo}` : ageLimit}
        </span>
      </div>

      {/* =============================================================== */}
      {/*                       EDIT BUTTON (TOP RIGHT)                   */}
      {/* =============================================================== */}

      {isHost && (
        <div className="flex justify-end mb-6">
          {editMode ? (
            <div className="flex gap-4">
              <button
                onClick={() => setEditMode(false)}
                className="text-sm text-gray-500 hover:underline"
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
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      )}

      {/* =============================================================== */}
      {/*                         EVENT DETAILS                           */}
      {/* =============================================================== */}

      <div className="border-b border-border pb-4 mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide">
          EVENT DETAILS
        </h3>

        <CommonFields
          meetup={meetup}
          fee={fee}
          setFee={setFee}
          ageLimit={ageLimit}
          setAgeLimit={setAgeLimit}
          ageFrom={ageFrom}
          setAgeFrom={setAgeFrom}
          ageTo={ageTo}
          setAgeTo={setAgeTo}
          editMode={editMode}
        />
      </div>

      {/* =============================================================== */}
      {/*                         ADDITIONAL INFO                         */}
      {/* =============================================================== */}

      <div className="pb-2">
        <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide">
          ADDITIONAL INFO
        </h3>

        <div className="divide-y divide-border">

          {["match_attendance", "pub_gathering"].includes(meetup.type) && (
            <div className="py-2">
              <TeamCheerFields meetup={meetup} />
            </div>
          )}

          {meetup.type === "online_game" && (
            <div className="py-2">
              <OnlineGameFields
                onlineGameName={onlineGameName}
                setOnlineGameName={setOnlineGameName}
                onlineLink={onlineLink}
                setOnlineLink={setOnlineLink}
                skillLevel={skillLevel}
                setSkillLevel={setSkillLevel}
                editMode={editMode}
              />
            </div>
          )}

          {meetup.type === "pickup_sports" && (
            <div className="py-2">
              <PickupSportsFields
                skillLevel={skillLevel}
                setSkillLevel={setSkillLevel}
                sportType={sportType}
                setSportType={setSportType}
                editMode={editMode}
              />
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
