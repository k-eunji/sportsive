//src/app/uk/sports-this-weekend/page.tsx

import type { Metadata } from "next";
import WeekendList from "@/app/components/list/WeekendList";
import { MOCK_EVENTS, getDefaultScope } from "@/lib/mockEvents";

export const metadata: Metadata = {
  title: "Sports in the UK This Weekend | Sportsive",
  description:
    "Scan live sports happening across the UK this weekend. Football, rugby, tennis, darts, horse racing — with official event links.",
};

export default function UKWeekendPage() {
  const defaultScope = getDefaultScope(new Date());

  return (
    <WeekendList
      title="Sports in the UK"
      subtitle="A quick weekend scan — then leave. Come back next weekend."
      events={MOCK_EVENTS}
      defaultScope={defaultScope}
    />
  );
}
