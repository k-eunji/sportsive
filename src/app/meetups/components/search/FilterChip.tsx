// src/app/meetups/components/search/FilterChip.tsx

"use client";

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        text-sm px-1 py-0.5 transition
        ${active 
          ? "text-blue-600 font-semibold underline underline-offset-4" 
          : "text-gray-600 dark:text-gray-300"
        }
      `}
    >
      {children}
    </button>
  );
}
