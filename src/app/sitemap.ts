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

    // =========================
    // 🇬🇧 UK Horse Racing
    // =========================
    "/uk/horse-racing",
    "/uk/horse-racing/calendar-2026",
    "/uk/horse-racing/busiest-days-2026",
    "/uk/horse-racing/meeting-frequency-2026",
    "/uk/horse-racing/next-60-days-density",
    "/uk/horse-racing/overlap-report-2026",
    "/uk/horse-racing/courses",

    // =========================
    // 🇮🇪 Ireland Horse Racing
    // =========================
    "/ireland/horse-racing",
    "/ireland/horse-racing/calendar-2026",
    "/ireland/horse-racing/courses",
  ];

  staticRoutes.forEach((path) => {
    urls.push({
      url: `${baseUrl}${path}`,
      lastModified: now,
    });
  });

  // =========================
  // 2️⃣ Monthly Hubs (기존)
  // =========================

  const pastMonths = 6;
  const futureMonths = 3;
  const baseMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = -pastMonths; i <= futureMonths; i++) {
    const d = new Date(baseMonth);
    d.setMonth(baseMonth.getMonth() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    urls.push(
      {
        url: `${baseUrl}/uk/sports/month/${year}/${month}`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/uk/football/month/${year}/${month}`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/uk/london/sports/month/${year}/${month}`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/uk/london/football/month/${year}/${month}`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/uk/basketball/month/${year}/${month}`,
        lastModified: now,
      },
      {
        url: `${baseUrl}/uk/london/basketball/month/${year}/${month}`,
        lastModified: now,
      }
    );
  }

  // =========================
  // 3️⃣ 날짜 기반 (과거 30일 / 미래 30일)
  // =========================

  const pastDays = 30;
  const futureDays = 30;

  for (let i = -pastDays; i <= futureDays; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    const dateStr = formatDate(date);

    urls.push(
      { url: `${baseUrl}/uk/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/sports/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/football/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/premier-league/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/championship/fixture-congestion/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/basketball/${dateStr}`, lastModified: now },
      { url: `${baseUrl}/uk/london/basketball/${dateStr}`, lastModified: now }
    );
  }

  // =========================
  // 4️⃣ Horse Racing 2026 Month Pages
  // =========================

  const months2026 = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );

  months2026.forEach((month) => {
    // 🇬🇧 UK
    urls.push({
      url: `${baseUrl}/uk/horse-racing/month/2026/${month}`,
      lastModified: now,
    });

    // 🇮🇪 Ireland
    urls.push({
      url: `${baseUrl}/ireland/horse-racing/month/2026/${month}`,
      lastModified: now,
    });
  });

  // =========================
  // 5️⃣ Horse Racing Course Slug Pages
  // ⚠️ 실제 코스 slug 리스트로 교체 필요
  // =========================

  const ukCourses = [
  "aintree",
  "ascot",
  "ayr",
  "bangor-on-dee",
  "bath",
  "beverley",
  "brighton",
  "carlisle",
  "cartmel",
  "catterick",
  "chelmsford-city",
  "cheltenham",
  "chepstow",
  "chester",
  "doncaster",
  "down-royal",
  "downpatrick",
  "epsom-downs",
  "exeter",
  "fakenham",
  "ffos-las",
  "fontwell-park-racing-and-events",
  "goodwood",
  "hamilton-park",
  "haydock-park",
  "hereford",
  "hexham",
  "huntingdon",
  "kelso",
  "kempton-park",
  "leicester",
  "lingfield-park",
  "ludlow",
  "market-rasen",
  "musselburgh",
  "newbury",
  "newcastle",
  "newmarket-july-course",
  "newton-abbot-races-ltd",
  "nottingham",
  "perth",
  "plumpton",
  "pontefract",
  "redcar",
  "ripon",
  "salisbury",
  "sandown-park",
  "sedgefield",
  "southwell",
  "stratford-on-avon",
  "taunton-racecourse-conference-centre",
  "thirsk",
  "uttoxeter",
  "warwick",
  "wetherby",
  "wincanton",
  "windsor",
  "wolverhampton",
  "worcester",
  "great-yarmouth",
  "york"
  ];
  const irelandCourses = [
  "ballinrobe",
  "bellewstown",
  "clonmel",
  "cork-racecourse-mallow",
  "the-curragh",
  "dundalk-stadium",
  "fairyhouse",
  "galway-races",
  "pirc-ghabhrin",
  "kilbeggan",
  "killarney-races",
  "laytown",
  "leopardstown",
  "rschrsa-luimnigh",
  "listowel-races",
  "naas",
  "navan",
  "punchestown",
  "roscommon",
  "sligo",
  "thurles",
  "tramore",
  "wexford"
  ];
  ukCourses.forEach((slug) => {
    urls.push({
      url: `${baseUrl}/uk/horse-racing/courses/${slug}`,
      lastModified: now,
    });
  });

  irelandCourses.forEach((slug) => {
    urls.push({
      url: `${baseUrl}/ireland/horse-racing/courses/${slug}`,
      lastModified: now,
    });
  });

  return urls;
}