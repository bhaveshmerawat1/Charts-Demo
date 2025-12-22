import { JSX } from "react";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
}

export function KPICard({ label, value, change, trend}: KPICardProps): JSX.Element {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1 duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded ${trend === "up" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
          <span>{trend === "up" ? "↑" : "↓"}</span>
          <span>{change}</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-light text-gray-800">{value}</p>
    </div>
  );
}