//src/app/teams/components/Tabs/TeamTabNav.tsx

import { TabKey } from "./types";

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

export default function TeamTabNav({ active, onChange }: Props) {
  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "quickPost", label: "Quick Post" },
    { key: "insights", label: "Insights" },
    { key: "fans", label: "Fans" },
  ];

  return (
    <nav className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 font-medium ${
            active === tab.key
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
