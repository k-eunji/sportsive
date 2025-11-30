// src/app/meetups/[meetupId]/components/MeetupInfoCard/MeetupFields/OnlineGameFields.tsx

"use client";

export default function OnlineGameFields({
  onlineGameName,
  setOnlineGameName,
  onlineLink,
  setOnlineLink,
  skillLevel,
  setSkillLevel,
  editMode,
}: any) {
  return (
    <div className="divide-y divide-border">

      <div className="py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Game</span>
        {editMode ? (
          <input
            value={onlineGameName}
            onChange={(e) => setOnlineGameName(e.target.value)}
            className="border border-border rounded-md px-2 py-1 text-sm w-40 text-right"
          />
        ) : (
          <span className="text-sm font-medium truncate">
            {onlineGameName || "TBA"}
          </span>
        )}
      </div>

      <div className="py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Game Link</span>
        {editMode ? (
          <input
            value={onlineLink}
            onChange={(e) => setOnlineLink(e.target.value)}
            className="border border-border rounded-md px-2 py-1 text-sm w-56 text-right"
          />
        ) : onlineLink ? (
          <a
            href={onlineLink}
            className="text-primary font-medium hover:underline truncate"
            target="_blank"
          >
            {onlineLink}
          </a>
        ) : (
          <span className="text-sm font-medium">—</span>
        )}
      </div>

      <div className="py-3 flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Skill Level</span>
        {editMode ? (
          <select
            value={skillLevel}
            onChange={(e) => setSkillLevel(e.target.value)}
            className="border border-border rounded-md px-2 py-1 text-sm bg-background"
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

    </div>
  );
}
