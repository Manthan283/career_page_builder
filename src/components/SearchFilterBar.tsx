// components/SearchFilterBar.tsx
"use client";
import React, { useState } from "react";

export default function SearchFilterBar({
  onSearch,
  onFilter
}: {
  onSearch: (q: string) => void;
  onFilter: (filters: { location?: string; type?: string }) => void;
}) {
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");

  function apply() {
    onSearch(q);
    onFilter({ location: location || undefined, type: type || undefined });
  }

  return (
    <div className="bg-white p-3 rounded border flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2 flex-1">
        <input
          aria-label="Search jobs"
          placeholder="Search by title, skill or keyword"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button onClick={() => { onSearch(q); }} className="ml-2 px-3 py-1 rounded border">Search</button>
      </div>

      <div className="flex items-center gap-2">
        <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="border p-2 rounded" />
        <select value={type} onChange={e => setType(e.target.value)} className="border p-2 rounded">
          <option value="">Any type</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Intern</option>
        </select>
        <button onClick={apply} className="ml-2 bg-blue-600 text-white px-3 py-1 rounded">Apply</button>
      </div>
    </div>
  );
}
