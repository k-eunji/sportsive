// src/app/sitemap.ts

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://venuescope.io";
  const now = new Date();

  const routes = [
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
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
  }));
}
