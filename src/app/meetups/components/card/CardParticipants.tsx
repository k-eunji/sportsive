// src/app/meetups/components/card/CardParticipants.tsx

import { MeetupWithEvent } from "@/types";

export default function CardParticipants({
  meetup,
  compactMobile = false,
}: {
  meetup: MeetupWithEvent;
  compactMobile?: boolean;
}) {

  const avatars: string[] = meetup.participantsAvatars ?? [];  // ⭐ 고정해주면 해결됨!
  const max = compactMobile ? 3 : 4;

  return (
    <div className="
      flex items-center gap-2
      text-[11px] sm:text-[12px]
      text-gray-600 dark:text-gray-400
    ">
      <div className="flex -space-x-2">
        {avatars.slice(0, max).map((url, i) => (
          <img
            key={i}
            src={url}
            className="w-6 h-6 rounded-full border border-white dark:border-gray-900"
          />
        ))}
      </div>

      {meetup.participantsCount > max && (
        <span className="text-gray-500">+{meetup.participantsCount - max}</span>
      )}

      <span className="ml-auto">{meetup.participantsCount} joined</span>
    </div>
  );
}
