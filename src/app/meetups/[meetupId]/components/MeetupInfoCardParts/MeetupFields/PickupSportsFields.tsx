// src/app/meetups/[meetupId]/components/MeetupInfoCard/MeetupFields/PickupSportsFields.tsx

"use client";

export default function PickupSportsFields({
  skillLevel,
  setSkillLevel,
  sportType,
  setSportType,
  editMode,
}: any) {
  return (
    <div className="divide-y divide-border">

      <div className="py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Skill Level</span>
        {editMode ? (
          <select
            className="border border-border rounded-md px-2 py-1 text-sm bg-background"
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
          >
            <option value="any">Any</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        ) : (
          <span className="text-sm font-medium">
            {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}
          </span>
        )}
      </div>

      <div className="py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Sport Type</span>

        {editMode ? (
          <select
            className="border border-border rounded-md px-2 py-1 text-sm bg-background"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
          >
            <option value="">Select sport</option>
            <option value="football">⚽ Football</option>
            <option value="rugby">🏉 Rugby</option>
            <option value="cricket">🏏 Cricket</option>
            <option value="tennis">🎾 Tennis</option>
            <option value="golf">🏌️ Golf</option>
            <option value="f1">🏎️ Formula 1</option>
            <option value="boxing">🥊 Boxing</option>
            <option value="cycling">🚴 Cycling</option>
            <option value="running">🏃 Running</option>
          </select>
        ) : (
          <span className="text-sm font-medium">
            {sportType.charAt(0).toUpperCase() + sportType.slice(1)}
          </span>
        )}
      </div>

    </div>
  );
}
