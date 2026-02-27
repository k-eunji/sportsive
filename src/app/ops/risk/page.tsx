// src/app/ops/risk/page.tsx

import { getAllEventsRaw } from "@/lib/events/getAllEventsRaw";
import RiskClient from "./RiskClient";

export default async function RiskPage() {

  const events = await getAllEventsRaw("180d");

  const targetDate = new Date().toISOString().slice(0, 10);

  return (
    <RiskClient
      events={events}
      targetDate={targetDate}
    />
  );
}
