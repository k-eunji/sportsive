//src//lib/risk/config.ts

export const RISK_RADIUS_OPTIONS = [
  { value: 80, km: 3 },
  { value: 120, km: 5 },
  { value: 200, km: 10 }
];

export const RISK_MODEL = {
  SPATIAL_WEIGHT: 4,
  TIME_WEIGHT: 6,
  TIME_WINDOW_HOURS: 2,
  BASE_PERCENTILE_WEIGHT: 0.7,
  DECISION_WINDOW_DAYS: 45 // 👈 여기
};


export const RISK_BANDS = [
  { min: 80, label: "Critical" },
  { min: 65, label: "High" },
  { min: 50, label: "Elevated" },
  { min: 35, label: "Moderate" },
  { min: 0, label: "Low" }
];

export const STAFF_MULTIPLIER = [
  { min: 80, value: 1.18 },
  { min: 65, value: 1.12 },
  { min: 50, value: 1.08 },
  { min: 35, value: 1.05 },
  { min: 0, value: 1 }
];

export function getImpactRange(score: number) {
  if (score >= 80) return [-10, -6];
  if (score >= 65) return [-8, -4];
  if (score >= 50) return [-5, -2];
  if (score >= 35) return [-3, -1];
  return [0, 0];
}

export function getRecommendedActions(score: number) {
  if (score >= 80)
    return [
      "Deploy maximum steward buffer",
      "Coordinate transport authority",
      "Adjust entry window"
    ];
  if (score >= 65)
    return [
      "Increase steward allocation 10–15%",
      "Monitor peak inflow"
    ];
  if (score >= 50)
    return ["Prepare flexible staffing buffer"];
  return ["Standard operational readiness"];
}

export function getRiskDrivers(risk: {
  percentile: number;
  spatialOverlap: number;
  timeOverlap: number;
}) {
  const drivers: string[] = [];

  if (risk.percentile >= 70)
    drivers.push("Top 30% busiest historical window");

  if (risk.spatialOverlap > 0)
    drivers.push(`${risk.spatialOverlap} overlapping venues within radius`);

  if (risk.timeOverlap > 0)
    drivers.push(`${risk.timeOverlap} simultaneous event clusters`);

  return drivers;
}

export function getRiskBand(score: number) {
  return RISK_BANDS.find(b => score >= b.min)?.label ?? "Low";
}

export function getStaffMultiplier(score: number) {
  return STAFF_MULTIPLIER.find(s => score >= s.min)?.value ?? 1;
}
