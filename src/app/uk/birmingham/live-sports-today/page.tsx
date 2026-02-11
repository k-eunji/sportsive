// src/app/uk/birmingham/live-sports-today/page.tsx

import type { Metadata } from "next";
import CitySportsPage from "@/components/seo/CitySportsPage";

export const metadata: Metadata = {
  title: "Live Sports in Birmingham Today | VenueScope",
  description:
    "Professional sports fixtures taking place in Birmingham today, organised by venue and scheduled start time.",
  alternates: {
    canonical: "https://venuescope.io/uk/birmingham/live-sports-today",
  },
};

export default function Page() {
  return (
    <CitySportsPage city="Birmingham" countryLabel="UK" />
  );
}
