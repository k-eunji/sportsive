// src/app/api/events/route.ts

import { NextResponse } from "next/server";
import { GET as getFootballEvents } from "./england/football/route";
import { GET as getRugbyEvents } from "./england/rugby/route";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const window = url.searchParams.get("window") ?? "7d"; // 기본 7일

    const [footballRes, rugbyRes] = await Promise.all([
      getFootballEvents(),
      getRugbyEvents(),
    ]);

    const footballData = await footballRes.json();
    const rugbyData = await rugbyRes.json();

    const merged = [
      ...(footballData.matches ?? []),
      ...(rugbyData.matches ?? []),
    ];

    const now = new Date();
    const end = new Date(now);

    if (window === "today") {
      end.setHours(23, 59, 59, 999);
    } else if (window === "7d") {
      end.setDate(end.getDate() + 7);
    } else if (window === "30d") {
      end.setDate(end.getDate() + 30);
    }

    const filtered = merged
      .map((e: any) => ({
        ...e,
        startAtUtc: e.startAtUtc ?? e.date, // ⭐ 단일 시간 필드
      }))
      .filter((e: any) => {
        const d = new Date(e.startAtUtc);
        return d >= now && d <= end; // 🔥 과거 제거
      })
      .sort(
        (a: any, b: any) =>
          new Date(a.startAtUtc).getTime() -
          new Date(b.startAtUtc).getTime()
      );

    return NextResponse.json({ events: filtered });
  } catch (error) {
    console.error("❌ Error combining event APIs:", error);
    return NextResponse.json({ events: [] }, { status: 500 });
  }
}
