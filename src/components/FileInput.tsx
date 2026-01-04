"use client";
import React, { ChangeEvent, useRef } from "react";

/**
 * SimpleFileInput (custom UI)
 *  - Hides native file input
 *  - Uses custom button + placeholder
 *  - Emits onChange(File | null)
 */

interface FileInputProps {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
}

export default function FileInput({
  value = null,
  onChange,
  accept,
  multiple = false,
  placeholder = "Choose a file…",
  className = "",
  name,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange(file);
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hidden real input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {/* Custom button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 transition"
      >
        Choose file
      </button>

      {/* Placeholder / filename */}
      <span className="text-sm text-gray-600 truncate">
        {value ? value.name : placeholder}
      </span>
    </div>
  );
}
