"use client";

import React, { useState } from "react";

export default function OptionBuilder({ label, options, setOptions }) {
  const [value, setValue] = useState("");

  const addOption = () => {
    if (!value.trim()) return;
    setOptions((prev) => [...prev, value.trim()]);
    setValue("");
  };

  const removeOption = (index) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border p-4 rounded-lg bg-gray-50">
      <h3 className="text-sm font-semibold mb-2">{label}</h3>

      <div className="flex gap-2 mb-2">
        <input
          className="border p-2 flex-1 rounded"
          placeholder={`Add new ${label}...`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          onClick={addOption}
          type="button"
          className="px-3 py-2 bg-[rgb(183,36,42)] text-white rounded"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => (
          <div
            key={i}
            className="bg-white px-3 py-1 rounded-full border flex items-center gap-2 text-sm"
          >
            {opt}
            <button
              type="button"
              onClick={() => removeOption(i)}
              className="text-red-600 font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
