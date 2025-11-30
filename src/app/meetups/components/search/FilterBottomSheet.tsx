// src/app/meetups/components/search/FilterBottomSheet.tsx

"use client";

import React from "react";
import { FilterChips } from "./SearchFilters";

interface FilterBottomSheetProps {
  open: boolean;
  onClose: () => void;
  filterType: string;
  setFilterType: (v: string) => void;
  filterAge: string;
  setFilterAge: (v: string) => void;
  filterDate: string;
  setFilterDate: (v: string) => void;
}

export function FilterBottomSheet({
  open,
  onClose,
  filterType,
  setFilterType,
  filterAge,
  setFilterAge,
  filterDate,
  setFilterDate,
}: FilterBottomSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm">
      <div className="
        absolute bottom-0 inset-x-0
        rounded-t-3xl bg-white dark:bg-gray-900
        shadow-xl p-6 animate-slide-up
      ">

        <div className="w-10 h-1 bg-gray-400/50 rounded-full mx-auto mb-4" />

        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 text-xl"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold mb-5">Filters</h3>

        <FilterChips
          filterType={filterType}
          setFilterType={setFilterType}
          filterAge={filterAge}
          setFilterAge={setFilterAge}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
        />
      </div>
    </div>
  );
}
