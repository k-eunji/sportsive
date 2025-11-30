// src/app/meetups/[meetupId]/components/MeetupInfoCard/utils.ts

export type MeetupType =
  | "match_attendance"
  | "pub_gathering"
  | "online_game"
  | "pickup_sports"
  | string; // 확장성을 위해 string 허용

export function formatType(type: MeetupType): string {
  const typeMap: Record<string, string> = {
    match_attendance: "🏟️ Match Attendance",
    pub_gathering: "🍺 Pub Gathering",
    online_game: "🎮 Online Game",
    pickup_sports: "🏐 Pickup Sports",
  };

  return typeMap[type] ?? "❓ Other";
}
