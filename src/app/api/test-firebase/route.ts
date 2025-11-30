// src/app/api/test-firebase/route.ts
import { NextRequest, NextResponse } from "next/server";

// 서버 메모리용 mock matches 데이터
const mockMatches = [
  { id: "match1", title: "Soccer Game", location: "Seoul Stadium", date: "2025-10-15" },
  { id: "match2", title: "Basketball Game", location: "Busan Arena", date: "2025-10-16" },
];

export async function GET(req: NextRequest) {
  try {
    // 데이터 콘솔 출력 (테스트용)
    console.log("Mock matches data:", mockMatches);

    // API 응답으로 반환
    return NextResponse.json({ data: mockMatches });
  } catch (error) {
    console.error("Mock API Test Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
