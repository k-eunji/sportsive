// src/app/uk/manchester/live-sports-today/page.tsx

import type { Metadata } from "next";
import CitySportsPage from "@/components/seo/CitySportsPage";

export const metadata: Metadata = {
  title: "Live Sports in Manchester Today | VenueScope",
  description:
    "Professional sports fixtures taking place in Manchester today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/manchester/live-sports-today",
  },
};

export default function Page() {
  return (
    <CitySportsPage city="Manchester" countryLabel="UK" />
  );
}
