// src/app/teams/[teamId]/components/TeamOverviewUnified.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import {
  FaInstagram,
  FaTwitter as FaXTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaUsers,
  FaCalendarAlt,
  FaFire,
  FaHandshake,
} from "react-icons/fa";

// -----------------------------
// ✅ 타입 정의 (필수)
// -----------------------------
type NextMatch = {
  homeTeam: string;
  awayTeam: string;
  date: string;
};

type RivalSummary = {
  rivalTopTeam?: {
    teamName: string;
    votes: number;
  };
  totalVotes?: number;
};

type MomModule = {
  data?: {
    candidates: { name: string; votes: number }[];
  };
};

type MeetupType = {
  title: string;
  datetime: string;
};

type LocalMatch = {
  id: string;
  title: string;
  date: string;
};
// -----------------------------


export default function TeamOverviewUnified({ team, teamId }: any) {
  // -----------------------------
  // ✅ 타입 안전한 state 선언
  // -----------------------------
  const [fanCount, setFanCount] = useState<number>(0);
  const [nextMatch, setNextMatch] = useState<NextMatch | null>(null);
  const [rival, setRival] = useState<RivalSummary | null>(null);
  const [mom, setMom] = useState<MomModule | null>(null);
  const [meetup, setMeetup] = useState<MeetupType | null>(null);
  const [localMatches, setLocalMatches] = useState<LocalMatch[]>([]);


  // 데이터 병합 fetch — 한 번에 가져오기 (2025 방식)
  useEffect(() => {
    (async () => {
      const [fans, next, rivalSum, momMod, meetups] = await Promise.all([
        fetch(`/api/teams/${teamId}/fans/count`).then((r) => r.json()),
        fetch(`/api/teams/${teamId}/matches/next`).then((r) => r.json()),
        fetch(`/api/teams/${teamId}/rivalvote/summary`).then((r) => r.json()),
        fetch(`/api/teams/${teamId}/momvote/module`).then((r) => r.json()),
        fetch(`/api/teams/${teamId}/meetups`).then((r) => r.json()),
      ]);

      setFanCount(fans.count ?? 0);
      setNextMatch(next.match ?? null);
      setRival(rivalSum ?? null);
      setMom(momMod.module ?? null);
      setMeetup(meetups.meetups?.[0] ?? null);
    })();
  }, [teamId]);

  return (
    <motion.div
      className="space-y-8 pt-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* -------------------------------------------------------- */}
      {/* 1) TEAM META (플랫 Hero) */}
      {/* -------------------------------------------------------- */}
      <section className="space-y-4">
        <div className="flex gap-4 items-center">
          <img src={team.logo} className="w-16 h-16 rounded-full" />

          <div>
            <h1 className="text-3xl font-bold">{team.name}</h1>

            <p className="text-sm text-gray-500 flex items-center gap-1">
              <FaMapMarkerAlt /> {team.city}, {team.region}
            </p>

            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <FaUsers className="text-green-600" />
              {fanCount.toLocaleString()} nearby supporters
            </p>
          </div>
        </div>

        {/* Social */}
        <div className="flex gap-3 text-xl text-gray-600">
          {team.instagram && <a href={team.instagram}><FaInstagram /></a>}
          {team.x && <a href={team.x}><FaXTwitter /></a>}
          {team.youtube && <a href={team.youtube}><FaYoutube /></a>}
        </div>

        {/* Next match */}
        {nextMatch && (
          <div className="text-sm text-gray-700 flex items-center gap-2 pt-2 border-t">
            <FaCalendarAlt className="text-blue-500" />
            {nextMatch.homeTeam} vs {nextMatch.awayTeam} ·{" "}
            {new Date(nextMatch.date).toLocaleDateString()}
          </div>
        )}
      </section>

      {/* -------------------------------------------------------- */}
      {/* 2) COMMUNITY SUMMARY (플랫) */}
      {/* -------------------------------------------------------- */}
      <section className="space-y-4 pt-4 border-t">
        {/* Rival */}
        <div>
          <h2 className="text-sm font-bold text-red-700 flex gap-1 items-center">
            ⚔️ Rival Vote
          </h2>
          {rival?.rivalTopTeam ? (
            <div className="mt-1 text-gray-700">
              <span className="font-semibold">{rival.rivalTopTeam.teamName}</span>{" "}
              — {rival.rivalTopTeam.votes} votes
            </div>
          ) : (
            <p className="text-sm text-gray-500">No rival data yet</p>
          )}
        </div>

        {/* MOM */}
        <div>
          <h2 className="text-sm font-bold text-blue-700 flex gap-1 items-center">
            ⭐ Man of the Match
          </h2>

          {mom ? (
            <div className="mt-1 text-gray-700">
              Top candidate:{" "}
              <span className="font-semibold">
                {mom.data?.candidates?.sort((a, b) => b.votes - a.votes)[0]?.name}
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No MOM voting yet.</p>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 3) Meetups + Local Matches */}
      {/* -------------------------------------------------------- */}
      <section className="space-y-6 pt-4 border-t">
        {/* Meetup */}
        <div>
          <h2 className="text-sm font-bold flex items-center gap-1">
            <FaHandshake className="text-green-600" /> Meetup
          </h2>

          {meetup ? (
            <p className="mt-1 text-sm text-gray-700">
              {meetup.title} — {new Date(meetup.datetime).toLocaleDateString()}
            </p>
          ) : (
            <p className="text-sm text-gray-500">No meetups yet.</p>
          )}
        </div>

        {/* Local matches */}
        <div>
          <h2 className="text-sm font-bold flex items-center gap-1">
            🏙 Local Matches
          </h2>

          {localMatches.length === 0 ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : (
            <ul className="space-y-1 text-sm text-gray-700">
              {localMatches.slice(0, 3).map((m) => (
                <li key={m.id}>
                  {m.title} — {new Date(m.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* -------------------------------------------------------- */}
      {/* 4) CTA */}
      {/* -------------------------------------------------------- */}
      <section className="pt-4 border-t">
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold">
            Join Fanbase
          </button>
          <Link
            href={`/meetups/create?team=${teamId}`}
            className="px-4 py-2 bg-green-600 rounded-lg text-white font-semibold"
          >
            Create Meetup
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
