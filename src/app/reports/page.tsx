// src/app/reports/page.tsx

import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import ReportsDashboard from "./ReportsDashboard";

export default async function ReportsPage() {
  const events = await getAllEventsRaw("180d");

  return <ReportsDashboard events={events} />;
}
