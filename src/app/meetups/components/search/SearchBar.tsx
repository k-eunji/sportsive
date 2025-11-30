// src/app/meetups/components/search/SearchBar.tsx

"use client";

import React, { useState } from "react";
import { FilterBottomSheet } from "./FilterBottomSheet";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;

  filterType: string;
  setFilterType: (v: string) => void;

  filterAge: string;
  setFilterAge: (v: string) => void;

  filterDate: string;
  setFilterDate: (v: string) => void;
}

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterAge,
  setFilterAge,
  filterDate,
  setFilterDate,
}: SearchBarProps) {

  const [openFilters, setOpenFilters] = useState(false);

  return (
    <>
      <div className="sticky top-[102px] z-[45] bg-[var(--background)]/80 backdrop-blur-md px-4 pt-3 pb-2">

        {/* 검색 */}
        <div className="flex items-center gap-2 border-b border-gray-300 dark:border-gray-700 pb-2">
          <span className="text-gray-400 text-lg">🔍</span>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meetups..."
            className="
              flex-1 bg-transparent outline-none
              text-[15px] text-gray-900 dark:text-gray-100
              placeholder-gray-400
            "
          />

          <button
            onClick={() => setOpenFilters(true)}
            className="text-gray-500 text-lg"
          >
            ⚙️
          </button>
        </div>

        {/* 텍스트 필터 */}
        <div className="flex gap-4 mt-3 overflow-x-auto no-scrollbar text-sm">

          {[
            ["all", "All"],
            ["match_attendance", "Match"],
            ["pub_gathering", "Pub"],
            ["pickup_sports", "Pickup"],
            ["online_game", "Online"],
          ].map(([value, label]) => {
            const active = filterType === value;

            return (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`
                  pb-1 transition-all
                  ${active
                    ? "font-semibold text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 dark:text-gray-300"
                  }
                `}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <FilterBottomSheet
        open={openFilters}
        onClose={() => setOpenFilters(false)}
        filterType={filterType}
        setFilterType={setFilterType}
        filterAge={filterAge}
        setFilterAge={setFilterAge}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
      />
    </>
  );
}
