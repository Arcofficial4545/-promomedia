"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Flat, brand-colored charts. No gradients. */

const AXIS = { stroke: "#7c8f86", fontSize: 12 } as const;
const TOOLTIP_STYLE = {
  backgroundColor: "#0d4029",
  border: "none",
  borderRadius: 10,
  color: "#ffffff",
  fontSize: 13,
} as const;

export function ClicksLineChart({
  data,
}: {
  data: { day: string; clicks: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#e3efe6" vertical={false} />
          <XAxis
            dataKey="day"
            tick={AXIS}
            tickLine={false}
            axisLine={{ stroke: "#cadfd0" }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#cadfd0" }} />
          <Line
            type="monotone"
            dataKey="clicks"
            stroke="#1ec677"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: "#0d4029" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke="#e3efe6" horizontal={false} />
          <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={AXIS}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "#ecf9ee" }} />
          <Bar dataKey="value" fill="#0d4029" radius={[0, 6, 6, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
