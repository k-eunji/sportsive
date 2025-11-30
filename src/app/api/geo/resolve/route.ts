// src/app/api/geo/resolve/route.ts
import { NextResponse } from "next/server";

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

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ city: null, region: null });
  }

  try {
    // 1) API 데이터를 가져옴 (DB 대신)
    const [eventsRes, footballRes] = await Promise.allSettled([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/england/football`)
    ]);

    // 🔥 여기서 타입 지정해야 빨간줄 안 뜸
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

    // 좌표가 있는 이벤트만 필터링
    const eventsWithCoords = events.filter(
      (e) => e.lat && e.lng && e.city
    );

    if (eventsWithCoords.length === 0) {
      return NextResponse.json({ city: null, region: null });
    }

    // 2) 가장 가까운 도시 찾기
    let nearest: any = null;
    let nearestDist = Infinity;

    for (const e of eventsWithCoords) {
      const d = getDistance(lat, lng, e.lat, e.lng);
      if (d < nearestDist) {
        nearest = e;
        nearestDist = d;
      }
    }

    return NextResponse.json({
      city: nearest?.city ?? null,
      region: nearest?.region ?? null,
    });

  } catch (err) {
    console.error("geo resolve failed", err);
    return NextResponse.json({ city: null, region: null });
  }
}
