//app/live/hooks/usePostLiveSummary.ts
export async function postLiveSummary({
  teamId,
  matchTitle,
  roomId,
}: {
  teamId?: string | null;
  matchTitle: string;
  roomId: string;
}) {
  try {
    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "post",
        text: `FT: ${matchTitle} — what a game! 🔥`,
        teamId: teamId ?? null,
        liveRoomId: roomId,
        tag: "live-summary",
      }),
    });
  } catch (e) {
    console.warn("Community auto-post failed (live summary):", e);
  }
}
