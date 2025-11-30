//src/app/explore/components/search/useSearch.ts

"use client";

import { useState, useEffect } from "react";

export function useSearch(query: string) {
  const [loading, setLoading] = useState(false);

  const [results, setResults] = useState({
    teams: [],
    events: [],
    posts: [],
    live: [],
    meetups: [],
  });

  const hasResults =
    results.teams.length ||
    results.events.length ||
    results.posts.length ||
    results.live.length ||
    results.meetups.length;

  useEffect(() => {
    if (query.length < 2) return;

    let mounted = true;

    async function load() {
      setLoading(true);

      try {
        const [teamsRes, eventsRes, postsRes, liveRes, meetupRes] =
          await Promise.all([
            fetch(`/api/search/teams?query=${query}`),
            fetch(`/api/search/events?query=${query}`),
            fetch(`/api/search/fanhub?query=${query}`),
            fetch(`/api/search/live?query=${query}`),
            fetch(`/api/search/meetups?query=${query}`),
          ]);

        if (!mounted) return;

        setResults({
          teams: (await teamsRes.json()).teams ?? [],
          events: (await(eventsRes).json()).events ?? [],
          posts: (await postsRes.json()).posts ?? [],
          live: (await liveRes.json()).rooms ?? [],
          meetups: (await meetupRes.json()).meetups ?? [],
        });
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [query]);

  return { loading, results, hasResults };
}
