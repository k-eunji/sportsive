//src/lib/distance.ts

export type DistanceUnit = "km" | "mi";

export function detectDefaultUnit(): DistanceUnit {
  if (typeof navigator === "undefined") return "km";

  const lang = navigator.language.toLowerCase();

  // 영국 + 미국은 miles가 자연스러움
  if (lang.startsWith("en-gb") || lang.startsWith("en-us")) {
    return "mi";
  }

  return "km";
}

export function kmToMiles(km: number) {
  return km * 0.621371;
}

export function formatDistance(
  km: number,
  unit: DistanceUnit
): string {
  if (unit === "mi") {
    const mi = kmToMiles(km);
    return mi < 10 ? `${mi.toFixed(1)} mi` : `${mi.toFixed(0)} mi`;
  }

  return km < 10 ? `${km.toFixed(1)} km` : `${km.toFixed(0)} km`;
}
