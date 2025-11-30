// src/context/CommunityContext.tsx

"use client";
import { createContext, useContext, useState, useEffect } from "react";

type CommunityContextType = {
  region: string | null;
  setRegion: (r: string | null) => void;
  selectedTeam: string | null;
  setSelectedTeam: (id: string | null) => void;
  userId: string | null;
};

const defaultValue: CommunityContextType = {
  region: null,
  setRegion: () => {},
  selectedTeam: null,
  setSelectedTeam: () => {},
  userId: null,
};

const CommunityContext = createContext<CommunityContextType>(defaultValue);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegion] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&localityLanguage=en`
          );
          const data = await res.json();
          setRegion(
            data.city || data.locality || data.principalSubdivision || data.countryName
          );
        } catch (err) {
          console.error("Failed to get region:", err);
        }
      });
    }
  }, []);

  return (
    <CommunityContext.Provider
      value={{ region, setRegion, selectedTeam, setSelectedTeam, userId }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  return useContext(CommunityContext);
}
