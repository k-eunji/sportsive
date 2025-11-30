// src/components/UserAvatar.tsx

"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  userId?: string;
  size?: number;
  avatarUrl?: string;
  name?: string;
  showName?: boolean;
  linkToProfile?: boolean;
};

export default function UserAvatar({
  userId,
  size = 32,
  avatarUrl,
  name,
  showName = true,
  linkToProfile = true,
}: Props) {
  const displayName = name || "Guest";
  const initials = displayName[0]?.toUpperCase() ?? "?";

  const AvatarImage = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={`${displayName}'s avatar`}
      width={size}
      height={size}
      className="
        rounded-full border border-border object-cover
        hover:ring-2 hover:ring-ring/40 transition-all
      "
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="
        flex items-center justify-center rounded-full border border-border
        bg-muted text-muted-foreground font-semibold
        hover:ring-2 hover:ring-ring/40 transition-all
      "
      aria-label={`${displayName}'s avatar placeholder`}
    >
      {initials}
    </div>
  );

  const NameText = showName && (
    <strong className="text-sm font-medium text-foreground truncate">
      {displayName}
    </strong>
  );

  return (
    <div className="flex items-center gap-2">
      {linkToProfile && userId ? (
        <Link
          href={`/profile/${userId}`}
          className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          aria-label={`${displayName}'s profile`}
        >
          {AvatarImage}
          {NameText}
        </Link>

      ) : (
        <>
          {AvatarImage}
          {NameText}
        </>
      )}
    </div>
  );
}
