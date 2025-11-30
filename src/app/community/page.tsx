// src/app/community/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import FeedFilterBar from "./components/FeedFilterBar";
import FeedComposer from "./components/FeedComposer";
import FeedList from "./components/FeedList";
import RightSidebar from "./components/RightSidebar";
import ToastArea from "./components/ToastArea";

export default function CommunityPage() {
  const params = useSearchParams() as unknown as URLSearchParams;

  const type = params.get("type") ?? "all";
  const team = params.get("team") ?? "";
  const user = params.get("user") ?? "";
  const region = params.get("region") ?? "global"; // ✅ 국가 (기본 global)
  const city = params.get("city") ?? ""; // ✅ 지역 (선택적)
  const mode = type as "all" | "post" | "meetup" | "live" | "relationship";

  return (
    <main
      className={`max-w-7xl mx-auto p-4 pt-24 grid gap-6 transition-all duration-300 ${
        mode !== "all" ? "lg:grid-cols-[2fr_1fr]" : "lg:grid-cols-3"
      }`}
    >
      <section className="lg:col-span-2 space-y-4">
        <FeedFilterBar />
        <FeedComposer mode={mode} />
        {/* ✅ region + city 함께 전달 */}
        <FeedList mode={mode} filter={{ type, team, user, region, city }} />
      </section>

      <RightSidebar mode={mode} />
      <ToastArea />
    </main>
  );
}
