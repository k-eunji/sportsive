//src/lib/normalizeSport.ts

export function normalizeSportKey(sport?: string): string {
  return (
    sport
      ?.toLowerCase()
      .replace(/[\s_-]/g, "") ?? ""
  );
}
