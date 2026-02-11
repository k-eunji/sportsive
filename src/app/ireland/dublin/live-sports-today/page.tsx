//src/app/ireland/dublin/live-sports-today/page.tsx

import type { Metadata } from "next";
import CitySportsPage from "@/components/seo/CitySportsPage";

export const metadata: Metadata = {
  title: "Live Sports in Dublin Today | VenueScope",
  description:
    "Professional sports fixtures taking place in Dublin today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/ireland/dublin/live-sports-today",
  },
};

export default function Page() {
  return (
    <CitySportsPage city="Dublin" countryLabel="Ireland" />
  );
}
