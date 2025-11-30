//src/app/explore/components/ExploreUpcoming.tsx

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function formatDateUK(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ExploreUpcoming() {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/events");
      const json = await res.json();

      const all: any[] = json.events ?? [];

      const now = Date.now();

      const upcoming = all
        .filter((e) => e.date && new Date(e.date).getTime() >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

      setMatches(upcoming);
    };

    load();
  }, []);

  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold mb-3">Upcoming Matches</h2>

      <div className="space-y-2 text-sm">
        {matches.map((m) => (
          <div key={m.id} className="flex justify-between py-1">
            <span>{m.homeTeam} vs {m.awayTeam}</span>
            <span className="text-sm text-gray-900">
              {formatDateUK(m.date)}
            </span>
          </div>
        ))}
      </div>

      <Link href="/events" className="mt-2 inline-block text-blue-600 text-sm">
        See all matches →
      </Link>
    </section>
  );
}
