"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function CareersFilters({ locations, jobTypes }: {
  locations: string[];
  jobTypes: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.push(`?${p.toString()}`);
  }

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <input
        placeholder="Search roles"
        defaultValue={params.get("search") ?? ""}
        onChange={(e) => update("search", e.target.value)}
        className="border rounded px-3 py-2 text-sm w-48"
      />

      <select
        defaultValue={params.get("location") ?? ""}
        onChange={(e) => update("location", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All locations</option>
        {locations.map(l => <option key={l}>{l}</option>)}
      </select>

      <select
        defaultValue={params.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {jobTypes.map(t => <option key={t}>{t}</option>)}
      </select>

      <select
        defaultValue={params.get("sort") ?? "latest"}
        onChange={(e) => update("sort", e.target.value)}
        className="border rounded px-3 py-2 text-sm"
      >
        <option value="latest">Latest</option>
        <option value="oldest">Oldest</option>
      </select>
    </div>
  );
}
