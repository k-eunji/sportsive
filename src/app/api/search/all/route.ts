// src/app/api/search/all/route.ts
import { NextResponse } from "next/server";

// 🔍 문자열 매칭 헬퍼 (null-safe + normalize)
function matchValue(value: any, keyword: string) {
  if (!value || typeof value !== "string") return false;
  return value.toLowerCase().includes(keyword);
}

// 🔥 점수 기반 랭킹: 필드별 가중치
function scoreMatch(obj: any, keyword: string, fields: string[]) {
  let score = 0;
  for (const field of fields) {
    const value = obj[field];
    if (!value) continue;

    if (typeof value === "string") {
      if (value.toLowerCase().startsWith(keyword)) score += 3;
      else if (value.toLowerCase().includes(keyword)) score += 1;
    }

    // 배열(예: tags[])인 경우
    if (Array.isArray(value)) {
      if (value.some((v) => matchValue(v, keyword))) score += 2;
    }
  }
  return score;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let keyword = searchParams.get("query")?.toLowerCase() ?? "";

  // 검색어 전처리 (여분의 기호 제거)
  keyword = keyword.replace(/[^a-z0-9\s]/gi, "").trim();

  if (!keyword || keyword.length < 2) {
    return NextResponse.json({
      teams: [],
      events: [],
      posts: [],
      live: [],
      meetups: [],
    });
  }

  try {
    // ---------- Fetch all resources ----------
    const [teamsRes, eventsRes, fanhubRes, liveRes, meetupsRes] =
      await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/teams`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/fanhub`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/live`),
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/meetups`),
      ]);

    const safeJson = async (res: any) =>
      res?.value?.ok ? await res.value.json() : null;

    const teamsData = await safeJson(teamsRes);
    const eventsData = await safeJson(eventsRes);
    const fanhubData = await safeJson(fanhubRes);
    const liveData = await safeJson(liveRes);
    const meetupsData = await safeJson(meetupsRes);

    const teams = teamsData?.teams ?? [];
    const events = eventsData?.events ?? [];
    const posts = fanhubData?.posts ?? fanhubData?.talks ?? [];
    const live = liveData?.rooms ?? liveData?.liveRooms ?? [];
    const meetups = meetupsData?.meetups ?? [];

    // ---------- TEAM SEARCH ----------
    const filteredTeams = teams
      .map((t: any) => ({
        ...t,
        _score: scoreMatch(t, keyword, ["name", "city", "region"]),
      }))
      .filter((t: any) => t._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    // ---------- EVENT SEARCH ----------
    const filteredEvents = events
      .map((e: any) => ({
        ...e,
        _score: scoreMatch(e, keyword, [
          "homeTeam",
          "awayTeam",
          "competition",
          "venue",
          "city",
        ]),
      }))
      .filter((e: any) => e._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    // ---------- FANHUB SEARCH (본문 + 태그 + 작성자) ----------
    const filteredPosts = posts
      .map((p: any) => ({
        ...p,
        _score: scoreMatch(p, keyword, ["text", "authorNickname", "tags"]),
      }))
      .filter((p: any) => p._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    // ---------- LIVE ROOMS ----------
    const filteredLive = live
      .map((r: any) => ({
        ...r,
        _score: scoreMatch(r, keyword, ["title", "description"]),
      }))
      .filter((r: any) => r._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    // ---------- MEETUPS ----------
    const filteredMeetups = meetups
      .map((m: any) => ({
        ...m,
        _score: scoreMatch(m, keyword, ["title", "city", "date"]),
      }))
      .filter((m: any) => m._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    return NextResponse.json({
      teams: filteredTeams,
      events: filteredEvents,
      posts: filteredPosts,
      live: filteredLive,
      meetups: filteredMeetups,
    });
  } catch (err) {
    console.error("Search API failed:", err);

    return NextResponse.json(
      {
        teams: [],
        events: [],
        posts: [],
        live: [],
        meetups: [],
        error: "Search failed",
      },
      { status: 500 }
    );
  }
}
