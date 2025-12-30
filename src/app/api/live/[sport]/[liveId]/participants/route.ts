// src/app/api/live/[sport]/[liveId]/participants/route.ts

// ❌ DEPRECATED
export const runtime = "nodejs";

export async function POST() {
  return new Response(
    JSON.stringify({
      error: "participants API is deprecated. Presence is used instead.",
    }),
    { status: 410 }
  );
}
