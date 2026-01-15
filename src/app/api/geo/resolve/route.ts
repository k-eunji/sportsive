// src/app/api/geo/resolve/route.ts

import { NextResponse } from "next/server";

// 🔹 Haversine 거리 계산 함수
function getDistance(
  lat1: number,
  lon1: number,
  lat2?: number,
  lon2?: number
): number {
  if (lat2 == null || lon2 == null) return Infinity;

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

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ city: null, region: null });
  }

  const base = url.origin;

  try {
    // ────────────────────────────────
    // 1) 축구 / 럭비 / 테니스 이벤트 병렬 로드
    // ────────────────────────────────
    const [footballRes, rugbyRes, tennisRes] = await Promise.allSettled([
      fetch(`${base}/api/events/england/football`, { cache: "no-store" }),
      fetch(`${base}/api/events/england/rugby`, { cache: "no-store" }),
      fetch(`${base}/api/events/england/tennis`, { cache: "no-store" }),
    ]);

    let events: {
      city?: string;
      region?: string;
      lat?: number;
      lng?: number;
    }[] = [];

    // ───── football
    if (footballRes.status === "fulfilled" && footballRes.value.ok) {
      const json = await footballRes.value.json();
      events.push(
        ...(json.matches ?? []).map((m: any) => ({
          city: m.city,
          region: m.region,
          lat: m.location?.lat,
          lng: m.location?.lng,
        }))
      );
    }

    // ───── rugby
    if (rugbyRes.status === "fulfilled" && rugbyRes.value.ok) {
      const json = await rugbyRes.value.json();
      events.push(
        ...(json.matches ?? []).map((m: any) => ({
          city: m.city,
          region: m.region,
          lat: m.location?.lat,
          lng: m.location?.lng,
        }))
      );
    }

    // ───── tennis (session events)
    if (tennisRes.status === "fulfilled" && tennisRes.value.ok) {
      const json = await tennisRes.value.json();
      events.push(
        ...(json.matches ?? []).map((m: any) => ({
          city: m.city,
          region: m.region,
          lat: m.location?.lat,
          lng: m.location?.lng,
        }))
      );
    }

    // ────────────────────────────────
    // 2) 좌표 있는 이벤트만
    // ────────────────────────────────
    const eventsWithCoords = events.filter(
      (e) => e.lat != null && e.lng != null && e.city
    );

    if (eventsWithCoords.length === 0) {
      return NextResponse.json({ city: null, region: null });
    }

    // ────────────────────────────────
    // 3) 가장 가까운 이벤트 기준 city / region 결정
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
