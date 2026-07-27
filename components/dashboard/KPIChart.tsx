"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", occupied: 82, vacant: 24 },
  { month: "Feb", occupied: 84, vacant: 22 },
  { month: "Mar", occupied: 86, vacant: 20 },
  { month: "Apr", occupied: 88, vacant: 18 },
  { month: "May", occupied: 90, vacant: 16 },
  { month: "Jun", occupied: 92, vacant: 14 },
  { month: "Jul", occupied: 94, vacant: 12 },
  { month: "Aug", occupied: 96, vacant: 18 },
  { month: "Sep", occupied: 98, vacant: 18 },
  { month: "Oct", occupied: 98, vacant: 18 },
  { month: "Nov", occupied: 98, vacant: 18 },
  { month: "Dec", occupied: 98, vacant: 18 },
];

export default function KPIChart() {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="occupiedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C28A78" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#C28A78" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="vacantGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#687068" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#687068" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#687068" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#687068" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#3A3F3A",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
            }}
            itemStyle={{ fontSize: "12px" }}
            labelStyle={{ fontSize: "11px", color: "#687068" }}
          />
          <Area type="monotone" dataKey="occupied" stroke="#C28A78" strokeWidth={2} fill="url(#occupiedGrad)" dot={false} />
          <Area type="monotone" dataKey="vacant" stroke="#687068" strokeWidth={2} fill="url(#vacantGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}