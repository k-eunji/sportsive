// src/app/teams/[teamId]/components/FanCard.tsx

"use client";

import { getRelationshipLabel, RelationshipStatus } from "@/lib/relationships";

interface FanCardProps {
  name: string;
  status: RelationshipStatus;
  onToggle: () => void;
}

export default function FanCard({ name, status, onToggle }: FanCardProps) {
  const info = getRelationshipLabel(status);

  return (
    <div className="p-3 border rounded-lg flex justify-between items-center bg-gray-50">
      <p className="font-semibold">{name}</p>
      <button
        onClick={onToggle}
        className="px-3 py-1 rounded-lg text-white text-sm"
        style={{ backgroundColor: info.color }}
      >
        {info.label}
      </button>
    </div>
  );
}