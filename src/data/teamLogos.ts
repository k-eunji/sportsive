//src/data/teamLogos.ts

// 팀 ID 기반 매핑 (절대 안 깨짐)
export const teamLogoMapById: Record<number, string> = {
  57: "/logos/arsenal.svg",
  58: "/logos/astonvilla.svg",
  61: "/logos/chelsea.svg",
  62: "/logos/everton.svg",
  63: "/logos/fulham.svg",
  64: "/logos/liverpool.svg",
  65: "/logos/mancity.svg",
  66: "/logos/manutd.svg",
  67: "/logos/newcastle.svg",
  71: "/logos/sunderland.svg",
  73: "/logos/tottenham.svg",
  76: "/logos/wolves.svg",
  328: "/logos/burnley.svg",
  341: "/logos/leeds.svg",
  351: "/logos/nottingham.svg",
  354: "/logos/crystalpalace.svg",
  397: "/logos/brighton.svg",
  402: "/logos/brentford.svg",
  563: "/logos/westham.svg",
  1044: "/logos/bournemouth.png",
};

// 팀 이름 기반 매핑 (fallback용)
export const teamLogoMapByName: Record<string, string> = {
  "Arsenal FC": "/logos/arsenal.svg",
  "Aston Villa FC": "/logos/astonvilla.svg",
  "Chelsea FC": "/logos/chelsea.svg",
  "Everton FC": "/logos/everton.svg",
  "Fulham FC": "/logos/fulham.svg",
  "Liverpool FC": "/logos/liverpool.svg",
  "Manchester City FC": "/logos/mancity.svg",
  "Manchester United FC": "/logos/manutd.svg",
  "Newcastle United FC": "/logos/newcastle.svg",
  "Sunderland AFC": "/logos/sunderland.svg",
  "Tottenham Hotspur FC": "/logos/tottenham.svg",
  "Wolverhampton Wanderers FC": "/logos/wolves.svg",
  "Burnley FC": "/logos/burnley.svg",
  "Leeds United FC": "/logos/leeds.svg",
  "Nottingham Forest FC": "/logos/nottingham.svg",
  "Crystal Palace FC": "/logos/crystalpalace.svg",
  "Brighton & Hove Albion FC": "/logos/brighton.svg",
  "Brentford FC": "/logos/brentford.svg",
  "West Ham United FC": "/logos/westham.svg",
  "AFC Bournemouth": "/logos/bournemouth.png",
};
