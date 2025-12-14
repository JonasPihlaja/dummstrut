"use client";

import React, { useState, useRef, useEffect } from "react";

/**
 * Dropdown
 *
 * Props:
 * - options: { label: string; value: string }[]
 * - value: string | string[]
 * - onChange: (value: string | string[]) => void
 * - multiple?: boolean
 * - placeholder?: string
 * - className?: string
 */

export default function Dropdown({
  options,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSelected = (val) =>
    multiple ? value.includes(val) : value === val;

  const toggleValue = (val) => {
    if (!multiple) {
      onChange(val);
      setOpen(false);
      return;
    }

    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const displayValue = () => {
    if (multiple) {
      if (!value.length) return placeholder;
      return options
        .filter((o) => value.includes(o.value))
        .map((o) => o.label)
        .join(", ");
    }

    return (
      options.find((o) => o.value === value)?.label || placeholder
    );
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-10 w-full rounded-md border border-gray-300 bg-white p-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <span className={value?.length ? "" : "text-gray-400"}>
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
                onClick={() => toggleValue(opt.value)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                {multiple && (
                  <input
                    type="checkbox"
                    checked={isSelected(opt.value)}
                    readOnly
                  />
                )}
                <span>{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
