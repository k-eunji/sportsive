// src/app/meetups/[meetupId]/components/MeetupInfoCard/formatType.ts

export type MeetupType =
  | "match_attendance"
  | "pub_gathering"
  | "online_game"
  | "pickup_sports"
  | string; // 기타 확장 가능성 고려

export default function formatType(type: MeetupType): string {
  const typeMap: Record<string, string> = {
    match_attendance: "🏟️ Match Attendance",
    pub_gathering: "🍺 Pub Gathering",
    online_game: "🎮 Online Game",
    pickup_sports: "🏐 Pickup Sports",
  };

  return typeMap[type] ?? "❓ Other";
}
