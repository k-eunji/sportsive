// src/app/reports/page.tsx

import { getAllEventsFull } from "@/lib/events/getAllEventsFull";
import ReportsDashboard from "./ReportsDashboard";

type SearchParams = Promise<{
  region?: string;
  city?: string;
  sport?: string;
  year?: string;
  month?: string;
}>;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const events = await getAllEventsFull();

  return (
    <ReportsDashboard
      events={events}
      initialRegion={params?.region ?? null}
      initialCity={params?.city ?? null}
      initialSport={params?.sport ?? "all"}
      initialYear={params?.year}
      initialMonth={params?.month}
    />
  );
}