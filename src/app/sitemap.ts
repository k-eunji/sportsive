//src/app/sitemap.ts

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sportsive.vercel.app";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/london/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/ireland/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/ireland/dublin/live-sports-today`,
      lastModified: new Date(),
    },

    // 종목 페이지 (아래 2️⃣에서 만들 것)
    {
      url: `${baseUrl}/uk/london/football-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/london/rugby-today`,
      lastModified: new Date(),
    },
  ];
}
