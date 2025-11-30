// src/app/teams/[teamId]/components/TeamOverview.refactored.tsx

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TeamOverviewProps {
  teamId: string;
  region?: string;
  sport?: string;
  teamName?: string;
  city?: string;
}

interface Meetup {
  id: string;
  title: string;
  datetime: string;
  location?: { name?: string };
}

interface LocalMatch {
  id: string;
  title: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  venue?: string;
  city?: string;
}

export default function TeamOverviewRefactored({
  teamId,
  region = "england",
  sport = "football",
  teamName,
  city,
}: TeamOverviewProps) {
  const [nextMatch, setNextMatch] = useState<any | null>(null);
  const [meetups, setMeetups] = useState<Meetup[]>([]);
  const [fanCount, setFanCount] = useState<number>(0);
  const [localMatches, setLocalMatches] = useState<LocalMatch[]>([]);
  const [localLoading, setLocalLoading] = useState(true);

  const [rivalTopTeam, setRivalTopTeam] = useState<any | null>(null);
  const [totalVotes, setTotalVotes] = useState<number | null>(null);
  const [momMod, setMomMod] = useState<any>(null);


  useEffect(() => {
    (async () => {
      try {
        // 다음 경기
        const matchRes = await fetch(`/api/teams/${teamId}/matches/next`, { cache: "no-store" });
        setNextMatch((await matchRes.json()).match ?? null);

        // 밋업
        const meetupRes = await fetch(`/api/teams/${teamId}/meetups`, { cache: "no-store" });
        setMeetups((await meetupRes.json()).meetups?.slice(0, 2) ?? []);

        // 팬 수
        const fansRes = await fetch(`/api/teams/${teamId}/fans/count`, { cache: "no-store" });
        setFanCount((await fansRes.json()).count ?? 0);

        // rival vote summary
        const rRes = await fetch(`/api/teams/${teamId}/rivalvote/summary`, { cache: "no-store" });
        const rJson = await rRes.json();
        setRivalTopTeam(rJson.rivalTopTeam ?? null);
        setTotalVotes(rJson.totalVotes ?? 0);

        // MOM module
        const mRes = await fetch(`/api/teams/${teamId}/momvote/module`, { cache: "no-store" });
        const { module } = await mRes.json();
        setMomMod(module);
      } catch (err) {
        console.error("overview error", err);
      }
    })();
  }, [teamId]);

  // 지역 경기
  useEffect(() => {
    (async () => {
      try {
        setLocalLoading(true);
        const res = await fetch(`/api/events/${region}/${sport}`, { cache: "no-store" });
        const matches = (await res.json()).matches ?? [];

        const parsed: LocalMatch[] = matches.map((m: any) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          homeTeam: m.homeTeam,
          awayTeam: m.awayTeam,
          venue: m.venue,
          city: m.city,
        }));

        const filtered = teamName
          ? parsed.filter(
              (m) => ![m.homeTeam, m.awayTeam].some((x) => x?.toLowerCase() === teamName.toLowerCase())
            )
          : parsed;

        setLocalMatches(filtered.slice(0, 4));
      } catch (e) {
        console.error("local match error", e);
      } finally {
        setLocalLoading(false);
      }
    })();
  }, [region, sport, teamName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* 1) HEADER */}
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">{teamName} Home</h2>
        <p className="text-sm text-gray-500">{fanCount} fans · {city || "Global"}</p>
      </section>

      {/* 2) KEY CHIPS */}
      <section className="flex gap-2 overflow-x-auto text-sm">
        <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">Next Match</div>
        <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">Rival Vote</div>
        <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">MOM Vote</div>
        <div className="px-4 py-1 rounded-full bg-gray-100 text-gray-700 whitespace-nowrap">Meetups</div>
      </section>

      {/* 3) NEXT MATCH */}
      {nextMatch && (
        <section className="space-y-1">
          <h3 className="font-medium">Next Match</h3>
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-semibold">{nextMatch.homeTeam}</span>
            <span className="text-gray-400">vs</span>
            <span className="font-semibold">{nextMatch.awayTeam}</span>
          </div>
          <p className="text-sm text-gray-500">
            {new Date(nextMatch.date).toLocaleString()} · {nextMatch.venue}
          </p>
        </section>
      )}

      {/* 4) TODAY'S BUZZ */}
      <section className="space-y-2">
        <h3 className="font-medium">Today's Buzz</h3>

        {rivalTopTeam && (
          <p className="text-sm">
            • Top rival: <span className="font-semibold">{rivalTopTeam.name}</span> ({totalVotes} votes)
          </p>
        )}

        {momMod === null && (
          <p className="text-sm">• MOM voting will open soon</p>
        )}

        {momMod && (
          <p className="text-sm">
            • MOM voting is open — {momMod?.data?.candidates?.length} candidates
          </p>
        )}

      </section>

      {/* 5) MEETUPS */}
      <section className="space-y-2">
        <h3 className="font-medium">Meetups</h3>
        {meetups.length === 0 ? (
          <p className="text-sm text-gray-400">No meetups scheduled.</p>
        ) : (
          meetups.map((m) => (
            <p key={m.id} className="text-sm">
              • {m.title} — {new Date(m.datetime).toLocaleDateString()} {m.location?.name ? `· ${m.location.name}` : ""}
            </p>
          ))
        )}
      </section>

      {/* 6) OTHER MATCHES */}
      <section className="space-y-2">
        <h3 className="font-medium">Other {region.toUpperCase()} Matches</h3>

        {localLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : localMatches.length === 0 ? (
          <p className="text-sm text-gray-400">No local matches available.</p>
        ) : (
          localMatches.map((m) => (
            <p key={m.id} className="text-sm">
              • {m.title} — {new Date(m.date).toLocaleDateString()} {m.venue ? `· ${m.venue}` : ""}
            </p>
          ))
        )}
      </section>
    </motion.div>
  );
}
