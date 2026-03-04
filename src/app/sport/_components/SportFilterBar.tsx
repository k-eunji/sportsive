///src/app/sport/_components/SportFilterBar.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function slugifyVenue(name: string) {
  return name
    .toLowerCase()
    .replace(" racecourse", "")
    .replace(" race course", "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function SportFilterBar({
  slug,
  events,
}: {
  slug: string;
  events: any[];
}) {
  const router = useRouter();
  const rawParams = useSearchParams();

  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const params = new URLSearchParams(
    rawParams?.toString() ?? ""
  );

  const country = params.get("country") ?? "all";
  const region = params.get("region") ?? "";
  const city = params.get("city") ?? "";
  const month = params.get("month") ?? "";
  const course = params.get("course") ?? "";

  const UK_SET = new Set([
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ]);

  /* ================= COUNTRY FILTER ================= */

  const filteredByCountry = useMemo(() => {
    return events.filter((e) => {
      const r = normalize(e.region);

      if (country === "uk") return UK_SET.has(r);
      if (country === "ireland") return r === "ireland";

      return true;
    });
  }, [events, country]);

  /* ================= REGION LIST ================= */

  const regions = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry.map((e) => e.region).filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry]);

  /* ================= CITY LIST ================= */

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .filter((e) =>
            region
              ? normalize(e.region) === normalize(region)
              : true
          )
          .map((e) => e.city)
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry, region]);

  /* ================= MONTH LIST ================= */

  const months = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .map((e) =>
            (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7)
          )
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry]);

  /* ================= COURSE LIST (FIXED) ================= */

  const courses = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .filter((e) =>
            region
              ? normalize(e.region) === normalize(region)
              : true
          )
          .filter((e) =>
            city ? e.city === city : true
          )
          .filter((e) =>
            month
              ? (e.startDate ?? e.date ?? e.utcDate)?.slice(0, 7) === month
              : true
          )
          .map((e) => e.venue)
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry, region, city, month]);

  /* ================= PARAM UPDATE ================= */

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(
      rawParams?.toString() ?? ""
    );

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/sport/${slug}?${params.toString()}`, {
      scroll: false,
    });
  }

  const competitions = useMemo(() => {
    if (slug !== "football") return [];

    return Array.from(
      new Set(events.map((e) => e.competition).filter(Boolean))
    ).sort();
  }, [events, slug]);

  return (
    <section className="flex flex-wrap gap-2 py-1 border-b border-zinc-200">

      {/* Country */}
      <select
        value={country}
        onChange={(e) => {
          const value = e.target.value;

          const params = new URLSearchParams(
            rawParams?.toString() ?? ""
          );

          if (!value || value === "all") {
            params.delete("country");
            params.delete("region");
          } else {
            params.set("country", value);

            if (value === "ireland") {
              params.set("region", "Ireland");
            }

            if (value === "uk") {
              params.delete("region");
            }
          }

          router.push(`/sport/${slug}?${params.toString()}`, {
            scroll: false,
          });
        }}
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      >
        <option value="all">All Countries</option>
        <option value="uk">United Kingdom</option>
        <option value="ireland">Ireland</option>
      </select>

      {/* Region */}
      <select
        value={region}
        onChange={(e) =>
          updateParam("region", e.target.value)
        }
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      >
        <option value="">All Regions</option>
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {/* City */}
      <select
        value={city}
        onChange={(e) =>
          updateParam("city", e.target.value)
        }
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      >
        <option value="">All Cities</option>
        {cities.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Month */}
      <select
        value={month}
        onChange={(e) =>
          updateParam("month", e.target.value)
        }
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      >
        <option value="">All Months</option>
        {months.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      {/* Course */}
      {slug === "horse-racing" && (
        <select
          value={course}
          onChange={(e) =>
            updateParam("course", e.target.value)
          }
          className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={slugifyVenue(c)}>
              {c?.replace(" Racecourse", "")}
            </option>
          ))}
        </select>
      )}
      {slug === "football" && competitions.length > 0 && (
        <select
          value={params.get("competition") ?? ""}
          onChange={(e) => updateParam("competition", e.target.value)}
          className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
        >
          <option value="">All Competitions</option>
          {competitions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

    </section>
  );
}