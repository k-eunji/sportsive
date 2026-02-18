//src/app/components/SportDistributionChart.tsx

//src/app/components/SportDistributionChart.tsx

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#111827",
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0ea5e9"
];

export default function SportDistributionChart({ data }: any) {
  return (
    <div className="w-full h-48 sm:h-64 md:h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="sport"
            innerRadius={50}
            outerRadius={80}
          >
            {data.map((_: any, index: number) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
