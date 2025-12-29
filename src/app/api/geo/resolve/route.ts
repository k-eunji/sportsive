// src/app/api/geo/resolve/route.ts
import { NextResponse } from "next/server";

// 🔹 Haversine 거리 계산 함수
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat2 || !lon2) return Infinity;

  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  // lat/lng 누락 시 기본값
  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ city: null, region: null });
  }

  // 🔥 Next.js 16에서 내부 API 안정적으로 호출하는 정답 방식
  const base = url.origin;

  try {
    // ────────────────────────────────
    // 1) 이벤트 API 두 개 병렬로 요청
    // ────────────────────────────────
    const [eventsRes, footballRes, rugbyRes] = await Promise.allSettled([
      fetch(`${base}/api/events`, { cache: "no-store" }),
      fetch(`${base}/api/events/england/football`, { cache: "no-store" }),
      fetch(`${base}/api/events/england/rugby`, { cache: "no-store" }),
    ]);

    let events: any[] = [];

    // base events
    if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
      const json = await eventsRes.value.json();
      events = [...events, ...(json.events ?? [])];
    }

    // football events
    if (footballRes.status === "fulfilled" && footballRes.value.ok) {
      const json = await footballRes.value.json();

      const footballEvents = (json.matches ?? []).map((m: any) => ({
        city: m.city,
        region: m.region,
        lat: m.location?.lat,
        lng: m.location?.lng,
      }));

      events = [...events, ...footballEvents];
    }

    // rugby events
    if (rugbyRes.status === "fulfilled" && rugbyRes.value.ok) {
      const json = await rugbyRes.value.json();

      const rugbyEvents = (json.matches ?? []).map((m: any) => ({
        city: m.city,
        region: m.region,
        lat: m.location?.lat,
        lng: m.location?.lng,
      }));

      events = [...events, ...rugbyEvents];
    }


    // ────────────────────────────────
    // 2) 좌표가 있는 이벤트만 필터링
    // ────────────────────────────────
    const eventsWithCoords = events.filter(
      (e) => e.lat && e.lng && e.city
    );

    if (eventsWithCoords.length === 0) {
      return NextResponse.json({ city: null, region: null });
    }

    // ────────────────────────────────
    // 3) 가장 가까운 이벤트 찾기
    // ────────────────────────────────
    let nearest: any = null;
    let nearestDist = Infinity;

    for (const e of eventsWithCoords) {
      const dist = getDistance(lat, lng, e.lat, e.lng);

      if (dist < nearestDist) {
        nearest = e;
        nearestDist = dist;
      }
    }

    return NextResponse.json({
      city: nearest?.city ?? null,
      region: nearest?.region ?? null,
    });

  } catch (err) {
    console.error("❌ geo resolve failed:", err);
    return NextResponse.json({ city: null, region: null });
  }
}
