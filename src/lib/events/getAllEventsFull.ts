//src/lib/events/getAllEventsFull.ts

import { getAllEvents } from "./getAllEvents";

export async function getAllEventsFull() {
  const { events } = await getAllEvents("all");
  return events;
}