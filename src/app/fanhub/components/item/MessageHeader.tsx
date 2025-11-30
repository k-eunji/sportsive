//src/app/fanhub/components/item/MessageHeader.tsx

"use client";

import UserAvatar from "@/components/UserAvatar";
import { timeAgoModern } from "@/utils/date";
import MessageText from "./MessageText";
import TagList from "./TagList";
import { useRouter } from "next/navigation";

export default function MessageHeader({ message }: any) {
  const router = useRouter();

  return (
    <div className="flex items-start gap-3 mb-2">
      {/* Avatar → 프로필 이동 */}
      <UserAvatar
        userId={message.userId}
        name={message.authorNickname}
        size={38}
        showName={false}
      />

      <div className="flex flex-col flex-1">

        {/* nickname + time */}
        <div className="flex items-center gap-2 mb-1">
          <p
            className="font-semibold text-sm cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/profile/${message.userId}`);
            }}
          >
            {message.authorNickname}
          </p>

          <span className="text-xs text-gray-500">
            {timeAgoModern(message.createdAt)}
          </span>
        </div>

        {/* text 클릭하면 상세 이동 */}
        <MessageText
          text={message.text}
          onBodyClick={() => router.push(`/fanhub/${message.id}`)}
        />

        <TagList tags={message.tags} />

      </div>
    </div>
  );
}

