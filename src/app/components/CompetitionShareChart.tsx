//src/app/components/CompetitionShareChart.tsx

"use client";

import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS = [
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  "#99f6e4",
  "#ccfbf1",
];

export default function CompetitionShareChart({ data }: any) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="sport"
            outerRadius={100}
          >
            {data.map((_: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name: any, props: any) => {
              return [
                `${value} (${props.payload.percentage}%)`,
                props.payload.sport,
              ];
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}