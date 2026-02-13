// src/app/sitemap.ts

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://venuescope.io";
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  // =========================
  // 1️⃣ 정적 페이지 (page.tsx)
  // =========================

  const staticRoutes = [
    "/",

    // 🇬🇧 UK – Today
    "/uk/live-sports-today",
    "/uk/football-today",
    "/uk/london/live-sports-today",
    "/uk/manchester/live-sports-today",
    "/uk/birmingham/live-sports-today",

    // 🇬🇧 UK – Weekend
    "/uk/sports-this-weekend",
    "/uk/london/sports-this-weekend",
    "/uk/sports-next-weekend",

    // 🇬🇧 UK – Fixture Congestion (Root)
    "/uk/birmingham/fixture-congestion",
    "/uk/england/fixture-congestion",
    "/uk/london/fixture-congestion",
    "/uk/manchester/fixture-congestion",
    "/uk/northern-ireland/fixture-congestion",
    "/uk/scotland/fixture-congestion",
    "/uk/wales/fixture-congestion",
    "/uk/premier-league/fixture-congestion",
    "/uk/league-two/fixture-congestion",
    "/uk/league-one/fixture-congestion",
    "/uk/championship/fixture-congestion",
    "/uk/horse-racing/fixture-congestion",

    // 🇬🇧 UK – Weekend Fixture Pages
    "/uk/fixture-congestion/this-weekend",
    "/uk/fixture-congestion/next-weekend",
    "/uk/london/fixture-congestion/this-weekend",
    "/uk/london/fixture-congestion/next-weekend",

    // 🇮🇪 Ireland – Today
    "/ireland/live-sports-today",
    "/ireland/dublin/live-sports-today",

    // 🇮🇪 Ireland – Weekend
    "/ireland/sports-this-weekend",

    // 🇮🇪 Ireland – Fixture Congestion
    "/ireland/fixture-congestion",
    "/ireland/horse-racing/fixture-congestion",
  ];

  staticRoutes.forEach((path) => {
    urls.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
    });
  });

  // =========================
  // 2️⃣ 날짜 기반 페이지 ([date])
  // =========================

  const pastDays = 90;
  const futureDays = 14;

  for (let i = -pastDays; i <= futureDays; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    const dateStr = formatDate(date);

    urls.push(
      // 🇬🇧 UK 기본 날짜
      { url: `${baseUrl}/uk/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/manchester/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/birmingham/sports/${dateStr}`, lastModified: now },

      // 🇬🇧 UK – Fixture Congestion 날짜
      { url: `${baseUrl}/uk/birmingham/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/england/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/manchester/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/northern-ireland/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/scotland/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/wales/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/premier-league/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/league-two/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/league-one/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/championship/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/horse-racing/fixture-congestion/${dateStr}`, lastModified: now },

      // 🇮🇪 Ireland 기본 날짜
      { url: `${baseUrl}/ireland/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/ireland/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/ireland/dublin/sports/${dateStr}`, lastModified: now },

      // 🇮🇪 Ireland – Fixture Congestion 날짜
      { url: `${baseUrl}/ireland/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/ireland/horse-racing/fixture-congestion/${dateStr}`, lastModified: now }
    );
  }

  return urls;
}
