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
  // 1️⃣ 정적 페이지
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

    // 🇮🇪 Ireland – Today
    "/ireland/live-sports-today",
    "/ireland/dublin/live-sports-today",

    // 🇮🇪 Ireland – Weekend
    "/ireland/sports-this-weekend",
  ];

  staticRoutes.forEach((path) => {
    urls.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
    });
  });

  // =========================
  // 2️⃣ 날짜 페이지 생성 범위
  // =========================

  const pastDays = 90;
  const futureDays = 14;

  for (let i = -pastDays; i <= futureDays; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);

    const dateStr = formatDate(date);

    // 🇬🇧 UK
    urls.push(
      { url: `${baseUrl}/uk/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/manchester/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/birmingham/sports/${dateStr}`, lastModified: now }
    );

    // 🇮🇪 Ireland
    urls.push(
      { url: `${baseUrl}/ireland/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/ireland/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/ireland/dublin/sports/${dateStr}`, lastModified: now }
    );
  }

  return urls;
}
