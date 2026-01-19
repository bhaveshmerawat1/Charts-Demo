"use client";

import React from "react";

interface DashboardHeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onExportPDF?: () => void;
  isExporting?: boolean;
  title: string;
  subtitle?: string;
}

export function DashboardHeader({
  theme,
  onThemeToggle,
  onExportPDF,
  isExporting = false,
  title,
  subtitle,
}: DashboardHeaderProps) {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const textSecondaryColor = isDark ? "text-gray-400" : "text-gray-600";

  return (
    <div className="mb-8 relative">
      <div className="flex items-start justify-between">
        <div>
          <h1 className={`text-5xl font-light ${textColor}`}>{title}</h1>
          {subtitle && (
            <p className={textSecondaryColor}>{subtitle}</p>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {/* PDF Export Button */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={isExporting}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                isExporting
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              } ${
                isDark
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                  : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              }`}
              aria-label="Export to PDF"
            >
              {isExporting ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Exporting...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span className="text-sm font-medium">Export PDF</span>
                </>
              )}
            </button>
          )}
          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isDark
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
            }`}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span className="text-sm font-medium">Light</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                <span className="text-sm font-medium">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

