"use client";
import React, { useEffect, useRef, useState } from "react";

export interface MultiSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
}

export interface MultiSelectDropdownProps<T extends string | number = string | number> {
  options: MultiSelectOption<T>[];
  value: T[];
  onChange: (value: T[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelectDropdown<T extends string | number = string | number>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: MultiSelectDropdownProps<T>) {
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

  const isSelected = (val: T): boolean => {
    return value.includes(val);
  };

  const toggleValue = (val: T): void => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const displayValue = (): string => {
    if (value.length === 0) return placeholder;
    return options
      .filter((o) => value.includes(o.value))
      .map((o) => o.label)
      .join(", ");
  };

  const hasValue = value.length > 0;

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="min-h-10 w-full rounded-md border border-gray-300 bg-white p-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
                onClick={() => toggleValue(opt.value)}
                className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  checked={isSelected(opt.value)}
                  readOnly
                  className="cursor-pointer"
                />
                <span>{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}