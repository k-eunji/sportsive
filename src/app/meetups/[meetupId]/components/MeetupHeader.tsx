// src/app/meetups/[meetupId]/components/MeetupHeader.tsx

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import type { MeetupWithRelated } from "@/types";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import ImagePreviewModal from "./ImagePreviewModal";
import toast from "react-hot-toast";

export default function MeetupHeader({ meetup }: { meetup: MeetupWithRelated }) {
  const { user } = useUser();
  const router = useRouter();

  const isHost =
    !!user &&
    (user.userId === meetup.hostId || meetup.hostId?.includes(user.userId));

  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(meetup.title || "");
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const hasImage = !!meetup.imageUrl;

  /** 저장 (제목만) */
  const handleSave = async () => {
    if (!meetup.id) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/meetups/${meetup.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Title updated!");
      setEditMode(false);
    } catch {
      toast.error("Failed to update title.");
    } finally {
      setLoading(false);
    }
  };

  /** 삭제 */
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/meetups/${meetup.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Meetup deleted");
        setTimeout(() => router.push("/meetups"), 800);
      } else {
        toast.error("Failed to delete meetup");
      }
    } catch {
      toast.error("Error occurred");
    }
  };

  return (
    <header className="w-full bg-background border-b border-border transition-colors">

      {/* 🔥 Option A: Top Hero Image with blurred background */}
      <div className="relative w-full h-[200px] md:h-[260px] overflow-hidden">
        {hasImage ? (
          <>
            {/* blurred background */}
            <div className="absolute inset-0">
              <Image
                src={meetup.imageUrl!}
                alt="bg"
                fill
                className="object-cover blur-xl scale-110 opacity-60"
                unoptimized
              />
            </div>

            {/* real image */}
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setPreviewOpen(true)}
            >
              <div className="relative w-full h-full max-w-[600px] mx-auto">
                <Image
                  src={meetup.imageUrl!}
                  alt={title}
                  fill
                  className="object-contain drop-shadow-lg"
                  unoptimized
                />
              </div>
            </div>
          </>
        ) : (
          /* ✅ 이미지 없을 때: 이모지 */
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <span className="text-7xl">
              {meetup.type === "match_attendance" && "🏟️"}
              {meetup.type === "pub_gathering" && "🍺"}
              {meetup.type === "online_game" && "🎮"}
              {meetup.type === "pickup_sports" && "🏐"}
            </span>
          </div>
        )}
      </div>


      <div className="max-w-3xl mx-auto px-4 pt-4 pb-6 text-center space-y-3">

        {/* 🔥 Title */}
        {editMode ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-2xl font-semibold w-full text-center bg-transparent border-b border-primary pb-1 focus:outline-none"
          />
        ) : (
          <h1 className="text-2xl font-bold">{title}</h1>
        )}

        {/* 🔥 Host */}
        <p className="text-xs text-muted-foreground">
          Hosted by{" "}
          <span className="font-medium text-primary">{meetup.authorNickname}</span>
        </p>

        {/* 🔥 Related Meetups */}
        {(meetup.relatedMeetups?.length ?? 0) > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {[meetup, ...(meetup.relatedMeetups ?? []).filter(m => m.id !== meetup.id)]  
              .map((m) => {
                const active = m.id === meetup.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => router.push(`/meetups/${m.id}`)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition ${
                      active
                        ? "bg-primary text-white border-primary shadow-sm"
                        : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {new Date(m.datetime).toLocaleDateString("en-GB", {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    ·{" "}
                    {new Date(m.datetime).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </button>
                );
              })}
          </div>
        )}

        {/* 🔥 Edit / Delete */}
        {isHost && (
          <div className="pt-3 flex justify-center gap-4">
            {editMode ? (
              <>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setTitle(meetup.title);
                  }}
                  className="text-sm text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-1.5 text-sm bg-primary text-white rounded-full"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="text-sm text-primary"
                >
                  ✏️ Edit
                </button>

                <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                  <AlertDialogTrigger asChild>
                    <button className="text-sm text-destructive">🗑️ Delete</button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this meetup?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔥 Full-screen preview modal */}
      <ImagePreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        imageUrl={meetup.imageUrl ?? null}
        meetupType={meetup.type}
      />

    </header>
  );
}
