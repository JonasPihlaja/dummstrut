"use client";

import React, { useState, useEffect } from "react";

/**
 * SimpleValueInput
 *  - A minimal input component
 *  - You provide a value, user edits it
 *  - Emits onChange(updatedValue)
 *  - Optional: textarea mode
 *
 * Props:
 *   - value (string) required
 *   - onChange (fn) required
 *   - textarea (boolean) optional — if true, renders <textarea>
 *   - rows (number) optional — textarea height
 *   - placeholder (string) optional
 *   - className (string) optional
 */

export default function SimpleValueInput({
  value,
  onChange,
  name,
  textarea = false,
  rows = 4,
  placeholder = "Enter value...",
  className = "",
}) {
  const [v, setV] = useState(value);

  useEffect(() => {
    setV(value);
  }, [value]);

  function handleChange(e) {
    const next = e.target.value;
    setV(next);
    onChange(next);
  }

  const baseClasses =
    "bg-white w-full rounded-md p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow " +
    className;

  if (textarea) {
    return (
      <textarea
        value={v}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        className={baseClasses}
      />
    );
  }

  return (
    <input
      name={name}
      type="text"
      value={v}
      onChange={handleChange}
      placeholder={placeholder}
      className={baseClasses}
    />
  );
}

/**
 * Example usage:
 *
 * <SimpleValueInput
 *   value={title}
 *   onChange={setTitle}
 * />
 *
 * <SimpleValueInput
 *   value={description}
 *   onChange={setDescription}
 *   textarea
 *   rows={6}
 * />
 */
