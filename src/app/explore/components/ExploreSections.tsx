//src/app/explore/components/ExploreSections.tsx

"use client";

import ExploreSectionNearby from "./sections/ExploreSectionNearby";
import ExploreSectionPopularTeams from "./sections/ExploreSectionPopularTeams";
import ExploreSectionFanHub from "./sections/ExploreSectionFanHub";
import ExploreSectionHashtags from "./sections/ExploreSectionHashtags";

export default function ExploreSections({ loading, data }: any) {
  if (loading || !data) return (
    <div className="space-y-8">
      <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
      <div className="h-24 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-10">
      <ExploreSectionNearby events={data.nearbyEvents} />
      <ExploreSectionPopularTeams teams={data.popularTeams} />
      <ExploreSectionFanHub posts={data.posts} />
      <ExploreSectionHashtags tags={data.hashtags} />
    </div>
  );
}
