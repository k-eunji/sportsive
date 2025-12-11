// src/app/api/search/all/route.ts
import { NextRequest, NextResponse } from "next/server";

/* ----------------------------------------------
 *  검색 문자열 매칭 (null-safe, normalize)
 * ---------------------------------------------- */
function matchValue(value: any, keyword: string) {
  if (!value || typeof value !== "string") return false;
  return value.toLowerCase().includes(keyword);
}

/* ----------------------------------------------
 *  가중치 기반 점수 계산
 * ---------------------------------------------- */
function scoreMatch(obj: any, keyword: string, fields: string[]) {
  let score = 0;

  for (const field of fields) {
    const value = obj[field];
    if (!value) continue;

    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower.startsWith(keyword)) score += 3;
      else if (lower.includes(keyword)) score += 1;
    }

    // 배열 필드(tags 등)
    if (Array.isArray(value)) {
      if (value.some((v) => matchValue(v, keyword))) score += 2;
    }
  }

  return score;
}

/* ----------------------------------------------
 *  safe JSON 파싱 헬퍼
 * ---------------------------------------------- */
async function safeJson(result: PromiseSettledResult<Response>) {
  if (result.status === "fulfilled" && result.value.ok) {
    try {
      return await result.value.json();
    } catch {
      return null;
    }
  }
  return null;
}

/* ----------------------------------------------
 *  GET /api/search/all
 * ---------------------------------------------- */
export async function GET(req: NextRequest) {
  let keyword = req.nextUrl.searchParams.get("query")?.toLowerCase() ?? "";

  // 검색어 전처리
  keyword = keyword.replace(/[^a-z0-9\s]/gi, "").trim();

  // 최소 글자수 미만이면 바로 빈 결과 반환
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
    // ----------------------------------------------
    //  1. 모든 데이터 소스 병렬 요청
    // ----------------------------------------------
    const base = process.env.NEXT_PUBLIC_BASE_URL;

    const [
      teamsRes,
      eventsRes,
      fanhubRes,
      liveRes,
      meetupsRes,
    ] = await Promise.allSettled([
      fetch(`${base}/api/teams`),
      fetch(`${base}/api/events`),
      fetch(`${base}/api/fanhub`),
      fetch(`${base}/api/live`),
      fetch(`${base}/api/meetups`),
    ]);

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

    // ----------------------------------------------
    //  2. 개별 영역 검색(score 기반 정렬)
    // ----------------------------------------------

    const filteredTeams = teams
      .map((t: any) => ({
        ...t,
        _score: scoreMatch(t, keyword, ["name", "city", "region"]),
      }))
      .filter((t: any) => t._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

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

    const filteredPosts = posts
      .map((p: any) => ({
        ...p,
        _score: scoreMatch(p, keyword, ["text", "authorNickname", "tags"]),
      }))
      .filter((p: any) => p._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    const filteredLive = live
      .map((r: any) => ({
        ...r,
        _score: scoreMatch(r, keyword, ["title", "description"]),
      }))
      .filter((r: any) => r._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    const filteredMeetups = meetups
      .map((m: any) => ({
        ...m,
        _score: scoreMatch(m, keyword, ["title", "city", "date"]),
      }))
      .filter((m: any) => m._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 20);

    // ----------------------------------------------
    //  3. 응답 반환
    // ----------------------------------------------
    return NextResponse.json({
      teams: filteredTeams,
      events: filteredEvents,
      posts: filteredPosts,
      live: filteredLive,
      meetups: filteredMeetups,
    });
  } catch (err) {
    console.error("❌ [Search API Error]:", err);

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
