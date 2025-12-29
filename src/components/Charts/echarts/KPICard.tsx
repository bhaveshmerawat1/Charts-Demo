import { JSX } from "react";
import clsx from "clsx";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  theme?: "light" | "dark";
  variant?: "primary" | "default";
  icon?: "doctor" | "nurse" | "staff" | "patients";
}

// Icon components
const DoctorIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M9 9h6M9 12h6M9 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const NurseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M5 21c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const StaffIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M5 21c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const PatientsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <circle cx="15.5" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path d="M3 20c0-2.5 2.239-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M13 20c0-2.5 2.239-4 5.5-4s5.5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

export function KPICard({
  label,
  value,
  change,
  trend,
  theme = "light",
  variant = "default",
  icon = "staff"
}: KPICardProps): JSX.Element {
  const isPrimary = variant === "primary";
  const isDark = theme === "dark";

  // Determine colors based on variant
  const bgColor = isPrimary
    ? "bg-blue-400"
    : isDark
      ? "bg-gray-800"
      : "bg-white";

  const textColor = isPrimary
    ? "text-white"
    : isDark
      ? "text-gray-100"
      : "text-gray-900";

  const labelColor = isPrimary
    ? "text-white"
    : isDark
      ? "text-gray-400"
      : "text-gray-600";

  const changeColor = trend === "up"
    ? (isPrimary ? "text-blue-300" : "text-green-600")
    : "text-red-600";

  const iconBgColor = isPrimary
    ? "bg-white"
    : isDark
      ? "bg-gray-700"
      : "bg-gray-100";

  const iconColor = isPrimary
    ? "text-blue-600"
    : isDark
      ? "text-gray-300"
      : "text-gray-900";

  // Select icon component
  const IconComponent = icon === "doctor"
    ? DoctorIcon
    : icon === "nurse"
      ? NurseIcon
      : icon === "patients"
        ? PatientsIcon
        : StaffIcon;

  return (
    <div className={clsx(
      `rounded-xl p-6 relative border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 duration-200 min-h-[160px]`,
      bgColor
    )}>
      {/* Icon in top right */}
      <div className={clsx(
        "absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center",
        iconBgColor
      )}>
        <IconComponent className={clsx("w-7 h-7", iconColor)} />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col h-full">
        {/* Large value */}
        <p className={clsx("text-3xl font-light mb-2", textColor)}>{value}</p>

        {/* Change indicator */}
        <div className={clsx("text-sm font-semibold mb-auto", changeColor)}>
          <span>{trend === "up" ? "↑" : "↓"}</span>
          <span className="ml-1">{change} In this month</span>
        </div>

        {/* Label at bottom */}
        <p className={clsx("text-sm font-semibold mt-auto", labelColor)}>{label}</p>
      </div>
    </div>
  );
}