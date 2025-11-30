// src/app/explore/page.tsx

"use client";

import { useState, useEffect } from "react";

import ExploreSearch from "./components/ExploreSearch";
import ExploreSearchResults from "./components/ExploreSearchResults/index";
import ExploreQuickFilters from "./components/ExploreQuickFilters";
import ExploreTrendingTeams from "./components/ExploreTrendingTeams";
import ExploreFanHubSpotlight from "./components/ExploreFanHubSpotlight";
import ExploreTopLeagues from "./components/ExploreTopLeagues";
import ExploreUpcoming from "./components/ExploreUpcoming";
import ExploreNearby from "./components/ExploreNearby";
import ExploreTrendingLocalTeams from "./components/ExploreTrendingLocalTeams";
import ExploreTrendingLocalLeagues from "./components/ExploreTrendingLocalLeagues";
import ExploreTrendingLocalFanHub from "./components/ExploreTrendingLocalFanHub";

import TeamLogoRow from "./components/TeamLogoRow";
import { useTeams } from "@/app/teams/hooks/useTeams";


// 🔥 중복 제거 유틸 – 여기 추가
function dedupeTeams(arr: any[]) {
  const map = new Map();
  arr.forEach(t => {
    const key = (t.name || "").toLowerCase().trim();
    if (!map.has(key)) map.set(key, t);
  });
  return Array.from(map.values());
}



export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<"global" | "local">("global");

  // 하단 로고 전용
  const [allGlobalTeams, setAllGlobalTeams] = useState<any[]>([]);
  const [allLocalTeams, setAllLocalTeams] = useState<any[]>([]);

  // 기존 트렌딩
  const [globalTrending, setGlobalTrending] = useState<any[]>([]);
  const [localTrending, setLocalTrending] = useState<any[]>([]);

  // 전체 팀 가져오기 (API + hooks)
  const { teams: allTeams } = useTeams();


  // Hydration-safe
  useEffect(() => {
    setMounted(true);
  }, []);

  // 위치 획득
  useEffect(() => {
    if (!mounted) return;

    navigator.geolocation.getCurrentPosition(
      (p) => setLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setLocation({ lat: 51.5074, lng: -0.1278 }) // fallback
    );
  }, [mounted]);

  // 도시 resolve
  useEffect(() => {
    if (!mounted || !location) return;

    async function detectCity() {
      const res = await fetch(
        `/api/geo/resolve?lat=${location?.lat}&lng=${location?.lng}`
      );
      const data = await res.json();
      setCity(data?.city ?? null);
    }

    detectCity();
  }, [mounted, location]);


  // GLOBAL TRENDING
  useEffect(() => {
    if (mode !== "global") return;
    fetch(`/api/trending/teams`)
      .then(r => r.json())
      .then(setGlobalTrending);
  }, [mode]);

  // LOCAL TRENDING
  useEffect(() => {
    if (mode !== "local" || !city) return;

    fetch(`/api/trending/local/teams?city=${city}`)
      .then(r => r.json())
      .then(setLocalTrending);
  }, [mode, city]);



  // ⭐ GLOBAL ALL TEAMS (하단 로고)
  useEffect(() => {
    fetch(`/api/teams`)
      .then(r => r.json())
      .then(data => {
        const deduped = dedupeTeams(data.teams);
        setAllGlobalTeams(deduped);
      });
  }, []);



  // ⭐ LOCAL ALL TEAMS (하단 로고)
  // 🔥 여기서 trending API 대신 전체 팀에서 필터링!
  useEffect(() => {
    if (!city) return;
    if (!allTeams || allTeams.length === 0) return;

    const filtered = allTeams.filter(t =>
      (t.city || "").toLowerCase().trim() === city.toLowerCase().trim()
    );

    setAllLocalTeams(dedupeTeams(filtered));
  }, [city, allTeams]);



  // 최종 매핑된 로고 리스트 생성
  const mappedGlobalLogos = allGlobalTeams.map(t => ({
    name: t.name,
    logo: t.logo || "/placeholder-logo.png",
  }));

  const mappedLocalLogos = allLocalTeams.map(t => ({
    name: t.name,
    logo: t.logo || "/placeholder-logo.png",
  }));


  const inSearchMode = query.length >= 2;

  return (
    <main className="max-w-xl mx-auto px-4 pt-0 pb-28">
      {!mounted ? (
        <div className="h-10" />
      ) : (
        <>
          <ExploreSearch query={query} setQuery={setQuery} />

          {!inSearchMode && (
            <div className="flex gap-2 mt-3 mb-6">
              <button
                onClick={() => setMode("global")}
                className={`flex-1 py-2 rounded-full text-sm ${
                  mode === "global"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Global
              </button>

              <button
                onClick={() => setMode("local")}
                className={`flex-1 py-2 rounded-full text-sm ${
                  mode === "local"
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                Your Location
              </button>
            </div>
          )}


          {inSearchMode ? (
            <ExploreSearchResults query={query} />
          ) : (
            <div className="space-y-10">
              <ExploreQuickFilters />

              {mode === "global" && (
                <>
                  {/* ⭐ 글로벌 전체 팀 로고 */}
                  <TeamLogoRow teams={mappedGlobalLogos} />
                  <ExploreTrendingTeams />
                  <ExploreTopLeagues />
                  <ExploreUpcoming />
                  <ExploreFanHubSpotlight />

                  
                </>
              )}

              {mode === "local" && city && (
                <>
                  <ExploreNearby />
                  <ExploreTrendingLocalTeams city={city} />
                  <ExploreTrendingLocalLeagues city={city} />
                  <ExploreTrendingLocalFanHub city={city} />

                  {/* ⭐ 로컬 전체 팀 로고 */}
                  <TeamLogoRow teams={mappedLocalLogos} />
                </>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
