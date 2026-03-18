// src/app/sitemap.ts

import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://venuescope.io";
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  // 날짜 포맷 헬퍼 (YYYY-MM-DD)
  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  // 데이터 업데이트 기준일 (오늘 새벽 00:00)
  const lastDataUpdate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // =========================
  // 1️⃣ 정적 페이지 (고정 정보)
  // =========================
  const staticRoutes = [
    "/",
    "/uk/horse-racing",
    "/uk/horse-racing/calendar-2026",
    "/uk/horse-racing/busiest-days-2026",
    "/uk/horse-racing/meeting-frequency-2026",
    "/uk/horse-racing/next-60-days-density",
    "/uk/horse-racing/overlap-report-2026",
    "/uk/horse-racing/courses",
    "/ireland/horse-racing",
    "/ireland/horse-racing/calendar-2026",
    "/ireland/horse-racing/courses",
  ];

  staticRoutes.forEach((path) => {
    urls.push({
      url: `${baseUrl}${path}`,
      lastModified: lastDataUpdate,
      changeFrequency: "weekly",
      priority: 1.0,
    });
  });

  // =========================
  // 2️⃣ Monthly Hubs (월간 일정)
  // =========================
  const pastMonths = 6;
  const futureMonths = 3;
  const baseMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  for (let i = -pastMonths; i <= futureMonths; i++) {
    const d = new Date(baseMonth);
    d.setMonth(baseMonth.getMonth() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");

    const isPastMonth = d < baseMonth;
    const modifiedDate = isPastMonth ? new Date(year, d.getMonth() + 1, 0) : now;

    const monthlyPaths = [
      `/uk/sports/month/${year}/${month}`,
      `/uk/football/month/${year}/${month}`,
      `/uk/london/sports/month/${year}/${month}`,
      `/uk/london/football/month/${year}/${month}`,
      `/uk/basketball/month/${year}/${month}`,
      `/uk/london/basketball/month/${year}/${month}`,
      `/ireland/sports/month/${year}/${month}`,
      `/ireland/football/month/${year}/${month}`,
      `/uk/tennis/month/${year}/${month}`,
      `/uk/fight/month/${year}/${month}`,
      `/uk/championship/month/${year}/${month}`,
      `/uk/league-one/month/${year}/${month}`,
      `/uk/football/league-two/month/${year}/${month}`,
    ];

    monthlyPaths.forEach((path) => {
      urls.push({
        url: `${baseUrl}${path}`,
        lastModified: modifiedDate,
        changeFrequency: isPastMonth ? "monthly" : "daily",
        priority: isPastMonth ? 0.5 : 0.7,
      });
    });
  }

  // =========================
  // 3️⃣ 날짜 기반 (일간 일정)
  // =========================
  for (let i = -30; i <= 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() + i);
    const dateStr = formatDate(date);

    const isFutureOrToday = i >= 0;
    const modifiedDate = isFutureOrToday ? now : date;

    const dailyPaths = [
      `/uk/sports/${dateStr}`,
      `/uk/football/${dateStr}`,
      `/uk/london/sports/${dateStr}`,
      `/uk/london/football/${dateStr}`,
      `/uk/premier-league/fixture-congestion/${dateStr}`,
      `/uk/championship/fixture-congestion/${dateStr}`,
      `/uk/tennis/${dateStr}`,
      `/uk/fight/${dateStr}`,
      `/uk/basketball/${dateStr}`,
      `/uk/london/basketball/${dateStr}`,
      `/ireland/sports/${dateStr}`,
      `/ireland/football/${dateStr}`,
    ];

    dailyPaths.forEach((path) => {
      urls.push({
        url: `${baseUrl}${path}`,
        lastModified: modifiedDate,
        changeFrequency: isFutureOrToday ? "daily" : "monthly",
        priority: isFutureOrToday ? 0.8 : 0.4,
      });
    });
  }

  // =========================
  // 4️⃣ Horse Racing 2026 Month & Courses
  // =========================
  const months2026 = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  months2026.forEach((month) => {
    const d = new Date(2026, Number(month) - 1, 1);
    const isPast = d < baseMonth;

    urls.push(
      { url: `${baseUrl}/uk/horse-racing/month/2026/${month}`, lastModified: isPast ? d : now, changeFrequency: isPast ? "monthly" : "daily" },
      { url: `${baseUrl}/ireland/horse-racing/month/2026/${month}`, lastModified: isPast ? d : now, changeFrequency: isPast ? "monthly" : "daily" }
    );
  });

  const ukCourses = [
    "aintree", "ascot", "ayr", "bangor-on-dee", "bath", "beverley", "brighton", "carlisle",
    "cartmel", "catterick", "chelmsford-city", "cheltenham", "chepstow", "chester",
    "doncaster", "down-royal", "downpatrick", "epsom-downs", "exeter", "fakenham",
    "ffos-las", "fontwell-park-racing-and-events", "goodwood", "hamilton-park",
    "haydock-park", "hereford", "hexham", "huntingdon", "kelso", "kempton-park",
    "leicester", "lingfield-park", "ludlow", "market-rasen", "musselburgh", "newbury",
    "newcastle", "newmarket-july-course", "newton-abbot-races-ltd", "nottingham",
    "perth", "plumpton", "pontefract", "redcar", "ripon", "salisbury", "sandown-park",
    "sedgefield", "southwell", "stratford-on-avon", "taunton-racecourse-conference-centre",
    "thirsk", "uttoxeter", "warwick", "wetherby", "wincanton", "windsor", "wolverhampton",
    "worcester", "great-yarmouth", "york"
  ];

  const irelandCourses = [
    "ballinrobe", "bellewstown", "clonmel", "cork-racecourse-mallow", "the-curragh",
    "dundalk-stadium", "fairyhouse", "galway-races", "pirc-ghabhrin", "kilbeggan",
    "killarney-races", "laytown", "leopardstown", "rschrsa-luimnigh", "listowel-races",
    "naas", "navan", "punchestown", "roscommon", "sligo", "thurles", "tramore", "wexford"
  ];

  ukCourses.forEach((slug) => {
    urls.push({
      url: `${baseUrl}/uk/horse-racing/courses/${slug}`,
      lastModified: lastDataUpdate,
      changeFrequency: "weekly",
    });
  });

  irelandCourses.forEach((slug) => {
    urls.push({
      url: `${baseUrl}/ireland/horse-racing/courses/${slug}`,
      lastModified: lastDataUpdate,
      changeFrequency: "weekly",
    });
  });

  return urls;
}