// src/app/meetups/components/search/SearchFilters.tsx

"use client";

import React from "react";
import { FilterChip } from "./FilterChip";

interface FilterChipsProps {
  filterType: string;
  setFilterType: (v: string) => void;
  filterAge: string;
  setFilterAge: (v: string) => void;
  filterDate: string;
  setFilterDate: (v: string) => void;
  filterSport: string;
  setFilterSport: (v: string) => void;
}

export function FilterChips({
  filterType,
  setFilterType,
  filterAge,
  setFilterAge,
  filterDate,
  setFilterDate,
  filterSport,
  setFilterSport,
}: FilterChipsProps) {
  return (
    <div className="space-y-6">
      {/* 종류 */}
      <div>
        <p className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
          Meetup Type
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            ["all", "All"],
            ["match_attendance", "Match"],
            ["pub_gathering", "Pub"],
            ["pickup_sports", "Pickup"],
            ["online_game", "Online"],
          ].map(([v, label]) => (
            <FilterChip key={v} active={filterType === v} onClick={() => setFilterType(v)}>
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <p className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
          Age
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            ["all", "All ages"],
            ["under18", "Under 18"],
            ["18plus", "18+"],
          ].map(([v, label]) => (
            <FilterChip key={v} active={filterAge === v} onClick={() => setFilterAge(v)}>
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <p className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
          Date
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            ["all", "All"],
            ["this_week", "This Week"],
            ["next_week", "Next Week"],
            ["weekend", "Weekend"],
          ].map(([v, label]) => (
            <FilterChip key={v} active={filterDate === v} onClick={() => setFilterDate(v)}>
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* ⭐ Sports Filter 추가 */}
      <div>
        <p className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">
          Sports
        </p>
        <div className="flex flex-wrap gap-4">
          {[
            ["", "All"],
            ["football", "Football"],
            ["rugby", "Rugby"],
            ["cricket", "Cricket"],
            ["tennis", "Tennis"],
            ["golf", "Golf"],
            ["f1", "Formula 1"],
            ["horseracing", "Horse Racing"],
            ["boxing", "Boxing"],
            ["cycling", "Cycling"],
            ["running", "Running"],
            ["snooker", "Snooker"],
            ["darts", "Darts"],
            ["other", "Other"],
          ].map(([v, label]) => (
            <FilterChip key={v} active={filterSport === v} onClick={() => setFilterSport(v)}>
              {label}
            </FilterChip>
          ))}
        </div>
      </div>
    </div>
  );
}
