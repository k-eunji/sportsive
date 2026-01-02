// src/app/page.tsx

import WhatIsSportsive from "./components/WhatIsSportsive";
import SituationHero from "./components/SituationHero";
import PlatformActivity from "./components/PlatformActivity";
import LivePreview from "./components/LivePreview";
import HelpShapeSportsive from "./components/HelpShapeSportsive";
import MapHero from "./components/map-hero/MapHero";
import { getUpcomingEvents } from "@/lib/events";

export default async function Home() {
  const events = await getUpcomingEvents();
  const safeEvents = JSON.parse(JSON.stringify(events));

  return (
    <main className="
      relative mx-auto max-w-6xl
      px-6 pt-6 pb-[140px]
      space-y-28
      transition-colors duration-500
    ">

      {/* 1️⃣ Context first */}
      <SituationHero />
      
      {/* 1️⃣ MAIN HERO — Map-based discovery */}
      <MapHero />

      {/* 2️⃣ What is this? (Explanation, not hero) */}
      <WhatIsSportsive />

      {/* 3️⃣ Trust signals (data, not people) */}
      <PlatformActivity />

      {/* 4️⃣ Live matches as a feature */}
      <LivePreview />

      {/* 4.5️⃣ Help shape Sportsive (feedback / match submissions) */}
      <HelpShapeSportsive />

      {/* 5️⃣ Locked future (meetups later) */}
      <section className="text-center text-gray-500 text-sm max-w-xl mx-auto">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Offline participation emerges only where activity already exists
        </p>
        <p className="mt-2">
          When enough fans gather around a match,  
          offline Together unlock naturally.
        </p>
        <p className="mt-1 text-xs opacity-70">
          Available in active cities only.
        </p>
      </section>

    </main>
  );
}
