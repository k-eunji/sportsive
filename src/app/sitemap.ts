// src/app/sitemap.ts

import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sportsive.vercel.app";

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
    },

    // 🇬🇧 UK
    {
      url: `${baseUrl}/uk/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/london/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/manchester/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/birmingham/live-sports-today`,
      lastModified: new Date(),
    },

    // 🇮🇪 Ireland
    {
      url: `${baseUrl}/ireland/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/ireland/dublin/live-sports-today`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/sports-this-weekend`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uk/london/sports-this-weekend`,
      lastModified: new Date(),
    },

  ];
}
