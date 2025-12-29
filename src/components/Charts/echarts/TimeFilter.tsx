"use client";

import React from "react";

export type TimeFilterValue = "all" | "last3" | "last6" | "last12";

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue) => void;
  theme: "light" | "dark";
}

export function TimeFilter({ value, onChange, theme }: TimeFilterProps) {
  return (
    <div className="mb-4 flex items-center justify-end">
      <label
        htmlFor="time-filter"
        className={`mr-3 text-sm font-medium ${
          theme === "dark" ? "text-gray-300" : "text-gray-700"
        }`}
      >
        Time Duration:
      </label>
      <select
        id="time-filter"
        value={value}
        onChange={(e) => onChange(e.target.value as TimeFilterValue)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 outline-none cursor-pointer ${
          theme === "dark"
            ? "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600"
            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
        }`}
      >
        <option value="all">All Time</option>
        <option value="last3">Last 3 Months</option>
        <option value="last6">Last 6 Months</option>
        <option value="last12">Last Year</option>
      </select>
    </div>
  );
}

