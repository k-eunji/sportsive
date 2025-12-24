// FILE: src/app/teams/[teamId]/mom-vote/components/MOMVoteModule.tsx

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MomVoteModuleType, MOMCandidate } from "@/types";
import { uploadToStorage } from "@/lib/uploadToStorage";


export default function MOMVoteModule({
  mod,
  myVote,
  userId,
  teamId,
  isStarted,
  isClosed,
  onVote,
  onAddCandidate,
}: {
  mod: {
    id: string;
    type: "momvote";
    createdAt: string;
    reactions: {
      likes: number;
      participants: number;
    };
    data: {
      matchId: string;
      title: string;
      expiresAt: string;
      locked: boolean;
      kickoff: string | null;
      opponent: string | null;
      candidates: MOMCandidate[];
    };
  };
  myVote: string | null;

  /** 🔥 여기 추가 */
  userId: string;
  teamId: string;

  isStarted: boolean;
  isClosed: boolean;
  onVote: (candidateId: string) => void;
  onAddCandidate: (
    name: string,
    position?: string,
    photoUrl?: string
  ) => Promise<MOMCandidate>;
}) {

  const [name, setName] = useState("");
  const [position, setPosition] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);

  const isExpiredByDB =
    mod.data.locked || Date.now() > new Date(mod.data.expiresAt).getTime();

  const FINAL = isClosed || isExpiredByDB;

  const sorted = FINAL
    ? [...mod.data.candidates].sort((a, b) => b.votes - a.votes)
    : mod.data.candidates;

  const totalVotes = sorted.reduce((s, c) => s + c.votes, 0);

  /** 업로드 */
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      return await uploadToStorage(file);
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setUploading(false);
    }
  };

  /** 후보 추가 */
  const handleSubmit = async () => {
    if (!name.trim()) return;

    let uploadedUrl: string | null = null;
    if (photo) uploadedUrl = await uploadImage(photo);

    const newCandidate = await onAddCandidate(
      name.trim(),
      position ?? undefined,
      uploadedUrl ?? undefined
    );

    if (!myVote) onVote(newCandidate.id);
    setName("");
    setPosition(null);
    setPhoto(null);
  };

  /** 기본 아바타 */
  const DefaultAvatar = ({ name }: { name: string }) => {
    const initial = name.charAt(0).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-white">
        {initial}
      </div>
    );
  };

  /** podium 색상 */
  const podiumBg = (index: number) => {
    if (!FINAL) return "bg-gray-50";
    if (index === 0) return "bg-yellow-50 border-yellow-400 shadow-md";
    if (index === 1) return "bg-gray-100 border-gray-400";
    if (index === 2) return "bg-amber-100 border-amber-300";
    return "bg-gray-50";
  };

  return (
    <div className="rounded-xl bg-white border shadow-md mt-4 overflow-hidden">

      {/* 🔥🔥 HEADER BAR (세련됨) */}
      <div className="
        flex items-center justify-between px-4 py-3
        bg-gradient-to-r from-gray-100 to-white
        border-b border-gray-200 shadow-sm
      ">
        <div className="flex flex-col">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <span className="text-xl">🏆</span>
            Man of the Match
          </h2>

          {!FINAL ? (
            <span className="text-xs text-gray-600">
              Voting open — {mod.reactions.participants} participants
            </span>
          ) : (
            <span className="text-xs text-gray-600">
              Final results — {totalVotes.toLocaleString()} votes
            </span>
          )}
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
            FINAL
              ? "bg-gray-800 text-white"
              : "bg-red-600 text-white animate-pulse"
          }`}
        >
          {FINAL ? "Final" : "Live"}
        </span>
      </div>

      {/* ------------------------------------------------- */}
      {/*                  ADD PLAYER                       */}
      {/* ------------------------------------------------- */}
      {!FINAL && !myVote && (
        <div className="bg-white p-5 border-b border-gray-200">
          <h3 className="font-bold text-blue-700 text-sm tracking-wide mb-3">
            Add a Player & Vote
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Player name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Smith"
                className="border rounded-lg px-3 py-2 w-full bg-white focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Position (optional)
              </label>
              <select
                className="border px-3 py-2 rounded-lg w-full bg-white focus:ring-2 focus:ring-blue-400"
                value={position ?? ""}
                onChange={(e) => setPosition(e.target.value || null)}
              >
                <option value="">Choose position</option>
                <option value="GK">GK - Goalkeeper</option>
                <option value="DF">DF - Defender</option>
                <option value="MF">MF - Midfielder</option>
                <option value="FW">FW - Forward</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Upload photo
              </label>
              <label className="cursor-pointer text-blue-600 text-sm">
                <span className="underline">Choose file</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setPhoto(e.target.files[0])}
                />
              </label>

              {photo && (
                <p className="text-xs text-gray-500 mt-1">{photo.name}</p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              {uploading ? "Uploading..." : "Add & Vote"}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------- */}
      {/*                  PLAYER LIST                       */}
      {/* ------------------------------------------------- */}
      <div className="p-4 sm:p-5 space-y-4">
        {sorted.map((c, index) => {
          const percentage = totalVotes
            ? Math.round((c.votes / totalVotes) * 100)
            : 0;

          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 sm:p-4 rounded-xl border transition-all ${podiumBg(
                index
              )}`}
            >
              {/* 헤더 */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  {c.photoUrl ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={c.photoUrl}
                        alt={c.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />


                    </div>
                  ) : (
                    <DefaultAvatar name={c.name} />
                  )}

                  <div>
                    <div className="flex items-center gap-1">
                      {FINAL && index < 3 && (
                        <span className="text-lg">
                          {index === 0 && "🥇"}
                          {index === 1 && "🥈"}
                          {index === 2 && "🥉"}
                        </span>
                      )}

                      <span className="font-semibold text-gray-800 text-base sm:text-lg">
                        {c.name}
                      </span>
                    </div>

                    {c.position && (
                      <span className="text-[10px] sm:text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                        {c.position}
                      </span>
                    )}
                  </div>
                </div>

                {!FINAL && !myVote && (
                  <button
                    onClick={() => onVote(c.id)}
                    className="px-4 py-1 rounded-lg text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700"
                  >
                    Vote
                  </button>
                )}
              </div>

              {/* bar */}
              <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    FINAL ? "bg-red-600" : "bg-gray-400"
                  }`}
                  style={{ width: `${FINAL ? percentage : 0}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>
                  {FINAL ? `${c.votes} votes` : "Votes hidden"}
                </span>

                {FINAL && <span>{percentage}%</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
