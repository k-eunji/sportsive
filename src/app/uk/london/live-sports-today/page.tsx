///src/app/uk/london/live-sports-today/page.tsx

import type { Metadata } from "next";
import CitySportsPage from "@/components/seo/CitySportsPage";

export const metadata: Metadata = {
  title: "Live Sports in London Today | VenueScope",
  description:
    "Professional sports fixtures taking place in London today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/london/live-sports-today",
  },
};

export default function Page() {
  return (
    <CitySportsPage city="London" countryLabel="UK" />
  );
}
