//src/app/teams/components/TeamFilter.tsx

'use client';

import React from 'react';
import type { Team } from '../hooks/useTeams';

type TeamFilterBarProps = {
  teams: Team[];
  selectedRegion: string;
  selectedCity: string;
  selectedSport: string;
  selectedCompetition: string;
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  onSportChange: (sport: string) => void;
  onCompetitionChange: (competition: string) => void;
  children?: React.ReactNode;
};

export default function TeamFilterBar({
  teams,
  selectedRegion,
  selectedCity,
  selectedSport,
  selectedCompetition,
  onRegionChange,
  onCityChange,
  onSportChange,
  onCompetitionChange,
  children,
}: TeamFilterBarProps) {
  // ✅ 유니크 값 추출
  const regions = [...new Set(teams.map((t) => t.region).filter(Boolean))] as string[];
  const cities = selectedRegion
    ? ([...new Set(teams.filter((t) => t.region === selectedRegion).map((t) => t.city).filter(Boolean))] as string[])
    : [];
  const sports = selectedCity
    ? ([...new Set(teams.filter((t) => t.city === selectedCity).map((t) => t.sport).filter(Boolean))] as string[])
    : ([...new Set(teams.map((t) => t.sport).filter(Boolean))] as string[]);
  const competitions = selectedSport
    ? ([...new Set(teams.filter((t) => t.sport === selectedSport).map((t) => t.competition).filter(Boolean))] as string[])
    : ([...new Set(teams.map((t) => t.competition).filter(Boolean))] as string[]);

  return (
    <div
      className="
        flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6
        bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
        rounded-2xl p-4 shadow-sm
      "
    >
      {/* 🔹 Left side: 필터 목록 */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <SelectBox
          label="Region"
          value={selectedRegion}
          onChange={(v) => {
            onRegionChange(v);
            onCityChange('');
            onSportChange('');
            onCompetitionChange('');
          }}
          options={regions}
          placeholder="All Regions"
        />

        <SelectBox
          label="City"
          value={selectedCity}
          onChange={(v) => {
            onCityChange(v);
            onSportChange('');
            onCompetitionChange('');
          }}
          options={cities}
          placeholder="All Cities"
          disabled={!selectedRegion}
        />

        <SelectBox
          label="Sport"
          value={selectedSport}
          onChange={(v) => {
            onSportChange(v);
            onCompetitionChange('');
          }}
          options={sports}
          placeholder="All Sports"
        />

        <SelectBox
          label="Competition"
          value={selectedCompetition}
          onChange={onCompetitionChange}
          options={competitions}
          placeholder="All Competitions"
        />
      </div>

      {/* 🔸 Right side: 추가 컨트롤 (검색창 등) */}
      {children && (
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
}

/** 🎯 공용 SelectBox (EventFilterBar 스타일 기반) */
function SelectBox({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: (string | undefined | null)[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="relative text-sm text-gray-700 dark:text-gray-300">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          appearance-none block w-full rounded-lg border border-gray-300 dark:border-gray-600
          bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100
          px-3 py-1.5 pr-8 cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        <option value="">{placeholder}</option>
        {options
          .filter((opt): opt is string => typeof opt === 'string')
          .map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
      </select>

      {/* ▼ 드롭다운 아이콘 */}
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none size-3 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </label>
  );
}
