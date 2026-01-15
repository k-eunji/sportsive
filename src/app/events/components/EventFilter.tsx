// src/app/events/components/EventFilter.tsx

'use client';

import React, { useState } from 'react';
import type { Event } from '@/types';

type EventFilterBarProps = {
  selectedRegion: string;
  selectedCity: string;
  selectedSport: string;
  selectedCompetition: string;
  events: Event[];
  onRegionChange: (region: string) => void;
  onCityChange: (city: string) => void;
  onSportChange: (category: string) => void;
  onCompetitionChange: (competition: string) => void;
  children?: React.ReactNode; // 날짜
};

export default function EventFilterBar({
  selectedRegion,
  selectedCity,
  selectedSport,
  selectedCompetition,
  events,
  onRegionChange,
  onCityChange,
  onSportChange,
  onCompetitionChange,
  children,
}: EventFilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const sports = [...new Set(events.map((e) => e.sport).filter(Boolean))];
  const regions = [...new Set(events.map((e) => e.region).filter(Boolean))] as string[];
  const cities = selectedRegion
    ? ([...new Set(
        events
          .filter((e) => e.region === selectedRegion)
          .map((e) => e.city)
          .filter(Boolean)
      )] as string[])
    : [];
  const competitions = [...new Set(events.map((e) => e.competition).filter(Boolean))] as string[];

  return (
    <div className="mb-4">
      {/* 🔹 Primary (flat toolbar) */}
      <div
        className="
          flex flex-wrap items-center gap-3
          border-b border-gray-200 dark:border-gray-700
          pb-3
        "
      >
        {/* Sport */}
        <InlineSelect
          label="Sport"
          value={selectedSport}
          onChange={onSportChange}
          options={sports}
          placeholder="All sports"
        />

        {/* Date */}
        {children}

        {/* Advanced toggle (flat text) */}
        <span
          onClick={() => setShowAdvanced((v) => !v)}
          className="
            ml-auto text-sm cursor-pointer
            text-gray-500 hover:text-gray-900
            dark:text-gray-400 dark:hover:text-gray-100
            transition
          "
        >
          {showAdvanced ? 'Fewer filters' : 'More filters'}
        </span>
      </div>

      {/* 🔸 Advanced (flat expand) */}
      {showAdvanced && (
        <div
          className="
            mt-3 pt-3
            flex flex-wrap items-center gap-3
            border-t border-gray-200 dark:border-gray-700
          "
        >
          <InlineSelect
            label="Region"
            value={selectedRegion}
            onChange={(value) => {
              onRegionChange(value);
              onCityChange('');
            }}
            options={regions}
            placeholder="All regions"
          />

          <InlineSelect
            label="City"
            value={selectedCity}
            onChange={onCityChange}
            options={cities}
            placeholder="All cities"
            disabled={!selectedRegion}
          />

          {selectedSport !== 'tennis' && (
            <InlineSelect
              label="Competition"
              value={selectedCompetition}
              onChange={onCompetitionChange}
              options={competitions}
              placeholder="All competitions"
            />
          )}

        </div>
      )}
    </div>
  );
}

/* ---------- Flat inline select ---------- */

function InlineSelect({
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
    <label
      className="
        relative text-sm
        text-gray-700 dark:text-gray-300
        flex items-center gap-1
      "
    >
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          appearance-none bg-transparent
          border-none
          px-1 pr-5 py-1
          text-sm
          text-gray-900 dark:text-gray-100
          focus:outline-none
          disabled:opacity-50
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

      {/* caret */}
      <svg
        className="absolute right-0 top-1/2 -translate-y-1/2 size-3 pointer-events-none text-gray-400"
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
