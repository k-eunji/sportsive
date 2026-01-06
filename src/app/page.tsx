// src/app/page.tsx

import WhatIsSportsive from "./components/WhatIsSportsive";
import PlatformActivity from "./components/PlatformActivity";
import LivePreview from "./components/LivePreview";
import MapHero from "./components/map-hero/MapHero";
import HomeFooterFeedback from "./components/HomeFooterFeedback";
import { getUpcomingEvents } from "@/lib/events";

export default async function Home() {
  const events = await getUpcomingEvents();
  const safeEvents = JSON.parse(JSON.stringify(events));

  return (
    <main
      className="
        relative mx-auto max-w-6xl
        px-6 pt-6 pb-[140px]
        space-y-28
        transition-colors duration-500
      "
    >
      {/* ✅ 1) Start with action: map + daily exploration loop */}
      <MapHero />

      {/* ✅ 2) Proof that this is alive */}
      <LivePreview />

      {/* ✅ 3) Explain later (after they’ve already explored) */}
      <WhatIsSportsive />

      {/* ✅ 4) Trust signals */}
      <PlatformActivity />

      {/* ✅ 5) Feedback CTA only when it makes sense (client-side) */}
      <HomeFooterFeedback />

      {/* (Optional) keep / remove this section. Leaving it is fine, but it reads as "future" */}
      <section className="text-center text-gray-500 text-sm max-w-xl mx-auto">
        <p className="font-medium text-gray-700 dark:text-gray-300">
          Offline participation emerges only where activity already exists
        </p>
        <p className="mt-2">
          When enough fans gather around a match,
          <br />
          offline Together unlock naturally.
        </p>
        <p className="mt-1 text-xs opacity-70">Available in active cities only.</p>
      </section>
    </main>
  );
}
