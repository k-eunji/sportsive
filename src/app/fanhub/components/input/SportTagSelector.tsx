//src/app/fanhub/components/input/SportTagSelector.tsx

"use client";

const SPORTS = [
  { key: "football", label: "#football" },
  { key: "rugby", label: "#rugby" },
  { key: "cricket", label: "#cricket" },
  { key: "tennis", label: "#tennis" },
  { key: "golf", label: "#golf" },
  { key: "f1", label: "#f1" },
  { key: "horseracing", label: "#horseracing" },
  { key: "boxing", label: "#boxing" },
  { key: "mma", label: "#mma" },
  { key: "cycling", label: "#cycling" },
  { key: "running", label: "#running" },
  { key: "snooker", label: "#snooker" },
  { key: "darts", label: "#darts" },
  { key: "basketball", label: "#basketball" },
  { key: "nfl", label: "#nfl" },
  { key: "icehockey", label: "#icehockey" },
  { key: "other", label: "#other" },
];

interface Props {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export default function SportTagSelector({ tags, setTags }: Props) {

  const toggleTag = (tag: string) => {
    setTags(
      tags.includes(tag)
        ? tags.filter((t) => t !== tag)
        : [...tags, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-3">
      {SPORTS.map((s) => (
        <button
          key={s.key}
          onClick={() => toggleTag(s.key)}
          className={`
            text-sm transition cursor-pointer
            ${
              tags.includes(s.key)
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-blue-500"
            }
          `}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
