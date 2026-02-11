// src/app/page.tsx

import LandingClient from "./LandingClient";
import { getAllEvents } from "@/lib/events/getAllEvents";

export default async function Page() {
  const data = await getAllEvents("180d");

  return (
    <LandingClient initialEvents={data.events ?? []} />
  );
}
