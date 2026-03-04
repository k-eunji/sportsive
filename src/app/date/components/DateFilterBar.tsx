//src/app/date/components/DateFilterBar.tsx

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

function formatLabel(s: string) {
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DateFilterBar({
  date,
  events,
}: {
  date: string;
  events: any[];
}) {
  const router = useRouter();

  const rawParams = useSearchParams();

  const params = new URLSearchParams(
    rawParams?.toString() ?? ""
  );

  const normalize = (v?: string) =>
    v?.toLowerCase().trim() ?? "";

  const country = params.get("country") ?? "all";
  const region = params.get("region") ?? "";
  const city = params.get("city") ?? "";
  const sport = params.get("sport") ?? "all";

  const UK_SET = new Set([
    "england",
    "scotland",
    "wales",
    "northern ireland",
  ]);

  const filteredByCountry = useMemo(() => {
    return events.filter((e) => {
      const regionLower = normalize(e.region);
      if (country === "uk") return UK_SET.has(regionLower);
      if (country === "ireland")
        return regionLower === "ireland";
      return true;
    });
  }, [events, country]);

  const regions = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .map((e) => e.region)
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .filter((e) =>
            region
              ? normalize(e.region) ===
                normalize(region)
              : true
          )
          .map((e) => e.city)
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry, region]);

  const sports = useMemo(() => {
    return Array.from(
      new Set(
        filteredByCountry
          .map((e) => normalize(e.sport))
          .filter(Boolean)
      )
    ).sort();
  }, [filteredByCountry]);

  const searchString = rawParams?.toString() ?? "";

  function updateParam(key: string, value: string) {

    const params = new URLSearchParams(
      rawParams?.toString() ?? ""
    );

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/date/${date}?${params.toString()}`, {
      scroll: false,
    });

  }
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

            // Ireland 선택 시 region 자동 설정
            if (value === "ireland") {
              params.set("region", "Ireland");
            }

            // UK 선택 시 region 초기화
            if (value === "uk") {
              params.delete("region");
            }
          }

          router.push(`/date/${date}?${params.toString()}`, {
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

      {/* Sport */}
      <select
        value={sport}
        onChange={(e) =>
          updateParam("sport", e.target.value)
        }
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      >
        <option value="all">All Sports</option>

        {sports.map((s) => (
          <option key={s} value={s}>
            {formatLabel(s)}
          </option>
        ))}

      </select>
      {/* Date picker */}
      <input
        type="date"
        value={date}
        onChange={(e) => {
          const params = rawParams?.toString() ?? "";
          router.push(`/date/${e.target.value}${params ? `?${params}` : ""}`);
        }}
        className="bg-white border border-zinc-200 rounded-md px-3 py-1.5 text-sm text-zinc-700 hover:border-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-300 transition"
      />

      <button
        onClick={() => {
          const params = rawParams?.toString()
            ? `?${rawParams.toString()}`
            : "";
          const today = new Date().toISOString().slice(0, 10);
          router.push(`/date/${today}${params}`);
        }}
        className="border px-3 py-2 rounded bg-black text-white"
      >
        Today
      </button>

      {/* Download */}
        <a
          href={`/api/export/events?date=${date}${
            sport !== "all" ? `&sport=${sport}` : ""
          }${
            country !== "all" ? `&country=${country}` : ""
          }&source=date-page`}
          className="border px-4 py-2 rounded bg-black text-white"
        >
        Download CSV
        </a>

        <a
          href={`/api/export/events?date=${date}${
            sport !== "all" ? `&sport=${sport}` : ""
          }${
            country !== "all" ? `&country=${country}` : ""
          }&format=ics&source=date-page`}
          className="border px-4 py-2 rounded"
        >
        Add to Calendar
        </a>

    </section>
  );
}