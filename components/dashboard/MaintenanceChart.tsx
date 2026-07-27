"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { type: "Plumbing", count: 8, color: "#3B82F6" },
  { type: "Electrical", count: 5, color: "#D4A85C" },
  { type: "Heating", count: 4, color: "#EF4444" },
  { type: "Carpentry", count: 3, color: "#8B5CF6" },
  { type: "Roofer", count: 2, color: "#14B8A6" },
  { type: "Glazing", count: 1, color: "#94A3B8" },
];

export default function MaintenanceChart() {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} layout="vertical">
          <XAxis type="number" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "#687068" }} axisLine={false} tickLine={false} width={70} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#3A3F3A",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
            }}
            cursor={{ fill: "#F1F5F9" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16} fill="#C28A78" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}