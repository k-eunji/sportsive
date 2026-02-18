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
  // 1️⃣ 정적 페이지 (그대로 유지)
  // =========================

  const staticRoutes = [
    "/",

    // 🇬🇧 UK Core
    "/uk/live-sports-today",
    "/uk/football-today",
    "/uk/sports-this-weekend",
    "/uk/sports-next-weekend",

    "/uk/london/live-sports-today",
    "/uk/london/sports-this-weekend",

    // 🇬🇧 Fixture Congestion 루트 유지
    "/uk/england/fixture-congestion",
    "/uk/london/fixture-congestion",
    "/uk/premier-league/fixture-congestion",
    "/uk/league-two/fixture-congestion",
    "/uk/league-one/fixture-congestion",
    "/uk/championship/fixture-congestion",
    "/uk/horse-racing/fixture-congestion",

    // 🇮🇪 Ireland
    "/ireland/horse-racing/fixture-congestion",
  ];

  staticRoutes.forEach((path) => {
    urls.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
    });
  });

  // =========================
  // 2️⃣ London 월 허브 유지
  // =========================

  const pastMonths = 6;
  const futureMonths = 3;
  const baseMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = -pastMonths; i <= futureMonths; i++) {
    const d = new Date(baseMonth);
    d.setMonth(baseMonth.getMonth() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    urls.push({
      url: `${baseUrl}/uk/london/football/month/${year}/${month}`,
      lastModified: now,
    });
  }

  // =========================
  // 3️⃣ 날짜 기반 (핵심 전략 유지)
  // 과거 30일 / 미래 30일
  // =========================

  const pastDays = 30;
  const futureDays = 30;

  for (let i = -pastDays; i <= futureDays; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    const dateStr = formatDate(date);

    urls.push(
      // 🇬🇧 UK 날짜
      { url: `${baseUrl}/uk/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/football/${dateStr}`, lastModified: now },

      // 🇬🇧 London 날짜
      { url: `${baseUrl}/uk/london/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/football/${dateStr}`, lastModified: now },

      // 🇬🇧 Fixture Congestion 날짜 (전략 유지)
      { url: `${baseUrl}/uk/england/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/premier-league/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/championship/fixture-congestion/${dateStr}`, lastModified: now },

      // 🇮🇪 Ireland Horse Racing 날짜
      { url: `${baseUrl}/ireland/horse-racing/fixture-congestion/${dateStr}`, lastModified: now }
    );
  }

  return urls;
}
