//src/app/meetups/components/CreateMeetupModal.tsx 

"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import MeetupFormFields from "./MeetupFormFields";
import { useMeetupForm } from "../hooks/useMeetupForm";

import type { Event } from "@/types";

interface CreateMeetupModalProps {
  upcomingEvents: Event[];
  onClose: () => void;
  onCreated?: (created: any) => void;
  teamId?: string;
}

/**
 * 🎨 FLAT UI 리디자인된 Create Meetup Modal
 * - 카드/섀도우 제거
 * - Divider 기반의 미니멀 UI
 * - 스포츠 선택은 텍스트 탭
 */
export default function CreateMeetupModal({
  upcomingEvents,
  onClose,
  onCreated,
  teamId,
}: CreateMeetupModalProps) {
  const { user } = useUser();

  const [meetupType, setMeetupType] = useState<
    "match_attendance" | "pub_gathering" | "online_game" | "pickup_sports"
  >("match_attendance");

  const form = useMeetupForm({ meetupType, upcomingEvents });

  const isFormValid = () => {
    if (!form.datetime) return false;

    switch (meetupType) {
      case "match_attendance":
      case "pub_gathering":
        return !!form.selectedEvent;
      case "online_game":
        return !!form.onlineGameName && !!form.onlineLink;
      case "pickup_sports":
        return !!form.skillLevel && !!(form.venue || form.venueLatLng);
      default:
        return false;
    }
  };

  const handleCreate = async () => {
    if (!user || !isFormValid()) return;
    const currentUser = auth?.currentUser;
    if (!currentUser) return alert("Please log in first.");

    const idToken = await currentUser.getIdToken();
    let imageUrl = form.autoImageUrl || null;

    if (form.useCustomImage && form.customImage && storage) {
      try {
        const fileName = `${Date.now()}_${form.customImage.name}`;
        const fileRef = ref(storage, `meetups/${fileName}`);
        await uploadBytes(fileRef, form.customImage);
        imageUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.error("Image upload failed", err);
      }
    }

    const body: any = {
      hostId: user.uid,
      authorNickname: user.authorNickname,
      type: meetupType,
      datetime: form.datetime,
      sportType: form.sportType,
      title: "",
      purpose: form.purpose,
      details: form.details,
      venue: form.venue,
      location:
        meetupType === "online_game" ? { name: "Online" } : form.venue,
      maxParticipants: form.maxParticipants,
      isPrivate: form.isPrivate,
      onlineLink: form.onlineLink,
      onlineGameName: form.onlineGameName || "",
      skillLevel: form.skillLevel || "",
      repeat: form.repeat,
      selectedEventId: form.selectedEvent?.id,
      teamType: form.cheerTeam ?? "neutral",
      teamId:
        meetupType === "match_attendance"
          ? form.cheerTeam === "home"
            ? form.selectedEvent?.homeTeamId
            : form.selectedEvent?.awayTeamId
          : teamId ?? null,
      applicationDeadline: form.applicationDeadline,
      fee: form.fee || 0,
      imageUrl,
      ageLimit: form.ageLimit,
      ageFrom: form.ageFrom ?? null,
      ageTo: form.ageTo ?? null,
      findUsNote: form.findUsNote,
    };

    // Auto Title
    switch (meetupType) {
      case "match_attendance":
        body.title =
          form.title ||
          `${form.selectedEvent?.homeTeam} vs ${form.selectedEvent?.awayTeam}`;
        break;
      case "pub_gathering":
        body.title = form.title || `Pub Gathering`;
        break;
      case "online_game":
        body.title = form.title || "Online Game Meetup";
        break;
      case "pickup_sports":
        body.title = form.title || "Pickup Sports Meetup";
        break;
    }

    try {
      const res = await fetch("/api/meetups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.meetupId) {
        onCreated?.(data.meetupId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[99999]">
      <div className="bg-white w-full max-w-md rounded-xl p-5 flex flex-col max-h-[80vh]">

        {/* HEADER */}
        <div className="flex justify-between mb-4 pt-1">
          <h2 className="text-xl font-semibold">Create a Meetup</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="overflow-y-auto mt-4 pr-1">
          <MeetupFormFields
            form={form}
            meetupType={meetupType}
            setMeetupType={setMeetupType}
            upcomingEvents={upcomingEvents}
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <button
            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={!isFormValid()}
            className={`px-4 py-2 rounded-lg text-white ${
              isFormValid()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
