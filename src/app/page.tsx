// src/app/page.tsx
import HeroCommunity from "./components/HeroCommunity";
import CommunityHighlights from "./components/CommunityHighlights";
import CommunityFeedPreview from "./components/CommunityFeedPreview";
import LivePreview from "./components/LivePreview";
import MeetupIntroSection from "./components/MeetupIntroSection";
import MeetupPreview from "./components/MeetupPreview";
import RegionDisplay from "./components/RegionDisplay";
import TeamsSection from "./teams/TeamsSection"; // ✅ 추가
import { getUpcomingEvents } from "@/lib/events";

export default async function Home() {
  const events = await getUpcomingEvents();
  const safeEvents = JSON.parse(JSON.stringify(events));

  return (
    <main className="relative mx-auto max-w-6xl px-6 pt-24 pb-28 space-y-28 transition-colors duration-500">
      {/* 🏟 히어로 */}
      <HeroCommunity events={safeEvents} />
      <RegionDisplay />
      <CommunityHighlights />
      <TeamsSection />
      <LivePreview />
      <MeetupIntroSection />
      <MeetupPreview />
      <CommunityFeedPreview />

      <div className="text-center mt-12">
        <a
          href="/community"
          className="inline-block bg-[var(--primary-to)] text-white px-8 py-3 rounded-full shadow-md hover:opacity-90 transition"
        >
          🚀 Find your team & join the fan community →
        </a>
      </div>
    </main>
  );
}
