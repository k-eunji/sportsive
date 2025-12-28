// src/app/api/explore/route.ts

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabaseServer";

// ✅ Haversine 거리 계산 (km)
function getDistance(lat1: number, lon1: number, lat2?: number, lon2?: number) {
  if (lat2 == null || lon2 == null) return Infinity;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q")?.toLowerCase() || "";

  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");

  const lat = latParam ? Number(latParam) : null;
  const lng = lngParam ? Number(lngParam) : null;

  const hasLocation = lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng);

  try {
    // ──────────────────────────
    // 1) Latest FanHub Posts
    // ──────────────────────────
    const { data: fanhubPostsRaw, error: postsErr } = await supabase
      .from("fanhub_posts")
      .select("id, text, author_nickname, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (postsErr) console.error("❌ fanhub_posts error:", postsErr);

    const fanhubPosts =
      (fanhubPostsRaw ?? []).map((p: any) => ({
        id: p.id,
        text: p.text,
        authorNickname: p.author_nickname,
        created_at: p.created_at,
      })) ?? [];

    // ──────────────────────────
    // 2) Trending hashtags
    //    ✅ Supabase에서 group by + count는 보통 RPC/뷰로 처리하는 게 깔끔함
    //    여기서는 2가지 방식 중 "RPC 우선 + fallback"으로 작성
    // ──────────────────────────

    // (A) RPC 방식: SQL로 만들어둔 함수가 있으면 가장 깔끔
    // create function get_trending_hashtags(limit_count int)
    // returns table(tag text, count bigint) ...
    const { data: hashtagsRpc, error: hashtagsRpcErr } = await supabase.rpc(
      "get_trending_hashtags",
      { limit_count: 10 }
    );

    let hashtags: any[] = [];

    if (!hashtagsRpcErr && hashtagsRpc) {
      hashtags = hashtagsRpc;
    } else {
      if (hashtagsRpcErr) {
        console.error("⚠️ get_trending_hashtags rpc error:", hashtagsRpcErr);
      }

      // (B) fallback: 전부 가져와서 메모리에서 집계 (데이터가 많으면 비추)
      const { data: tagsRaw, error: tagsErr } = await supabase
        .from("fanhub_hashtags")
        .select("hashtag");

      if (tagsErr) console.error("❌ fanhub_hashtags error:", tagsErr);

      const counts = new Map<string, number>();
      for (const row of tagsRaw ?? []) {
        const tag = (row as any).hashtag;
        if (!tag) continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }

      hashtags = [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    }

    // ──────────────────────────
    // 3) Popular Teams (랜덤)
    //    ✅ Supabase에서 ORDER BY RANDOM()은 직접 쿼리 불가 → RPC 추천
    //    여기서는 RPC 우선 + fallback(최근 팀)으로 작성
    // ──────────────────────────

    // (A) RPC: get_random_teams(table_name text, limit_count int) 같은 함수 만들어두면 베스트
    const { data: teamsRpc, error: teamsRpcErr } = await supabase.rpc(
      "get_random_england_pl_football_teams",
      { limit_count: 6 }
    );

    let teams: any[] = [];

    if (!teamsRpcErr && teamsRpc) {
      teams = teamsRpc;
    } else {
      if (teamsRpcErr) console.error("⚠️ get_random teams rpc error:", teamsRpcErr);

      // (B) fallback: 랜덤 대신 그냥 최신/기본 정렬로 6개 (임시)
      const { data: teamsRaw, error: teamsErr } = await supabase
        .from("england_pl_football_teams")
        .select("id, name, city, region, logo_url")
        .limit(6);

      if (teamsErr) console.error("❌ teams error:", teamsErr);

      teams =
        (teamsRaw ?? []).map((t: any) => ({
          id: t.id,
          name: t.name,
          city: t.city,
          region: t.region,
          logo: t.logo_url,
        })) ?? [];
    }

    // ──────────────────────────
    // 4) Events (없어도 깨지지 않게)
    // ──────────────────────────
    let rawEvents: any[] = [];

    {
      const { data: eventsRaw, error: eventsErr } = await supabase
        .from("events")
        .select("id, home_team, away_team, date, venue, city, region, lat, lng")
        .order("date", { ascending: true });

      if (eventsErr) {
        // 테이블 없거나 권한 문제일 수 있음
        console.error("⚠️ events error:", eventsErr);
        rawEvents = [];
      } else {
        rawEvents = eventsRaw ?? [];
      }
    }

    // ──────────────────────────
    // 5) Nearby Events (서버에서 계산)
    // ──────────────────────────
    let nearbyEvents: any[] = [];

    if (hasLocation && lat !== null && lng !== null) {
      nearbyEvents = rawEvents
        .map((e) => ({
          ...e,
          distance: getDistance(lat, lng, e.lat, e.lng),
        }))
        .filter((e) => e.distance < 80)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 7);
    } else {
      nearbyEvents = rawEvents
        .filter((e) => e.city?.toLowerCase() === "london")
        .slice(0, 7);
    }

    // ──────────────────────────
    // 6) Search (기존처럼 in-memory)
    //    ✅ 정확히 sqlite 버전 동작 그대로 맞춤
    // ──────────────────────────
    let searchResults: any = null;

    if (q) {
      searchResults = {
        teams: teams.filter((t) => t.name?.toLowerCase().includes(q)),
        events: rawEvents.filter(
          (e) =>
            e.home_team?.toLowerCase().includes(q) ||
            e.away_team?.toLowerCase().includes(q)
        ),
        posts: fanhubPosts.filter((p) => p.text?.toLowerCase().includes(q)),
      };
    }

    return NextResponse.json({
      nearbyEvents,
      teams,
      fanhubPosts,
      hashtags,
      search: searchResults,
    });
  } catch (err) {
    console.error("❌ Explore API Error:", err);
    return NextResponse.json(
      { error: "Failed to load explore data" },
      { status: 500 }
    );
  }
}
