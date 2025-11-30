// src/data/footballEvents.ts

export async function getFootballEvents(): Promise<Event[]> {
  const res = await fetch("/api/events/england/london/football");
  const dataFootball = await res.json();

  return (dataFootball.matches ?? []).map((m: any) => {
    const homeName = m.homeTeam?.name ?? "";
    const awayName = m.awayTeam?.name ?? "";

    return {
      id: m.id,
      date: m.utcDate,
      competition: m.competition?.name ?? "Unknown",
      homeTeam: homeName,
      awayTeam: awayName,
      venue: m.venue ?? "Unknown Stadium",
      status: m.status,
      teams: [homeName, awayName],
      title: homeName && awayName ? `${homeName} vs ${awayName}` : "",
      location: m.location,
    };
  });
}
