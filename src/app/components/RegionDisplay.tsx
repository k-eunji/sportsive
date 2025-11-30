//src/app/components/RegionDisplay.tsx

"use client";

import { useCommunity } from "@/context/CommunityContext";

export default function RegionDisplay() {
  const { region } = useCommunity();

  if (!region) return null;

  return (
    <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-2">
      📍 Showing results for <span className="font-semibold">{region}</span>
    </div>
  );
}

