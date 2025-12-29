"use client";

import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  className?: string;
}

export default function SelectDropdown({
  label,
  value,
  options,
  onChange,
  className,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`w-full relative ${className}`} ref={wrapperRef}>
      <label className="text-md text-gray-900 mb-1 block">{label}</label>

      {/* SELECT BOX */}
      <div
        className="relative border border-gray-200 rounded-md px-3 py-2 cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm">{value}</span>

        {/* CARET */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          <FiChevronDown
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
              }`}
          />
        </span>
      </div>

      {/* DROPDOWN LIST */}
      {open && (
        <ul className="mt-1 max-h-48 overflow-auto rounded-md border border-gray-200 bg-white shadow-md z-50 absolute w-full">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50
                ${value === option ? "bg-blue-100 font-medium" : ""}`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
