// src/app/teams/page.tsx

"use client";

import { useState } from "react";
import { useTeams } from "./hooks/useTeams";
import TeamList from "./components/TeamList";
import TeamFilterBar from "./components/TeamFilterBar";

export default function TeamsPage() {
  const { teams, isLoading, isError } = useTeams();

  const [selectedRegion, setRegion] = useState('');
  const [selectedCity, setCity] = useState('');
  const [selectedSport, setSport] = useState('');
  const [selectedCompetition, setCompetition] = useState('');

  if (isLoading) return <p>Loading teams...</p>;
  if (isError) return <p>Error loading teams.</p>;

  const filteredTeams = teams.filter((t) => {
    return (
      (!selectedRegion || t.region === selectedRegion) &&
      (!selectedCity || t.city === selectedCity) &&
      (!selectedSport || t.sport === selectedSport) &&
      (!selectedCompetition || t.competition === selectedCompetition)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 mt-8">
      <h1 className="text-3xl font-bold mb-4">Teams</h1>

      <TeamFilterBar
        teams={teams}
        selectedRegion={selectedRegion}
        selectedCity={selectedCity}
        selectedSport={selectedSport}
        selectedCompetition={selectedCompetition}
        onRegionChange={setRegion}
        onCityChange={setCity}
        onSportChange={setSport}
        onCompetitionChange={setCompetition}
      />

      <TeamList teams={filteredTeams} />
    </div>
  );
}
