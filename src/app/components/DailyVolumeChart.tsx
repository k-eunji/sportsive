//src/app/components/DailyVolumeChart.tsx
"use client";

import {
  BarChart,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyVolumeChart({ data }: any) {

  const max = Math.max(...data.map((d: any) => d.count));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip
            formatter={(value: any, name: any, props: any) => {
              return [`${value} (${props.payload.percentage}%)`, "Matches"];
            }}
          />

          <Bar dataKey="count">
            {data.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.count === max
                    ? "#4f46e5"  // indigo-600 (최고값)
                    : "#c7d2fe"  // indigo-200 (기본)
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
