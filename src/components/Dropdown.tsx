"use client";
import React, { useEffect, useRef, useState } from "react";

export interface SingleSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

export interface SingleSelectDropdownProps<T extends string | number = string | number> {
  options: SingleSelectOption<T>[];
  value?: T;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
}

export default function SingleSelectDropdown<T extends string | number = string | number>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: SingleSelectDropdownProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        ref.current &&
        e.target instanceof Node &&
        !ref.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (val: T): void => {
    onChange(val);
    setOpen(false);
  };

  const displayValue = (): string => {
    return options.find((o) => o.value === value)?.label ?? placeholder;
  };

  const hasValue = value !== undefined && value !== null && value !== "";

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer min-h-10 w-full rounded-md border border-gray-300 bg-white p-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <span className={hasValue ? "" : "text-gray-400"}>
          {displayValue()}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
                  value === opt.value ? "bg-indigo-50 font-medium" : ""
                }`}
              >
                <span>{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}