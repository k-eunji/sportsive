// src/components/FollowButton.tsx
"use client";

interface Props {
  isFollowing: boolean;
  loading?: boolean;
  onToggle: () => void;
  removeMode?: boolean; // 추가
}

export default function FollowButton({ isFollowing, loading, onToggle, removeMode }: Props) {
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-white ${
        removeMode
          ? "bg-red-500 hover:bg-red-600"
          : isFollowing
          ? "bg-gray-500 hover:bg-gray-600"
          : "bg-blue-600 hover:bg-blue-700"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {removeMode ? "Remove" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
